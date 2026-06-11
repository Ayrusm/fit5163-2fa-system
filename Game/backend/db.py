"""
Program: db.py

Purpose: Provides a shared SQLite connection helper for the main CheckMate
         backend so route files use the same database path and row format.
"""

import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "2fa_app.db")

print("MAIN BACKEND DB PATH:", DB_PATH)

def get_db():
    """
    Purpose: Opens a connection to the main application database.

    Returns:
        A SQLite connection configured to return rows that can be accessed by
        column name.
    """
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
