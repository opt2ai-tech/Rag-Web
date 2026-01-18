from datetime import datetime
from app.database.connection import get_supabase

class BookingService:
    """Service for booking business logic."""
    
    def __init__(self):
        self.supabase = get_supabase()
    
    def check_availability(self, room_id: int, check_in: datetime, check_out: datetime) -> bool:
        """Check if a room is available for the given dates."""
        # Get room
        room_result = self.supabase.table("rooms").select("*").eq("id", room_id).limit(1).execute()
        if not room_result.data or len(room_result.data) == 0:
            return False
        
        room = room_result.data[0]
        if not room.get("available"):
            return False
        
        # Check for overlapping bookings
        overlapping_result = self.supabase.table("bookings").select("id", count="exact").eq("room_id", room_id).eq("status", "confirmed").lt("check_in", check_out.isoformat()).gt("check_out", check_in.isoformat()).execute()
        
        overlapping_count = overlapping_result.count if hasattr(overlapping_result, 'count') else len(overlapping_result.data) if overlapping_result.data else 0
        return overlapping_count == 0
    
    def calculate_total_price(self, room_id: int, check_in: datetime, check_out: datetime) -> float:
        """Calculate total price for a booking."""
        room_result = self.supabase.table("rooms").select("price_per_night").eq("id", room_id).limit(1).execute()
        if not room_result.data or len(room_result.data) == 0:
            return 0.0
        
        room = room_result.data[0]
        nights = (check_out - check_in).days
        return room["price_per_night"] * nights
