from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from auth_routes import auth_bp
from admin_routes import admin_bp

load_dotenv()

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp)
app.register_blueprint(admin_bp)

@app.route("/", methods=["GET"])
def home():
    return {
        "message": "Secure Chess 2FA backend is running"
    }

if __name__ == "__main__":
    app.run(debug=True, port=5000)
