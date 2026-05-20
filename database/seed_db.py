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
        ('alice@test.com', 'password123', 'admin'),
        ('bob@test.com',   'password123', 'user'),
        ('charlie@test.com','password123', 'user'),
    ]

    for email, password, role in test_users:
        # Insert into users
        cursor.execute('''
            INSERT OR IGNORE INTO users (email, password_hash, role)
            VALUES (?, ?, ?)
        ''', (email, hash_password(password), role))

        # Get the user id
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        user_id = cursor.fetchone()[0]

        # Insert into keygen_accounts
        cursor.execute('''
            INSERT OR IGNORE INTO keygen_accounts (user_id, secret_key, hash_salt)
            VALUES (?, ?, ?)
        ''', (user_id, generate_secret_key(), hash_email(email)))

        print(f"Seeded user: {email}")

    conn.commit()
    conn.close()
    print("Seeding complete!")

if __name__ == '__main__':
    seed()