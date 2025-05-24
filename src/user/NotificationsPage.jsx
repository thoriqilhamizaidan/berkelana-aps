// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Footer from './footer';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'reminder',
      title: '[Pengingat Keberangkatan]',
      content: 'Hai, waktunya berkemas!',
      details: 'Perjalanan Anda ke Jakarta dimulai dalam 1 jam.\nPastikan Anda sudah tiba di titik keberangkatan ya!',
      date: new Date(),
      isRead: false
    },
    {
      id: 2,
      type: 'success',
      title: '[Notifikasi Pemesanan Berhasil]',
      content: 'Selamat! Pemesanan Anda Berhasil',
      details: 'Nomor pesanan: TRV12345678\nRincian pemesanan:\nJakarta → Bandung | Tanggal: 29 April 2025 | Jam: 03:00 WIB',
      footer: 'E-tiket telah dikirim ke email Anda dan tersedia di menu Tiket Saya. Jangan lupa datang 30 menit sebelum keberangkatan!',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isRead: false
    },
    {
      id: 3,
      type: 'promo',
      title: '[Penawaran Khusus]',
      content: 'Promo Spesial untuk Anda!',
      details: 'Dapatkan diskon hingga 20% untuk perjalanan ke Surabaya minggu ini!\nPilih sekarang, sebelum kehabisan!',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      isRead: true
    }
  ]);
  const [loading, setLoading] = useState(false);
  
  const handleMarkAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };
  
  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                className="mr-4 text-gray-900 hover:text-emerald-400"
                aria-label="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
              </div>
            </div>
            {notifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-emerald-500 font-medium hover:text-emerald-600"
              >
                Tandai semua sudah dibaca
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notifications container */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className="bg-gray-100 rounded-lg p-4 cursor-pointer"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    {notification.type === 'reminder' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                    {notification.type === 'success' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                    {notification.type === 'promo' && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="h-5 w-5 text-green-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-base font-medium ${notification.isRead ? 'text-gray-500' : 'text-gray-900'}`}>{notification.title}</h3>
                    <p className={`text-base font-medium ${notification.isRead ? 'text-gray-400' : 'text-gray-900'} mt-1`}>{notification.content}</p>
                    <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'} mt-2 whitespace-pre-line`}>{notification.details}</p>
                    
                    {notification.footer && (
                      <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                        <span className="font-semibold">E-tiket telah dikirim ke email Anda dan tersedia di menu </span>
                        <span className={`font-semibold ${notification.isRead ? 'text-emerald-400' : 'text-emerald-600'}`}>Tiket Saya</span>
                        <span className="font-semibold">. Jangan lupa datang 30 menit sebelum keberangkatan!</span>
                      </p>
                    )}
                  </div>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2 mt-2"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-900">Tidak ada notifikasi</h3>
            <p className="text-gray-600 mt-2">Anda akan menerima notifikasi terkait perjalanan dan promo di sini.</p>
          </div>
        )}
      </div>
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotificationsPage;
