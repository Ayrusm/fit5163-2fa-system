"""
Program: code_generator.py

Purpose: Generates short-lived HMAC-based verification codes for the
         authenticator service and hashes those codes before storage in the
         main CheckMate database.
"""

import hmac
import hashlib
import time

def get_time_window():
    """
    Purpose: Calculates the current 15-second time window used for code
             generation.

    Returns:
        The integer time-window number for the current Unix timestamp.
    """
    return int(time.time() // 15)

def generate_code(secret_key, hash_salt):
    """
    Purpose: Generates the current 6-character authentication code for a
             keygen account.

    Parameters:
        secret_key -- The account-specific HMAC secret.
        hash_salt -- The account-specific salt derived from the user's email.

    Returns:
        A 6-character uppercase verification code.
    """
    time_window = get_time_window()
    message = f"{hash_salt}:{time_window}".encode()
    secret = secret_key.encode()
    # Combining the salt with the time window makes the code change every period.
    raw_code = hmac.new(secret, message, hashlib.sha256).hexdigest()[:6].upper()
    return raw_code

def hash_code(raw_code):
    """
    Purpose: Hashes a generated code before saving it in the database.

    Parameters:
        raw_code -- The visible code produced for the authenticator user.

    Returns:
        The hexadecimal SHA-256 digest of the code.
    """
    return hashlib.sha256(raw_code.encode()).hexdigest()

def seconds_until_next_window():
    """
    Purpose: Calculates how long remains in the current 15-second code window.

    Returns:
        The number of seconds until the next code refresh.
    """
    return 15 - (time.time() % 15)
