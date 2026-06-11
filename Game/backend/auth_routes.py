"""
Program: auth_routes.py

Purpose: Defines the public authentication API for the main CheckMate
         application. The routes in this file register users, validate
         passwords, verify two-factor authentication codes, issue JWT session
         tokens, and record authentication events for auditing.
"""

from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from db import get_db
from utils import sha256_hash, create_secret_key, write_auth_log, create_jwt
import re

auth_bp = Blueprint("auth", __name__)

def validate_game_password(password):
    """
    Purpose: Checks that a main application password satisfies the minimum
             security requirements before it is stored.

    Parameters:
        password -- The plaintext password entered by the user.

    Returns:
        A validation error message when the password is invalid, otherwise
        None.
    """
    if len(password) < 8:
        return "Password must be at least 8 characters long"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return "Password must contain at least one special character"

    return None

@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Purpose: Creates a new main application user and the matching keygen
             account used later by the authenticator service.

    Returns:
        A JSON response describing success or the reason registration failed.
    """
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    password_error = validate_game_password(password)

    if password_error:
        return jsonify({"message": password_error}), 400

    conn = get_db()
    cursor = conn.cursor()

    existing_user = cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        conn.close()
        return jsonify({"message": "User already exists"}), 400

    password_hash = generate_password_hash(password)
    secret_key = create_secret_key()
    hash_salt = sha256_hash(email)

    try:
        # Store the main account first so the generated user id can link to 2FA.
        cursor.execute("""
            INSERT INTO users (email, password_hash, role, is_active)
            VALUES (?, ?, 'user', 1)
        """, (email, password_hash))

        user_id = cursor.lastrowid

        cursor.execute("""
            INSERT INTO keygen_accounts (user_id, secret_key, hash_salt, is_active)
            VALUES (?, ?, ?, 1)
        """, (user_id, secret_key, hash_salt))

        conn.commit()
        conn.close()

        write_auth_log(user_id, "admin_action", 1, request.remote_addr)

        return jsonify({"message": "User registered successfully"}), 201

    except Exception:
        conn.rollback()
        conn.close()
        return jsonify({"message": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Purpose: Verifies the user's email and password before the second factor
             is requested.

    Returns:
        A JSON response confirming password verification or explaining why the
        login attempt failed.
    """
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    user = cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if not user:
        return jsonify({"message": "Invalid email or password"}), 401

    if user["is_active"] != 1:
        write_auth_log(user["id"], "login_fail", 0, request.remote_addr)
        return jsonify({"message": "Account is suspended"}), 403

    if not check_password_hash(user["password_hash"], password):
        write_auth_log(user["id"], "login_fail", 0, request.remote_addr)
        return jsonify({"message": "Invalid email or password"}), 401

    write_auth_log(user["id"], "login_success", 1, request.remote_addr)

    return jsonify({"message": "Password verified"}), 200


@auth_bp.route("/authenticate", methods=["POST"])
def authenticate():
    """
    Purpose: Completes login by checking the submitted 2FA code against the
             active unused code stored for the user's keygen account.

    Returns:
        A JSON response containing a JWT and user details when authentication
        succeeds, otherwise an error response.
    """
    data = request.get_json()
    email = data.get("email", "").lower().strip()
    code = data.get("code", "")

    if not email or not code:
        return jsonify({"message": "Email and code are required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    user = cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    keygen_account = cursor.execute("""
        SELECT * FROM keygen_accounts
        WHERE user_id = ? AND is_active = 1
    """, (user["id"],)).fetchone()

    if not keygen_account:
        conn.close()
        write_auth_log(user["id"], "2fa_fail", 0, request.remote_addr)
        return jsonify({"message": "No active keygen account found"}), 403

    code_hash = sha256_hash(code)

    # Only unused, unexpired codes are accepted so each code can be used once.
    active_code = cursor.execute("""
        SELECT * FROM active_codes
        WHERE keygen_account_id = ?
        AND code_hash = ?
        AND is_used = 0
        AND datetime(valid_until) > datetime('now')
        ORDER BY valid_until DESC
        LIMIT 1
    """, (keygen_account["id"], code_hash)).fetchone()

    if not active_code:
        conn.close()
        write_auth_log(user["id"], "2fa_fail", 0, request.remote_addr)
        return jsonify({"message": "Invalid or expired authentication code"}), 401

    cursor.execute("""
        UPDATE active_codes
        SET is_used = 1
        WHERE id = ?
    """, (active_code["id"],))

    conn.commit()
    conn.close()

    write_auth_log(user["id"], "2fa_success", 1, request.remote_addr)

    token = create_jwt(user)

    return jsonify({
        "token": token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "role": user["role"]
        }
    }), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Purpose: Provides a logout endpoint for the frontend. JWT sessions are
             stateless, so the client removes its saved token.

    Returns:
        A JSON response confirming logout.
    """
    return jsonify({"message": "Logged out successfully"}), 200
