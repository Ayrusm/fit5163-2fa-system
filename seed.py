import sqlite3
import hashlib

def seed_database():
    conn = sqlite3.connect('2fa_app.db')
    cursor = conn.cursor()

    chess_password = hashlib.sha256('chess123'.encode()).hexdigest()
    keygen_password = hashlib.sha256('keygen456'.encode()).hexdigest()

    cursor.execute('''
        INSERT OR IGNORE INTO users 
        (email, password_hash, keygen_password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?)
    ''', ('test@chess.com', chess_password, keygen_password, 'user', 1))

    cursor.execute('''
        INSERT OR IGNORE INTO users 
        (email, password_hash, keygen_password_hash, role, is_active)
        VALUES (?, ?, ?, ?, ?)
    ''', ('admin@chess.com', chess_password, keygen_password, 'admin', 1))

    conn.commit()
    conn.close()
    print("Test users created!")
    print("test@chess.com / chess: chess123 / keygen: keygen456")
    print("admin@chess.com / chess: chess123 / keygen: keygen456")

try:
    seed_database()
except Exception as e:
    print(f"Error: {e}")