const express = require('express');
const router = express.Router();
const kendaraanController = require('../controllers/kendaraanController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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

// Rute untuk CRUD kendaraan
router.get('/', kendaraanController.getAllKendaraan);
router.get('/tipe/:tipe', kendaraanController.getKendaraanByTipe); // Route baru untuk get by tipe
router.get('/:id', kendaraanController.getKendaraanById);
router.post('/', upload.single('gambar'), kendaraanController.createKendaraan);
router.put('/:id', upload.single('gambar'), kendaraanController.updateKendaraan);
router.delete('/:id', kendaraanController.deleteKendaraan);

module.exports = router;