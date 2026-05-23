import sqlite3
import os
from datetime import datetime, timedelta

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa_app.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def get_active_users():
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