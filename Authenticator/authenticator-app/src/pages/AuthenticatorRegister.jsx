import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/AuthenticatorRegister.css";

function AuthenticatorRegister() {
  const [email, setEmail] = useState("");
  const [authenticatorPassword, setAuthenticatorPassword] = useState("");
  const [confirmAuthenticatorPassword, setConfirmAuthenticatorPassword] =
    useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_AUTHENTICATOR_BACKEND_URL;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailFromUrl = params.get("email");

    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  const handleRegister = async () => {
    if (
      email === "" ||
      authenticatorPassword === "" ||
      confirmAuthenticatorPassword === ""
    ) {
      setError("Please fill in all fields");
      return;
    }

    if (authenticatorPassword !== confirmAuthenticatorPassword) {
      setError("Authenticator passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/authenticator/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password: authenticatorPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("authenticatorToken", data.token);
        localStorage.setItem("authenticatorUser", JSON.stringify(data.user));

        setError("");
        navigate("/code");
      } else {
        setError(data.message || "Could not create authenticator account");
      }
    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  return (
    <div className="authenticator-page">
      <main className="authenticator-register-card">
        <div className="authenticator-register-brand">
          <div className="authenticator-logo">SC</div>

          <div>
            <h1>Secure Authenticator</h1>
            <p>Set up your second authentication factor</p>
          </div>
        </div>

        <section className="authenticator-register-content">
          <h2>Create authenticator account</h2>

          <p className="authenticator-register-description">
            This account is separate from your main chess account. Use a
            different password or PIN to protect your 2FA code generator.
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
            <label>Authenticator password / PIN</label>
            <input
              type="password"
              placeholder="Create authenticator password"
              value={authenticatorPassword}
              onChange={(e) => setAuthenticatorPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Confirm authenticator password / PIN</label>
            <input
              type="password"
              placeholder="Confirm authenticator password"
              value={confirmAuthenticatorPassword}
              onChange={(e) => setConfirmAuthenticatorPassword(e.target.value)}
            />
          </div>

          {error && <div className="error-box">{error}</div>}

          <button className="primary-button" onClick={handleRegister}>
            Create authenticator
          </button>

          <button
            className="secondary-button"
            onClick={() => navigate("/login")}
          >
            Already set up? Sign in
          </button>
        </section>
      </main>
    </div>
  );
}

export default AuthenticatorRegister;
