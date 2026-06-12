# FIT5163 Two-Factor Authentication System

This project implements a basic two-factor authentication system using two separate applications:

1. **Game Application** — handles user registration, login, 2FA verification, admin management, and chess game access.
2. **Authenticator Application** — handles authenticator setup, authenticator login, and 2FA code generation.

The purpose of the project is to demonstrate a two-factor authentication workflow where access to the main application requires both a main account password and a short-lived verification code from a separate authenticator application.

---

## Project Overview

The system is made up of four main components:

| Component | Description | Default Port |
|---|---|---|
| Game Backend | Flask backend for registration, login, 2FA verification, admin APIs, and database creation | `5000` |
| Game Frontend | React frontend for login, registration, chess game, and admin dashboard | `3000` |
| Authenticator Backend | Flask backend for authenticator login, setup, and code generation | `5001` |
| Authenticator Frontend | React frontend for displaying the 2FA code | `3001` |

Both backend applications share the same SQLite database located at:

```text
Game/2fa_app.db
```

The database is generated automatically when the Game backend starts.

---

## Main Features

- User registration with email and password.
- Separate authenticator setup with a different authenticator password.
- 2FA code generation every 15 seconds.
- 2FA verification before accessing the chess game.
- JWT-based authentication for the main application.
- Separate JWT-based authentication for the authenticator application.
- Role-based routing for normal users and admin users.
- Protected frontend routes for game and admin pages.
- Admin dashboard for viewing users, keygen accounts, and authentication logs.
- Admin ability to enable or disable users.
- Shared SQLite database between the Game app and Authenticator app.

---

## Project Structure

```text
fit5163-2fa-system/
│
├── Game/
│   ├── backend/
│   │   ├── app.py
│   │   ├── auth_routes.py
│   │   ├── admin_routes.py
│   │   ├── database.py
│   │   ├── db.py
│   │   ├── seed_admin.py
│   │   ├── utils.py
│   │   └── requirements.txt
│   │
│   └── main-app/
│       ├── package.json
│       ├── package-lock.json
│       ├── public/
│       └── src/
│
├── Authenticator/
│   ├── backend/
│   │   ├── keygen_app.py
│   │   ├── db_helper.py
│   │   ├── code_generator.py
│   │   └── requirements.txt
│   │
│   └── authenticator-app/
│       ├── package.json
│       ├── package-lock.json
│       ├── public/
│       └── src/
│
├── README.md
└── .gitignore
```

---

## Technologies Used

### Frontend

- React
- React Router
- CSS

### Backend

- Python
- Flask
- SQLite
- PyJWT
- Flask-CORS
- Werkzeug password hashing

---

## Environment Variables

Create a `.env` file inside the Game frontend folder:

```text
Game/main-app/.env
```

Example:

```env
PORT=3000
REACT_APP_BACKEND_URL=http://127.0.0.1:5000
REACT_APP_AUTHENTICATOR_URL=http://localhost:3001
```

Create a `.env` file inside the Authenticator frontend folder:

```text
Authenticator/authenticator-app/.env
```

Example:

```env
PORT=3001
REACT_APP_AUTHENTICATOR_BACKEND_URL=http://127.0.0.1:5001
REACT_APP_MAIN_APP_URL=http://localhost:3000
```

Backend environment variables are optional. The application uses default local development values if backend `.env` files are not provided.

---

## Installation and Running Instructions

The system requires four terminals:

1. Game backend
2. Authenticator backend
3. Game frontend
4. Authenticator frontend

Start them in this order.

---

## 1. Start the Game Backend

Open a terminal and run:

```bash
cd path/to/fit5163-2fa-system/Game
python3.11 -m venv venv
source venv/bin/activate
python3.11 -m pip install -r backend/requirements.txt
python3.11 backend/app.py
```

The Game backend should run on:

```text
http://127.0.0.1:5000
```

When the backend starts, it creates the SQLite database and seeds the demo admin user.

Expected output includes:

```text
Database created successfully!
Demo admin user created successfully.
Running on http://127.0.0.1:5000
```

---

## 2. Start the Authenticator Backend

Open a second terminal and run:

```bash
cd fit5163-2fa-system/Authenticator/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 keygen_app.py
```

The Authenticator backend should run on:

```text
http://127.0.0.1:5001
```

Expected output includes:

```text
Keygen loop started.
Running on http://127.0.0.1:5001
```

---

## 3. Start the Game Frontend

Open a third terminal and run:

```bash
cd fit5163-2fa-system/Game/main-app
npm install
npm start
```

The Game frontend should run on:

```text
http://localhost:3000
```

---

## 4. Start the Authenticator Frontend

Open a fourth terminal and run:

```bash
cd fit5163-2fa-system/Authenticator/authenticator-app
npm install
npm start
```

The Authenticator frontend should run on:

```text
http://localhost:3001
```

---

## Demo Admin Account

A demo admin user is created automatically when the Game backend starts.

```text
Email: admin@securechess.com
Password: Admin123!
```

Before the admin user can complete 2FA login, the admin account must first be set up in the Authenticator application.

---

## User Flow

### Registration Flow

1. The user registers in the Game application using an email and main app password.
2. The Authenticator application opens separately for authenticator setup.
3. The user sets an authenticator password.
4. The Authenticator application displays a 2FA code.
5. The user returns to the Game application login page.
6. The user logs in using the main app password.
7. The user enters the current 2FA code.
8. The user gains access to the chess game.

---

### Login Flow

1. The user enters their email and main app password.
2. If the password is correct, the user is redirected to the 2FA verification page.
3. The user opens the Authenticator application.
4. The user logs in to the Authenticator application using their authenticator password.
5. The Authenticator application displays the current 2FA code.
6. The user enters the code in the Game application.
7. If the code is valid, the Game backend issues a JWT token.
8. The user is redirected to the chess game or admin dashboard depending on their role.

---

### Admin Flow

1. The admin logs in using the seeded admin account.
2. The admin completes authenticator setup.
3. The admin logs in again and completes 2FA verification.
4. The admin is redirected to the admin dashboard.
5. The admin can view users, keygen accounts, and authentication logs.
6. The admin can enable or disable users.

---

## Resetting the Database

To reset the system for a clean demo, stop both backend servers and delete the database file:

```bash
cd fit5163-2fa-system
rm -f Game/2fa_app.db
```

Then restart the Game backend:

```bash
cd Game
python3 backend/app.py
```

The database will be recreated automatically.

---

## Security Features

- User passwords are hashed before being stored.
- Authenticator passwords are stored separately from main app passwords.
- The authenticator application uses a separate login flow.
- 2FA codes are generated from user-specific keygen data.
- 2FA codes refresh every 15 seconds.
- JWT tokens are issued only after successful 2FA verification.
- Main application and authenticator application use separate JWT tokens.
- Protected frontend routes prevent direct access to the game page without authentication.
- Admin frontend routes are restricted based on user role.
- Logout clears local session data.
- The Authenticator application is visually and functionally separated from the main Game application.

---