// src/pages/NotificationsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, Tag, Bell } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import Footer from './footer';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/api/notifications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        setNotifications(result.data);
      } else {
        // If no notifications or error, use empty array
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Gagal memuat notifikasi');
      // Use fallback data if API fails
      setNotifications([
        {
          id: 1,
          type: 'reminder',
          title: '[Pengingat Keberangkatan]',
          content: 'Hai, waktunya berkemas!',
          details: 'Perjalanan Anda ke Jakarta dimulai dalam 1 jam.\nPastikan Anda sudah tiba di titik keberangkatan ya!',
          date: new Date(),
          isRead: false
        }
      ]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchNotifications();
    
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ));
      } else {
        console.error('Failed to mark notification as read');
        // Fallback: update UI anyway
        setNotifications(notifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Fallback: update UI anyway
      setNotifications(notifications.map(notification => 
        notification.id === id ? { ...notification, isRead: true } : notification
      ));
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      } else {
        console.error('Failed to mark all notifications as read');
        // Fallback: update UI anyway
        setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      // Fallback: update UI anyway
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'promo':
        return <Tag className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationBgColor = (type, isRead) => {
    if (isRead) return 'bg-gray-50';
    
    switch (type) {
      case 'reminder':
        return 'bg-blue-50';
      case 'success':
        return 'bg-green-50';
      case 'promo':
        return 'bg-purple-50';
      default:
        return 'bg-gray-100';
    }
  };

  const formatDate = (date) => {
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Tanggal tidak valid';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate(-1)}
                className="mr-4 text-gray-900 hover:text-emerald-400 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </div>
            </div>
            {notifications.length > 0 && notifications.some(n => !n.isRead) && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-emerald-500 font-medium hover:text-emerald-600 transition-colors"
                disabled={loading}
              >
                Tandai semua sudah dibaca
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-3xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

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
                className={`${getNotificationBgColor(notification.type, notification.isRead)} rounded-lg p-4 cursor-pointer transition-all hover:shadow-md border ${!notification.isRead ? 'border-emerald-200' : 'border-gray-200'}`}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1 mr-3">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className={`text-base font-medium ${notification.isRead ? 'text-gray-500' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        <p className={`text-base font-medium ${notification.isRead ? 'text-gray-400' : 'text-gray-900'} mt-1`}>
                          {notification.content}
                        </p>
                      </div>
                      <div className="flex items-center ml-4">
                        <span className={`text-xs ${notification.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                          {formatDate(notification.date)}
                        </span>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-emerald-500 rounded-full ml-2"></div>
                        )}
                      </div>
                    </div>
                    
                    {notification.details && (
                      <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'} mt-2 whitespace-pre-line`}>
                        {notification.details}
                      </p>
                    )}
                    
                    {notification.footer && (
                      <div className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-gray-600'} mt-3 p-3 bg-white rounded-md border-l-4 ${notification.type === 'promo' ? 'border-purple-400' : 'border-emerald-400'}`}>
                        <p className="font-medium">{notification.footer}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-medium text-gray-900">Tidak ada notifikasi</h3>
            <p className="text-gray-600 mt-2">Anda akan menerima notifikasi terkait perjalanan dan promo di sini.</p>
            <button 
              onClick={fetchNotifications}
              className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              disabled={loading}
            >
              Refresh
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default NotificationsPage;