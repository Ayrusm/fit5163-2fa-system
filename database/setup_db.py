"""
Program: setup_db.py

Purpose: Initializes the project database from the SQL schema file when the
         database does not already exist. This script is intended for first-time
         local setup.
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa_app.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def setup():
    """
    Purpose: Creates the SQLite database by executing schema.sql.

    Post-condition:
        A database file exists at DB_PATH unless setup was skipped because the
        file was already present.

    Returns:
        None.
    """
    if os.path.exists(DB_PATH):
        print("Database already exists. Skipping setup.")
        print("Delete 2fa.db manually if you want to reset.")
        return
    print("Setting up database...")
    conn = sqlite3.connect(DB_PATH)
    with open(SCHEMA_PATH, 'r') as f:
        conn.executescript(f.read())
    conn.commit()
    conn.close()
    print("Done! 2fa.db created successfully.")

if __name__ == '__main__':
    setup()
