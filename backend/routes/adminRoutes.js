const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticate, authorizeAdmin, authorizeSuperAdmin } = require('../middleware/auth');

// Protect all admin routes with authentication and admin authorization
router.get('/admin', authenticate, authorizeAdmin, adminController.getAllAdmins);
router.post('/admin', authenticate, authorizeSuperAdmin, adminController.addAdmin); // Only superadmin can add admin
router.put('/admin/:id', authenticate, authorizeSuperAdmin, adminController.updateAdmin); // Only superadmin can update admin
router.delete('/admin/:id', authenticate, authorizeSuperAdmin, adminController.deleteAdmin); // Only superadmin can delete admin

module.exports = router;