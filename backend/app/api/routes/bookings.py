from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime
from app.database.connection import get_supabase
from app.models import schemas

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.Booking)
async def create_booking(
    booking: schemas.BookingCreate
):
    """Create a new booking."""
    supabase = get_supabase()
    
    # Verify room exists
    room_result = supabase.table("rooms").select("*").eq("id", booking.room_id).limit(1).execute()
    if not room_result.data or len(room_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Room not found"
        )
    
    # Check availability - get overlapping bookings
    overlapping_result = supabase.table("bookings").select("id", count="exact").eq("room_id", booking.room_id).eq("status", "confirmed").lt("check_in", booking.check_out.isoformat()).gt("check_out", booking.check_in.isoformat()).execute()
    
    overlapping_count = overlapping_result.count if hasattr(overlapping_result, 'count') else len(overlapping_result.data) if overlapping_result.data else 0
    
    if overlapping_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Room is not available for the selected dates"
        )
    
    # Validate dates
    if booking.check_in >= booking.check_out:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-out date must be after check-in date"
        )
    
    if booking.check_in < datetime.now():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Check-in date cannot be in the past"
        )
    
    # Create booking
    booking_data = booking.model_dump()
    booking_data["check_in"] = booking_data["check_in"].isoformat()
    booking_data["check_out"] = booking_data["check_out"].isoformat()
    booking_data["status"] = "confirmed"
    
    result = supabase.table("bookings").insert(booking_data).execute()
    return result.data[0] if result.data else {}

@router.get("/", response_model=List[schemas.Booking])
async def list_bookings(
    skip: int = 0,
    limit: int = 100,
    admin: dict = Depends(lambda: None)
):
    """List all bookings (Admin only)."""
    from app.api.dependencies import get_admin_user
    admin = await get_admin_user()
    
    supabase = get_supabase()
    result = supabase.table("bookings").select("*").order("created_at", desc=True).range(skip, skip + limit - 1).execute()
    return result.data if result.data else []

@router.get("/{booking_id}", response_model=schemas.Booking)
async def get_booking(booking_id: int):
    """Get a specific booking."""
    supabase = get_supabase()
    result = supabase.table("bookings").select("*").eq("id", booking_id).limit(1).execute()
    
    if not result.data or len(result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    return result.data[0]

@router.put("/{booking_id}/cancel")
async def cancel_booking(booking_id: int):
    """Cancel a booking."""
    supabase = get_supabase()
    
    # Get booking
    booking_result = supabase.table("bookings").select("*").eq("id", booking_id).limit(1).execute()
    if not booking_result.data or len(booking_result.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    booking = booking_result.data[0]
    if booking.get("status") == "cancelled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Booking is already cancelled"
        )
    
    supabase.table("bookings").update({"status": "cancelled"}).eq("id", booking_id).execute()
    
    return {"message": "Booking cancelled successfully"}
