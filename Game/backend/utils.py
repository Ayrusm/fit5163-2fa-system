import hashlib
import secrets
import jwt
import datetime
import os
from db import get_db

JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")

def sha256_hash(value):
    return hashlib.sha256(value.encode()).hexdigest()

def create_secret_key():
    return secrets.token_hex(32)

def write_auth_log(user_id, event_type, success, ip_address):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO auth_logs (user_id, event_type, success, ip_address)
        VALUES (?, ?, ?, ?)
    """, (user_id, event_type, success, ip_address))

    conn.commit()
    conn.close()

def create_jwt(user):
    return jwt.encode({
        "user_id": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, JWT_SECRET, algorithm="HS256")
