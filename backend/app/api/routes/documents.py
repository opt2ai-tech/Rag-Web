from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import List
import os
import shutil
from app.database.connection import get_supabase
from app.models import schemas
from app.api.dependencies import get_admin_user
from app.core.config import settings

router = APIRouter(prefix="/documents", tags=["documents"])

# Create upload directory if it doesn't exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

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
    file_path = os.path.join(settings.UPLOAD_DIR, file.filename)
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
    if os.path.exists(document["file_path"]):
        os.remove(document["file_path"])
    
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
