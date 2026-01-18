from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database.connection import get_supabase
from app.models import schemas
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=schemas.User)
async def register(user: schemas.UserCreate):
    """Register a new user."""
    from app.core.security import get_password_hash
    
    supabase = get_supabase()
    
    # Check if user already exists
    result = supabase.table("users").select("*").eq("email", user.email).limit(1).execute()
    if result.data and len(result.data) > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    new_user = {
        "email": user.email,
        "password_hash": hashed_password,
        "role": "guest"
    }
    
    result = supabase.table("users").insert(new_user).execute()
    return result.data[0] if result.data else {}

@router.post("/login", response_model=schemas.Token)
async def login(credentials: schemas.UserLogin):
    """Authenticate user and return JWT token."""
    supabase = get_supabase()
    
    # Find user
    result = supabase.table("users").select("*").eq("email", credentials.email).limit(1).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    user = result.data[0]
    if not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": str(user["id"]), "role": user["role"]})
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=schemas.User)
async def get_current_user_info(
    current_user: dict = Depends(lambda: None)
):
    """Get current user information."""
    from app.api.dependencies import get_current_user
    user = await get_current_user()
    return user
