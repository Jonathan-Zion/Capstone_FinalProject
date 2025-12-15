import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import L from 'leaflet';

// Fix for default marker icon missing
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import Navbar from "../components/navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";

/* Import default page styles first, then dashboard overrides */
import "../styles/page.css";
import "../styles/Dashboard.css";

import { API_ENDPOINTS } from "../config.js";
import { apiGet } from "../services/api.js";

function Dashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [weather, setWeather] = useState({
    temp: "--",
    condition: "Loading...",
    humidity: "--",
    windSpeed: "--",
    isRaining: false,
    icon: "..."
  });

  const [productionData, setProductionData] = useState([]);
  const [vehicleStatus, setVehicleStatus] = useState({ active: 0, standby: 0, maintenance: 0, breakdown: 0 });
  const [logistics, setLogistics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Weather (External API)
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-0.5022&longitude=117.1536&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&timezone=Asia%2FSingapore"
        );
        const data = await response.json();

        const current = data.current;
        const code = current.weather_code;
        const isRaining = code >= 50;
        let conditionText = "Clear";
        let conditionIcon = "☀️";

        if (code === 0) { conditionText = "Clear Sky"; conditionIcon = "☀️"; }
        else if (code >= 1 && code <= 3) { conditionText = "Partly Cloudy"; conditionIcon = "⛅"; }
        else if (code >= 45 && code <= 48) { conditionText = "Foggy"; conditionIcon = "🌫️"; }
        else if (code >= 51 && code <= 67) { conditionText = "Rainy"; conditionIcon = "🌧️"; }
        else if (code >= 80 && code <= 99) { conditionText = "Heavy Rain/Storm"; conditionIcon = "⛈️"; }

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition: conditionText,
          humidity: current.relative_humidity_2m,
          windSpeed: current.wind_speed_10m,
          isRaining: isRaining,
          icon: conditionIcon
        });

      } catch (error) {
        console.error("Failed to fetch weather:", error);
        setWeather(prev => ({ ...prev, condition: "Offline" }));
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 600000); // 10 mins
    return () => clearInterval(interval);
  }, []);

  // Fetch Backend Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, fleetData, logisticsChain] = await Promise.all([
          apiGet(API_ENDPOINTS.PRODUCTION),
          apiGet(API_ENDPOINTS.FLEET),
          apiGet(API_ENDPOINTS.LOGISTICS)
        ]);

        setProductionData(prodData);
        setVehicleStatus(fleetData);
        setLogistics(logisticsChain);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        // Optional: Handle error UI
      }
    };

    fetchData();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dashboard-wrapper">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <main className="page">
        <div className="dashboard-header" style={{ marginBottom: '24px' }}>
          <h1>Site Overview: <span style={{ color: '#0ea5e9' }}>Batu Hijau Pit</span></h1>
          <p style={{ color: '#94a3b8' }}>Real-time monitoring and operational status</p>
        </div>

        <div className="dashboard-container">

          {/* 1. MAP OVERVIEW */}
          <section className="dashboard-card map-overview">
            <div className="card-header">
              <span className="card-title">🗺️ Geospatial Mine Map</span>
            </div>
            <div className="map-visual">
              <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossOrigin="" />
              <MapContainer center={[-8.97, 116.87]} zoom={15} style={{ height: '100%', width: '100%' }}>
                <LayersControl position="topright">
                  <LayersControl.BaseLayer checked name="Default Map">
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                  </LayersControl.BaseLayer>

                  <LayersControl.BaseLayer name="Satellite Map">
                    <TileLayer
                      attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                  </LayersControl.BaseLayer>
                </LayersControl>

                {/* Render Vehicle Markers */}
                {vehicleStatus.vehicles && vehicleStatus.vehicles.map(vehicle => (
                  vehicle.coordinates && (
                    <Marker
                      key={vehicle.id}
                      position={[vehicle.coordinates.lat, vehicle.coordinates.lng]}
                    >
                      <Popup>
                        <div style={{ color: 'black' }}>
                          <strong>{vehicle.id}</strong><br />
                          {vehicle.type}<br />
                          Status: {vehicle.status}
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                {/* Zone Circle Examples */}
                <Circle center={[-8.971, 116.871]} pathOptions={{ color: 'red', fillColor: '#f03', fillOpacity: 0.2 }} radius={100} />
                <Circle center={[-8.969, 116.869]} pathOptions={{ color: 'blue', fillColor: '#30f', fillOpacity: 0.2 }} radius={100} />

              </MapContainer>
            </div>
          </section>

          {/* 2. WEATHER STATUS */}
          <section className="dashboard-card weather-status">
            <div className="card-header">
              <span className="card-title">⛅ Weather Station (Kalimantan)</span>
            </div>
            <div className="weather-content">
              <div className="weather-icon">{weather.icon}</div>
              <div className="temp-big">{weather.temp}°C</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 500 }}>{weather.condition}</div>
              <div className="weather-detail">
                <span>
                  <span>💧 {weather.humidity}% Humidity</span>
                </span>
                <span>
                  <span>💨 {weather.windSpeed} km/h Wind</span>
                </span>
              </div>

              {/* Conditional Warning */}
              {weather.isRaining ? (
                <div style={{ marginTop: '20px', padding: '8px', background: 'rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                  ⚠️ Caution: Slippery haul roads
                </div>
              ) : (
                <div style={{ marginTop: '20px', padding: '8px', background: 'rgba(34, 197, 94, 0.2)', borderRadius: '8px', color: '#86efac', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
                  ✅ Operations Normal
                </div>
              )}
            </div>
          </section>

          {/* 3. PRODUCTION OVERVIEW */}
          <section className="dashboard-card production-overview">
            <div className="card-header">
              <span className="card-title">📊 Production Stats</span>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Shift 1</span>
            </div>
            <div className="stats-list">
              {productionData.map((item, index) => (
                <div className="stat-row" key={index}>
                  <span className="stat-label">{item.label}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div className="stat-value">{item.value}</div>
                    <span className={`stat-trend ${item.status === 'up' ? 'trend-up' : item.status === 'down' ? 'trend-down' : ''}`}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. FLEET STATUS */}
          <section className="dashboard-card fleet-status">
            <div className="card-header">
              <span className="card-title">🚛 Fleet Availability</span>
            </div>
            <div className="fleet-grid">
              <div className="fleet-item" style={{ borderLeft: '4px solid #22c55e' }}>
                <span className="fleet-count" style={{ color: '#22c55e' }}>{vehicleStatus.active}</span>
                <span className="fleet-name">Active Units</span>
              </div>
              <div className="fleet-item" style={{ borderLeft: '4px solid #3b82f6' }}>
                <span className="fleet-count" style={{ color: '#3b82f6' }}>{vehicleStatus.standby}</span>
                <span className="fleet-name">Standby</span>
              </div>
              <div className="fleet-item" style={{ borderLeft: '4px solid #f59e0b' }}>
                <span className="fleet-count" style={{ color: '#f59e0b' }}>{vehicleStatus.maintenance}</span>
                <span className="fleet-name">In Service</span>
              </div>
              <div className="fleet-item" style={{ borderLeft: '4px solid #ef4444' }}>
                <span className="fleet-count" style={{ color: '#ef4444' }}>{vehicleStatus.breakdown}</span>
                <span className="fleet-name">Breakdown</span>
              </div>
            </div>
            {/* Simple Pie Chart Representation using CSS Conic Gradient */}
            <div style={{
              marginTop: '20px',
              height: '10px',
              width: '100%',
              background: '#334155',
              borderRadius: '5px',
              overflow: 'hidden',
              display: 'flex'
            }}>
              <div style={{ width: '85%', background: '#22c55e' }}></div>
              <div style={{ width: '7%', background: '#3b82f6' }}></div>
              <div style={{ width: '5%', background: '#f59e0b' }}></div>
              <div style={{ width: '3%', background: '#ef4444' }}></div>
            </div>
          </section>

          {/* 5. LOGISTIC STATUS */}
          <section className="dashboard-card logistic-status">
            <div className="card-header">
              <span className="card-title">⚓ Logistics Chain</span>
            </div>
            <div className="timeline">
              {logistics.map((item, index) => (
                <div className="timeline-item" key={index}>
                  <div className={`timeline-dot ${item.flow === 'optimal' ? 'active' : item.flow === 'delayed' ? 'delayed' : ''}`}></div>
                  <div className="timeline-content">
                    <span style={{ fontWeight: 500 }}>{item.stage}</span>
                    <span style={{
                      fontSize: '0.8rem',
                      color: item.flow === 'delayed' ? '#ef4444' : '#94a3b8'
                    }}>
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;
