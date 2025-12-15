// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Authentication
  AUTH: `${API_BASE_URL}/api/auth`,
  SIGNIN: `${API_BASE_URL}/api/auth/signin`,
  SIGNUP: `${API_BASE_URL}/api/auth/signup`,
  ME: `${API_BASE_URL}/api/auth/me`,

  // Production
  PRODUCTION: `${API_BASE_URL}/api/production/stats`,

  // Fleet
  FLEET: `${API_BASE_URL}/api/fleet/status`,
  FLEET_VEHICLES: `${API_BASE_URL}/api/fleet/vehicles`,

  // Logistics
  LOGISTICS: `${API_BASE_URL}/api/logistics/chain`,

  // Attendance
  ATTENDANCE: `${API_BASE_URL}/api/attendance/records`,
  ATTENDANCE_CHECKIN: `${API_BASE_URL}/api/attendance/checkin`,
  ATTENDANCE_CHECKOUT: `${API_BASE_URL}/api/attendance/checkout`,

  // Weather
  WEATHER: `${API_BASE_URL}/api/weather`,

  // AI Agent
  AI_RECOMMEND: `${API_BASE_URL}/api/ai/recommend`,
  AI_EXECUTE: `${API_BASE_URL}/api/ai/execute`
};

export default API_BASE_URL;
