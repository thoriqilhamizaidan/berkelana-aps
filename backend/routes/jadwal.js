// backend/routes/jadwal.js
const express = require('express');
const router = express.Router();
const jadwalController = require('../controllers/jadwalController');

// Get jadwal with filters
router.get('/filter', jadwalController.getJadwalByFilter);

// Get all jadwal
router.get('/', jadwalController.getAllJadwal);

// Get single jadwal
router.get('/:id', jadwalController.getJadwalById);

// Create new jadwal
router.post('/', jadwalController.createJadwal);

// Update jadwal
router.put('/:id', jadwalController.updateJadwal);

// Delete jadwal
router.delete('/:id', jadwalController.deleteJadwal);

module.exports = router;