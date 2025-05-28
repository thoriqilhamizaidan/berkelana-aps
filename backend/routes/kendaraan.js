// backend/routes/kendaraan.js
const express = require('express');
const router = express.Router();
const { Kendaraan } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../public/uploads/kendaraan');
    // Create directory if it doesn't exist
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

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// GET all kendaraan
router.get('/', async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findAll({
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      success: true,
      data: kendaraan
    });
  } catch (error) {
    console.error('Error fetching kendaraan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kendaraan',
      error: error.message
    });
  }
});

// GET single kendaraan by ID
router.get('/:id', async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findByPk(req.params.id);
    
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }
    
    res.json({
      success: true,
      data: kendaraan
    });
  } catch (error) {
    console.error('Error fetching kendaraan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kendaraan',
      error: error.message
    });
  }
});

// POST create new kendaraan
router.post('/', upload.single('gambar'), async (req, res) => {
  try {
    const {
      tipe_armada,
      nomor_armada,
      nomor_kendaraan,
      format_kursi,
      kapasitas_kursi,
      nama_kondektur,
      nomor_kondektur,
      fasilitas
    } = req.body;

    // Validate required fields
    if (!tipe_armada || !nomor_armada || !nomor_kendaraan || !format_kursi || 
        !kapasitas_kursi || !nama_kondektur || !nomor_kondektur) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Check if nomor_armada or nomor_kendaraan already exists
    const existingKendaraan = await Kendaraan.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { nomor_armada },
          { nomor_kendaraan }
        ]
      }
    });

    if (existingKendaraan) {
      return res.status(400).json({
        success: false,
        message: 'Nomor armada atau nomor kendaraan sudah digunakan'
      });
    }

    const kendaraanData = {
      tipe_armada,
      nomor_armada,
      nomor_kendaraan,
      format_kursi,
      kapasitas_kursi: parseInt(kapasitas_kursi),
      nama_kondektur,
      nomor_kondektur,
      fasilitas: Array.isArray(fasilitas) ? fasilitas : (fasilitas ? JSON.parse(fasilitas) : [])
    };

    // Add image filename if uploaded
    if (req.file) {
      kendaraanData.gambar = req.file.filename;
    }

    const newKendaraan = await Kendaraan.create(kendaraanData);
    
    res.status(201).json({
      success: true,
      message: 'Kendaraan berhasil ditambahkan',
      data: newKendaraan
    });
  } catch (error) {
    console.error('Error creating kendaraan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan kendaraan',
      error: error.message
    });
  }
});

// PUT update kendaraan
router.put('/:id', upload.single('gambar'), async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findByPk(req.params.id);
    
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    const {
      tipe_armada,
      nomor_armada,
      nomor_kendaraan,
      format_kursi,
      kapasitas_kursi,
      nama_kondektur,
      nomor_kondektur,
      fasilitas
    } = req.body;

    // Check if nomor_armada or nomor_kendaraan already exists (excluding current record)
    if (nomor_armada || nomor_kendaraan) {
      const existingKendaraan = await Kendaraan.findOne({
        where: {
          id_kendaraan: { [require('sequelize').Op.ne]: req.params.id },
          [require('sequelize').Op.or]: [
            ...(nomor_armada ? [{ nomor_armada }] : []),
            ...(nomor_kendaraan ? [{ nomor_kendaraan }] : [])
          ]
        }
      });

      if (existingKendaraan) {
        return res.status(400).json({
          success: false,
          message: 'Nomor armada atau nomor kendaraan sudah digunakan'
        });
      }
    }

    const updateData = {};
    if (tipe_armada) updateData.tipe_armada = tipe_armada;
    if (nomor_armada) updateData.nomor_armada = nomor_armada;
    if (nomor_kendaraan) updateData.nomor_kendaraan = nomor_kendaraan;
    if (format_kursi) updateData.format_kursi = format_kursi;
    if (kapasitas_kursi) updateData.kapasitas_kursi = parseInt(kapasitas_kursi);
    if (nama_kondektur) updateData.nama_kondektur = nama_kondektur;
    if (nomor_kondektur) updateData.nomor_kondektur = nomor_kondektur;
    if (fasilitas !== undefined) {
      updateData.fasilitas = Array.isArray(fasilitas) ? fasilitas : (fasilitas ? JSON.parse(fasilitas) : []);
    }

    // Handle image upload
    if (req.file) {
      // Delete old image if exists
      if (kendaraan.gambar) {
        const oldImagePath = path.join(__dirname, '../public/uploads/kendaraan', kendaraan.gambar);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      updateData.gambar = req.file.filename;
    }

    await kendaraan.update(updateData);
    
    res.json({
      success: true,
      message: 'Kendaraan berhasil diperbarui',
      data: kendaraan
    });
  } catch (error) {
    console.error('Error updating kendaraan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui kendaraan',
      error: error.message
    });
  }
});

// DELETE kendaraan
router.delete('/:id', async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findByPk(req.params.id);
    
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    // Delete image file if exists
    if (kendaraan.gambar) {
      const imagePath = path.join(__dirname, '../public/uploads/kendaraan', kendaraan.gambar);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await kendaraan.destroy();
    
    res.json({
      success: true,
      message: 'Kendaraan berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting kendaraan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus kendaraan',
      error: error.message
    });
  }
});

module.exports = router;