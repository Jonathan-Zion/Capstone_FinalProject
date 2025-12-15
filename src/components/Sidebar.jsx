import { NavLink } from "react-router-dom";
import "./sidebar.css";

export default function Sidebar({ open, setOpen }) {
  return (
    <>
      {/* OVERLAY MOBILE */}
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-logo">
          ⛏️ <span>Mining AI</span>
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/dashboard" onClick={() => setOpen(false)}>
            Dashboard
          </NavLink>
          <NavLink to="/simulation" onClick={() => setOpen(false)}>
            Simulation
          </NavLink>
          <NavLink to="/attendance" onClick={() => setOpen(false)}>
            Attendance
          </NavLink>
          <NavLink to="/setting" onClick={() => setOpen(false)}>
            Setting
          </NavLink>
        </nav>
      </aside>
    </>
  );
}
