"""
Program: app.py

Purpose: Starts the main CheckMate backend service. The application loads
         environment settings, registers authentication and administration
         routes, prepares the database, creates the demo admin account, and
         runs the Flask API server.
"""

from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from auth_routes import auth_bp
from admin_routes import admin_bp
from seed_admin import seed_admin_user
from database import create_database

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

@app.route("/", methods=["GET"])
def home():
    """
    Purpose: Provides a simple health check for the main backend.

    Returns:
        A small JSON-compatible message confirming the service is running.
    """
    return {
        "message": "CheckMate 2FA backend is running"
    }

if __name__ == "__main__":
    # Prepare required database tables and the demo admin before serving API requests.
    create_database()
    seed_admin_user()
    app.run(debug=True, port=5000)
