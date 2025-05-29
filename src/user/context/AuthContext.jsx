// src/user/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const storedUser = JSON.parse(localStorage.getItem('admin'));
        if (storedUser) {
          setUser(storedUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('admin', JSON.stringify(userData));
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin');
    setIsLoggedIn(false);
    setUser(null);
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export both the context and the provider
export { AuthContext };
export default AuthProvider;
