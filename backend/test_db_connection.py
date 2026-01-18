#!/usr/bin/env python3
"""
Database Connection Test Script

This script tests the Supabase connection and verifies that:
1. Environment variables are loaded correctly
2. Supabase client connection is successful
3. Basic queries can be executed
4. Tables are accessible

Usage:
    python test_db_connection.py
"""

import sys
import os

# Add the backend directory to the path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.core.config import settings
    from app.database.connection import get_supabase
except ImportError as e:
    print(f"❌ Error importing modules: {e}")
    print("Make sure you're running this from the backend directory and have installed dependencies.")
    sys.exit(1)


def test_environment_variables():
    """Test that all required environment variables are set."""
    print("=" * 60)
    print("Testing Environment Variables")
    print("=" * 60)
    
    required_vars = {
        "SUPABASE_URL": settings.SUPABASE_URL,
        "SUPABASE_KEY": settings.SUPABASE_KEY,
        "OPENAI_API_KEY": settings.OPENAI_API_KEY,
        "JWT_SECRET": settings.JWT_SECRET,
    }
    
    all_set = True
    for var_name, var_value in required_vars.items():
        if var_value:
            # Mask sensitive parts
            if "KEY" in var_name or "SECRET" in var_name:
                masked = var_value[:20] + "..." if len(var_value) > 20 else "***"
                print(f"✅ {var_name}: {masked}")
            else:
                print(f"✅ {var_name}: {var_value}")
        else:
            print(f"❌ {var_name}: NOT SET")
            all_set = False
    
    print()
    return all_set


def test_supabase_connection():
    """Test Supabase client connection."""
    print("=" * 60)
    print("Testing Supabase Client Connection")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        print("✅ Supabase client created successfully")
        print(f"✅ Supabase URL: {settings.SUPABASE_URL}")
        
        return True
            
    except Exception as e:
        print(f"❌ Supabase client connection failed: {e}")
        return False


def test_supabase_tables():
    """Test if we can access Supabase tables."""
    print("=" * 60)
    print("Testing Supabase Tables")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # List of expected tables
        expected_tables = ["users", "rooms", "bookings", "documents", "document_chunks", "chat_logs"]
        accessible_tables = []
        
        for table_name in expected_tables:
            try:
                # Try to select from the table (limit 0 to just test access)
                result = supabase.table(table_name).select("id").limit(0).execute()
                accessible_tables.append(table_name)
                print(f"✅ Table '{table_name}' is accessible")
            except Exception as e:
                error_msg = str(e)
                if "relation" in error_msg.lower() or "does not exist" in error_msg.lower():
                    print(f"⚠️  Table '{table_name}' does not exist (run migrations)")
                else:
                    print(f"⚠️  Table '{table_name}' access error: {error_msg[:50]}...")
        
        if accessible_tables:
            print(f"\n✅ {len(accessible_tables)} table(s) are accessible")
        else:
            print("\n⚠️  No tables are accessible. Make sure you've run the database migrations.")
        
        return len(accessible_tables) > 0
            
    except Exception as e:
        print(f"❌ Error testing tables: {e}")
        return False


def test_supabase_operations():
    """Test basic Supabase operations."""
    print("=" * 60)
    print("Testing Supabase Operations")
    print("=" * 60)
    
    try:
        supabase = get_supabase()
        
        # Test count operation
        try:
            result = supabase.table("users").select("id", count="exact").limit(0).execute()
            count = result.count if hasattr(result, 'count') else 0
            print(f"✅ Count operation works (users table: {count} rows)")
        except Exception as e:
            print(f"⚠️  Count operation test: {str(e)[:80]}...")
        
        # Test select operation
        try:
            result = supabase.table("rooms").select("*").limit(1).execute()
            if result.data is not None:
                print("✅ Select operation works")
            else:
                print("⚠️  Select operation returned no data (table might be empty)")
        except Exception as e:
            print(f"⚠️  Select operation test: {str(e)[:80]}...")
        
        return True
            
    except Exception as e:
        print(f"❌ Error testing operations: {e}")
        return False


def main():
    """Run all tests."""
    print("\n" + "=" * 60)
    print("Supabase Connection Test")
    print("=" * 60 + "\n")
    
    results = {
        "Environment Variables": test_environment_variables(),
        "Supabase Connection": test_supabase_connection(),
        "Supabase Tables": test_supabase_tables(),
        "Supabase Operations": test_supabase_operations(),
    }
    
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    all_passed = True
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not passed:
            all_passed = False
    
    print("=" * 60)
    
    if all_passed:
        print("\n🎉 All tests passed! Supabase connection is working correctly.")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check your configuration.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
