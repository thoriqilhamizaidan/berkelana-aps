// src/layouts/MainLayout.jsx
import React from 'react';
import Navbar from '../user/navbar';
import { useAuth } from '../user/context/AuthContext';

const MainLayout = ({ children }) => {
  const { isLoggedIn } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isLoggedIn} />
      <main className="flex-grow">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;