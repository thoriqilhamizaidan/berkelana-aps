// backend/controllers/transaksiController.js
const db = require('../models'); // Import models

const transaksiController = {
  // Create Head Transaksi
  createHeadTransaksi: async (req, res) => {
    try {
      const {
        id_user,
        nama_pemesan,
        no_hp_pemesan,
        email_pemesan,
        id_promo,
        potongan,
        total,
        status
      } = req.body;

      // Validasi input
      if (!nama_pemesan || !no_hp_pemesan || !email_pemesan) {
        return res.status(400).json({
          success: false,
          message: 'Nama pemesan, no HP, dan email wajib diisi'
        });
      }

      // Menggunakan nama model yang sesuai dengan definisi
      const headTransaksi = await db.tabel_headtransaksi.create({
        id_user: id_user || null,
        nama_pemesan,
        no_hp_pemesan,
        email_pemesan,
        id_promo: id_promo || null,
        potongan: potongan || 0,
        total: total || 0,
        status: status || 'pending'
      });

      res.status(201).json({
        success: true,
        message: 'Head transaksi berhasil dibuat',
        data: headTransaksi
      });
    } catch (error) {
      console.error('Error creating head transaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat head transaksi',
        error: error.message
      });
    }
  },

  // Update Head Transaksi
  updateHeadTransaksi: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const [updatedRows] = await db.tabel_headtransaksi.update(updateData, {
        where: { id_headtransaksi: id }
      });

      if (updatedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Head transaksi tidak ditemukan'
        });
      }

      const updatedHeadTransaksi = await db.tabel_headtransaksi.findByPk(id);

      res.json({
        success: true,
        message: 'Head transaksi berhasil diupdate',
        data: updatedHeadTransaksi
      });
    } catch (error) {
      console.error('Error updating head transaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupdate head transaksi',
        error: error.message
      });
    }
  },

  // Get Head Transaksi by ID
  getHeadTransaksiById: async (req, res) => {
    try {
      const { id } = req.params;

      const headTransaksi = await db.tabel_headtransaksi.findByPk(id, {
        include: [{
          model: db.tabel_detailtransaksi,
          as: 'DetailTransaksi'
        }]
      });

      if (!headTransaksi) {
        return res.status(404).json({
          success: false,
          message: 'Head transaksi tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: headTransaksi
      });
    } catch (error) {
      console.error('Error getting head transaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil head transaksi',
        error: error.message
      });
    }
  },

  // Create Detail Transaksi
  createDetailTransaksi: async (req, res) => {
    try {
      const {
        id_headtransaksi,
        id_jadwal,
        harga_kursi,
        gender,
        nama_penumpang,
        nomor_kursi
      } = req.body;

      // Validasi input
      if (!id_headtransaksi || !id_jadwal || !nama_penumpang) {
        return res.status(400).json({
          success: false,
          message: 'ID head transaksi, ID jadwal, dan nama penumpang wajib diisi'
        });
      }

      // Cek apakah head transaksi ada
      const headExists = await db.tabel_headtransaksi.findByPk(id_headtransaksi);
      if (!headExists) {
        return res.status(404).json({
          success: false,
          message: 'Head transaksi tidak ditemukan'
        });
      }

      const detailTransaksi = await db.tabel_detailtransaksi.create({
        id_headtransaksi,
        id_jadwal,
        harga_kursi: harga_kursi || 0,
        gender,
        nama_penumpang,
        nomor_kursi
      });

      res.status(201).json({
        success: true,
        message: 'Detail transaksi berhasil dibuat',
        data: detailTransaksi
      });
    } catch (error) {
      console.error('Error creating detail transaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat detail transaksi',
        error: error.message
      });
    }
  },

  // Get Detail Transaksi by Head ID
  getDetailTransaksiByHeadId: async (req, res) => {
    try {
      const { headId } = req.params;

      const detailTransaksi = await db.tabel_detailtransaksi.findAll({
        where: { id_headtransaksi: headId },
        include: [{
          model: db.Jadwal,
          as: 'Jadwal'
        }]
      });

      res.json({
        success: true,
        data: detailTransaksi
      });
    } catch (error) {
      console.error('Error getting detail transaksi:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil detail transaksi',
        error: error.message
      });
    }
  }
};

module.exports = transaksiController;