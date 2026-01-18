from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    role: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Room Schemas
class RoomBase(BaseModel):
    name: str
    description: str
    price_per_night: float
    max_guests: int
    amenities: List[str] = []
    images: List[str] = []
    available: bool = True

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price_per_night: Optional[float] = None
    max_guests: Optional[int] = None
    amenities: Optional[List[str]] = None
    images: Optional[List[str]] = None
    available: Optional[bool] = None

class Room(RoomBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    room_id: int
    check_in: datetime
    check_out: datetime
    guest_count: int
    guest_name: str
    guest_email: EmailStr

class BookingCreate(BookingBase):
    pass

class Booking(BookingBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Chat Schemas
class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    session_id: Optional[str] = None

# Document Schemas
class DocumentUpload(BaseModel):
    filename: str

class Document(BaseModel):
    id: int
    filename: str
    uploaded_at: datetime
    processed: bool
    
    class Config:
        from_attributes = True

# Dashboard Stats
class DashboardStats(BaseModel):
    total_rooms: int
    total_bookings: int
    total_revenue: float
    total_chat_logs: int
