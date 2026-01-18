"""
Helper functions for Supabase database operations.
Provides a convenient interface for common database operations.
"""

from typing import Optional, List, Dict, Any
from app.database.connection import get_supabase


def get_table(table_name: str):
    """Get a Supabase table reference."""
    supabase = get_supabase()
    return supabase.table(table_name)


def select_one(table_name: str, filters: Optional[Dict] = None, order_by: Optional[str] = None) -> Optional[Dict]:
    """Select a single row from a table."""
    table = get_table(table_name)
    query = table.select("*")
    
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    
    if order_by:
        query = query.order(order_by)
    
    result = query.limit(1).execute()
    if result.data and len(result.data) > 0:
        return result.data[0]
    return None


def select_many(table_name: str, filters: Optional[Dict] = None, order_by: Optional[str] = None, 
                limit: Optional[int] = None, offset: Optional[int] = None) -> List[Dict]:
    """Select multiple rows from a table."""
    table = get_table(table_name)
    query = table.select("*")
    
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    
    if order_by:
        query = query.order(order_by)
    
    if limit:
        query = query.limit(limit)
    
    if offset:
        query = query.offset(offset)
    
    result = query.execute()
    return result.data if result.data else []


def insert(table_name: str, data: Dict) -> Dict:
    """Insert a new row into a table."""
    table = get_table(table_name)
    result = table.insert(data).execute()
    return result.data[0] if result.data else {}


def update(table_name: str, filters: Dict, data: Dict) -> Optional[Dict]:
    """Update rows in a table."""
    table = get_table(table_name)
    query = table.update(data)
    
    for key, value in filters.items():
        query = query.eq(key, value)
    
    result = query.execute()
    return result.data[0] if result.data and len(result.data) > 0 else None


def delete(table_name: str, filters: Dict) -> bool:
    """Delete rows from a table."""
    table = get_table(table_name)
    query = table.delete()
    
    for key, value in filters.items():
        query = query.eq(key, value)
    
    result = query.execute()
    return True


def count(table_name: str, filters: Optional[Dict] = None) -> int:
    """Count rows in a table."""
    table = get_table(table_name)
    query = table.select("id", count="exact")
    
    if filters:
        for key, value in filters.items():
            query = query.eq(key, value)
    
    result = query.execute()
    return result.count if hasattr(result, 'count') else len(result.data) if result.data else 0


def execute_rpc(function_name: str, params: Optional[Dict] = None) -> Any:
    """Execute a PostgreSQL function (RPC) via Supabase."""
    supabase = get_supabase()
    if params:
        result = supabase.rpc(function_name, params).execute()
    else:
        result = supabase.rpc(function_name).execute()
    return result.data if result.data else None


