"""
Program: seed_admin.py

Purpose: Creates the default administrator account for the CheckMate system
         when one does not already exist. The account is linked to a keygen
         record so it can use the same 2FA flow as standard users.
"""

import os
from werkzeug.security import generate_password_hash

from db import get_db
from utils import create_secret_key, sha256_hash


def seed_admin_user():
    """
    Purpose: Inserts the demo admin user and linked keygen account if the
             configured admin email is not already present.

    Returns:
        None.
    """
    admin_email = os.getenv("ADMIN_EMAIL", "admin@securechess.com").lower().strip()
    admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")

    conn = get_db()
    cursor = conn.cursor()

    existing_admin = cursor.execute(
        "SELECT id FROM users WHERE email = ?",
        (admin_email,)
    ).fetchone()

    if existing_admin:
        print(f"Admin user already exists: {admin_email}")
        conn.close()
        return

    password_hash = generate_password_hash(admin_password)
    secret_key = create_secret_key()
    hash_salt = sha256_hash(admin_email)

    # Admins are created without an authenticator password until setup/login flow.
    cursor.execute("""
        INSERT INTO users (
            email,
            password_hash,
            keygen_password_hash,
            role,
            is_active
        )
        VALUES (?, ?, NULL, 'admin', 1)
    """, (admin_email, password_hash))

    admin_user_id = cursor.lastrowid

    cursor.execute("""
        INSERT INTO keygen_accounts (
            user_id,
            secret_key,
            hash_salt,
            is_active
        )
        VALUES (?, ?, ?, 1)
    """, (admin_user_id, secret_key, hash_salt))

    conn.commit()
    conn.close()

    print("Demo admin user created successfully.")
    print(f"Email: {admin_email}")
    print(f"Password: {admin_password}")
