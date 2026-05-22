import time
import sys
import os
import hashlib
import sqlite3
import threading
from flask import Flask, request, jsonify, session

sys.path.append(os.path.dirname(__file__))

from code_generator import generate_code, hash_code, seconds_until_next_window
from db_helper import get_active_users, save_code

# ─────────────────────────────────────────
# Flask app setup
# ─────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.urandom(24)

DB_PATH = os.path.join(os.path.dirname(__file__), '..', '2fa.db')

def hash_password(password):
    return hashlib.sha256(password.encode()).hexdigest()


# ─────────────────────────────────────────
# Keygen background loop
# ─────────────────────────────────────────
def run_keygen_loop():
    print("Keygen loop started. Generating codes every 15 seconds...")
    while True:
        try:
            users = get_active_users()
            if not users:
                print("No active users found. Waiting...")
            else:
                print(f"Generating codes for {len(users)} user(s)...")
                for user_id, email, keygen_account_id, secret_key, hash_salt in users:
                    raw_code = generate_code(secret_key, hash_salt)
                    stored_hash = hash_code(raw_code)
                    save_code(keygen_account_id, stored_hash)
                    print(f"  {email} → code: {raw_code}")
            print("  Next refresh in 15 seconds...\n")
        except Exception as e:
            print(f"Error during code generation: {e}")

        time.sleep(seconds_until_next_window())


# ─────────────────────────────────────────
# Authenticator routes
# ─────────────────────────────────────────
@app.route('/authenticator/login', methods=['POST'])
def authenticator_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute('''
        SELECT u.id, u.is_active, k.id
        FROM users u
        JOIN keygen_accounts k ON u.id = k.user_id
        WHERE u.email = ? AND u.auth_app_password_hash = ?
    ''', (email, hash_password(password)))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({ 'success': False, 'error': 'Invalid credentials' }), 401

    user_id, is_active, keygen_account_id = user

    if not is_active:
        return jsonify({ 'success': False, 'error': 'Account suspended' }), 403

    session['user_id'] = user_id
    session['keygen_account_id'] = keygen_account_id
    return jsonify({ 'success': True })


@app.route('/authenticator/code', methods=['GET'])
def get_current_code():
    if 'user_id' not in session:
        return jsonify({ 'success': False, 'error': 'Not logged in' }), 401

    keygen_account_id = session['keygen_account_id']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT code_hash, valid_until
        FROM active_codes
        WHERE keygen_account_id = ? AND is_used = 0
        ORDER BY valid_from DESC LIMIT 1
    ''', (keygen_account_id,))
    code_row = cursor.fetchone()
    conn.close()

    if not code_row:
        return jsonify({ 'success': False, 'error': 'No code available yet' })

    return jsonify({
        'success': True,
        'valid_until': code_row[1]
    })


@app.route('/authenticator/logout', methods=['POST'])
def authenticator_logout():
    session.clear()
    return jsonify({ 'success': True })


@app.route('/keygen/status', methods=['GET'])
def status():
    return jsonify({ 'running': True })


# ─────────────────────────────────────────
# Start both together
# ─────────────────────────────────────────
if __name__ == '__main__':
    # Run the keygen loop in a background thread
    # daemon=True means it stops automatically when the app stops
    keygen_thread = threading.Thread(target=run_keygen_loop, daemon=True)
    keygen_thread.start()

    # Run the Flask web server
    print("Starting authenticator web server on http://localhost:5001")
    app.run(port=5001, debug=False)