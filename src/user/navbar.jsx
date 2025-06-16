// src/user/navbar.jsx (Fixed untuk semua ukuran layar termasuk 27 inch)
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
    setMobileMenuOpen(false);
  }, [location.pathname]);
  
  // Effect untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
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
        setUnreadNotificationCount(0);
      }
    } catch (error) {
      console.error('Error fetching notification count:', error);
      setUnreadNotificationCount(0);
    }
  };

  // Effect untuk fetch notification count ketika user login/logout
  useEffect(() => {
    if (isLoggedIn) {
      fetchUnreadNotificationCount();
      const interval = setInterval(fetchUnreadNotificationCount, 30000);
      return () => clearInterval(interval);
    } else {
      setUnreadNotificationCount(0);
    }
  }, [isLoggedIn]);

  // Effect untuk refresh notification count ketika kembali dari halaman notifikasi
  useEffect(() => {
    if (isLoggedIn && location.pathname !== '/notifikasi') {
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
    setUnreadNotificationCount(0);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const handleMenuItemClick = (e, path) => {
    e.stopPropagation();
    setShowProfileMenu(false);
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleNotificationClick = () => {
    setMobileMenuOpen(false);
    navigate('/notifikasi');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setShowProfileMenu(false);
  };
  
  return (
    <nav className="bg-white shadow-sm w-full font-['League_Spartan'] fixed top-0 left-0 right-0 z-50">
      {/* Tambahkan style inline untuk memastikan navbar tampil di semua ukuran layar */}
      <style>{`
        .navbar-desktop {
          display: none;
        }
        
        .navbar-login {
          display: none;
        }
        
        @media (min-width: 1024px) {
          .navbar-desktop {
            display: flex !important;
          }
          .navbar-login {
            display: flex !important;
          }
          .navbar-mobile-button {
            display: none !important;
          }
        }
        
        @media (max-width: 1023px) {
          .navbar-desktop {
            display: none !important;
          }
          .navbar-login {
            display: none !important;
          }
          .navbar-mobile-button {
            display: block !important;
          }
        }
      `}</style>
      
      <div className="w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-12">
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18">
          {/* Logo - Always visible */}
          <div className="flex-shrink-0 mb-1 sm:mb-2">
            <Link to="/">
              <img
                src="/images/Logo nocaption.png"
                alt="Berkelana Logo"
                className="h-7 sm:h-8 lg:h-9 xl:h-10 2xl:h-12"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/120/48";
                }}
              />
            </Link>
          </div>
          
          {/* Desktop Navigation Links - Gunakan class custom dan inline style */}
          <div className="navbar-desktop justify-center flex-1 mx-4">
            <div className="flex space-x-4 xl:space-x-6 2xl:space-x-8 3xl:space-x-10">
              <NavLink 
                to="/cari-tiket" 
                className={({ isActive }) =>
                  `font-bold px-3 py-2 text-sm xl:text-base 2xl:text-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive || location.pathname === '/pesan-tiket' ? 'text-emerald-400' : 'text-gray-900 hover:text-emerald-400'
                  }`
                }
              >
                Cari Tiket
              </NavLink>
              <NavLink 
                to="/promo" 
                className={({ isActive }) =>
                  `font-bold px-3 py-2 text-sm xl:text-base 2xl:text-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : 'text-gray-900 hover:text-emerald-400'
                  }`
                }
              >
                Promo
              </NavLink>
              <NavLink 
                to="/artikel" 
                className={({ isActive }) =>
                  `font-bold px-3 py-2 text-sm xl:text-base 2xl:text-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : 'text-gray-900 hover:text-emerald-400'
                  }`
                }
              >
                Artikel
              </NavLink>
              <NavLink 
                to="/tiket-saya" 
                className={({ isActive }) =>
                  `font-bold px-3 py-2 text-sm xl:text-base 2xl:text-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : 'text-gray-900 hover:text-emerald-400'
                  }`
                }
              >
                Tiket Saya
              </NavLink>
              <NavLink 
                to="/tentang-kami" 
                className={({ isActive }) =>
                  `font-bold px-3 py-2 text-sm xl:text-base 2xl:text-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                    isActive ? 'text-emerald-400' : 'text-gray-900 hover:text-emerald-400'
                  }`
                }
              >
                Tentang Kami
              </NavLink>
            </div>
          </div>

          {/* Right side - User actions */}
          <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
            {isLoggedIn ? (
              <>
                {/* Notification Bell - Always visible when logged in */}
                <div className="relative">
                  <button 
                    className="text-gray-900 hover:text-emerald-400 focus:outline-none p-1 transition-colors"
                    onClick={handleNotificationClick}
                  >
                    <i className="fas fa-bell text-lg sm:text-xl lg:text-2xl xl:text-3xl"></i>
                    {unreadNotificationCount > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-500 rounded-full min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-5 lg:min-w-[22px] lg:h-6">
                        {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                      </span>
                    )}
                  </button>
                </div>

                {/* User Profile - Visible on desktop */}
                <div className="hidden sm:block relative" ref={dropdownRef}>
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center focus:outline-none"
                    type="button"
                  >
                    <div className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 2xl:w-14 2xl:h-14 rounded-full overflow-hidden border-2 border-emerald-400 hover:scale-105 transition-transform">
                      {user?.profil_user ? (
                        <img
                          src={user.profil_user.startsWith('http') ? user.profil_user : `http://localhost:3000${user.profil_user}`}
                          alt="User Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/images/default-avatar.png";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <i className="fas fa-user-circle text-xl sm:text-2xl lg:text-3xl xl:text-4xl text-gray-600"></i>
                        </div>
                      )}
                    </div>
                  </button>

                  {/* Profile Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 lg:w-52 xl:w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
                      <button 
                        onClick={(e) => handleMenuItemClick(e, '/info-akun')}
                        className="block w-full text-left px-4 py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Profil Saya
                      </button>
                      <button 
                        onClick={(e) => handleMenuItemClick(e, '/tiket-saya')}
                        className="block w-full text-left px-4 py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Tiket Saya
                      </button>
                      <div className="border-t border-gray-100"></div>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm lg:text-base text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                      >
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login Link - Selalu tampil di desktop */
              <Link
                to="/daftar-masuk"
                className="navbar-login font-bold text-gray-900 hover:text-emerald-400 px-3 lg:px-4 py-2 text-sm lg:text-base xl:text-lg items-center transition-colors"
              >
                <span>Daftar/Masuk</span>
                <i className="fas fa-user-circle text-xl lg:text-2xl xl:text-3xl ml-2 bg-gray-900 text-white rounded-full"></i>
              </Link>
            )}
            
            {/* Mobile menu button - Gunakan class custom */}
            <button 
              className="navbar-mobile-button bg-white p-2 rounded-md text-gray-900 hover:text-emerald-400 focus:outline-none transition-colors"
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <i className={`fas ${mobileMenuOpen ? 'fa-times' : 'fa-bars'} text-lg sm:text-xl transition-transform duration-200`}></i>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu - Show on tablet and mobile */}
      <div className={`lg:hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          {/* Navigation Links */}
          <NavLink
            to="/cari-tiket"
            className={({ isActive }) =>
              `font-bold block px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Cari Tiket
          </NavLink>
          <NavLink
            to="/promo"
            className={({ isActive }) =>
              `font-bold block px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Promo
          </NavLink>
          <NavLink
            to="/artikel"
            className={({ isActive }) =>
              `font-bold block px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Artikel
          </NavLink>
          <NavLink
            to="/tiket-saya"
            className={({ isActive }) =>
              `font-bold block px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Tiket Saya
          </NavLink>
          <NavLink
            to="/tentang-kami"
            className={({ isActive }) =>
              `font-bold block px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
              }`
            }
            onClick={() => setMobileMenuOpen(false)}
          >
            Tentang Kami
          </NavLink>
          
          {/* Conditional content based on login status */}
          {isLoggedIn ? (
            <>
              {/* Notifications link with count */}
              <NavLink
                to="/notifikasi"
                className={({ isActive }) =>
                  `font-bold flex items-center justify-between px-3 py-3 text-sm uppercase tracking-wider transition-colors ${
                    isActive ? 'text-emerald-400 bg-emerald-50' : 'text-gray-900 hover:text-emerald-400 hover:bg-gray-50'
                  }`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>Notifikasi</span>
                {unreadNotificationCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                    {unreadNotificationCount > 99 ? '99+' : unreadNotificationCount}
                  </span>
                )}
              </NavLink>
              
              {/* User profile section */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex items-center px-3 py-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400 mr-3">
                    {user?.profil_user ? (
                      <img
                        src={user.profil_user.startsWith('http') ? user.profil_user : `http://localhost:3000${user.profil_user}`}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/default-avatar.png";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <i className="fas fa-user-circle text-2xl text-gray-600"></i>
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{user?.nama || 'User'}</span>
                </div>
                
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/info-akun');
                  }}
                  className="font-bold text-gray-900 hover:text-emerald-400 hover:bg-gray-50 block px-3 py-3 text-sm uppercase tracking-wider w-full text-left transition-colors"
                >
                  Profil Saya
                </button>
                
                <button
                  onClick={handleLogout}
                  className="font-bold text-red-600 hover:text-red-700 hover:bg-red-50 block px-3 py-3 text-sm uppercase tracking-wider w-full text-left transition-colors"
                >
                  Keluar
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/daftar-masuk"
              className="font-bold text-gray-900 hover:text-emerald-400 hover:bg-gray-50 block px-3 py-3 text-sm uppercase tracking-wider transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Daftar/Masuk
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;