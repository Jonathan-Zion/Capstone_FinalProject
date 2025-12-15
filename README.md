# Mining Operations Backend

HAPI.js backend server for the Mining Operations Dashboard.

## Features

- **Authentication**: JWT-based signup and signin
- **Production Stats**: Real-time mining production data
- **Fleet Management**: Vehicle status tracking
- **Logistics**: Supply chain monitoring
- **Attendance**: Employee check-in/out system
- **Weather**: Integrated weather data

## Tech Stack

- Node.js
- HAPI.js Framework
- JSON Web Tokens (JWT)
- Joi Validation
- Nodemon (Development)

## Prerequisites

- Node.js (v14 or higher)
- npm

## Setup & Run

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   The project includes a default `.env` file. You can adjust the settings:
   - `PORT`: Server port (default: 5000)
   - `JWT_SECRET`: Secret key for token generation
   - `FRONTEND_URL`: URL of the frontend application (for CORS)

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server will start at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Login
- `GET /api/auth/me` - Get current user profile (Protected)

### Production
- `GET /api/production/stats` - Get dashboard statistics
- `POST /api/production/update` - Update stats (Admin)

### Fleet
- `GET /api/fleet/status` - Fleet summary
- `GET /api/fleet/vehicles` - List all vehicles
- `PUT /api/fleet/vehicles/{id}/status` - Update vehicle status

### Logistics
- `GET /api/logistics/chain` - Logistics chain status
- `PUT /api/logistics/stage/{stage}/status` - Update stage status

### Attendance
- `GET /api/attendance/records` - List attendance records
- `POST /api/attendance/checkin` - Employee check-in
- `POST /api/attendance/checkout` - Employee check-out

### Weather
- `GET /api/weather/current` - Current weather data

## Project Structure

- `server.js` - Main entry point
- `routes/` - API route definitions
- `middleware/` - Auth and CORS middleware
- `utils/` - Helper functions (logger)
- `data/` - Mock data store
