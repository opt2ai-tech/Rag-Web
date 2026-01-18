from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth, rooms, bookings, chat, documents, admin

app = FastAPI(
    title="Hotel Management API",
    description="AI-Powered Hotel Management with RAG Chatbot",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(bookings.router)
app.include_router(chat.router)
app.include_router(documents.router)
app.include_router(admin.router)

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Hotel Management API",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
