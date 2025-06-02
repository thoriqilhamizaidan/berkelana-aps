'use strict';

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/NotificationController');

// Get all notifications
router.get('/', notificationController.getNotifications);

// Create new notification
router.post('/', notificationController.createNotification);

// Mark notification as read
router.put('/:id/read', notificationController.markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

module.exports = router;