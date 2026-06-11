"""
Program: utils.py

Purpose: Contains shared security helpers for the main CheckMate backend,
         including hashing, secret generation, audit logging, and JWT creation.
"""

import hashlib
import secrets
import jwt
import datetime
import os
from db import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")

def sha256_hash(value):
    """
    Purpose: Creates a SHA-256 hash for a string value.

    Parameters:
        value -- The plaintext value to hash.

    Returns:
        The hexadecimal SHA-256 digest.
    """
    return hashlib.sha256(value.encode()).hexdigest()

def create_secret_key():
    """
    Purpose: Generates a random secret key for a keygen account.

    Returns:
        A 64-character hexadecimal secret generated from secure random bytes.
    """
    return secrets.token_hex(32)

def write_auth_log(user_id, event_type, success, ip_address):
    """
    Purpose: Stores an authentication or admin event in the audit log table.

    Parameters:
        user_id -- The id of the related user, when available.
        event_type -- The category of event being recorded.
        success -- 1 for a successful event and 0 for a failed event.
        ip_address -- The client IP address reported by Flask.

    Returns:
        None.
    """
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO auth_logs (user_id, event_type, success, ip_address)
        VALUES (?, ?, ?, ?)
    """, (user_id, event_type, success, ip_address))

    conn.commit()
    conn.close()

def create_jwt(user):
    """
    Purpose: Creates a signed JWT for an authenticated main application user.

    Parameters:
        user -- A database row containing id, email, and role fields.

    Returns:
        A signed JWT string that expires after one hour.
    """
    return jwt.encode({
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, JWT_SECRET, algorithm="HS256")
