"""
Program: database.py

Purpose: Creates the SQLite schema for the main CheckMate application. The
         schema stores users, keygen accounts, temporary 2FA codes, and
         authentication logs used by the frontend and backend routes.
"""

import sqlite3
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "2fa_app.db")

def create_database():
    """
    Purpose: Creates all required SQLite tables if they do not already exist.

    Post-condition:
        The database file contains users, keygen_accounts, active_codes, and
        auth_logs tables with the expected relationships.

    Returns:
        None.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Table 1 — Users
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        keygen_password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'user' 
            CHECK(role IN ('user','admin')),
        is_active INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )''')

    # Table 2 — Keygen accounts
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS keygen_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL UNIQUE,
        secret_key TEXT NOT NULL,
        hash_salt TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_generated_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE CASCADE
    )''')

    # Table 3 — Active codes
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS active_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        keygen_account_id INTEGER NOT NULL,
        code_hash TEXT NOT NULL,
        valid_from TEXT NOT NULL,
        valid_until TEXT NOT NULL,
        is_used INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (keygen_account_id) 
            REFERENCES keygen_accounts(id) 
            ON DELETE CASCADE
    )''')

    # Table 4 — Auth logs
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS auth_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        event_type TEXT NOT NULL CHECK(event_type IN (
            'login_success','login_fail',
            '2fa_success','2fa_fail',
            'admin_action','account_suspended')),
        success INTEGER NOT NULL DEFAULT 0,
        ip_address TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) 
            ON DELETE SET NULL
    )''')

    conn.commit()
    conn.close()
    print("Database created successfully!")

try:
    create_database()
except Exception as e:
    print(f"Error: {e}")
