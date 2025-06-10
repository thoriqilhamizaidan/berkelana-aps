// src/user/context/AuthContext.jsx - ENHANCED DEBUG VERSION
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

  // ✅ ENHANCED: Check if user is logged in on initial load with better debugging
  useEffect(() => {
    const checkLoginStatus = () => {
      console.log('🔍 AuthContext: Checking login status...');
      
      const token = localStorage.getItem('token');
      const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const userDataString = localStorage.getItem('user');
      
      console.log('🔍 AuthContext Debug:', {
        token: token ? 'EXISTS' : 'NULL',
        loggedIn,
        userDataString: userDataString ? 'EXISTS' : 'NULL'
      });
      
      if (token && loggedIn) {
        if (userDataString) {
          try {
            const parsedUser = JSON.parse(userDataString);
            console.log('✅ AuthContext: User parsed successfully:', {
              id_user: parsedUser.id_user,
              id: parsedUser.id,
              email: parsedUser.email,
              nama: parsedUser.nama,
              fullUser: parsedUser
            });
            
            setUser(parsedUser);
            setIsLoggedIn(true);
          } catch (error) {
            console.error('❌ AuthContext: Error parsing user data:', error);
            console.log('🔍 Raw user data that failed to parse:', userDataString);
            // Clear invalid data
            logout();
          }
        } else {
          console.log('⚠️ AuthContext: No user data in localStorage');
          setIsLoggedIn(false);
          setUser(null);
        }
      } else {
        console.log('⚠️ AuthContext: No token or not logged in');
        setIsLoggedIn(false);
        setUser(null);
      }

      setLoading(false);
      console.log('✅ AuthContext: Login check completed');
    };

    checkLoginStatus();
  }, []);

  // ✅ ENHANCED: Login function with better logging
  const login = (userData) => {
    console.log('🔑 AuthContext: Login called with:', {
      id_user: userData.id_user,
      id: userData.id,
      email: userData.email,
      nama: userData.nama,
      role: userData.role
    });
    
    localStorage.setItem('isLoggedIn', 'true');
    
    // Store user data - check if it's admin or regular user
    if (userData.role === 'admin' || userData.role === 'superadmin') {
      localStorage.setItem('admin', JSON.stringify(userData));
    }
    localStorage.setItem('user', JSON.stringify(userData));
    
    setIsLoggedIn(true);
    setUser(userData);
    
    console.log('✅ AuthContext: Login completed, user set');
  };

  // Logout function
  const logout = () => {
    console.log('🚪 AuthContext: Logout called');
    
    // Clear all auth related data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('admin');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    setIsLoggedIn(false);
    setUser(null);
    
    console.log('✅ AuthContext: Logout completed');
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

  // ✅ ENHANCED: Log when user state changes
  useEffect(() => {
    console.log('🔄 AuthContext: User state changed:', {
      isLoggedIn,
      user: user ? {
        id_user: user.id_user,
        id: user.id,
        email: user.email,
        nama: user.nama
      } : null,
      loading
    });
  }, [user, isLoggedIn, loading]);

  const value = {
    isLoggedIn,
    user,
    setUser,
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