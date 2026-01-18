#!/usr/bin/env python3
"""
Script to create or reset admin user password
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.connection import get_supabase
from app.core.security import get_password_hash, verify_password

def create_or_update_admin():
    """Create or update admin user with password 'admin123'."""
    supabase = get_supabase()
    
    email = "admin@hotel.com"
    password = "admin123"
    
    # Check if user exists
    result = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    
    # Generate new password hash
    new_hash = get_password_hash(password)
    print(f"Generated password hash: {new_hash[:50]}...")
    
    if result.data and len(result.data) > 0:
        # User exists - update password
        user = result.data[0]
        print(f"Found existing user: {user['email']} (ID: {user['id']})")
        print("Updating password...")
        
        supabase.table("users").update({
            "password_hash": new_hash,
            "role": "admin"
        }).eq("id", user["id"]).execute()
        
        print("[SUCCESS] Admin password updated successfully!")
    else:
        # User doesn't exist - create new
        print("Admin user not found. Creating new admin user...")
        
        new_user = {
            "email": email,
            "password_hash": new_hash,
            "role": "admin"
        }
        
        result = supabase.table("users").insert(new_user).execute()
        print("[SUCCESS] Admin user created successfully!")
    
    # Verify the password works
    result = supabase.table("users").select("*").eq("email", email).limit(1).execute()
    if result.data:
        user = result.data[0]
        if verify_password(password, user["password_hash"]):
            print(f"[SUCCESS] Password verification successful!")
            print(f"\nLogin credentials:")
            print(f"  Email: {email}")
            print(f"  Password: {password}")
        else:
            print("[ERROR] Password verification failed!")

if __name__ == "__main__":
    try:
        create_or_update_admin()
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()

