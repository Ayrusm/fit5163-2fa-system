import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(true);

  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const setupMessage = location.state?.message;

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (setupMessage) {
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [setupMessage]);

  const handleLogin = async () => {
    if (email === "" || password === "") {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
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

        navigate("/authenticate", {
          state: { email },
        });
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  const openAuthenticator = () => {
    const AUTHENTICATOR_LOGIN_URL = "http://localhost:3001/login";

    if (email) {
      window.open(
        `${AUTHENTICATOR_LOGIN_URL}?email=${encodeURIComponent(email)}`,
        "_blank",
        "width=480,height=700",
      );
    } else {
      window.open(AUTHENTICATOR_LOGIN_URL, "_blank", "width=480,height=700");
    }
  };

  return (
    <div className="login-page">
      <section className="login-left">
        <div className="login-brand">
          <div className="login-mark">SC</div>

          <h1>CheckMate</h1>

          <p>
            A protected chess application using password authentication and
            hash-based two-factor verification.
          </p>
        </div>
      </section>

      <section className="login-right">
        <div className="login-card">
          <h2>Sign in</h2>

          <p className="login-description">
            Enter your main application credentials. You will be asked for a 2FA
            code after this step.
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
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button className="login-button" onClick={handleLogin}>
            Continue to verification
          </button>

          <button className="authenticator-button" onClick={openAuthenticator}>
            Open authenticator app
          </button>

          <div className="login-footer">
            <span>New user?</span>
            <Link to="/register">Create account</Link>
          </div>
        </div>
      </section>
      {showToast && setupMessage && (
        <div className="toast-success">
          <span className="toast-icon">✓</span>
          <div>
            <strong>Registration successful</strong>
            <p>{setupMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
