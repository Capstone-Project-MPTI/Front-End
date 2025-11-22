import { createContext, useContext, useState, useEffect } from "react";
import api from "../service/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Check authentication status
  const checkAuthStatus = () => {
    return !!localStorage.getItem("authToken");
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("authToken");
  };

  // Set auth token
  const setAuthToken = (token) => {
    localStorage.setItem("authToken", token);
  };

  // Remove auth token
  const removeAuthToken = () => {
    localStorage.removeItem("authToken");
  };

  // Main auth check function
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        if (token) {
          const response = await api.get("/auth/profile");
          setIsAuthenticated(true);
          setUser(response.data);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        handleAuthError();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Handle auth errors
  const handleAuthError = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  // Login function
  const login = async (token) => {
    setAuthToken(token);
    try {
      const response = await api.get("/auth/profile");
      setIsAuthenticated(true);
      setUser(response.data);
    } catch (error) {
      console.error("Login error:", error);
      handleAuthError();
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        logout,
        getAuthToken,
        checkAuthStatus,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
