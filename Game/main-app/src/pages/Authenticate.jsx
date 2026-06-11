/*
 * Program: Authenticate.jsx
 *
 * Purpose: Handles the second step of main application login. The user enters
 *          the current authenticator code, and a successful check stores the
 *          returned session token.
 */

import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/Authenticate.css";

/*
 * Component: Authenticate
 *
 * Purpose: Collects and verifies the 2FA code for the email address that
 *          passed password verification on the login page.
 */
function Authenticate() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email;

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const AUTHENTICATOR_URL = process.env.REACT_APP_AUTHENTICATOR_URL;

  const handleCodeChange = (e) => {
    /*
     * Purpose: Normalizes code entry so the backend receives only up to six
     *          uppercase alphanumeric characters.
     */
    // Allow letters and numbers only
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");

    // Maximum 6 characters only
    if (value.length <= 6) {
      setCode(value.toUpperCase());
    }
  };

  const openAuthenticator = () => {
    /*
     * Purpose: Opens the separate authenticator app where the user can view
     *          the current 2FA code.
     */
    const authenticatorLoginUrl = `${AUTHENTICATOR_URL}/login`;

    if (email) {
      window.open(
        `${authenticatorLoginUrl}?email=${encodeURIComponent(email)}`,
        "_blank",
        "width=480,height=700",
      );
    } else {
      window.open(authenticatorLoginUrl, "_blank", "width=480,height=700");
    }
  };

  const handleVerifyCode = async () => {
    /*
     * Purpose: Sends the email and code to the backend. A valid response stores
     *          the session and redirects users by role.
     */
    if (!email) {
      setError("No login session found. Please return to login.");
      return;
    }

    if (code === "") {
      setError("Please enter your authentication code");
      return;
    }

    if (code.length !== 6) {
      setError("Authentication code must be 6 digits");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/authenticate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid or expired authentication code");
        return;
      }

      if (!data.token || !data.user) {
        setError(
          "Authentication succeeded, but server response was incomplete.",
        );
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      setError("");

      if (data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/game");
      }
    } catch (err) {
      console.error("Authentication request failed:", err);
      setError("Unable to connect to the authentication server.");
    }
  };

  return (
    <div className="auth-page">
      <main className="auth-panel">
        <section className="auth-header">
          <div className="auth-brand">
            <div className="auth-mark">SC</div>

            <div>
              <h1>CheckMate</h1>
              <p>Two-factor verification</p>
            </div>
          </div>
        </section>

        <section className="auth-content">
          <h2>Enter verification code</h2>

          <p className="auth-description">
            Open the authenticator application, sign in using your authenticator
            password or PIN, and enter the current 6-digit code shown there.
          </p>

          <div className="account-summary">
            <span>Account</span>
            <strong>{email || "No account selected"}</strong>
          </div>

          <button
            className="open-authenticator-button"
            onClick={openAuthenticator}
          >
            Open authenticator app
          </button>

          <div className="form-group">
            <label htmlFor="code">Verification code</label>

            <input
              id="code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              className="code-input"
              autoComplete="one-time-code"
            />
          </div>

          <div className="code-note">
            Codes refresh every 15 seconds in the authenticator app.
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-action" onClick={handleVerifyCode}>
            Verify and continue
          </button>

          <div className="auth-links">
            <Link to="/login">Return to login</Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Authenticate;
