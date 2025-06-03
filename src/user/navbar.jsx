// src/user/navbar.jsx (updated with dynamic notification count)
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { BellIcon } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, logout, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const dropdownRef = useRef(null);
  
  // Tutup menu dropdown ketika rute berubah
  useEffect(() => {
    setShowProfileMenu(false);
  }, [location.pathname]);
  
  // Effect untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Tambahkan pengecekan ref untuk memastikan dropdown ref ada
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    // Hanya tambahkan listener jika dropdown terbuka
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);
  
  // Fetch unread notification count
  const fetchUnreadNotificationCount = async () => {
    if (!isLoggedIn) {
      setUnreadNotificationCount(0);
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const unreadCount = result.data.filter(notification => !notification.isRead).length;
          setUnreadNotificationCount(unreadCount);
        } else {
          setUnreadNotificationCount(0);
        }
      } else {
        // Fallback - set to 0 if API fails
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      // Fallback - set to 0 if API fails
      setUnreadNotificationCount(0);
    }
  };

  // Effect untuk fetch notification count ketika user login/logout
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadNotificationCount();
      
      // Set interval untuk refresh notification count setiap 30 detik
      const interval = setInterval(fetchUnreadNotificationCount, 30000);
      
      // Cleanup interval saat component unmount atau user logout
      return () => clearInterval(interval);
    } else {
      setUnreadNotificationCount(0);
    }
  }, [isLoggedIn]);

  // Effect untuk refresh notification count ketika kembali dari halaman notifikasi
  useEffect(() => {
    if (isLoggedIn && location.pathname !== '/notifikasi') {
      // Refresh count ketika navigasi dari halaman notifikasi
      const timeoutId = setTimeout(() => {
        fetchUnreadNotificationCount();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, isLoggedIn]);
  
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
      if (document.head.contains(fontAwesomeLink)) {
        document.head.removeChild(fontAwesomeLink);
      }
      if (document.head.contains(fontLink)) {
        document.head.removeChild(fontLink);
      }
    };
  }, []);

  const handleProfileClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggedIn) {
      setShowProfileMenu(!showProfileMenu);
    } else {
      navigate('/daftar-masuk');
    }
  };
  
  const handleLogout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    logout();
    setShowProfileMenu(false);
    setUnreadNotificationCount(0); // Reset notification count on logout
    navigate('/');
  };

  // Handler untuk menu items agar tidak menutup dropdown saat diklik
  const handleMenuItemClick = (e, path) => {
    e.stopPropagation();
    setShowProfileMenu(false);
    navigate(path);
  };

  // Handler for notification bell click - Navigate to notifications page
  const handleNotificationClick = () => {
    navigate('/notifikasi');
  };
  
  return (
    <nav className="bg-white shadow-sm w-full font-['League_Spartan'] relative z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-start h-16">
          {/* Logo - Left aligned */}
          <div className="flex-shrink-0 mb-2 ml-2">
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
          <div className="flex justify-center flex-1 ml-9">
            <div className="flex space-x-12">
              <NavLink 
                to="/cari-tiket" 
                className={({ isActive }) =>
                  isActive ? 'font-bold text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider' : 'font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider'
                }
              >
                Cari Tiket
              </NavLink>
              <NavLink 
                to="/promo" 
                className={({ isActive }) =>
                  isActive ? 'font-bold text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider' : 'font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider'
                }
              >
                Promo
              </NavLink>
              <NavLink 
                to="/artikel" 
                className={({ isActive }) =>
                  isActive ? 'font-bold text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider' : 'font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider'
                }
              >
                Artikel
              </NavLink>
              <NavLink 
                to="/tiket-saya" 
                className={({ isActive }) =>
                  isActive ? 'font-bold text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider' : 'font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider'
                }
              >
                Tiket Saya
              </NavLink>
              <NavLink 
                to="/tentang-kami" 
                className={({ isActive }) =>
                  isActive ? 'font-bold text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider' : 'font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm uppercase tracking-wider'
                }
              >
                Tentang Kami
              </NavLink>
            </div>
          </div>

          
          {/* Login/Register or User Profile - Right aligned */}
          <div className="flex items-center space-x-4 mr-2">
            {isLoggedIn ? (
              <>
                {/* Notification Bell - Updated with dynamic count */}
                <div className="relative top-1">
                  <button 
                    className="text-gray-900 hover:text-emerald-400 focus:outline-none"
                    onClick={handleNotificationClick}
                  >
                    <i className="fas fa-bell text-2xl"></i>
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] h-5">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Profile */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center focus:outline-none"
                    type="button"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald1 hover:scale-105 ">
                      
  {user?.profil_user ? (
  <img
    src={user.profil_user.startsWith('http') ? user.profil_user : `http://localhost:3000${user.profil_user}`}
    alt="User Profile"
    className="w-full h-12 object-cover"
    onError={(e) => {
      e.target.onerror = null;
      e.target.src = "/images/default-avatar.png";
    }}
  />
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-200">
    <i className="fas fa-user-circle text-3xl text-gray-600"></i>
  </div>
)}

                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <button 
                        onClick={(e) => handleMenuItemClick(e, '/info-akun')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Profil Saya
                      </button>
                      <button 
                        onClick={(e) => handleMenuItemClick(e, '/tiket-saya')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Tiket Saya
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/daftar-masuk"
                className="font-bold text-gray-900 hover:text-emerald-400 px-3 py-2 text-sm flex items-center"
              >
                Daftar/Masuk
                <i className="fas fa-user-circle text-2xl ml-2 bg-gray-900 text-white rounded-full"></i>
              </Link>
            )}
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
            onClick={() => setMobileMenuOpen(false)}
          >
            Cari Tiket
          </Link>
          <Link
            to="/promo"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
            onClick={() => setMobileMenuOpen(false)}
          >
            Promo
          </Link>
          <Link
            to="/artikel"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
            onClick={() => setMobileMenuOpen(false)}
          >
            Artikel
          </Link>
          <Link
            to="/tiket-saya"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tiket Saya
          </Link>
          <Link
            to="/tentang-kami"
            className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
            onClick={() => setMobileMenuOpen(false)}
          >
            Tentang Kami
          </Link>
          {/* Add Notifications link to mobile menu with count */}
          {isLoggedIn && (
            <Link
              to="/notifikasi"
              className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider flex items-center justify-between"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notifikasi
              {unreadNotificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                  {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                </span>
              )}
            </Link>
          )}
          {!isLoggedIn && (
            <Link
              to="/daftar-masuk"
              className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider"
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar/Masuk
            </Link>
          )}
          {isLoggedIn && (
            <>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate('/info-akun');
                }}
                className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider w-full text-left"
              >
                Profil Saya
              </button>
              <button
                onClick={handleLogout}
                className="font-bold text-gray-900 hover:text-emerald-400 block px-3 py-2 text-sm uppercase tracking-wider w-full text-left"
              >
                Keluar
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;