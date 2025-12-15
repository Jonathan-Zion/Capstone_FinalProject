
import { useState, useEffect } from "react";
import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import "../styles/page.css";
import "../styles/Simulation.css";
import { API_ENDPOINTS } from "../config.js";
import { apiGet, apiPost } from "../services/api.js";

export default function Simulation() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Simulation Inputs
  const [weatherData, setWeatherData] = useState(null);
  const [roadCondition, setRoadCondition] = useState('dry');

  // Simulation Output
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [logs, setLogs] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);

  // Fetch Real Weather
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-0.5022&longitude=117.1536&current=temperature_2m,precipitation,rain,weather_code,wind_speed_10m&timezone=Asia%2FSingapore"
        );
        const data = await response.json();
        setWeatherData(data.current);
      } catch (error) {
        console.error("Weather fetch failed", error);
        setWeatherData({ temperature_2m: 30, wind_speed_10m: 10, rain: 0 });
      }
    };
    fetchWeather();
  }, []);

  const askAIAgent = async () => {
    setIsAnalyzing(true);
    setLogs([]);
    setRecommendation(null);
    setExecutionResult(null);

    // Simulate thinking logs
    setLogs(prev => [...prev, "Connecting to Backend AI Service..."]);

    try {
      // Simple delay for effect
      await new Promise(r => setTimeout(r, 1000));

      // Determine weather condition string for API
      let condition = "Clear";
      if (weatherData) {
        if (weatherData.rain > 5 || weatherData.weather_code >= 50) condition = "Rain";
        if (weatherData.wind_speed_10m > 50 || weatherData.weather_code >= 80) condition = "Storm";
      }

      setLogs(prev => [...prev, `Sending Telemetry: Weather=${condition}, Road=${roadCondition}...`]);

      const data = await apiGet(`${API_ENDPOINTS.AI_RECOMMEND}?weather=${condition}&roadCondition=${roadCondition}`);

      setLogs(prev => [...prev, "Analysis Complete."]);
      setRecommendation(data);

    } catch (error) {
      setLogs(prev => [...prev, `Error: ${error.message}`]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const executeAction = async () => {
    if (!recommendation?.action) return;

    setLogs(prev => [...prev, `Authorizing Action: ${recommendation.action}...`]);

    try {
      const result = await apiPost(API_ENDPOINTS.AI_EXECUTE, {
        action: recommendation.action
      });

      setExecutionResult(result);
      setLogs(prev => [...prev, `Execution Result: ${result.message}`]);
    } catch (error) {
      setLogs(prev => [...prev, `Execution Failed: ${error.message}`]);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="page">
        <div style={{ marginBottom: "30px" }}>
          <h1>AI Operations Controller</h1>
          <p style={{ color: "#94a3b8" }}>
            Ask the AI Agent to validate mining operations based on real-time and simulated conditions.
          </p>
        </div>

        <div className="simulation-container">

          {/* LEFT: Control Panel */}
          <div className="control-panel">

            <div className="panel-section">
              <span className="section-title">📡 Real-Time Inputs (Auto-Detected)</span>
              <div className="data-row">
                <span>Temp / Weather</span>
                <span className="mono">{weatherData ? `${weatherData.temperature_2m}°C` : "--"}</span>
              </div>
              <div className="data-row">
                <span>Wind Velocity</span>
                <span className="mono">{weatherData ? `${weatherData.wind_speed_10m} km/h` : "--"}</span>
              </div>
              <div className="data-row">
                <span>Precipitation</span>
                <span className="mono">{weatherData ? `${weatherData.rain} mm` : "--"}</span>
              </div>
            </div>

            <div className="panel-section">
              <span className="section-title">🔧 Field Conditions (Manual Input)</span>
              <div className="input-group">
                <label>Road Connection</label>
                <div className="toggle-group">
                  {['dry', 'wet', 'muddy'].map(status => (
                    <button
                      key={status}
                      className={`toggle-btn ${roadCondition === status ? 'active' : ''}`}
                      onClick={() => setRoadCondition(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="analyze-btn"
              onClick={askAIAgent}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? <><span className="spinner"></span>Processing...</> : "✨ Ask AI Agent"}
            </button>
          </div>

          {/* RIGHT: AI Output */}
          <div className="ai-terminal">
            <div className="terminal-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
              <span style={{ marginLeft: '10px', fontSize: '0.8rem', color: '#64748b' }}>agent_core_v4.2.exe</span>
            </div>

            <div className="terminal-content">
              {logs.length === 0 && !recommendation && (
                <div style={{ opacity: 0.5 }}><span>System Ready. Awaiting start command...</span></div>
              )}

              {logs.map((log, index) => (
                <div key={index} style={{ marginBottom: '6px' }}><span>&gt; {log}</span></div>
              ))}

              {isAnalyzing && <div className="typing-effect">_</div>}

              {recommendation && (
                <div className={`ai-decision ${recommendation.status === 'NORMAL' ? 'decision-go' : 'decision-nogo'}`} style={{ marginTop: '20px' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>[{recommendation.status}] {recommendation.message}</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>{recommendation.description}</div>

                  {recommendation.action && !executionResult && (
                    <div style={{ marginTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                      <div style={{ marginBottom: '10px', fontSize: '0.85rem', color: '#fbbf24' }}>
                        ⚠️ Authorization Required: {recommendation.action}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          onClick={executeAction}
                          style={{
                            background: '#22c55e', color: 'white', border: 'none',
                            padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                          }}
                        >
                          ✅ Approve & Execute
                        </button>
                        <button
                          onClick={() => setRecommendation(null)} // Dismiss
                          style={{
                            background: '#ef4444', color: 'white', border: 'none',
                            padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold'
                          }}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  )}

                  {executionResult && (
                    <div style={{ marginTop: '15px', padding: '10px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '4px', color: '#86efac' }}>
                      ✅ {executionResult.message}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
