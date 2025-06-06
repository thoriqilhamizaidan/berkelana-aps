// src/user/footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-white font-[League_Spartan] text-base">
      {/* Footer Banner */}
      <section className="relative h-32 sm:h-40 md:h-48 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="../images/banner.png" alt="Footer Banner" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-start text-white px-4 sm:px-6 md:px-8 lg:px-16">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">
            Bersama <span className="text-purple-300">#Berkelana</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg">Perjalanan Tak Terbatas, Keindahan Tanpa Batas</p>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="max-w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Mobile Layout - Stack vertically */}
          <div className="block md:hidden space-y-6">
            {/* Logo Section */}
            <div className="text-center">
              <img
                src="../images/berkelana-logo.png"
                alt="Berkelana Logo"
                className="h-16 sm:h-20 mx-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/160/60";
                }}
              />
            </div>
            
            {/* Contact Section */}
            <div className="text-center">
              <h3 className="font-medium mb-3 text-gray-900">Hubungi Kami</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <i className="fa-solid fa-phone-alt mr-2 text-gray-700"></i>
                  <a href="tel:08124494015" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    08124494015
                  </a>
                </div>
                <div className="flex items-center justify-center">
                  <i className="fas fa-envelope mr-2 text-gray-700"></i>
                  <a href="mailto:berkelanaapps@gmail.com" className="text-gray-700 hover:text-emerald-400 transition-colors break-all">
                    berkelanaapps@gmail.com
                  </a>
                </div>
              </div>
            </div>
            
            {/* Services and Others in 2 columns */}
            <div className="grid grid-cols-2 gap-6">
              {/* Services Section */}
              <div className="text-center">
                <h3 className="font-medium mb-3 text-gray-900">Layanan</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/cari-tiket" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Cari tiket
                    </Link>
                  </li>
                  <li>
                    <Link to="/promo" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Promo
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Others Section */}
              <div className="text-center">
                <h3 className="font-medium mb-3 text-gray-900">Lainnya</h3>
                <ul className="space-y-2">
                  <li>
                    <Link to="/artikel" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Artikel
                    </Link>
                  </li>
                  <li>
                    <Link to="/tiket-saya" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Tiket Saya
                    </Link>
                  </li>
                  <li>
                    <Link to="/tentang-kami" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Tentang kami
                    </Link>
                  </li>
                  <li>
                    <Link to="/syarat-ketentuan" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                      Kebijakan Kami
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Social Media Section */}
            <div className="text-center">
              <h3 className="font-medium mb-3 text-gray-900">Temukan Kami di</h3>
              <div className="flex justify-center space-x-4">
                <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                  <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
                </a>
                <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                  <i className="fab fa-instagram text-gray-700 hover:text-emerald-400"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Desktop/Tablet Layout - Horizontal */}
          <div className="hidden md:flex flex-wrap justify-between items-start gap-6 lg:gap-8">
            {/* Logo Section */}
            <div className="flex-shrink-0">
              <img
                src="../images/berkelana-logo.png"
                alt="Berkelana Logo"
                className="h-20 lg:h-25"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/160/60";
                }}
              />
            </div>
            
            {/* Contact Section */}
            <div className="min-w-0 flex-1 max-w-xs">
              <h3 className="font-medium mb-4 text-gray-900">Hubungi Kami</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <i className="fa-solid fa-phone-alt mr-2 text-gray-700 flex-shrink-0"></i>
                  <a href="tel:08124494015" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    08124494015
                  </a>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-envelope mr-2 text-gray-700 flex-shrink-0"></i>
                  <a href="mailto:berkelanaapps@gmail.com" className="text-gray-700 hover:text-emerald-400 transition-colors break-words">
                    berkelanaapps@gmail.com
                  </a>
                </div>
              </div>
            </div>
            
            {/* Services Section */}
            <div className="min-w-0 flex-1 max-w-xs">
              <h3 className="font-medium mb-4 text-gray-900">Layanan</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/cari-tiket" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Cari tiket
                  </Link>
                </li>
                <li>
                  <Link to="/promo" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Promo
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Others Section */}
            <div className="min-w-0 flex-1 max-w-xs">
              <h3 className="font-medium mb-4 text-gray-900">Lainnya</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/artikel" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Artikel
                  </Link>
                </li>
                <li>
                  <Link to="/tiket-saya" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Tiket Saya
                  </Link>
                </li>
                <li>
                  <Link to="/tentang-kami" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Tentang kami
                  </Link>
                </li>
                <li>
                  <Link to="/syarat-ketentuan" className="text-gray-700 hover:text-emerald-400 transition-colors">
                    Kebijakan Kami
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Social Media Section */}
            <div className="flex-shrink-0">
              <h3 className="font-medium mb-4 text-gray-900">Temukan Kami di</h3>
              <div className="flex space-x-4">
                <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                  <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
                </a>
                <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                  <i className="fab fa-instagram text-gray-700 hover:text-emerald-400"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-emerald1 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-black text-sm sm:text-base">
            Copyright © 2025 BERKELANA®, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;