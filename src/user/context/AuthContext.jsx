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
        // In a real app, you would fetch user data from API or localStorage
        // For demo purposes, we'll use a hardcoded user object
        setUser({
          name: 'Nasywa Putri Nataliza',
          email: 'natalizanasywaputri@gmail.com',
          avatar: '/api/placeholder/40/40'
        });
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
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('isLoggedIn');
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