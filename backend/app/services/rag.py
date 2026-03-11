import hashlib
import json
import logging
import os
import pickle
import threading
from pathlib import Path
from typing import Dict, List, Optional

from dotenv import load_dotenv
from langchain.retrievers import ParentDocumentRetriever
from langchain.schema import Document
from langchain.storage import InMemoryStore
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import TextLoader
from langchain_community.embeddings import SentenceTransformerEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_groq import ChatGroq

load_dotenv()
logger = logging.getLogger(__name__)


class RAGService:
    def __init__(self):
        self.chroma_dir = Path("./chroma_db_final")
        self.docstore_file = Path("docstore.pkl")
        self.memory_file = Path("conversation_memory.pkl")
        self.index_meta_file = Path("rag_index_meta.json")
        self.data_dirs = [Path("college_data"), Path("temp_uploads")]
        self.collection_name = "split_by_section"

        self.embeddings: Optional[SentenceTransformerEmbeddings] = None
        self.llm: Optional[ChatGroq] = None
        self.retriever: Optional[ParentDocumentRetriever] = None

        self.session_conversations: Dict[int, Dict[int, List[Dict[str, str]]]] = {}
        self._loaded_fingerprint: Optional[str] = None
        self._init_done = False
        self._init_lock = threading.Lock()
        self._index_lock = threading.Lock()

        self._load_conversation_memory()
        logger.info("RAG service created. Components will load on first query.")

    def _ensure_initialized(self):
        if self._init_done:
            return

        with self._init_lock:
            if self._init_done:
                return

            logger.info("Initializing RAG components...")
            self.embeddings = SentenceTransformerEmbeddings(
                model_name="BAAI/bge-base-en-v1.5"
            )
            self.llm = ChatGroq(
                groq_api_key=os.getenv("GROQ_API_KEY"),
                model_name="llama-3.3-70b-versatile",
                temperature=0.3,
            )
            self._init_done = True
            self._ensure_retriever_ready()
            logger.info("RAG components initialized.")

    def _load_conversation_memory(self):
        if self.memory_file.exists():
            try:
                with self.memory_file.open("rb") as handle:
                    self.session_conversations = pickle.load(handle)
            except Exception:
                self.session_conversations = {}

    def _save_conversation_memory(self):
        try:
            with self.memory_file.open("wb") as handle:
                pickle.dump(self.session_conversations, handle)
        except Exception as exc:
            logger.error("Failed to save conversation memory: %s", exc)

    def _collect_source_files(self) -> List[Path]:
        allowed_suffixes = {".txt", ".md", ".pdf", ".docx"}
        files: List[Path] = []
        for directory in self.data_dirs:
            if not directory.exists() or not directory.is_dir():
                continue
            for path in directory.rglob("*"):
                if path.is_file() and path.suffix.lower() in allowed_suffixes:
                    files.append(path)
        files.sort(key=lambda item: str(item).lower())
        return files

    def _compute_source_fingerprint(self, files: List[Path]) -> Optional[str]:
        if not files:
            return None

        digest = hashlib.sha256()
        for path in files:
            stats = path.stat()
            digest.update(str(path.resolve()).encode("utf-8"))
            digest.update(str(stats.st_size).encode("utf-8"))
            digest.update(str(stats.st_mtime_ns).encode("utf-8"))
        return digest.hexdigest()

    def _load_saved_fingerprint(self) -> Optional[str]:
        if not self.index_meta_file.exists():
            return None
        try:
            with self.index_meta_file.open("r", encoding="utf-8") as handle:
                return json.load(handle).get("fingerprint")
        except Exception:
            return None

    def _save_fingerprint(self, fingerprint: Optional[str]):
        try:
            payload = {"fingerprint": fingerprint}
            with self.index_meta_file.open("w", encoding="utf-8") as handle:
                json.dump(payload, handle)
        except Exception as exc:
            logger.warning("Failed to save index metadata: %s", exc)

    def _load_docstore(self) -> InMemoryStore:
        if not self.docstore_file.exists():
            return InMemoryStore()

        try:
            with self.docstore_file.open("rb") as handle:
                loaded = pickle.load(handle)
            if isinstance(loaded, InMemoryStore):
                return loaded
            if isinstance(loaded, dict):
                store = InMemoryStore()
                store.mset(list(loaded.items()))
                return store
            if hasattr(loaded, "store") and isinstance(getattr(loaded, "store"), dict):
                store = InMemoryStore()
                store.mset(list(loaded.store.items()))
                return store
        except Exception as exc:
            logger.warning("Unable to load docstore. Rebuilding may be required: %s", exc)

        return InMemoryStore()

    def _save_docstore(self, store: InMemoryStore):
        try:
            with self.docstore_file.open("wb") as handle:
                pickle.dump(store, handle)
        except Exception as exc:
            logger.warning("Failed to save docstore: %s", exc)

    def _create_vectorstore(self) -> Chroma:
        return Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embeddings,
            persist_directory=str(self.chroma_dir),
        )

    def _build_retriever(
        self, docstore: InMemoryStore, vectorstore: Optional[Chroma] = None
    ) -> ParentDocumentRetriever:
        parent_splitter = RecursiveCharacterTextSplitter(
            separators=["\n=== "],
            chunk_size=2000,
            chunk_overlap=200,
        )
        child_splitter = RecursiveCharacterTextSplitter(
            chunk_size=400,
            chunk_overlap=100,
        )

        vectorstore = vectorstore or self._create_vectorstore()
        return ParentDocumentRetriever(
            vectorstore=vectorstore,
            docstore=docstore,
            child_splitter=child_splitter,
            parent_splitter=parent_splitter,
        )

    def _load_documents(self, files: List[Path]) -> List[Document]:
        documents: List[Document] = []
        for path in files:
            extension = path.suffix.lower()
            try:
                if extension in {".txt", ".md"}:
                    loader = TextLoader(str(path), encoding="utf-8")
                    documents.extend(loader.load())
                elif extension == ".pdf":
                    try:
                        from langchain_community.document_loaders import PyPDFLoader
                    except Exception:
                        logger.warning(
                            "Skipping PDF %s because pypdf is not available.",
                            path.name,
                        )
                        continue
                    documents.extend(PyPDFLoader(str(path)).load())
                elif extension == ".docx":
                    try:
                        from docx import Document as DocxDocument
                    except Exception:
                        logger.warning(
                            "Skipping DOCX %s because python-docx is not available.",
                            path.name,
                        )
                        continue
                    doc = DocxDocument(str(path))
                    text = "\n".join([p.text for p in doc.paragraphs if p.text.strip()])
                    if text:
                        documents.append(Document(page_content=text, metadata={"source": str(path)}))
            except Exception as exc:
                logger.warning("Failed to parse %s: %s", path, exc)
        return documents

    def _load_existing_retriever(self) -> bool:
        if not self.chroma_dir.exists() or not self.docstore_file.exists():
            return False

        try:
            docstore = self._load_docstore()
            self.retriever = self._build_retriever(docstore)
            return True
        except Exception as exc:
            logger.warning("Failed to load existing vector index: %s", exc)
            self.retriever = None
            return False

    def _rebuild_retriever(self, source_files: List[Path], fingerprint: Optional[str]) -> bool:
        documents = self._load_documents(source_files)
        if not documents:
            logger.warning("No readable files found. Keeping previous vector index.")
            return False

        docstore = InMemoryStore()

        # Reset only this collection. This avoids deleting the whole chroma directory
        # and prevents file-lock errors while the app process is alive.
        try:
            cleanup_store = self._create_vectorstore()
            cleanup_store.delete_collection()
        except Exception:
            pass

        vectorstore = self._create_vectorstore()
        self.retriever = self._build_retriever(docstore, vectorstore=vectorstore)
        self.retriever.add_documents(documents, ids=None)
        self._save_docstore(docstore)
        self._save_fingerprint(fingerprint)
        self._loaded_fingerprint = fingerprint
        logger.info("Rebuilt vector index with %s documents.", len(documents))
        return True

    def _ensure_retriever_ready(self):
        with self._index_lock:
            source_files = self._collect_source_files()
            current_fingerprint = self._compute_source_fingerprint(source_files)
            saved_fingerprint = self._load_saved_fingerprint()
            has_saved_index = self.chroma_dir.exists() and self.docstore_file.exists()

            if self.retriever is not None and current_fingerprint == self._loaded_fingerprint:
                return

            if source_files and current_fingerprint != saved_fingerprint:
                logger.info("Knowledge files changed. Rebuilding index.")
                if self._rebuild_retriever(source_files, current_fingerprint):
                    return

            if self.retriever is None and has_saved_index:
                if self._load_existing_retriever():
                    self._loaded_fingerprint = saved_fingerprint or current_fingerprint
                    logger.info("Loaded existing vector index from disk.")
                    return

            if self.retriever is None and source_files:
                self._rebuild_retriever(source_files, current_fingerprint)
                return

            if self.retriever is None and not has_saved_index:
                logger.warning(
                    "No vector index available yet. Add files in college_data or temp_uploads."
                )

    def _get_session_history(self, user_id: int, session_id: int) -> List[Dict[str, str]]:
        if user_id not in self.session_conversations:
            return []
        if session_id not in self.session_conversations[user_id]:
            return []
        return self.session_conversations[user_id][session_id]

    def _store_session_conversation(
        self, user_id: int, session_id: int, question: str, answer: str
    ):
        if user_id not in self.session_conversations:
            self.session_conversations[user_id] = {}
        if session_id not in self.session_conversations[user_id]:
            self.session_conversations[user_id][session_id] = []

        self.session_conversations[user_id][session_id].append(
            {"question": question, "answer": answer}
        )
        self._save_conversation_memory()

    def get_response_for_session(self, question: str, user_id: int, session_id: int) -> str:
        try:
            self._ensure_initialized()
            self._ensure_retriever_ready()
        except Exception as exc:
            logger.error("RAG initialization failed: %s", exc)
            return "RAG service is still initializing. Please try again in a moment."

        history_list = self._get_session_history(user_id, session_id)
        if len(history_list) > 0:
            style_instruction = "Strictly DO NOT greet. Answer directly."
            history_text = "\n".join(
                [f"User: {msg['question']}\nYou: {msg['answer']}" for msg in history_list[-6:]]
            )
        else:
            style_instruction = "Start with a short, friendly greeting."
            history_text = "No previous conversation."

        db_context = ""
        if self.retriever is not None:
            try:
                db_docs = self.retriever.get_relevant_documents(question)
                db_context = "\n".join([doc.page_content for doc in db_docs]) if db_docs else ""
            except Exception:
                db_context = ""

        final_prompt = f"""You are a helpful AI assistant that answers questions based on the user's uploaded documents.

        **INSTRUCTIONS:**
        1. Answer based on the provided knowledge base context below.
        2. If the answer is not found in the context, say so honestly.
        3. {style_instruction} Be helpful and accurate.

        **CONTEXT:**
        Conversation History: {history_text}
        User Question: {question}

        **KNOWLEDGE BASE:**
        {db_context}

        **ANSWER:**"""

        try:
            response = self.llm.invoke(final_prompt) if self.llm is not None else None
            response_text = response.content if response is not None else ""
            self._store_session_conversation(user_id, session_id, question, response_text)
            return response_text
        except Exception as exc:
            logger.error("Critical RAG error: %s", exc)
            return "I'm hitting a search limit. Give me a second and ask again."

    def get_response(self, question: str, user_id: int) -> str:
        return self.get_response_for_session(question=question, user_id=user_id, session_id=0)

    def clear_session_memory(self, user_id: int, session_id: int):
        if (
            user_id in self.session_conversations
            and session_id in self.session_conversations[user_id]
        ):
            del self.session_conversations[user_id][session_id]
            self._save_conversation_memory()

    def ingest_uploaded_file(self, file_path: Path) -> bool:
        """Ingest a single uploaded file into the vector store."""
        try:
            self._ensure_initialized()
            documents = self._load_documents([file_path])
            if not documents:
                logger.warning("No content extracted from %s", file_path)
                return False

            with self._index_lock:
                if self.retriever is None:
                    docstore = self._load_docstore() if self.docstore_file.exists() else InMemoryStore()
                    self.retriever = self._build_retriever(docstore)

                self.retriever.add_documents(documents, ids=None)

                # Save docstore to persist newly added vectors
                if hasattr(self.retriever, "docstore"):
                    self._save_docstore(self.retriever.docstore)

                # Update fingerprint so it doesn't rebuild unnecessarily
                source_files = self._collect_source_files()
                fingerprint = self._compute_source_fingerprint(source_files)
                self._save_fingerprint(fingerprint)
                self._loaded_fingerprint = fingerprint

            logger.info("Successfully ingested file: %s (%d documents)", file_path.name, len(documents))
            return True
        except Exception as exc:
            logger.error("Failed to ingest file %s: %s", file_path, exc, exc_info=True)
            return False

    def get_uploaded_files(self) -> List[Dict[str, str]]:
        """Return list of files in temp_uploads directory."""
        upload_dir = Path("temp_uploads")
        if not upload_dir.exists():
            return []
        allowed = {".txt", ".pdf", ".docx", ".md"}
        files = []
        for f in sorted(upload_dir.iterdir()):
            if f.is_file() and f.suffix.lower() in allowed:
                files.append({"name": f.name, "size": f.stat().st_size})
        return files

    def delete_uploaded_file(self, filename: str) -> bool:
        """Delete a file from temp_uploads."""
        upload_dir = Path("temp_uploads")
        file_path = (upload_dir / filename).resolve()
        # Ensure the resolved path is still within upload_dir
        if not str(file_path).startswith(str(upload_dir.resolve())):
            return False
        if file_path.exists() and file_path.is_file():
            file_path.unlink()
            return True
        return False


rag_service = RAGService()
