// backend/routes/jadwal.js
const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes - anyone can view
router.get('/filter', jadwalController.getJadwalByFilter);
router.get('/', jadwalController.getAllJadwal);
router.get('/:id', jadwalController.getJadwalById);

// Admin only routes - need authentication and admin role
router.post('/', authenticate, authorizeAdmin, jadwalController.createJadwal);
router.put('/:id', authenticate, authorizeAdmin, jadwalController.updateJadwal);
router.delete('/:id', authenticate, authorizeAdmin, jadwalController.deleteJadwal);

module.exports = router;