"""
Program: seed_db.py

Purpose: Inserts sample users and keygen accounts into the local 2FA database
         for development and testing.
"""

import sqlite3
import hashlib
import secrets
import os

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa.db')

def hash_password(password):
    """
    Purpose: Hashes a test user's password before it is inserted into the
             seed database.

    Parameters:
        password -- The plaintext password from the seed data.

    Returns:
        The hexadecimal SHA-256 password hash.
    """
    return hashlib.sha256(password.encode()).hexdigest()

def hash_email(email):
    """
    Purpose: Hashes an email address so it can be used as keygen salt data.

    Parameters:
        email -- The email address from the seed data.

    Returns:
        The hexadecimal SHA-256 email hash.
    """
    return hashlib.sha256(email.encode()).hexdigest()

def generate_secret_key():
    """
    Purpose: Creates a random secret key for a seeded keygen account.

    Returns:
        A 64-character hexadecimal secret.
    """
    return secrets.token_hex(32)

def seed():
    """
    Purpose: Inserts sample users and linked keygen account records.

    Post-condition:
        The database contains the configured test users unless they already
        existed.

    Returns:
        None.
    """
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    test_users = [
        ('alice@test.com',   'chesspass123', 'authpass123', 'admin'),
        ('bob@test.com',     'chesspass123', 'authpass456', 'user'),
        ('charlie@test.com', 'chesspass123', 'authpass789', 'user'),
    ]

    for email, chess_password, auth_password, role in test_users:
        # INSERT OR IGNORE lets the script be run more than once without duplicates.
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
