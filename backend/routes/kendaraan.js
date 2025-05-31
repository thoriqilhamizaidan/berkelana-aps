const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Konfigurasi multer untuk upload gambar kendaraan
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads/kendaraan');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'kendaraan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Public routes - anyone can view
router.get('/', kendaraanController.getAllKendaraan);
router.get('/tipe/:tipe', kendaraanController.getKendaraanByTipe);
router.get('/:id', kendaraanController.getKendaraanById);

// Admin only routes - need authentication and admin role
router.post('/', authenticate, authorizeAdmin, upload.single('gambar'), kendaraanController.createKendaraan);
router.put('/:id', authenticate, authorizeAdmin, upload.single('gambar'), kendaraanController.updateKendaraan);
router.delete('/:id', authenticate, authorizeAdmin, kendaraanController.deleteKendaraan);

module.exports = router;