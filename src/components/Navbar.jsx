import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "./navbar.css";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/sign-in");
  };

  return (
    <header className="navbar">
      {/* TOGGLE (MOBILE) */}
      <button
        className="navbar-toggle"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      <span className="navbar-title">
        AC-5 Mining Value Chain Optimization
      </span>

      <div className="navbar-user">
        <span>Hello, {user?.name}</span>

        <button onClick={handleLogout} className="logout-btn">
          <svg
            className="logout-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </header>
  );
}
