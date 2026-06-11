"""
Program: db_helper.py

Purpose: Provides database helper functions for the authenticator backend.
         These helpers find active keygen users and save the latest hashed
         verification code to the main CheckMate database.
"""

import sqlite3
import os
from datetime import datetime, timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "Game", "2fa_app.db")

def get_connection():
    """
    Purpose: Opens a SQLite connection with foreign key checks enabled.

    Returns:
        A SQLite connection to the shared CheckMate database.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def get_active_users():
    """
    Purpose: Retrieves users whose main account and keygen account are both
             active.

    Returns:
        A list of user and keygen account tuples needed to generate codes.
    """
    # Returns all users who have an active keygen account
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT u.id, u.email, k.id, k.secret_key, k.hash_salt
        FROM users u
        JOIN keygen_accounts k ON u.id = k.user_id
        WHERE u.is_active = 1 AND k.is_active = 1
    ''')
    users = cursor.fetchall()
    conn.close()
    return users

def save_code(keygen_account_id, code_hash):
    """
    Purpose: Replaces the current active code for a keygen account with a new
             hashed code and updates the generation timestamp.

    Parameters:
        keygen_account_id -- The keygen account that owns the code.
        code_hash -- The SHA-256 hash of the generated raw code.

    Returns:
        None.
    """
    # Deletes the old code for this user and inserts the new one
    now = datetime.utcnow()
    valid_until = now + timedelta(seconds=15)

    conn = get_connection()
    cursor = conn.cursor()

    # Delete old code for this keygen account
    cursor.execute('''
        DELETE FROM active_codes
        WHERE keygen_account_id = ?
    ''', (keygen_account_id,))

    # Insert the new code
    cursor.execute('''
        INSERT INTO active_codes (keygen_account_id, code_hash, valid_from, valid_until, is_used)
        VALUES (?, ?, ?, ?, 0)
    ''', (
        keygen_account_id,
        code_hash,
        now.strftime('%Y-%m-%d %H:%M:%S'),
        valid_until.strftime('%Y-%m-%d %H:%M:%S')
    ))

    # Update last_generated_at on the keygen account
    cursor.execute('''
        UPDATE keygen_accounts
        SET last_generated_at = ?
        WHERE id = ?
    ''', (now.strftime('%Y-%m-%d %H:%M:%S'), keygen_account_id))

    conn.commit()
    conn.close()
