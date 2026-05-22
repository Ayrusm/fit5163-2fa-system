import sqlite3
import hashlib
import secrets
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa.db')

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()

def hash_email(email):
    return hashlib.sha256(email.encode()).hexdigest()

def generate_secret_key():
    return secrets.token_hex(32)

def seed():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    test_users = [
        ('alice@test.com',   'chesspass123', 'authpass123', 'admin'),
        ('bob@test.com',     'chesspass123', 'authpass456', 'user'),
        ('charlie@test.com', 'chesspass123', 'authpass789', 'user'),
    ]

    for email, chess_password, auth_password, role in test_users:
        cursor.execute('''
            INSERT OR IGNORE INTO users 
                (email, password_hash, auth_app_password_hash, role)
            VALUES (?, ?, ?, ?)
        ''', (
            email,
            hash_password(chess_password),
            hash_password(auth_password),
            role
        ))

        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_id = cursor.fetchone()[0]

        cursor.execute('''
            INSERT OR IGNORE INTO keygen_accounts (user_id, secret_key, hash_salt)
            VALUES (?, ?, ?)
        ''', (user_id, generate_secret_key(), hash_email(email)))

        print(f"Seeded: {email}")

    conn.commit()
    conn.close()
    print("Seeding complete!")

if __name__ == '__main__':
    seed()