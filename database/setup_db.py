import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa.db')
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), 'schema.sql')

def setup():
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