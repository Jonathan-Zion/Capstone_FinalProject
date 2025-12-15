import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../config";
import "./auth.css";

function SignIn() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.SIGNIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal Login. Cek kembali kredensial Anda.");
      }

      const data = await response.json();

      // Call login in AuthContext with backend response data
      login(data);

      navigate("/dashboard");

    } catch (err) {
      console.error("Login Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      {/* LEFT */}
      <div className="auth-left">
        <h1 className="auth-title">
          Login <span className="logo-pickaxe">⛏️</span>
        </h1>

        <form className="auth-form" onSubmit={handleLogin}>
          {/* Input Email */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
            {/* Icon */}
            <svg className="input-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="7" r="4" /><path d="M5.5 21a6.5 6.5 0 0 1 13 0" /></svg>
          </div>

          {/* Input Password (tetap sama) */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            {/* ... Icon ... */}
            <svg className="input-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          </div>

          {/* Menampilkan Error */}
          {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/sign-up">Sign Up</Link>
        </p>
      </div>

      {/* RIGHT */}
      <div className="auth-right">
        <h1>
          WELCOME
          <br />
          BACK!
        </h1>
      </div>
    </div>
  );
}

export default SignIn;