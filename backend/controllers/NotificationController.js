'use strict';

const db = require('../models');
const Notification = db.Notification;

// Helper function to map database fields to frontend expected fields
const mapNotificationToFrontend = (notification) => {
  if (!notification) return null;
  const notificationData = notification.toJSON ? notification.toJSON() : notification;
  return {
    id: notificationData.id_notifikasi,
    type: notificationData.type || 'info',
    title: notificationData.title,
    content: notificationData.content,
    details: notificationData.isi_notif,
    footer: notificationData.footer,
    date: notificationData.createdAt,
    isRead: notificationData.is_read || false,
    id_admin: notificationData.id_admin,
    id_artikel: notificationData.id_artikel,
    promo_id: notificationData.promo_id,
    createdAt: notificationData.createdAt,
    updatedAt: notificationData.updatedAt
  };
};

// Get all notifications
exports.getNotifications = async (req, res) => {
  try {
    console.log('Getting all notifications...');
    
    const notifications = await Notification.findAll({
      where: {
        deletedAt: null
      },
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${notifications.length} notifications in database`);
    
    const mappedNotifications = notifications.map(notification => mapNotificationToFrontend(notification));
    
    res.json({
      success: true,
      data: mappedNotifications
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message 
    });
  }
};

// Create new notification
exports.createNotification = async (req, res) => {
  try {
    const { type, title, content, details, footer, id_admin, id_artikel, promo_id } = req.body;
    
    console.log('Creating new notification with data:', req.body);
    
    const notification = await Notification.create({
      type: type || 'info',
      title,
      content,
      isi_notif: details,
      footer,
      id_admin,
      id_artikel,
      promo_id,
      is_read: false
    });
    
    console.log('Created notification:', notification.toJSON());
    
    const mappedNotification = mapNotificationToFrontend(notification);
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: mappedNotification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create notification',
      error: error.message 
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findByPk(id);
    
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }
    
    await notification.update({ is_read: true });
    
    const mappedNotification = mapNotificationToFrontend(notification);
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      data: mappedNotification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message 
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { is_read: true },
      { 
        where: { 
          is_read: false,
          deletedAt: null
        } 
      }
    );
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message 
    });
  }
};

// Helper function to create promo notification
exports.createPromoNotification = async (promoData) => {
  try {
    const notification = await Notification.create({
      type: 'promo',
      title: '[Promo Baru Tersedia]',
      content: `Promo ${promoData.title} telah ditambahkan!`,
      isi_notif: `Dapatkan diskon ${promoData.potongan}% dengan kode promo: ${promoData.code}\n\nDetail: ${promoData.details}\n\nBerlaku hingga: ${new Date(promoData.berlakuHingga).toLocaleDateString('id-ID')}`,
      footer: 'Jangan lewatkan kesempatan ini! Gunakan kode promo sekarang juga.',
      id_admin: promoData.id_admin,
      promo_id: promoData.id,
      is_read: false
    });
    
    console.log('Promo notification created:', notification.toJSON());
    return notification;
  } catch (error) {
    console.error('Error creating promo notification:', error);
    throw error;
  }
};