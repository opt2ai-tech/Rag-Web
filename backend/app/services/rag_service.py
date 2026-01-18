from openai import OpenAI
from typing import List, Dict, Optional
import os
from app.core.config import settings
from app.services.embedding_service import EmbeddingService
from app.database.connection import get_supabase

# Document parsers
import PyPDF2
from docx import Document as DocxDocument

class RAGService:
    """Service for Retrieval-Augmented Generation."""
    
    def __init__(self):
        self.supabase = get_supabase()
        self.embedding_service = EmbeddingService()
        self.openai_client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.system_prompt = """You are an AI hotel concierge assistant. Your role is to help guests with information about the hotel.

IMPORTANT RULES:
1. Answer questions ONLY using the provided context from hotel documents, room information, and policies.
2. If the information is not available in the context, politely decline and suggest contacting human support.
3. Never make up or hallucinate information.
4. Keep responses friendly, professional, and concise.
5. Use a warm hospitality tone.

Context:
{context}

Remember: Only use the information provided above to answer questions."""
    
    async def process_document(self, document_id: int, file_path: str):
        """Process a document: extract text, chunk, embed, and store."""
        # Extract text based on file type
        text = self._extract_text(file_path)
        
        # Split into chunks
        chunks = self._chunk_text(text, settings.CHUNK_SIZE, settings.CHUNK_OVERLAP)
        
        # Generate embeddings
        embeddings = await self.embedding_service.embed_batch(chunks)
        
        # Store chunks with embeddings
        for chunk_text, embedding in zip(chunks, embeddings):
            chunk_data = {
                "document_id": document_id,
                "chunk_text": chunk_text,
                "embedding": "[" + ",".join(map(str, embedding)) + "]",  # Convert to PostgreSQL vector format
                "chunk_metadata": {"file_path": file_path}
            }
            self.supabase.table("document_chunks").insert(chunk_data).execute()
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text from a file based on its extension."""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            return self._extract_from_pdf(file_path)
        elif ext in ['.doc', '.docx']:
            return self._extract_from_docx(file_path)
        elif ext == '.txt':
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file type: {ext}")
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF."""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        return text
    
    def _extract_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX."""
        doc = DocxDocument(file_path)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text
    
    def _chunk_text(self, text: str, chunk_size: int, overlap: int) -> List[str]:
        """Split text into overlapping chunks."""
        # Simple word-based chunking
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk:
                chunks.append(chunk)
        
        return chunks
    
    async def vector_search(self, query_embedding: List[float], limit: int = 10) -> List[Dict]:
        """Search for similar document chunks using vector similarity."""
        # Convert embedding to PostgreSQL vector format string
        embedding_str = '[' + ','.join(map(str, query_embedding)) + ']'
        
        # Use RPC function for vector search (you'll need to create this function in your database)
        # For now, we'll use a workaround by fetching all processed documents and filtering
        # Note: For production, create a PostgreSQL function for efficient vector search
        
        try:
            # Call RPC function for vector search
            result = self.supabase.rpc(
                "search_document_chunks",
                {
                    "query_embedding": embedding_str,
                    "match_limit": limit
                }
            ).execute()
            
            if result.data:
                return result.data
        except Exception as e:
            # Fallback: if RPC doesn't exist, we'll need to implement a different approach
            print(f"RPC function not available, using fallback: {e}")
            # For now, return empty - you'll need to create the RPC function
            # or use a different vector search approach
            pass
        
        return []
    
    def _get_room_context(self) -> str:
        """Get current room information as context."""
        result = self.supabase.table("rooms").select("*").eq("available", True).execute()
        
        if not result.data:
            return ""
        
        context = "\n\nAVAILABLE ROOMS:\n"
        for room in result.data:
            context += f"\n{room['name']}:"
            context += f"\n- Description: {room['description']}"
            context += f"\n- Price: ${room['price_per_night']} per night"
            context += f"\n- Max Guests: {room['max_guests']}"
            if room.get('amenities'):
                amenities = room['amenities'] if isinstance(room['amenities'], list) else []
                context += f"\n- Amenities: {', '.join(amenities)}"
            context += "\n"
        
        return context
    
    async def query(self, user_query: str, session_id: Optional[str] = None) -> str:
        """Process a user query and return RAG-enhanced response."""
        # Generate query embedding
        query_embedding = await self.embedding_service.embed(user_query)
        
        # Search for relevant document chunks
        similar_chunks = await self.vector_search(query_embedding, settings.TOP_K_RESULTS)
        
        # Build context from retrieved chunks
        context = ""
        if similar_chunks:
            context += "HOTEL DOCUMENTS:\n"
            for i, chunk in enumerate(similar_chunks, 1):
                context += f"\n[Source: {chunk['filename']}]\n{chunk['text']}\n"
        
        # Add room information
        context += self._get_room_context()
        
        # If no context found, provide a helpful message
        if not context.strip():
            return ("I apologize, but I don't have enough information to answer that question. "
                   "Please contact our front desk at reception@hotel.com or call us for assistance.")
        
        # Generate response using OpenAI
        try:
            response = self.openai_client.chat.completions.create(
                model=settings.CHAT_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": self.system_prompt.format(context=context)
                    },
                    {
                        "role": "user",
                        "content": user_query
                    }
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            return response.choices[0].message.content
        
        except Exception as e:
            return (f"I apologize, but I'm having trouble processing your request right now. "
                   f"Please try again or contact our support team.")
