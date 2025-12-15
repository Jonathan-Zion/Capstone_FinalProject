import { Routes, Route, Navigate } from "react-router-dom";

import SignIn from "./Pages/Auth/SignIn.jsx";
import SignUp from "./Pages/Auth/SignUp.jsx";

import Dashboard from "./Pages/Dashboard.jsx";
import Simulation from "./Pages/Simulation.jsx";
import Attendance from "./Pages/Attendance.jsx";
import Setting from "./Pages/setting.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/simulation"
        element={
          <ProtectedRoute>
            <Simulation />
          </ProtectedRoute>
        }
      />

      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />

      <Route
        path="/setting"
        element={
          <ProtectedRoute>
            <Setting />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
