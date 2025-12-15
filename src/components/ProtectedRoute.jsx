import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth();

  // Show loading while checking authentication
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  // Redirect to sign-in if not authenticated
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}

export default ProtectedRoute;
