from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
from app.database.connection import get_supabase
from app.models import schemas
import uuid

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/", response_model=schemas.ChatResponse)
async def chat(
    message: schemas.ChatMessage
):
    """Handle chat message and return AI response."""
    from app.services.rag_service import RAGService
    
    # Generate session ID if not provided
    session_id = message.session_id or str(uuid.uuid4())
    
    # Get RAG service
    rag_service = RAGService()
    
    try:
        # Get response from RAG service
        response = await rag_service.query(message.message, session_id)
        
        # Log the conversation
        supabase = get_supabase()
        chat_log_data = {
            "session_id": session_id,
            "message": message.message,
            "response": response
        }
        supabase.table("chat_logs").insert(chat_log_data).execute()
        
        return schemas.ChatResponse(response=response, session_id=session_id)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chat: {str(e)}"
        )

@router.get("/history/{session_id}")
async def get_chat_history(
    session_id: str
):
    """Get chat history for a session."""
    supabase = get_supabase()
    result = supabase.table("chat_logs").select("*").eq("session_id", session_id).order("created_at").execute()
    
    if not result.data:
        return []
    
    return [
        {
            "message": chat["message"],
            "response": chat["response"],
            "created_at": chat["created_at"]
        }
        for chat in result.data
    ]
