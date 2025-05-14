// src/user/footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    
    <footer className="bg-white" style={{ fontFamily: 'League Spartan, sans-serif' }}>
      {/* Main footer content - removed horizontal padding constraints */}
      <section className="relative h-48 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="/images/killian-pham-Sq8rpq2KB7U-unsplash.jpg" alt="Footer Banner" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <h2 className="text-2xl font-bold mb-2">Berkelana</h2>
          <p className="text-lg">Perjalanan Tak Terbatas, Keindahan Tanpa Batas</p>
        </div>
      </section>
      <div className="max-w-full mx-auto py-8 px-0">
        <div className="flex flex-col md:flex-row justify-between items-start max-w-7xl mx-auto">
          {/* Section 1 - Logo - Added negative margin to pull to edge */}
          <div className="mb-8 md:mb-0 md:mr-8 md:-ml-4 lg:-ml-8">
            <div className="mb-6">
              <img
                src="../images/berkelana-logo.png"
                alt="Berkelana Logo"
                className="h-25"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/160/60";
                }}
              />
            </div>
          </div>
          
          {/* Section 2 - Kontak (Nomor dan Email) */}
          <div className="mb-8 md:mb-0 md:mr-8">
            <h3 className="font-medium mb-4">Hubungi Kami</h3>
            <div className="space-y-2">
              <div className="flex items-center">
              
                <i className="fa-solid fa-phone-alt mr-2 text-gray-700"></i>
                <a href="tel:08124494015" className="text-gray-700 hover:text-emerald-400">
                  08124494015
                </a>
              </div>
              <div className="flex items-center">
                <i className="fas fa-envelope mr-2 text-gray-700"></i>
                <a href="mailto:berkelanaindonesia@gmail.com" className="text-gray-700 hover:text-emerald-400">
                  berkelanaindonesia@gmail.com
                </a>
              </div>
            </div>
          </div>
          
          {/* Section 3 - Cari Tiket dan Promo */}
          <div className="mb-8 md:mb-0 md:mr-8">
            <h3 className="font-medium mb-4">Layanan</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cari-tiket" className="text-gray-700 hover:text-emerald-400">
                  Cari tiket
                </Link>
              </li>
              <li>
                <Link to="/promo" className="text-gray-700 hover:text-emerald-400">
                  Promo
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Section 4 - Artikel, Tiket Saya, Syarat, Privacy */}
          <div className="mb-8 md:mb-0 md:mr-8">
            <h3 className="font-medium mb-4">Lainnya</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/artikel" className="text-gray-700 hover:text-emerald-400">
                  Artikel
                </Link>
              </li>
              <li>
                <Link to="/tiket-saya" className="text-gray-700 hover:text-emerald-400">
                  Tiket Saya
                </Link>
              </li>
              <li>
                <Link to="/syarat-ketentuan" className="text-gray-700 hover:text-emerald-400">
                  Syarat & Ketentuan
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-700 hover:text-emerald-400">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Section 5 - Social Media - Added negative margin to pull to edge */}
          <div className="md:-mr-4 lg:-mr-8">
            <h3 className="font-medium mb-4">Temukan Kami di</h3>
            <div className="flex space-x-4">
              <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400">
                <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
              </a>
              <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400">
                <i className="fab fa-instagram text-gray-700 hover:text-emerald-400"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Copyright Section */}
      <div className="bg-emerald1 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-black">
            Copyright © 2025 BERKELANA®, All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;