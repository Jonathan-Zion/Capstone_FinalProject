import { useState } from "react";
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import "../styles/page.css";
import "../styles/Attendance.css";

import { useEffect } from "react";
import { API_ENDPOINTS } from "../config.js";
import { apiGet } from "../services/api.js";

export default function Attendance() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState("Morning"); // Morning, Night
  const [searchTerm, setSearchTerm] = useState("");
  const [workforce, setWorkforce] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const data = await apiGet(API_ENDPOINTS.ATTENDANCE);
        // Map backend data to frontend structure if needed
        // Backend: { employeeName, department, checkIn, status, ... }
        // Frontend expects: { name, role, time, status ... }
        const formattedData = data.map(record => ({
          id: record.employeeId,
          name: record.employeeName,
          role: record.department, // Mapping department to role for now
          location: record.shift,  // Mapping shift to location column
          time: record.checkIn || '-',
          status: record.status.charAt(0).toUpperCase() + record.status.slice(1) // Title Case
        }));
        setWorkforce(formattedData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch attendance:", err);
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  const filteredWorkforce = workforce.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="dashboard-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="page">
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
          <div>
            <h1>Workforce Management</h1>
            <p style={{ color: '#94a3b8' }}>Real-time attendance and shift rostering</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: 'bold', color: '#0ea5e9' }}>08:42 AM</span>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>15 Dec 2025</span>
          </div>
        </div>

        {/* 1. STATS CARDS */}
        <div className="attendance-stats">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>👥</div>
            <div className="stat-info">
              <h3>142</h3>
              <p>Total Scheduled</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' }}>✅</div>
            <div className="stat-info">
              <h3>135</h3>
              <p>Present</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>⚠️</div>
            <div className="stat-info">
              <h3>3</h3>
              <p>Late Check-in</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171' }}>🤒</div>
            <div className="stat-info">
              <h3>4</h3>
              <p>Sick / Absent</p>
            </div>
          </div>
        </div>

        {/* 2. TOOLBAR */}
        <div className="toolbar">
          <div className="shift-toggle">
            <button
              className={`shift-btn ${currentShift === 'Morning' ? 'active' : ''}`}
              onClick={() => setCurrentShift('Morning')}
            >
              ☀️ Morning Shift
            </button>
            <button
              className={`shift-btn ${currentShift === 'Night' ? 'active' : ''}`}
              onClick={() => setCurrentShift('Night')}
            >
              🌙 Night Shift
            </button>
          </div>

          <input
            type="text"
            placeholder="Search personnel or role..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 3. TABLE */}
        <div className="attendance-table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Personnel</th>
                <th>Role</th>
                <th>Shift Location</th>
                <th>Check-in</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkforce.map((person) => (
                <tr key={person.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">
                        {person.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{person.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{person.id}</div>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">{person.role}</td>
                  <td data-label="Shift Location">{person.location}</td>
                  <td data-label="Check-in">{person.time}</td>
                  <td data-label="Status">
                    <span className={`status-badge status-${person.status.toLowerCase()}`}>
                      {person.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredWorkforce.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              No personnel found matching "{searchTerm}"
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
