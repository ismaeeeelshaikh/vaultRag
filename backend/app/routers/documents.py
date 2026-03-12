import asyncio
import os
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..services.auth import AuthService
from ..services.rag import rag_service
from ..utils.security import verify_token

import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/documents", tags=["documents"])
security = HTTPBearer()

UPLOAD_DIR = Path("temp_uploads")
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
):
    """Upload a document (PDF, DOCX, TXT) and ingest it into the knowledge base."""
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

    # Sanitize filename - keep only safe characters
    safe_name = "".join(
        c if c.isalnum() or c in (".", "-", "_", " ") else "_"
        for c in Path(file.filename).name
    )
    if not safe_name or safe_name.startswith("."):
        safe_name = f"upload{ext}"

    UPLOAD_DIR.mkdir(exist_ok=True)
    file_path = UPLOAD_DIR / safe_name

    # If file with same name exists, add a number suffix
    counter = 1
    stem = file_path.stem
    while file_path.exists():
        file_path = UPLOAD_DIR / f"{stem}_{counter}{ext}"
        counter += 1

    file_path.write_bytes(content)
    logger.info("User %s uploaded file: %s", user.id, file_path.name)

    # Ingest into vector store (run in thread to avoid blocking async loop)
    try:
        loop = asyncio.get_event_loop()
        success = await loop.run_in_executor(None, rag_service.ingest_uploaded_file, file_path)
    except Exception as exc:
        logger.error("Ingestion exception for %s: %s", file_path.name, exc, exc_info=True)
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Ingestion error: {str(exc)}")

    if not success:
        # Clean up if ingestion failed
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail="Failed to process document. Check server logs.")

    return {
        "message": f"Document '{file_path.name}' uploaded and indexed successfully.",
        "filename": file_path.name,
    }


@router.get("/list")
async def list_documents(user=Depends(get_current_user)):
    """List all uploaded documents in the knowledge base."""
    files = rag_service.get_uploaded_files()
    return {"documents": files}


@router.delete("/{filename}")
async def delete_document(filename: str, user=Depends(get_current_user)):
    """Delete an uploaded document."""
    success = rag_service.delete_uploaded_file(filename)
    if not success:
        raise HTTPException(status_code=404, detail="File not found.")
    return {"message": f"Document '{filename}' deleted successfully."}
