import hmac
import hashlib
import time

def get_time_window():
    # Returns a number that changes every 15 seconds
    return int(time.time() // 15)

def generate_code(secret_key, hash_salt):
    time_window = get_time_window()
    message = f"{hash_salt}:{time_window}".encode()
    secret = secret_key.encode()
    raw_code = hmac.new(secret, message, hashlib.sha256).hexdigest()[:6].upper()
    return raw_code

def hash_code(raw_code):
    # This is what gets stored in the database - never the raw code
    return hashlib.sha256(raw_code.encode()).hexdigest()

def seconds_until_next_window():
    # How long to sleep until the next 15s window starts
    return 15 - (time.time() % 15)