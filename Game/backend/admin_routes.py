"""
Program: admin_routes.py

Purpose: Defines administrator API routes for the CheckMate 2FA system. These
         routes expose user records, keygen account records, authentication
         logs, and account status updates for the admin dashboard.
"""

from flask import Blueprint, request, jsonify
from db import get_db

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/users", methods=["GET"])
def get_admin_users():
    """
    Purpose: Retrieves all registered users for the admin dashboard.

    Returns:
        A JSON list of user records ordered by creation date.
    """
    conn = get_db()
    cursor = conn.cursor()

    users = cursor.execute("""
        SELECT id, email, role, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
    """).fetchall()

    conn.close()
    return jsonify([dict(user) for user in users]), 200


@admin_bp.route("/admin/keygen-accounts", methods=["GET"])
def get_keygen_accounts():
    """
    Purpose: Retrieves keygen accounts and their linked user email addresses.

    Returns:
        A JSON list of keygen account records ordered by creation date.
    """
    conn = get_db()
    cursor = conn.cursor()

    accounts = cursor.execute("""
        SELECT 
            keygen_accounts.id,
            keygen_accounts.user_id,
            users.email,
            keygen_accounts.is_active,
            keygen_accounts.last_generated_at,
            keygen_accounts.created_at
        FROM keygen_accounts
        JOIN users ON keygen_accounts.user_id = users.id
        ORDER BY keygen_accounts.created_at DESC
    """).fetchall()

    conn.close()
    return jsonify([dict(account) for account in accounts]), 200


@admin_bp.route("/admin/auth-logs", methods=["GET"])
def get_auth_logs():
    """
    Purpose: Retrieves recent authentication and admin events for auditing.

    Returns:
        A JSON list containing up to the latest 100 authentication log entries.
    """
    conn = get_db()
    cursor = conn.cursor()

    logs = cursor.execute("""
        SELECT 
            auth_logs.id,
            auth_logs.user_id,
            users.email,
            auth_logs.event_type,
            auth_logs.success,
            auth_logs.ip_address,
            auth_logs.created_at
        FROM auth_logs
        LEFT JOIN users ON auth_logs.user_id = users.id
        ORDER BY auth_logs.created_at DESC
        LIMIT 100
    """).fetchall()

    conn.close()
    return jsonify([dict(log) for log in logs]), 200


@admin_bp.route("/admin/users/<int:user_id>/status", methods=["PATCH"])
def update_user_status(user_id):
    """
    Purpose: Enables or disables a user account and keeps the linked keygen
             account in the same active state.

    Parameters:
        user_id -- The database id of the user whose status should be updated.

    Returns:
        A JSON response describing the updated account status or the validation
        error that prevented the update.
    """
    data = request.get_json()
    is_active = data.get("is_active")

    if is_active not in [0, 1]:
        return jsonify({"message": "is_active must be 0 or 1"}), 400

    conn = get_db()
    cursor = conn.cursor()

    user = cursor.execute(
        "SELECT * FROM users WHERE id = ?",
        (user_id,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({"message": "User not found"}), 404

    cursor.execute("""
        UPDATE users
        SET is_active = ?, updated_at = datetime('now')
        WHERE id = ?
    """, (is_active, user_id))

    cursor.execute("""
        UPDATE keygen_accounts
        SET is_active = ?
        WHERE user_id = ?
    """, (is_active, user_id))

    event_type = "account_suspended" if is_active == 0 else "admin_action"

    # Record the status change so the admin activity appears in auth logs.
    cursor.execute("""
        INSERT INTO auth_logs (user_id, event_type, success, ip_address)
        VALUES (?, ?, ?, ?)
    """, (user_id, event_type, 1, request.remote_addr))

    conn.commit()
    conn.close()

    return jsonify({
        "message": "User status updated successfully",
        "user_id": user_id,
        "is_active": is_active
    }), 200
