// backend/controllers/jadwalController.js
const { Jadwal, Kendaraan } = require('../models');
const { Op } = require('sequelize');

// Get all jadwal
const getAllJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.findAll({
      include: [{
        model: Kendaraan,
        as: 'Kendaraan', // ✅ TAMBAHKAN ALIAS
        attributes: [
          'id_kendaraan', 
          'tipe_armada', 
          'nomor_armada', 
          'nomor_kendaraan', 
          'format_kursi', 
          'kapasitas_kursi', 
          'fasilitas',
          'nama_kondektur',
          'nomor_kondektur'
        ]
      }],
      order: [['waktu_keberangkatan', 'ASC']]
    });

    res.status(200).json({
      success: true,
      message: 'Data jadwal berhasil diambil',
      data: jadwal
    });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal',
      error: error.message
    });
  }
};

// Get jadwal by ID
const getJadwalById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jadwal = await Jadwal.findByPk(id, {
      include: [{
        model: Kendaraan,
        as: 'Kendaraan', // ✅ TAMBAHKAN ALIAS
        attributes: [
          'id_kendaraan', 
          'tipe_armada', 
          'nomor_armada', 
          'nomor_kendaraan', 
          'format_kursi', 
          'kapasitas_kursi', 
          'fasilitas',
          'nama_kondektur',
          'nomor_kondektur'
        ]
      }]
    });
    
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Data jadwal berhasil diambil',
      data: jadwal
    });
  } catch (error) {
    console.error('Error fetching jadwal by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal',
      error: error.message
    });
  }
};

// Create new jadwal
const createJadwal = async (req, res) => {
  try {
    const {
      id_kendaraan,
      kota_awal,
      kota_tujuan,
      waktu_keberangkatan,
      waktu_sampai,
      durasi,
      harga,
      id_promo
    } = req.body;

    // Validate required fields
    if (!id_kendaraan || !kota_awal || !kota_tujuan || !waktu_keberangkatan || !waktu_sampai || !durasi || !harga) {
      return res.status(400).json({
        success: false,
        message: 'Semua field wajib harus diisi'
      });
    }

    // Validate kendaraan exists
    const kendaraan = await Kendaraan.findByPk(id_kendaraan);
    if (!kendaraan) {
      return res.status(404).json({
        success: false,
        message: 'Kendaraan tidak ditemukan'
      });
    }

    const jadwal = await Jadwal.create({
      id_kendaraan,
      kota_awal,
      kota_tujuan,
      waktu_keberangkatan: new Date(waktu_keberangkatan),
      waktu_sampai: new Date(waktu_sampai),
      durasi,
      harga,
      id_promo: id_promo || null
    });

    // Fetch dengan relasi yang lengkap
    const newJadwal = await Jadwal.findByPk(jadwal.id_jadwal, {
      include: [{
        model: Kendaraan,
        as: 'Kendaraan', // ✅ TAMBAHKAN ALIAS
        attributes: [
          'id_kendaraan', 
          'tipe_armada', 
          'nomor_armada', 
          'nomor_kendaraan', 
          'format_kursi', 
          'kapasitas_kursi', 
          'fasilitas',
          'nama_kondektur',
          'nomor_kondektur'
        ]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Jadwal berhasil ditambahkan',
      data: newJadwal
    });
  } catch (error) {
    console.error('Error creating jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal',
      error: error.message
    });
  }
};

// Update jadwal
const updateJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      id_kendaraan,
      kota_awal,
      kota_tujuan,
      waktu_keberangkatan,
      waktu_sampai,
      durasi,
      harga,
      id_promo
    } = req.body;

    const jadwal = await Jadwal.findByPk(id);
    
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    // Validate kendaraan exists if changing
    if (id_kendaraan && id_kendaraan !== jadwal.id_kendaraan) {
      const kendaraan = await Kendaraan.findByPk(id_kendaraan);
      if (!kendaraan) {
        return res.status(404).json({
          success: false,
          message: 'Kendaraan tidak ditemukan'
        });
      }
    }

    // Build update object
    const updateData = {};
    if (id_kendaraan !== undefined) updateData.id_kendaraan = id_kendaraan;
    if (kota_awal !== undefined) updateData.kota_awal = kota_awal;
    if (kota_tujuan !== undefined) updateData.kota_tujuan = kota_tujuan;
    if (waktu_keberangkatan !== undefined) updateData.waktu_keberangkatan = new Date(waktu_keberangkatan);
    if (waktu_sampai !== undefined) updateData.waktu_sampai = new Date(waktu_sampai);
    if (durasi !== undefined) updateData.durasi = durasi;
    if (harga !== undefined) updateData.harga = harga;
    if (id_promo !== undefined) updateData.id_promo = id_promo;

    await jadwal.update(updateData);

    // Fetch updated dengan relasi yang lengkap
    const updatedJadwal = await Jadwal.findByPk(id, {
      include: [{
        model: Kendaraan,
        as: 'Kendaraan', // ✅ TAMBAHKAN ALIAS
        attributes: [
          'id_kendaraan', 
          'tipe_armada', 
          'nomor_armada', 
          'nomor_kendaraan', 
          'format_kursi', 
          'kapasitas_kursi', 
          'fasilitas',
          'nama_kondektur',
          'nomor_kondektur'
        ]
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Jadwal berhasil diperbarui',
      data: updatedJadwal
    });
  } catch (error) {
    console.error('Error updating jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal memperbarui jadwal',
      error: error.message
    });
  }
};

// Delete jadwal
const deleteJadwal = async (req, res) => {
  try {
    const { id } = req.params;
    
    const jadwal = await Jadwal.findByPk(id);
    
    if (!jadwal) {
      return res.status(404).json({
        success: false,
        message: 'Jadwal tidak ditemukan'
      });
    }

    await jadwal.destroy();

    res.status(200).json({
      success: true,
      message: 'Jadwal berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus jadwal',
      error: error.message
    });
  }
};

// Get jadwal by filters
const getJadwalByFilter = async (req, res) => {
  try {
    const { kota_awal, kota_tujuan, tanggal, tipe_armada } = req.query;
    console.log('Filter params:', { kota_awal, kota_tujuan, tanggal, tipe_armada });
    
    const where = {};

    // Filter kota
    if (kota_awal) {
      where.kota_awal = kota_awal;
    }
    if (kota_tujuan) {
      where.kota_tujuan = kota_tujuan;
    }
    
    // Filter tanggal
    if (tanggal) {
      const startDate = new Date(tanggal);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(tanggal);
      endDate.setHours(23, 59, 59, 999);
      where.waktu_keberangkatan = { [Op.between]: [startDate, endDate] };
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      where.waktu_keberangkatan = { [Op.gte]: today };
    }

    // Include kendaraan dengan filter tipe_armada jika ada
    const include = [{
      model: Kendaraan,
      as: 'Kendaraan', // ✅ TAMBAHKAN ALIAS
      attributes: ['id_kendaraan', 'tipe_armada', 'nomor_armada', 'nomor_kendaraan', 'format_kursi', 'kapasitas_kursi', 'fasilitas'],
      where: tipe_armada ? { tipe_armada } : {},
      required: true
    }];

    const jadwal = await Jadwal.findAll({
      where,
      include,
      order: [['waktu_keberangkatan', 'ASC']]
    });

    console.log(`Found ${jadwal.length} jadwal`);

    res.status(200).json({
      success: true,
      message: 'Data jadwal berhasil diambil',
      data: jadwal
    });
  } catch (error) {
    console.error('Error fetching filtered jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal',
      error: error.message
    });
  }
};

module.exports = {
  getAllJadwal,
  getJadwalById,
  createJadwal,
  updateJadwal,
  deleteJadwal,
  getJadwalByFilter
};