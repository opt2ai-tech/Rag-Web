from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.database.connection import get_supabase
from app.models import schemas

router = APIRouter(prefix="/rooms", tags=["rooms"])

@router.get("/", response_model=List[schemas.Room])
async def list_rooms(
    available_only: bool = False
):
    """List all rooms."""
    supabase = get_supabase()
    query = supabase.table("rooms").select("*")
    
    if available_only:
        query = query.eq("available", True)
    
    result = query.execute()
    return result.data if result.data else []

@router.get("/{room_id}", response_model=schemas.Room)
async def get_room(room_id: int):
    """Get a specific room by ID."""
    supabase = get_supabase()
    result = supabase.table("rooms").select("*").eq("id", room_id).limit(1).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    return result.data[0]

@router.post("/", response_model=schemas.Room, dependencies=[Depends(lambda: None)])
async def create_room(
    room: schemas.RoomCreate,
    admin: dict = Depends(lambda: None)
):
    """Create a new room (Admin only)."""
    from app.api.dependencies import get_admin_user
    admin = await get_admin_user()
    
    supabase = get_supabase()
    result = supabase.table("rooms").insert(room.model_dump()).execute()
    return result.data[0] if result.data else {}

@router.put("/{room_id}", response_model=schemas.Room, dependencies=[Depends(lambda: None)])
async def update_room(
    room_id: int,
    room_update: schemas.RoomUpdate,
    admin: dict = Depends(lambda: None)
):
    """Update a room (Admin only)."""
    from app.api.dependencies import get_admin_user
    admin = await get_admin_user()
    
    supabase = get_supabase()
    
    # Check if room exists
    check_result = supabase.table("rooms").select("*").eq("id", room_id).limit(1).execute()
    if not check_result.data or len(check_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Update fields
    update_data = room_update.model_dump(exclude_unset=True)
    result = supabase.table("rooms").update(update_data).eq("id", room_id).execute()
    
    return result.data[0] if result.data else {}

@router.delete("/{room_id}", dependencies=[Depends(lambda: None)])
async def delete_room(
    room_id: int,
    admin: dict = Depends(lambda: None)
):
    """Delete a room (Admin only)."""
    from app.api.dependencies import get_admin_user
    admin = await get_admin_user()
    
    supabase = get_supabase()
    
    # Check if room exists
    check_result = supabase.table("rooms").select("*").eq("id", room_id).limit(1).execute()
    if not check_result.data or len(check_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    supabase.table("rooms").delete().eq("id", room_id).execute()
    return {"message": "Room deleted successfully"}

@router.get("/{room_id}/availability")
async def check_room_availability(
    room_id: int,
    check_in: datetime,
    check_out: datetime
):
    """Check if a room is available for the given dates."""
    supabase = get_supabase()
    
    # Get room
    room_result = supabase.table("rooms").select("*").eq("id", room_id).limit(1).execute()
    if not room_result.data or len(room_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    room = room_result.data[0]
    
    # Check for overlapping bookings
    bookings_result = supabase.table("bookings").select("id", count="exact").eq("room_id", room_id).eq("status", "confirmed").lt("check_in", check_out.isoformat()).gt("check_out", check_in.isoformat()).execute()
    
    overlapping_count = bookings_result.count if hasattr(bookings_result, 'count') else len(bookings_result.data) if bookings_result.data else 0
    available = room["available"] and overlapping_count == 0
    
    return {
        "available": available,
        "room_id": room_id,
        "check_in": check_in,
        "check_out": check_out
    }
