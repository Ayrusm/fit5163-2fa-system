/*
 * Program: DisplayCodePage.jsx
 *
 * Purpose: Displays the current Secure Authenticator verification code and
 *          refresh countdown for the logged-in authenticator user.
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CodeDisplay.css";

/*
 * Component: CodeDisplay
 *
 * Purpose: Fetches the active 2FA code from the authenticator backend, shows
 *          the remaining validity time, and handles authenticator logout.
 */
function CodeDisplay() {
  const [code, setCode] = useState("------");
  const [expiresIn, setExpiresIn] = useState(15);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_AUTHENTICATOR_BACKEND_URL;

  const fetchCurrentCode = async () => {
    /*
     * Purpose: Loads the latest authenticator code using the saved
     *          authenticator token and redirects to login when the token is
     *          missing or expired.
     */
    const token = localStorage.getItem("authenticatorToken");

    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/authenticator/code`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Could not load verification code");

        if (response.status === 401) {
          localStorage.removeItem("authenticatorToken");
          localStorage.removeItem("authenticatorUser");
          navigate("/login");
        }

        return;
      }

      if (!data.code) {
        setError(data.error || "No verification code available yet.");
        return;
      }

      setCode(data.code);
      setExpiresIn(data.seconds_left || 15);

      const storedUser = localStorage.getItem("authenticatorUser");

      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setEmail(parsedUser.email);
      }

      setError("");
    } catch (err) {
      console.error("Code fetch failed:", err);
      setError("Could not connect to authenticator server.");
    }
  };

  useEffect(() => {
    /*
     * Purpose: Fetches the code immediately and refreshes it every second so
     *          the countdown remains accurate.
     */
    fetchCurrentCode();

    const interval = setInterval(() => {
      fetchCurrentCode();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    /*
     * Purpose: Calls the authenticator logout endpoint when possible, clears
     *          local authenticator session data, and returns to login.
     */
    const token = localStorage.getItem("authenticatorToken");

    try {
      await fetch(`${BACKEND_URL}/authenticator/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.log("Authenticator logout failed, clearing local token anyway.");
    }

    localStorage.removeItem("authenticatorToken");
    localStorage.removeItem("authenticatorUser");

    navigate("/login");
  };

  return (
    <div className="authenticator-page">
      <main className="code-card">
        <header className="code-header">
          <div className="authenticator-logo">SC</div>

          <div>
            <h1>Verification Code</h1>
            <p>Secure Authenticator</p>
          </div>
        </header>

        <section className="account-box">
          <span>Account</span>
          <strong>{email || "Loading account..."}</strong>
        </section>

        <section className="code-display-box">
          <span>Current code</span>
          <strong>{code}</strong>
        </section>

        <section className="timer-box">
          <span>Refreshes in</span>
          <strong>{expiresIn}s</strong>
        </section>

        <p className="code-description">
          Enter this 6-digit code in the main CheckMate application. The code
          refreshes every 15 seconds.
        </p>

        {error && <div className="error-box">{error}</div>}

        <button className="secondary-button" onClick={handleLogout}>
          Logout from authenticator
        </button>
      </main>
    </div>
  );
}

export default CodeDisplay;
