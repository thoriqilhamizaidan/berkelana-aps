const { Kendaraan } = require('../models');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Mengambil semua kendaraan
const getAllKendaraan = async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findAll({
      order: [['createdAt', 'DESC']]  // Ubah ke createdAt (camelCase)
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
};

// Mengambil kendaraan berdasarkan ID
const getKendaraanById = async (req, res) => {
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
    console.error('Error fetching kendaraan by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kendaraan',
      error: error.message
    });
  }
};

// Mengambil kendaraan berdasarkan tipe armada
const getKendaraanByTipe = async (req, res) => {
  try {
    const { tipe } = req.params;
    
    const kendaraan = await Kendaraan.findAll({
      where: {
        tipe_armada: tipe
      },
      attributes: ['id_kendaraan', 'tipe_armada', 'nomor_armada', 'nomor_kendaraan', 'kapasitas_kursi'],
      order: [['nomor_armada', 'ASC']]
    });

    res.json({
      success: true,
      data: kendaraan
    });
  } catch (error) {
    console.error('Error fetching kendaraan by type:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kendaraan berdasarkan tipe',
      error: error.message
    });
  }
};

// Menambahkan kendaraan baru
const createKendaraan = async (req, res) => {
  try {
    const { tipe_armada, nomor_armada, nomor_kendaraan, format_kursi, kapasitas_kursi, nama_kondektur, nomor_kondektur, fasilitas } = req.body;

    if (!tipe_armada || !nomor_armada || !nomor_kendaraan || !format_kursi || !kapasitas_kursi || !nama_kondektur || !nomor_kondektur) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Cek apakah nomor armada atau nomor kendaraan sudah ada
    const existingKendaraan = await Kendaraan.findOne({
      where: {
        [Op.or]: [
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
};

// Memperbarui kendaraan
const updateKendaraan = async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findByPk(req.params.id);
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    const { tipe_armada, nomor_armada, nomor_kendaraan, format_kursi, kapasitas_kursi, nama_kondektur, nomor_kondektur, fasilitas } = req.body;

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

    if (req.file) {
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
};

// Menghapus kendaraan
const deleteKendaraan = async (req, res) => {
  try {
    const kendaraan = await Kendaraan.findByPk(req.params.id);
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

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
};

module.exports = {
  getAllKendaraan,
  getKendaraanById,
  getKendaraanByTipe,
  createKendaraan,
  updateKendaraan,
  deleteKendaraan
};