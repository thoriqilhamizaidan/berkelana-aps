// backend/routes/transaksiRoutes.js - COMPLETE VERSION WITH REFRESH FIX
const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const db = require('../models');

// Head Transaksi Routes
router.post('/headtransaksi', transaksiController.createHeadTransaksi);
router.put('/headtransaksi/:id', transaksiController.updateHeadTransaksi);
router.get('/headtransaksi/:id', transaksiController.getHeadTransaksiById);
router.put('/headtransaksi/:id/promo', transaksiController.updateHeadTransaksiWithPromo);

// Detail Transaksi Routes
router.post('/detailtransaksi', transaksiController.createDetailTransaksi);
router.post('/detailtransaksi/multiple', transaksiController.createMultipleDetailTransaksi);
router.get('/detail-transaksi/jadwal/:jadwalId/seats', transaksiController.getBookedSeatsByJadwal);

// XENDIT: Fixed payment routes with correct paths
try {
  const xenditController = require('../controllers/xenditController');
  
  // ✅ FIXED: Tambah /payment prefix
  router.post('/payment/xendit/create-payment/:id_headtransaksi', xenditController.createXenditPayment);
  router.post('/payment/xendit/webhook', xenditController.handleXenditWebhook); // ✅ FIXED PATH
  router.get('/payment/xendit/status/:invoice_id', xenditController.checkXenditPaymentStatus);
  router.get('/payment/xendit/check-direct/:invoice_id', xenditController.checkDirectXenditStatus);
  
  console.log('✅ XENDIT routes loaded successfully');
} catch (error) {
  console.log('❌ XENDIT routes failed to load:', error.message);
}

// MIDTRANS: Keep as backup
router.post('/payment/midtrans/create-token/:id_headtransaksi', transaksiController.createPaymentToken);
router.post('/payment/midtrans/notification', transaksiController.handleMidtransNotification);
router.get('/payment/midtrans/status/:order_id', transaksiController.checkPaymentStatus);

// DOKU: Keep as backup  
try {
  const dokuController = require('../controllers/dokuController');
  
  router.post('/payment/doku/create-payment/:id_headtransaksi', dokuController.createDokuPayment);
  router.post('/payment/doku/callback', dokuController.handleDokuCallback);
  router.get('/payment/doku/status/:order_id', dokuController.checkDokuPaymentStatus);
  
  console.log('✅ DOKU routes loaded as backup');
} catch (error) {
  console.log('❌ DOKU routes failed to load:', error.message);
}

// MAIN: Universal payment endpoint - NOW DEFAULTS TO XENDIT
router.post('/payment/create-token/:id_headtransaksi', (req, res, next) => {
  const gateway = process.env.PAYMENT_GATEWAY || 'xendit';
  
  console.log('🎯 Payment Gateway:', gateway);
  
  if (gateway === 'xendit') {
    try {
      const xenditController = require('../controllers/xenditController');
      return xenditController.createXenditPayment(req, res, next);
    } catch (error) {
      console.error('Xendit fallback to Midtrans:', error.message);
      return transaksiController.createPaymentToken(req, res, next);
    }
  } else if (gateway === 'doku') {
    try {
      const dokuController = require('../controllers/dokuController');
      return dokuController.createDokuPayment(req, res, next);
    } catch (error) {
      console.error('DOKU fallback to Midtrans:', error.message);
      return transaksiController.createPaymentToken(req, res, next);
    }
  } else {
    // Default to Midtrans
    return transaksiController.createPaymentToken(req, res, next);
  }
});

// 🔧 MAIN: Universal status check - FIXED TO HANDLE PARAMETER MAPPING
router.get('/payment/status/:order_id', (req, res, next) => {
  const gateway = process.env.PAYMENT_GATEWAY || 'xendit';
  
  // 🔍 DEBUG: Log parameters
  console.log('🔍 Payment status check params:', {
    order_id: req.params.order_id,
    gateway: gateway
  });
  
  if (gateway === 'xendit') {
    try {
      const xenditController = require('../controllers/xenditController');
      // 🎯 CRITICAL FIX: Map order_id to invoice_id for Xendit controller
      req.params.invoice_id = req.params.order_id;
      return xenditController.checkXenditPaymentStatus(req, res, next);
    } catch (error) {
      console.error('Xendit controller error, fallback to transaksi:', error.message);
      return transaksiController.checkPaymentStatus(req, res, next);
    }
  } else if (gateway === 'doku') {
    try {
      const dokuController = require('../controllers/dokuController');
      return dokuController.checkDokuPaymentStatus(req, res, next);
    } catch (error) {
      console.error('DOKU controller error, fallback to transaksi:', error.message);
      return transaksiController.checkPaymentStatus(req, res, next);
    }
  } else {
    return transaksiController.checkPaymentStatus(req, res, next);
  }
});

// ✅ NEW: Get payments by head transaksi (existing endpoint - keep this)
router.get('/payment/headtransaksi/:id_headtransaksi', async (req, res) => {
  try {
    const { id_headtransaksi } = req.params;
    
    console.log('🔍 Getting payments for head transaksi:', id_headtransaksi);
    
    const payments = await db.tabel_payments.findAll({
      where: { 
        id_headtransaksi: id_headtransaksi 
      },
      order: [['createdAt', 'DESC']],
      include: [{
        model: db.tabel_headtransaksi,
        as: 'HeadTransaksi',
        attributes: ['booking_code', 'nama_pemesan', 'status']
      }]
    });
    
    console.log('✅ Found payments:', payments.length);
    
    res.json({
      success: true,
      data: payments
    });
    
  } catch (error) {
    console.error('❌ Error getting payments by head transaksi:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting payments',
      error: error.message
    });
  }
});

// ⭐ NEW ENDPOINTS FOR REFRESH FIX - ADD THESE:

// ✅ GANTI query di router.get('/payments/status-by-head/:id') dengan ini:

router.get('/payments/status-by-head/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🔍 Checking payment status for head_transaksi:', id);
    
    // ✅ FIX: Ganti 'promos' dengan 'tabel_promo'
    const query = `
      SELECT 
        h.id_headtransaksi,
        h.status as head_status,
        h.payment_status as head_payment_status,
        h.booking_code,
        h.total as gross_amount,
        h.id_promo,
        h.potongan as promo_discount,
        pr.kode_promo as promo_code,
        pr.judul as promo_name,
        p.order_id as invoice_id,
        p.transaction_status,
        p.gross_amount as payment_amount,
        p.expiry_time as expires_at,
        COALESCE(p.transaction_status, h.payment_status, h.status) as final_status
      FROM tabel_headtransaksi h
      LEFT JOIN tabel_payments p ON h.id_headtransaksi = p.id_headtransaksi
      LEFT JOIN tabel_promo pr ON h.id_promo = pr.id_promo
      WHERE h.id_headtransaksi = ?
      ORDER BY p.createdAt DESC
      LIMIT 1
    `;
    
    const results = await db.sequelize.query(query, {
      replacements: [id],
      type: db.Sequelize.QueryTypes.SELECT
    });
    
    // ✅ FIX: Handle empty results properly
    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const result = results[0]; // Get first result
    const transaction_status = result.transaction_status || result.head_payment_status || result.head_status;
    
    res.json({
      success: true,
      data: {
        id_headtransaksi: result.id_headtransaksi,
        transaction_status,
        booking_status: result.head_status,
        head_status: result.head_status,
        head_payment_status: result.head_payment_status,
        booking_code: result.booking_code,
        gross_amount: result.gross_amount || result.payment_amount,
        invoice_id: result.invoice_id,
        expires_at: result.expires_at,
        // ✅ FIX: Include promo info for frontend restoration
        promo_code: result.promo_code,
        promo_discount: result.promo_discount,
        promo_name: result.promo_name,
        debug_statuses: {
          head_status: result.head_status,
          head_payment_status: result.head_payment_status,
          payment_transaction_status: result.transaction_status,
          final_status: transaction_status
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error getting combined payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// ✅ NEW: Get existing payment by head_transaksi_id
router.get('/payments/by-head-transaksi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const payment = await db.tabel_payments.findOne({
      where: { id_headtransaksi: id },
      order: [['createdAt', 'DESC']]
    });
    
    if (!payment) {
      return res.json({
        success: false,
        message: 'No existing payment found'
      });
    }
    
    res.json({
      success: true,
      data: payment
    });
    
  } catch (error) {
    console.error('Error getting existing payment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ✅ NEW: Update head_transaksi status
router.put('/transaksi/update-status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body;
    
    await db.tabel_headtransaksi.update(
      {
        status: status,
        payment_status: payment_status || status,
        updatedAt: new Date()
      },
      {
        where: { id_headtransaksi: id }
      }
    );
    
    res.json({
      success: true,
      message: 'Head transaksi status updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating head transaksi status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ✅ ENHANCED: Webhook with auto-sync both tables
router.post('/webhook/xendit', async (req, res) => {
  try {
    const payload = req.body;
    const { external_id, status, paid_amount } = payload;
    
    console.log('🔔 Webhook received:', { external_id, status, paid_amount });
    
    // Step 1: Update payment table
    await db.tabel_payments.update(
      {
        transaction_status: status.toLowerCase(),
        paid_amount: paid_amount,
        settlement_time: ['PAID', 'SETTLED'].includes(status) ? new Date() : null,
        raw_response: JSON.stringify(payload),
        updatedAt: new Date()
      },
      {
        where: { order_id: external_id }
      }
    );
    
    // Step 2: Get head_transaksi_id from payment
    const payment = await db.tabel_payments.findOne({
      where: { order_id: external_id },
      attributes: ['id_headtransaksi']
    });
    
    if (payment) {
      const headTransaksiId = payment.id_headtransaksi;
      
      // Step 3: Auto-sync head_transaksi status
      if (['PAID', 'SETTLED'].includes(status)) {
        await db.tabel_headtransaksi.update(
          {
            status: 'paid',
            payment_status: 'paid',
            invoice_id: external_id,
            updatedAt: new Date()
          },
          {
            where: { id_headtransaksi: headTransaksiId }
          }
        );
        
        console.log('✅ WEBHOOK: Both payment and head_transaksi synced for:', external_id);
      } else if (['EXPIRED', 'FAILED'].includes(status)) {
        const newStatus = status === 'EXPIRED' ? 'expired' : 'failed';
        
        await db.tabel_headtransaksi.update(
          {
            status: newStatus,
            payment_status: newStatus,
            updatedAt: new Date()
          },
          {
            where: { id_headtransaksi: headTransaksiId }
          }
        );
        
        console.log('✅ WEBHOOK: Status updated to', newStatus, 'for:', external_id);
      }
    }
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// ✅ DEBUG: Manual sync endpoint for troubleshooting
router.post('/payments/sync-status/:headTransaksiId', async (req, res) => {
  try {
    const { headTransaksiId } = req.params;
    
    // Get latest payment
    const payment = await db.tabel_payments.findOne({
      where: { id_headtransaksi: headTransaksiId },
      order: [['createdAt', 'DESC']]
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'No payment found'
      });
    }
    
    // Update head_transaksi with payment status
    await db.tabel_headtransaksi.update(
      {
        payment_status: payment.transaction_status,
        invoice_id: payment.order_id,
        last_payment_id: payment.id_payment,
        status: ['paid', 'settlement', 'capture'].includes(payment.transaction_status) ? 'paid' :
                ['expired'].includes(payment.transaction_status) ? 'expired' :
                ['failed'].includes(payment.transaction_status) ? 'failed' :
                'pending',
        updatedAt: new Date()
      },
      {
        where: { id_headtransaksi: headTransaksiId }
      }
    );
    
    res.json({
      success: true,
      message: 'Status synced successfully',
      data: {
        payment_status: payment.transaction_status,
        invoice_id: payment.order_id
      }
    });
    
  } catch (error) {
    console.error('Error syncing status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// ✅ TAMBAHKAN: Update existing payment amount (di transaksiRoutes.js)
router.put('/payments/update-amount/:headTransaksiId', async (req, res) => {
  try {
    const { headTransaksiId } = req.params;
    const { new_amount } = req.body;
    
    console.log('💰 Updating payment amount:', { headTransaksiId, new_amount });
    
    // Update payment amount di database
    const updateResult = await db.tabel_payments.update(
      {
        amount: new_amount,
        gross_amount: new_amount,
        updatedAt: new Date()
      },
      {
        where: { id_headtransaksi: headTransaksiId },
        order: [['createdAt', 'DESC']],
        limit: 1
      }
    );
    
    console.log('✅ Payment amount updated');
    
    res.json({
      success: true,
      message: 'Payment amount updated successfully',
      data: { new_amount }
    });
    
  } catch (error) {
    console.error('❌ Error updating payment amount:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment amount'
    });
  }
});

// ================================
// TAMBAH INI KE backend/routes/transaksiRoutes.js
// Letakkan di bagian paling bawah sebelum module.exports = router;
// ================================

// GANTI router.get('/transaksi/user/:id_user') DENGAN KODE INI:

router.get('/transaksi/user/:id_user', async (req, res) => {
  try {
    const { id_user } = req.params;
    
    console.log('🔍 Getting transaksi for user:', id_user);
    
    // ✅ ENHANCED: Better user validation and debugging
    const user = await db.User.findOne({
      where: { id_user: id_user },
      attributes: ['email_user']
    });
    
    if (!user) {
      console.log('❌ User not found in database for ID:', id_user);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    console.log('📧 User email:', user.email_user);
    
    // ✅ SINGLE CLEAN QUERY: Fix untuk hanya user yang bersangkutan
    const query = `
      SELECT 
        ht.id_headtransaksi,
        ht.booking_code,
        ht.nama_pemesan,
        ht.email_pemesan,
        ht.no_hp_pemesan,
        ht.total,
        ht.potongan,
        ht.status,
        ht.payment_status,
        ht.payment_method,
        ht.paid_at,
        ht.createdAt,
        ht.updatedAt,
        ht.id_user as head_id_user,
        
        -- Jadwal & Kendaraan Info (ambil dari detail transaksi pertama)
        (SELECT j.kota_awal FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as kota_awal,
        (SELECT j.kota_tujuan FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as kota_tujuan,
        (SELECT j.waktu_keberangkatan FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as waktu_keberangkatan,
        (SELECT j.waktu_sampai FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as waktu_sampai,
        (SELECT j.harga FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as harga_tiket,
        (SELECT k.tipe_armada FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as tipe_armada,
        (SELECT k.nomor_armada FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as nomor_armada,
        (SELECT k.nomor_kendaraan FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as nomor_kendaraan,
        (SELECT k.nama_kondektur FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as nama_kondektur,
        (SELECT k.nomor_kondektur FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as nomor_kondektur,
        (SELECT k.gambar FROM tabel_detailtransaksi dt 
         LEFT JOIN tabel_jadwal j ON dt.id_jadwal = j.id_jadwal 
         LEFT JOIN tabel_kendaraan k ON j.id_kendaraan = k.id_kendaraan
         WHERE dt.id_headtransaksi = ht.id_headtransaksi AND dt.deletedAt IS NULL LIMIT 1) as bus_image,
        
        -- Payment Info (ambil payment terbaru)
        (SELECT p.order_id FROM tabel_payments p 
         WHERE p.id_headtransaksi = ht.id_headtransaksi AND p.deletedAt IS NULL 
         ORDER BY p.createdAt DESC LIMIT 1) as invoice_id,
        (SELECT p.transaction_status FROM tabel_payments p 
         WHERE p.id_headtransaksi = ht.id_headtransaksi AND p.deletedAt IS NULL 
         ORDER BY p.createdAt DESC LIMIT 1) as payment_transaction_status,
        (SELECT p.snap_redirect_url FROM tabel_payments p 
         WHERE p.id_headtransaksi = ht.id_headtransaksi AND p.deletedAt IS NULL 
         ORDER BY p.createdAt DESC LIMIT 1) as payment_url,
        (SELECT p.expiry_time FROM tabel_payments p 
         WHERE p.id_headtransaksi = ht.id_headtransaksi AND p.deletedAt IS NULL 
         ORDER BY p.createdAt DESC LIMIT 1) as expiry_time,
        
        -- Promo Info
        pr.kode_promo,
        pr.judul as promo_name,
        
        -- Count penumpang
        (SELECT COUNT(*) FROM tabel_detailtransaksi dt2 
         WHERE dt2.id_headtransaksi = ht.id_headtransaksi AND dt2.deletedAt IS NULL) as jumlah_penumpang
        
      FROM tabel_headtransaksi ht
      LEFT JOIN tabel_promo pr ON ht.id_promo = pr.id_promo
      
      WHERE ht.id_user = ? 
      AND ht.deletedAt IS NULL
      ORDER BY ht.createdAt DESC
    `;
    
    console.log('🔍 Executing query for user_id:', id_user);
    
    const transaksi = await db.sequelize.query(query, {
      replacements: [id_user], // ✅ HANYA user_id untuk mencegah data user lain muncul
      type: db.Sequelize.QueryTypes.SELECT
    });
    
    console.log('✅ Found transaksi:', transaksi.length);
    console.log('🔍 First record debug:', transaksi[0] ? {
      id_headtransaksi: transaksi[0].id_headtransaksi,
      head_id_user: transaksi[0].head_id_user,
      nama_pemesan: transaksi[0].nama_pemesan,
      email_pemesan: transaksi[0].email_pemesan
    } : 'No records');
    
    res.json({
      success: true,
      data: transaksi,
      count: transaksi.length
    });
    
  } catch (error) {
    console.error('❌ Error getting user transaksi:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user transactions',
      error: error.message
    });
  }
});

// ✅ ADD: Delete transaction & cleanup routes - TAMBAH SEBELUM module.exports
router.delete('/transaksi/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const headTransaksi = await db.tabel_headtransaksi.findByPk(id);
    
    if (!headTransaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    const allowedStatuses = ['expired', 'failed', 'cancelled', 'pending'];
    if (!allowedStatuses.includes(headTransaksi.status)) {
      return res.status(400).json({
        success: false,
        message: 'Transaksi yang sudah dibayar tidak dapat dihapus'
      });
    }
    
    const transaction = await db.sequelize.transaction();
    
    try {
      await db.tabel_detailtransaksi.destroy({
        where: { id_headtransaksi: id },
        transaction
      });
      
      await db.tabel_payments.destroy({
        where: { id_headtransaksi: id },
        transaction
      });
      
      await headTransaksi.destroy({ transaction });
      
      await transaction.commit();
      
      res.json({
        success: true,
        message: 'Transaksi berhasil dihapus'
      });
      
    } catch (deleteError) {
      await transaction.rollback();
      throw deleteError;
    }
    
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menghapus transaksi',
      error: error.message
    });
  }
});

// Manual cleanup trigger
router.post('/transaksi/cleanup/manual', async (req, res) => {
  try {
    const paymentCleanupService = require('../services/paymentCleanupService');
    await paymentCleanupService.manualCleanup();
    
    res.json({
      success: true,
      message: 'Manual cleanup completed successfully'
    });
  } catch (error) {
    console.error('Manual cleanup error:', error);
    res.status(500).json({
      success: false,
      message: 'Manual cleanup failed',
      error: error.message
    });
  }
});
module.exports = router;