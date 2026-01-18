from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
from pathlib import Path
import errno
import os
import shutil
import uuid
from app.database.connection import get_supabase
from app.models import schemas
from app.api.dependencies import get_admin_user
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

def _ensure_writable_dir(dir_path: Path) -> None:
    dir_path.mkdir(parents=True, exist_ok=True)
    # Best-effort writability check (some platforms allow mkdir but not file writes)
    probe_path = dir_path / ".__write_probe__"
    with open(probe_path, "wb") as f:
        f.write(b"ok")
    try:
        probe_path.unlink(missing_ok=True)
    except TypeError:
        # Python < 3.8 compatibility (missing_ok)
        if probe_path.exists():
            probe_path.unlink()


def _get_upload_dir() -> Path:
    """
    Return a writable upload directory.

    Some serverless runtimes mount the app code on a read-only filesystem.
    In those cases, only `/tmp` is writable.
    """
    configured = Path(settings.UPLOAD_DIR)
    candidates: List[Path] = [configured]
    if not configured.is_absolute():
        candidates.append(Path("/tmp") / configured)
    candidates.append(Path("/tmp/uploads"))

    for candidate in candidates:
        try:
            _ensure_writable_dir(candidate)
            return candidate
        except OSError as e:
            # Try the next candidate for common "not writable" errors
            if e.errno in (errno.EROFS, errno.EACCES, errno.EPERM):
                continue
            continue

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=(
            "Server upload directory is not writable. "
            "Set UPLOAD_DIR to a writable path (e.g. /tmp/uploads in serverless) "
            "or use external object storage for uploads."
        ),
    )

@router.post("/upload", response_model=schemas.Document)
async def upload_document(
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    """Upload a document for RAG processing (Admin only)."""
    # Validate file type
    allowed_extensions = [".pdf", ".doc", ".docx", ".txt"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}"
        )
    
    # Validate file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE / (1024*1024)}MB"
        )
    
    # Save file
    upload_dir = _get_upload_dir()
    original_name = os.path.basename(file.filename or "upload")
    stored_name = f"{uuid.uuid4().hex}_{original_name}"
    file_path = str(upload_dir / stored_name)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Create database record
    supabase = get_supabase()
    document_data = {
        "filename": file.filename,
        "file_path": file_path,
        "admin_id": admin["id"],
        "processed": False
    }
    result = supabase.table("documents").insert(document_data).execute()
    db_document = result.data[0] if result.data else {}
    
    # Process document asynchronously
    from app.services.rag_service import RAGService
    rag_service = RAGService()
    
    try:
        await rag_service.process_document(db_document["id"], file_path)
        
        # Mark as processed
        supabase.table("documents").update({"processed": True}).eq("id", db_document["id"]).execute()
    except Exception as e:
        # Log error but don't fail the upload
        print(f"Error processing document: {str(e)}")
    finally:
        # Cleanup: serverless filesystems are ephemeral; avoid leaving temp files around.
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception:
            pass
    
    return db_document

@router.get("/", response_model=List[schemas.Document])
async def list_documents(
    admin: dict = Depends(get_admin_user)
):
    """List all uploaded documents (Admin only)."""
    supabase = get_supabase()
    result = supabase.table("documents").select("*").execute()
    return result.data if result.data else []

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    admin: dict = Depends(get_admin_user)
):
    """Delete a document and its chunks (Admin only)."""
    supabase = get_supabase()
    
    # Get document
    result = supabase.table("documents").select("*").eq("id", document_id).limit(1).execute()
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    document = result.data[0]
    
    # Delete file from filesystem
    file_path = document.get("file_path")
    if file_path and os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database (cascades to chunks via foreign key)
    supabase.table("documents").delete().eq("id", document_id).execute()
    
    return {"message": "Document deleted successfully"}

@router.get("/conversations", dependencies=[Depends(get_admin_user)])
async def get_conversations(
    skip: int = 0,
    limit: int = 100
):
    """Get all chat conversations (Admin only)."""
    supabase = get_supabase()
    result = supabase.table("chat_logs").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    
    if not result.data:
        return []
    
    return [
        {
            "id": chat["id"],
            "session_id": chat["session_id"],
            "message": chat["message"],
            "response": chat["response"],
            "created_at": chat["created_at"]
        }
        for chat in result.data
    ]
