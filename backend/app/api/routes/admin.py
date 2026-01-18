from fastapi import APIRouter, Depends
from datetime import datetime
from app.database.connection import get_supabase
from app.models import schemas
from app.api.dependencies import get_admin_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/stats", response_model=schemas.DashboardStats)
async def get_dashboard_stats(
    admin: dict = Depends(get_admin_user)
):
    """Get dashboard statistics (Admin only)."""
    supabase = get_supabase()
    
    # Count rooms
    rooms_result = supabase.table("rooms").select("id", count="exact").execute()
    total_rooms = rooms_result.count if hasattr(rooms_result, 'count') else len(rooms_result.data) if rooms_result.data else 0
    
    # Count bookings
    bookings_result = supabase.table("bookings").select("id", count="exact").execute()
    total_bookings = bookings_result.count if hasattr(bookings_result, 'count') else len(bookings_result.data) if bookings_result.data else 0
    
    # Calculate total revenue - get confirmed bookings with room prices
    confirmed_bookings = supabase.table("bookings").select("*, rooms(price_per_night)").eq("status", "confirmed").execute()
    
    total_revenue = 0.0
    if confirmed_bookings.data:
        for booking in confirmed_bookings.data:
            if booking.get("rooms") and isinstance(booking["rooms"], list) and len(booking["rooms"]) > 0:
                price_per_night = booking["rooms"][0].get("price_per_night", 0)
            elif isinstance(booking.get("rooms"), dict):
                price_per_night = booking["rooms"].get("price_per_night", 0)
            else:
                # Fallback: get room price separately
                room_result = supabase.table("rooms").select("price_per_night").eq("id", booking["room_id"]).limit(1).execute()
                price_per_night = room_result.data[0]["price_per_night"] if room_result.data else 0
            
            # Calculate nights
            check_in = datetime.fromisoformat(booking["check_in"].replace("Z", "+00:00"))
            check_out = datetime.fromisoformat(booking["check_out"].replace("Z", "+00:00"))
            nights = (check_out - check_in).days
            total_revenue += price_per_night * nights
    
    # Count chat logs
    chat_logs_result = supabase.table("chat_logs").select("id", count="exact").execute()
    total_chat_logs = chat_logs_result.count if hasattr(chat_logs_result, 'count') else len(chat_logs_result.data) if chat_logs_result.data else 0
    
    return schemas.DashboardStats(
        total_rooms=total_rooms,
        total_bookings=total_bookings,
        total_revenue=float(total_revenue),
        total_chat_logs=total_chat_logs
    )
