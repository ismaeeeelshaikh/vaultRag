import asyncio
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..models.document import Document
from ..services.auth import AuthService
from ..services.rag import rag_service
from ..utils.security import verify_token

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])
security = HTTPBearer()

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".docx", ".doc", ".md"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20 MB


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    email = verify_token(credentials.credentials)
    if email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return await AuthService.get_user_by_email(email, db)


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Upload a document and store in PostgreSQL + ingest into user's vector index."""
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Read and validate size
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 20MB.")

    # Sanitize filename
    safe_name = "".join(
        c if c.isalnum() or c in (".", "-", "_", " ") else "_"
        for c in Path(file.filename).name
    )
    if not safe_name or safe_name.startswith("."):
        safe_name = f"upload{ext}"

    # Check if user already has a file with same name, add suffix if so
    result = await db.execute(
        select(Document).filter(
            Document.user_id == user.id,
            Document.filename == safe_name,
        )
    )
    if result.scalar_one_or_none():
        stem = Path(safe_name).stem
        counter = 1
        while True:
            candidate = f"{stem}_{counter}{ext}"
            check = await db.execute(
                select(Document).filter(
                    Document.user_id == user.id,
                    Document.filename == candidate,
                )
            )
            if not check.scalar_one_or_none():
                safe_name = candidate
                break
            counter += 1

    # Store in PostgreSQL
    doc = Document(
        user_id=user.id,
        filename=safe_name,
        file_extension=ext,
        file_size=len(content),
        file_content=content,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    logger.info("User %s uploaded file to DB: %s (id=%d)", user.id, safe_name, doc.id)

    # Ingest into user's vector store (run in thread to avoid blocking)
    try:
        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(
            None, rag_service.ingest_document, content, safe_name, user.id
        )
    except Exception as exc:
        logger.error("Ingestion exception for %s: %s", safe_name, exc, exc_info=True)
        # File is still in DB, just vector indexing failed - that's ok, can retry
        return {
            "message": f"Document '{safe_name}' saved but indexing failed. It will be indexed on next query.",
            "filename": safe_name,
        }

    if not success:
        return {
            "message": f"Document '{safe_name}' saved but indexing had issues. It will be indexed on next query.",
            "filename": safe_name,
        }

    return {
        "message": f"Document '{safe_name}' uploaded and indexed successfully.",
        "filename": safe_name,
    }


@router.get("/list")
async def list_documents(
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List all documents uploaded by the current user."""
    result = await db.execute(
        select(Document)
        .filter(Document.user_id == user.id)
        .order_by(Document.uploaded_at.desc())
    )
    docs = result.scalars().all()

    return {
        "documents": [
            {
                "name": doc.filename,
                "size": doc.file_size,
                "uploaded_at": doc.uploaded_at.isoformat() if doc.uploaded_at else None,
            }
            for doc in docs
        ]
    }


@router.delete("/{filename}")
async def delete_document(
    filename: str,
    user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete a document belonging to the current user and rebuild their vector index."""
    result = await db.execute(
        select(Document).filter(
            Document.user_id == user.id,
            Document.filename == filename,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="File not found.")

    await db.delete(doc)
    await db.commit()

    logger.info("User %d deleted document: %s", user.id, filename)

    # Rebuild user's vector index with remaining documents
    remaining = await db.execute(
        select(Document).filter(Document.user_id == user.id)
    )
    remaining_docs = remaining.scalars().all()

    docs_data = [
        {"filename": d.filename, "file_content": d.file_content}
        for d in remaining_docs
    ]

    try:
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, rag_service.rebuild_user_index, user.id, docs_data
        )
    except Exception as exc:
        logger.error("Index rebuild failed for user %d after delete: %s", user.id, exc)

    return {"message": f"Document '{filename}' deleted successfully."}
