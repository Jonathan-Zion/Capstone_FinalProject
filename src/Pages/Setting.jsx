import { useState } from "react";
import { API_ENDPOINTS } from "../config";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import "../styles/page.css";
import "../styles/Setting.css";

export default function Setting() {
  const { user, updateUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  // Local state for forms (initialized from user settings)
  const [settings, setSettings] = useState({
    darkMode: user?.settings?.darkMode || false,
    refreshRate: user?.settings?.system?.refreshRate || 30
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      // Construct the settings object matching backend structure
      const payload = {
        settings: {
          darkMode: settings.darkMode,
          system: {
            refreshRate: parseInt(settings.refreshRate)
          }
        }
      };

      const response = await fetch(`${API_ENDPOINTS.AUTH}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        updateUser({ settings: data.settings }); // Update global user state
        alert("Settings saved successfully!");

        // Apply Dark Mode immediately
        if (data.settings.darkMode) {
          document.body.classList.add('dark-mode');
        } else {
          document.body.classList.remove('dark-mode');
        }
      } else {
        alert("Failed to save settings.");
      }
    } catch (error) {
      console.error("Save failed:", error);
      alert("Error saving settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="page">
        <div>
          <h1>Settings & Configuration</h1>
          <p style={{ color: '#94a3b8' }}>Manage application preferences and system thresholds</p>
        </div>

        <div className="settings-layout">
          {/* Navigation Sidebar */}
          <div className="settings-nav">
            <button
              className={`nav-item ${activeTab === 'general' ? 'active' : ''}`}
              onClick={() => setActiveTab('general')}
            >
              ⚙️ General
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              🔔 Notifications
            </button>
            <button
              className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
              onClick={() => setActiveTab('system')}
            >
              🛡️ System & Security
            </button>
          </div>

          {/* Content Area */}
          <div className="settings-content">

            {activeTab === 'general' && (
              <div className="setting-section">
                <div className="section-header">
                  <h2>General Preferences</h2>
                  <p>Customize your dashboard experience.</p>
                </div>

                <div className="form-group">
                  <label>Display Language</label>
                  <select className="form-select">
                    <option>English (US)</option>
                    <option>Bahasa Indonesia</option>
                  </select>
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-label">
                    <h4>Dark Mode</h4>
                    <p>Use darker color palette for low-light environments.</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-label">
                    <h4>Compact View</h4>
                    <p>Reduce padding and font size for high-density displays.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="setting-section">
                <div className="section-header">
                  <h2>Alert Thresholds</h2>
                  <p>Configure when you want to be notified.</p>
                </div>

                <div className="form-group">
                  <label>High Wind Alert Threshold (km/h)</label>
                  <input type="number" className="form-input" defaultValue="50" />
                </div>

                <div className="form-group">
                  <label>Production Target Notification</label>
                  <select className="form-select">
                    <option>Daily at 6:00 PM</option>
                    <option>Real-time (Every 100 Tons)</option>
                    <option>Weekly Report Only</option>
                  </select>
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-label">
                    <h4>Weather Warnings</h4>
                    <p>Receive alerts for heavy rain or storms in the pit area.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <button className="save-btn">Update Preferences</button>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="setting-section">
                <div className="section-header">
                  <h2>System Configuration</h2>
                  <p>Advanced settings for administrators.</p>
                </div>

                <div className="form-group">
                  <label>Data Refresh Rate (Seconds)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.refreshRate}
                    onChange={(e) => setSettings({ ...settings, refreshRate: e.target.value })}
                  />
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-label">
                    <h4>API Caching</h4>
                    <p>Cache API responses to reduce bandwidth usage.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-wrapper">
                  <div className="toggle-label">
                    <h4>Debug Mode</h4>
                    <p>Show verbose error logs in the console.</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <h4 style={{ color: '#ef4444', marginTop: 0 }}>Danger Zone</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Clear all local data and reset dashboard configurations.</p>
                    <button className="danger-btn">Reset Factory Settings</button>
                  </div>
                </div>

                <button className="save-btn" onClick={handleSave} style={{ marginTop: '20px' }} disabled={loading}>
                  {loading ? "Saving..." : "Save System Settings"}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
