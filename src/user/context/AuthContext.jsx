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
      const token = localStorage.getItem('token');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (token && loggedIn) {
        // Try to get user data from localStorage
        let userData = localStorage.getItem('user');
        
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setIsLoggedIn(true);
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear invalid data
            logout();
          }
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  // Login function
  const login = (userData) => {
    localStorage.setItem('isLoggedIn', 'true');
    
    // Store user data - check if it's admin or regular user
    if (userData.role === 'admin' || userData.role === 'superadmin') {
      localStorage.setItem('admin', JSON.stringify(userData));
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsLoggedIn(true);
    setUser(userData);
  };

  // Logout function
  const logout = () => {
    // Clear all auth related data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    setIsLoggedIn(false);
    setUser(null);
  };

  // Check if user is admin or superadmin
  const isAdmin = () => {
    if (!user) return false;
    return user.role === 'admin' || user.role === 'superadmin' || 
           user.role_admin === 'admin' || user.role_admin === 'superadmin';
  };

  // Check if user is superadmin
  const isSuperAdmin = () => {
    if (!user) return false;
    return user.role === 'superadmin' || user.role_admin === 'superadmin';
  };

  const value = {
  isLoggedIn,
  user,
  setUser, // ✅ Tambahkan ini
  loading,
  login,
  logout,
  isAdmin,
  isSuperAdmin
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