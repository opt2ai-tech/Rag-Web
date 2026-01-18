from app.core.config import settings
import supabase

# Supabase client
supabase_client = supabase.create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_supabase():
    """Get Supabase client dependency."""
    return supabase_client
