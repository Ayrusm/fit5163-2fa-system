/*
 * Program: Register.jsx
 *
 * Purpose: Displays the main CheckMate account registration page. After a user
 *          registers successfully, the page opens the authenticator setup flow.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Register.css";

/*
 * Component: Register
 *
 * Purpose: Collects account details, validates the password locally, creates a
 *          main application account, and directs the user to authenticator
 *          setup.
 */
const Register = () => {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const AUTHENTICATOR_URL = process.env.REACT_APP_AUTHENTICATOR_URL;

  const handleRegister = async () => {
    /*
     * Purpose: Validates the form and sends registration details to the main
     *          backend before opening the authenticator registration page.
     */
    if (email === "" || password === "" || confirmPassword === "") {
      setError("Please fill in all fields");
      return;
    }

    const passwordError = validatePassword(password);

    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setError("");

        window.open(
          `${AUTHENTICATOR_URL}/register?email=${encodeURIComponent(email)}`,
          "_blank",
          "width=520,height=760",
        );

        setError("");
        navigate("/login", {
          state: {
            message:
              "Account created. Complete authenticator setup in the new tab, then sign in here.",
          },
        });
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  const validatePassword = (password) => {
    /*
     * Purpose: Enforces the same visible password rules used by the backend so
     *          users receive immediate feedback.
     */
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    const hasSpecialCharacter = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasSpecialCharacter) {
      return "Password must contain at least one special character";
    }

    return "";
  };

  return (
    <div className="register-page">
      <section className="register-panel">
        <div className="register-brand">
          <div className="register-mark">SC</div>

          <div>
            <h1>CheckMate</h1>
            <p>Create your main application account</p>
          </div>
        </div>

        <div className="register-card">
          <h2>Create account</h2>

          <p className="register-description">
            Register for the chess application. After this step, you will set up
            a separate authenticator account for two-factor authentication.
          </p>

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button className="register-button" onClick={handleRegister}>
            Register and set up authenticator
          </button>

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
