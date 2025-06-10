// routes/laporan.js
const express = require('express');
const router = express.Router();
const { tabel_headtransaksi, tabel_detailtransaksi, Jadwal, Kendaraan } = require('../models');
const { Op } = require('sequelize');

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
    
    // Check if Kendaraan model exists
    if (!Kendaraan) {
      throw new Error('Kendaraan model not found');
    }

    const tipeArmada = await Kendaraan.findAll({
      attributes: ['tipe_armada'],
      group: ['tipe_armada'],
      order: [['tipe_armada', 'ASC']],
      raw: true // Get plain objects
    });

    console.log('✅ Tipe armada found:', tipeArmada);

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
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /api/laporan/penjualan-tiket
router.get('/penjualan-tiket', async (req, res) => {
  try {
    console.log('📊 Fetching laporan penjualan data with params:', req.query);
    
    const { 
      tipe_armada, 
      tanggal, 
      bulan, 
      tahun,
      page = 1, 
      limit = 10 
    } = req.query;

    // Check if required models exist
    if (!tabel_headtransaksi || !tabel_detailtransaksi || !Jadwal || !Kendaraan) {
      throw new Error('Required models not found');
    }

    // Build where conditions
    let whereCondition = {
      status: {
        [Op.in]: ['paid', 'settlement'] // Hanya transaksi yang sudah lunas
      }
    };

    // Build include conditions for filtering
    let jadwalWhere = {};
    let kendaraanWhere = {};

    // Filter berdasarkan tanggal keberangkatan
    if (tanggal || bulan || tahun) {
      let dateConditions = {};
      
      if (tahun) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(
          require('sequelize').where(
            require('sequelize').fn('YEAR', require('sequelize').col('Jadwal.waktu_keberangkatan')), 
            parseInt(tahun)
          )
        );
      }
      
      if (bulan) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(
          require('sequelize').where(
            require('sequelize').fn('MONTH', require('sequelize').col('Jadwal.waktu_keberangkatan')), 
            parseInt(bulan)
          )
        );
      }
      
      if (tanggal) {
        dateConditions[Op.and] = dateConditions[Op.and] || [];
        dateConditions[Op.and].push(
          require('sequelize').where(
            require('sequelize').fn('DAY', require('sequelize').col('Jadwal.waktu_keberangkatan')), 
            parseInt(tanggal)
          )
        );
      }
      
      jadwalWhere = dateConditions;
    }

    // Filter berdasarkan tipe armada
    if (tipe_armada) {
      kendaraanWhere.tipe_armada = {
        [Op.iLike]: `%${tipe_armada}%`
      };
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Query conditions:', {
      whereCondition,
      jadwalWhere,
      kendaraanWhere,
      pagination: { page, limit, offset }
    });

    const result = await tabel_headtransaksi.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: tabel_detailtransaksi,
          as: 'DetailTransaksi',
          required: true, // Inner join
          include: [
            {
              model: Jadwal,
              as: 'Jadwal',
              required: true, // Inner join
              where: Object.keys(jadwalWhere).length > 0 ? jadwalWhere : undefined,
              include: [
                {
                  model: Kendaraan,
                  as: 'Kendaraan',
                  required: true, // Inner join
                  where: Object.keys(kendaraanWhere).length > 0 ? kendaraanWhere : undefined
                }
              ]
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset,
      distinct: true,
      subQuery: false
    });

    console.log('✅ Query result count:', result.count);

    // Transform data
    const transformedData = result.rows.map(transaksi => {
      // Ambil detail transaksi pertama untuk mendapatkan info jadwal
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

    // Calculate statistics
    const totalTransaksi = result.count;
    const totalPenumpang = result.rows.reduce((sum, transaksi) => 
      sum + (transaksi.DetailTransaksi?.length || 0), 0
    );
    const totalPendapatan = result.rows.reduce((sum, transaksi) => 
      sum + (transaksi.total || 0), 0
    );

    const response = {
      success: true,
      data: transformedData,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalTransaksi / parseInt(limit)),
        totalItems: totalTransaksi,
        itemsPerPage: parseInt(limit)
      },
      statistics: {
        totalTransaksi,
        totalPenumpang,
        totalPendapatan
      }
    };

    console.log('✅ Sending response with', transformedData.length, 'items');
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching laporan penjualan:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data laporan penjualan',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;