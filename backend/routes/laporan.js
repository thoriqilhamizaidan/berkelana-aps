// routes/laporan.js
const express = require('express');
const router = express.Router();
const { tabel_headtransaksi, tabel_detailtransaksi, Jadwal, Kendaraan } = require('../models');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs'); // Tambah ExcelJS

// Test route untuk memastikan route berfungsi
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Laporan routes working',
    timestamp: new Date().toISOString()
  });
});

// GET /api/laporan/tipe-armada - untuk dropdown filter
router.get('/tipe-armada', async (req, res) => {
  try {
    console.log('🚗 Fetching tipe armada data...');

    if (!Kendaraan) throw new Error('Kendaraan model not found');

    const tipeArmada = await Kendaraan.findAll({
      attributes: ['tipe_armada'],
      group: ['tipe_armada'],
      order: [['tipe_armada', 'ASC']],
      raw: true
    });

    const result = tipeArmada.map(item => item.tipe_armada).filter(Boolean);

    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('❌ Error fetching tipe armada:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data tipe armada',
      error: error.message
    });
  }
});

// GET /api/laporan/penjualan-tiket
router.get('/penjualan-tiket', async (req, res) => {
  try {
    console.log('📊 Fetching laporan penjualan data with params:', req.query);

    const { tipe_armada, tanggal, bulan, tahun, page = 1, limit = 10 } = req.query;

    if (!tabel_headtransaksi || !tabel_detailtransaksi || !Jadwal || !Kendaraan) {
      throw new Error('Required models not found');
    }

    let whereCondition = { status: { [Op.in]: ['paid', 'settlement'] } };
    let jadwalWhere = {};
    let kendaraanWhere = {};

    if (tanggal || bulan || tahun) {
      let dateConditions = {};
      if (tahun) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(require('sequelize').where(
          require('sequelize').fn('YEAR', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(tahun)
        ));
      }
      if (bulan) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(require('sequelize').where(
          require('sequelize').fn('MONTH', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(bulan)
        ));
      }
      if (tanggal) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(require('sequelize').where(
          require('sequelize').fn('DAY', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(tanggal)
        ));
      }
      jadwalWhere = dateConditions;
    }

    if (tipe_armada) {
      kendaraanWhere.tipe_armada = { [Op.iLike]: `%${tipe_armada}%` };
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await tabel_headtransaksi.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: tabel_detailtransaksi,
          as: 'DetailTransaksi',
          required: true,
          include: [
            {
              model: Jadwal,
              as: 'Jadwal',
              required: true,
              where: Object.keys(jadwalWhere).length > 0 ? jadwalWhere : undefined,
              include: [
                {
                  model: Kendaraan,
                  as: 'Kendaraan',
                  required: true,
                  where: Object.keys(kendaraanWhere).length > 0 ? kendaraanWhere : undefined
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset,
      distinct: true,
      subQuery: false
    });

    const transformedData = result.rows.map(transaksi => {
      const detailTransaksi = transaksi.DetailTransaksi?.[0];
      const jadwal = detailTransaksi?.Jadwal;
      const kendaraan = jadwal?.Kendaraan;

      return {
        id_headtransaksi: transaksi.id_headtransaksi,
        booking_code: transaksi.booking_code || `BKL${transaksi.id_headtransaksi}`,
        nama_pemesan: transaksi.nama_pemesan,
        email_pemesan: transaksi.email_pemesan,
        waktu_keberangkatan: jadwal?.waktu_keberangkatan,
        rute: jadwal ? `${jadwal.kota_awal} - ${jadwal.kota_tujuan}` : 'N/A',
        tipe_armada: kendaraan?.tipe_armada || 'N/A',
        total_penumpang: transaksi.DetailTransaksi?.length || 0,
        total: transaksi.total || 0,
        status: transaksi.status,
        createdAt: transaksi.createdAt
      };
    });

    const fullData = await tabel_headtransaksi.findAll({
      where: whereCondition,
      include: [
        {
          model: tabel_detailtransaksi,
          as: 'DetailTransaksi',
          required: true,
          include: [
            {
              model: Jadwal,
              as: 'Jadwal',
              required: true,
              where: Object.keys(jadwalWhere).length > 0 ? jadwalWhere : undefined,
              include: [
                {
                  model: Kendaraan,
                  as: 'Kendaraan',
                  required: true,
                  where: Object.keys(kendaraanWhere).length > 0 ? kendaraanWhere : undefined
                }
              ]
            }
          ]
        }
      ],
      distinct: true,
      subQuery: false
    });

    const totalPenumpangAll = fullData.reduce((sum, transaksi) => sum + (transaksi.DetailTransaksi?.length || 0), 0);
    const totalPendapatanAll = fullData.reduce((sum, transaksi) => sum + (transaksi.total || 0), 0);

    res.json({
      success: true,
      data: transformedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(result.count / parseInt(limit)),
        totalItems: result.count,
        itemsPerPage: parseInt(limit)
      },
      statistics: {
        totalTransaksi: result.count,
        totalPenumpang: totalPenumpangAll,
        totalPendapatan: totalPendapatanAll
      }
    });
  } catch (error) {
    console.error('❌ Error fetching laporan penjualan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan penjualan',
      error: error.message
    });
  }
});

// GET /api/laporan/penjualan-tiket/excel - Ekspor ke Excel
router.get('/penjualan-tiket/excel', async (req, res) => {
  try {
    console.log('📦 Exporting laporan penjualan ke Excel...');
    const { tipe_armada, tanggal, bulan, tahun } = req.query;

    let whereCondition = { status: { [Op.in]: ['paid', 'settlement'] } };
    let jadwalWhere = {};
    let kendaraanWhere = {};

    if (tahun) {
      jadwalWhere[Op.and] = jadwalWhere[Op.and] || [];
      jadwalWhere[Op.and].push(require('sequelize').where(
        require('sequelize').fn('YEAR', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(tahun)
      ));
    }
    if (bulan) {
      jadwalWhere[Op.and] = jadwalWhere[Op.and] || [];
      jadwalWhere[Op.and].push(require('sequelize').where(
        require('sequelize').fn('MONTH', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(bulan)
      ));
    }
    if (tanggal) {
      jadwalWhere[Op.and] = jadwalWhere[Op.and] || [];
      jadwalWhere[Op.and].push(require('sequelize').where(
        require('sequelize').fn('DAY', require('sequelize').col('Jadwal.waktu_keberangkatan')), parseInt(tanggal)
      ));
    }
    if (tipe_armada) {
      kendaraanWhere.tipe_armada = { [Op.iLike]: `%${tipe_armada}%` };
    }

    const data = await tabel_headtransaksi.findAll({
      where: whereCondition,
      include: [
        {
          model: tabel_detailtransaksi,
          as: 'DetailTransaksi',
          required: true,
          include: [
            {
              model: Jadwal,
              as: 'Jadwal',
              required: true,
              where: Object.keys(jadwalWhere).length > 0 ? jadwalWhere : undefined,
              include: [
                {
                  model: Kendaraan,
                  as: 'Kendaraan',
                  required: true,
                  where: Object.keys(kendaraanWhere).length > 0 ? kendaraanWhere : undefined
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true,
      subQuery: false
    });

    const laporan = data.map(transaksi => {
      const detail = transaksi.DetailTransaksi?.[0];
      const jadwal = detail?.Jadwal;
      const kendaraan = jadwal?.Kendaraan;

      return {
        BookingCode: transaksi.booking_code || `BKL${transaksi.id_headtransaksi}`,
        NamaPemesan: transaksi.nama_pemesan,
        EmailPemesan: transaksi.email_pemesan,
        WaktuKeberangkatan: jadwal?.waktu_keberangkatan || '',
        Rute: jadwal ? `${jadwal.kota_awal} - ${jadwal.kota_tujuan}` : '',
        TipeArmada: kendaraan?.tipe_armada || '',
        TotalPenumpang: transaksi.DetailTransaksi?.length || 0,
        Total: transaksi.total || 0,
        Status: transaksi.status,
        TanggalPesan: transaksi.createdAt
      };
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');

    worksheet.columns = [
      { header: 'Booking Code', key: 'BookingCode', width: 20 },
      { header: 'Nama Pemesan', key: 'NamaPemesan', width: 25 },
      { header: 'Email Pemesan', key: 'EmailPemesan', width: 25 },
      { header: 'Waktu Keberangkatan', key: 'WaktuKeberangkatan', width: 25 },
      { header: 'Rute', key: 'Rute', width: 25 },
      { header: 'Tipe Armada', key: 'TipeArmada', width: 15 },
      { header: 'Total Penumpang', key: 'TotalPenumpang', width: 15 },
      { header: 'Total', key: 'Total', width: 15 },
      { header: 'Status', key: 'Status', width: 15 },
      { header: 'Tanggal Pesan', key: 'TanggalPesan', width: 25 }
    ];

    laporan.forEach(item => worksheet.addRow(item));
    worksheet.getRow(1).font = { bold: true };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('❌ Error export Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal ekspor data ke Excel',
      error: error.message
    });
  }
});

module.exports = router;
