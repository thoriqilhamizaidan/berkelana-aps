import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom'; // ✅ Tambahan

const Sidebar = ({ activeMenu, setActiveMenu, userRole = null }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate(); // ✅ Tambahan

  // Fungsi untuk mendapatkan role user yang benar
  const getCurrentUserRole = () => {
    if (userRole) {
      return userRole;
    }

    try {
      let userData = localStorage.getItem('user');
      if (!userData) {
        userData = localStorage.getItem('admin');
      }

      if (userData) {
        const parsedData = JSON.parse(userData);
        return parsedData.role_admin || parsedData.role || 'admin';
      }

      let sessionData = sessionStorage.getItem('user');
      if (!sessionData) {
        sessionData = sessionStorage.getItem('admin');
      }

      if (sessionData) {
        const parsedData = JSON.parse(sessionData);
        return parsedData.role_admin || parsedData.role || 'admin';
      }

      return 'admin';
    } catch (error) {
      console.error('Error getting user role:', error);
      return 'admin';
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Admin';

    switch (role.toLowerCase()) {
      case 'superadmin':
      case 'super_admin':
      case 'super admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
    }
  };

  const menuItems = [
    {
      icon: 'material-symbols:home-rounded',
      label: 'Dashboard',
      active: true
    },
    {
      icon: 'mingcute:ticket-fill',
      label: 'Tiket dan Jadwal'
    },
    {
      icon: 'mdi:car',
      label: 'Detail Kendaraan'
    },
    {
      icon: 'fa6-solid:pencil',
      label: 'Artikel'
    },
    {
      icon: 'streamline:discount-percent-circle-solid',
      label: 'Promo'
    },
    {
      icon: 'ph:database-fill',
      label: 'Laporan Penjualan Tiket'
    },
    {
      icon: 'lsicon:circle-add-filled',
      label: 'Kelola Admin'
    }
  ];

  const currentRole = getCurrentUserRole();
  console.log('Current user role:', currentRole);
  console.log('Formatted role:', formatRole(currentRole));

  return (
    <div
      className={`${isCollapsed ? 'w-20' : 'w-72'} bg-gradient-to-b from-gray-100 to-gray-100 shadow-xl border-r border-gray-100 min-h-screen relative transition-all duration-500 ease-in-out cursor-pointer backdrop-blur-sm`}
      onClick={() => setIsCollapsed(!isCollapsed)}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex flex-col items-start">
          {/* Logo */}
          <div className={`${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} flex items-center justify-center transition-all duration-500 ease-in-out`}>
            {isCollapsed ? (
              <img
                src="../images/berkelana-logo-kecil.png"
                alt="Berkelana Logo Small"
                className="w-10 h-10 object-contain filter drop-shadow-sm transition-all duration-500"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24' fill='%237c3aed'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z'/%3E%3C/svg%3E";
                }}
              />
            ) : (
              <img
                src="../images/berkelana-logo.png"
                alt="Berkelana Logo"
                className="w-26 h-26 object-contain filter drop-shadow-sm transition-all duration-500"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='%237c3aed'%3E%3Cpath d='M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z'/%3E%3C/svg%3E";
                }}
              />
            )}
          </div>
          {!isCollapsed && (
            <div className="mt-2 opacity-0 animate-fade-in" style={{ animation: 'fadeIn 0.3s ease-in-out 0.2s forwards' }}>
              <p className="text-xs text-gray-500 font-medium tracking-wide">
                {formatRole(currentRole)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="mt-6">
        {menuItems.map((item, index) => {
          const isActive = item.label === activeMenu;
          return (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenu(item.label);
              }}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-3' : 'space-x-3 px-6'
              } py-3 text-left transition-colors border-b border-gray-300 ${
                isActive
                  ? 'bg-purple-100 border-r-3 border-purple-600 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
              title={isCollapsed ? item.label : ''}
              style={{ borderBottomWidth: index === menuItems.length - 1 ? '0' : undefined }}
            >
              <Icon
                icon={item.icon}
                width={20}
                height={20}
                className={`transition-all duration-300 ${
                  isActive ? 'text-purple-700' : 'text-gray-600'
                }`}
              />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className={`absolute bottom-0 ${isCollapsed ? 'w-20' : 'w-72'} p-6 transition-all duration-500`}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            localStorage.removeItem('admin');
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/'); // ✅ Redirect ke homepage
          }}
          className={`flex items-center ${
            isCollapsed ? 'justify-center p-3' : 'space-x-3 px-4 py-3'
          } text-gray-500 hover:text-red-500 transition-all duration-300 ease-in-out rounded-xl hover:bg-red-50 hover:shadow-md hover:shadow-red-100/50 group w-full`}
          title={isCollapsed ? 'Log out' : ''}
        >
          <LogOut
            size={isCollapsed ? 18 : 20}
            className="transition-all duration-300 group-hover:transform group-hover:scale-110"
          />
          {!isCollapsed && (
            <span className="font-medium text-sm transition-all duration-300">Log out</span>
          )}
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
