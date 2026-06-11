import time
import sys
import os
import hashlib
import sqlite3
import threading
from flask import Flask, request, jsonify
import jwt
import datetime
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

sys.path.append(os.path.dirname(__file__))

from code_generator import generate_code, hash_code, seconds_until_next_window
from db_helper import get_active_users, save_code

# ─────────────────────────────────────────
# Flask app setup
# ─────────────────────────────────────────
app = Flask(__name__)
CORS(app, origins=["http://localhost:3001"])
JWT_SECRET = os.getenv("JWT_SECRET", "change_this_secret")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "Game", "2fa_app.db")

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

@app.route("/authenticator/register", methods=["POST"])
def authenticator_register():
    data = request.get_json()

    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Email and authenticator password are required"
        }), 400

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    user = cursor.execute("""
        SELECT id, is_active, keygen_password_hash
        FROM users
        WHERE email = ?
    """, (email,)).fetchone()

    if not user:
        conn.close()
        return jsonify({
            "success": False,
            "error": "Main app account not found. Please register in the main app first."
        }), 404

    user_id = user[0]
    is_active = user[1]
    existing_keygen_password_hash = user[2]

    if is_active != 1:
        conn.close()
        return jsonify({
            "success": False,
            "error": "Main app account is suspended."
        }), 403

    if existing_keygen_password_hash:
        conn.close()
        return jsonify({
            "success": False,
            "error": "Authenticator account already exists. Please login instead."
        }), 400

    keygen_account = cursor.execute("""
        SELECT id
        FROM keygen_accounts
        WHERE user_id = ?
    """, (user_id,)).fetchone()

    if not keygen_account:
        conn.close()
        return jsonify({
            "success": False,
            "error": "Keygen account row does not exist."
        }), 500

    keygen_account_id = keygen_account[0]
    keygen_password_hash = generate_password_hash(password)

    cursor.execute("""
        UPDATE users
        SET keygen_password_hash = ?, updated_at = datetime('now')
        WHERE id = ?
    """, (keygen_password_hash, user_id))

    cursor.execute("""
        UPDATE keygen_accounts
        SET is_active = 1
        WHERE user_id = ?
    """, (user_id,))

    conn.commit()
    conn.close()

    token = jwt.encode({
        "user_id": user_id,
        "keygen_account_id": keygen_account_id,
        "scope": "authenticator",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, JWT_SECRET, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Authenticator account created successfully.",
        "token": token,
        "user": {
            "id": user_id,
            "email": email
        }
    }), 201
    
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

    # In authenticator_login route, update this query:
    cursor.execute('''
        SELECT u.id, u.is_active, u.keygen_password_hash, k.id
        FROM users u
        JOIN keygen_accounts k ON u.id = k.user_id
        WHERE u.email = ?
    ''', (email,))

    user = cursor.fetchone()
    conn.close()

    if not user:
        return jsonify({ 'success': False, 'error': 'Invalid credentials' }), 401

    user_id, is_active, stored_hash, keygen_account_id = user

    if not is_active:
        return jsonify({ 'success': False, 'error': 'Account suspended' }), 403
    
    if not stored_hash:
        return jsonify({'success': False, 'error': 'Authenticator not set up'}), 403

    if not check_password_hash(stored_hash, password):
        return jsonify({'success': False, 'error': 'Invalid credentials'}), 401

    token = jwt.encode({
        'user_id': user_id,
        'keygen_account_id': keygen_account_id,
        'scope': 'authenticator',
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, JWT_SECRET, algorithm='HS256')

    return jsonify({ 'success': True, 'token': token })


@app.route('/authenticator/code', methods=['GET'])
def get_current_code():
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'success': False, 'error': 'Not logged in'}), 401

    token = auth_header.split(' ')[1]

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return jsonify({'success': False, 'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'success': False, 'error': 'Invalid token'}), 401

    if payload.get('scope') != 'authenticator':
        return jsonify({'success': False, 'error': 'Invalid token scope'}), 403

    keygen_account_id = payload['keygen_account_id']

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT code_hash, valid_until
        FROM active_codes
        WHERE keygen_account_id = ? AND is_used = 0
        AND datetime(valid_until) > datetime('now')
        ORDER BY valid_from DESC LIMIT 1
    ''', (keygen_account_id,))
    code_row = cursor.fetchone()
    conn.close()

    if not code_row:
        return jsonify({'success': False, 'error': 'No code available yet'})

    # Recalculate raw code using same HMAC formula
    from code_generator import generate_code
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        SELECT secret_key, hash_salt FROM keygen_accounts WHERE id = ?
    ''', (keygen_account_id,))
    account = cursor.fetchone()
    conn.close()

    raw_code = generate_code(account[0], account[1])
    seconds_left = 15 - (int(time.time()) % 15)

    return jsonify({
        'success': True,
        'code': raw_code,
        'valid_until': code_row[1],
        'seconds_left': seconds_left
    })


@app.route('/authenticator/logout', methods=['POST'])
def authenticator_logout():
    # JWT is stateless — frontend just deletes the token
    return jsonify({'success': True})

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