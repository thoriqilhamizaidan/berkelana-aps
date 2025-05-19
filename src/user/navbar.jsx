// src/user/navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    // Load Font Awesome
    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
    
    // Load League Spartan font
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
    
    // Add League Spartan to the document body
    document.body.style.fontFamily = '"League Spartan", sans-serif';
    
    return () => {
      document.head.removeChild(fontAwesomeLink);
      document.head.removeChild(fontLink);
      // Reset font family on unmount if needed
    };
  }, []);
  
  return (
    <nav className="bg-white shadow-sm w-full font-['League_Spartan']">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-16">
          {/* Logo - Left aligned */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/images/Logo nocaption.png"
                alt="Berkelana Logo"
                className="h-9"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/120/48";
                }}
              />
            </Link>
          </div>
          
          {/* Navigation Links - Center aligned */}
          <div className="flex justify-center flex-1">
            <div className="flex space-x-8">
              <Link 
                to="/cari-tiket" 
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider"
              >
                Cari Tiket
              </Link>
              <Link 
                to="/promo" 
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider"
              >
                Promo
              </Link>
              <Link 
                to="/artikel" 
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider"
              >
                Artikel
              </Link>
              <Link 
                to="/tiket-saya" 
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider"
              >
                Tiket Saya
              </Link>
              <Link 
                to="/tentang-kami" 
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider"
              >
                Tentang Kami
              </Link>
            </div>
          </div>
          
          {/* Login/Register - Right aligned */}
          <div className="flex items-center">
            <Link
              to="/daftar-masuk"
              className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm flex items-center"
            >
              Daftar/Masuk
              <i className="fas fa-user-circle text-2xl ml-2 bg-gray-900 text-white rounded-full"></i>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="bg-white p-2 rounded-md text-gray-900 hover:text-emerald-400 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu, toggle based on menu state */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/cari-tiket"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Cari Tiket
          </Link>
          <Link
            to="/promo"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Promo
          </Link>
          <Link
            to="/artikel"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Artikel
          </Link>
          <Link
            to="/tiket-saya"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Tiket Saya
          </Link>
          <Link
            to="/tentang-kami"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Tentang Kami
          </Link>
          <Link
            to="/daftar-masuk"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
          >
            Daftar/Masuk
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;