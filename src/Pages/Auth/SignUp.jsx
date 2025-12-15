import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_ENDPOINTS } from "../../config";
import "./auth.css";

function SignUp() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Check Password Match
    if (password !== confirmPassword) {
      setError("Konfirmasi Password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.SIGNUP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gagal melakukan registrasi.");
      }

      alert("Registrasi berhasil! Silakan login.");
      navigate("/sign-in");

    } catch (err) {
      console.error("Register Error:", err.message);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="auth-container">
      <div className="auth-left">
        <h1 className="auth-title">
          Sign Up <span className="logo-pickaxe">⛏️</span>
        </h1>

        <form className="auth-form" onSubmit={handleRegister}>
          {/* Full Name */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <span className="icon">👤</span>
          </div>

          {/* Email */}
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
            <span className="icon">📧</span>
          </div>

          {/* Password */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
            <span className="icon">🔒</span>
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <input
              type="password"
              placeholder="Confirm Password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <span className="icon">🔒</span>
          </div>

          {/* Menampilkan Error */}
          {error && <p className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</p>}


          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/sign-in">Sign In</Link>
        </p>
      </div>

      <div className="auth-right">
        <h1>
          JOIN<br />US!
        </h1>
      </div>
    </div>
  );
}

export default SignUp;