import React from "react";
import { FaHome, FaTicketAlt, FaPen, FaTags, FaDatabase, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: "Dashboard", icon: <FaHome />, to: "/admin/dashboard" },
  { label: "Tiket dan Jadwal", icon: <FaTicketAlt />, to: "/admin/tiket-jadwal" },
  { label: "Artikel", icon: <FaPen />, to: "/admin/artikel" },
  { label: "Promo", icon: <FaTags />, to: "/admin/promo" },
  { label: "Laporan Penjualan Tiket", icon: <FaDatabase />, to: "/admin/laporan" },
  { label: "Kelola Admin", icon: <FaUserPlus />, to: "/admin/admins" },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="bg-[#F6F6F6] min-h-screen w-[290px] flex flex-col justify-between rounded-tr-[2rem] rounded-br-[2rem] py-8 px-6 border-r border-gray-200">
      <div>
        {/* Logo */}
        <div className="flex flex-col items-start mb-8">
          <img src="/images/berkelana-logo.png" className="h-10 mb-2" alt="Logo" />
          <span className="font-semibold text-gray-400 text-lg mt-1 ml-1">Super Admin</span>
        </div>
        {/* Navigation */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item, idx) => (
            <Link
              to={item.to}
              key={item.label}
              className={`flex items-center gap-4 py-3 px-4 rounded-lg text-lg font-medium transition 
                ${location.pathname === item.to ? "bg-white text-purple-500 font-bold shadow" : "text-gray-700 hover:bg-white hover:text-purple-500"}
                border-b border-[#C6C6C6] last:border-b-0`}
            >
              <span className="text-2xl">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      {/* Logout */}
      <button className="flex items-center gap-3 text-lg font-bold text-purple-400 hover:text-purple-600 mt-10">
        <FaSignOutAlt className="text-2xl" />
        Log out
      </button>
    </aside>
  );
};

export default AdminSidebar;