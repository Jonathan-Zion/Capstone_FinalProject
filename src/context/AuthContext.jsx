import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData) => {
    // userData should contain { token, user: {...} }
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    if (userData.user) {
      localStorage.setItem('user', JSON.stringify(userData.user));
      setUser(userData.user);
    } else {
      // Fallback if userData doesn't have nested user object
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUser = (updatedUserData) => {
    // Merge updates into current user state
    setUser(prev => {
      const newState = { ...prev, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newState));
      return newState;
    });
  };

  const getToken = () => {
    return localStorage.getItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, getToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);