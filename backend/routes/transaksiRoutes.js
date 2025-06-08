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
    
    // ✅ FIX: Query yang include promo info
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
      LEFT JOIN promos pr ON h.id_promo = pr.id_promo
      WHERE h.id_headtransaksi = ?
      ORDER BY p.createdAt DESC
      LIMIT 1
    `;
    
    const [results] = await db.sequelize.query(query, {
      replacements: [id],
      type: db.Sequelize.QueryTypes.SELECT
    });
    
    if (!results) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }
    
    const transaction_status = results.transaction_status || results.head_payment_status || results.head_status;
    
    res.json({
      success: true,
      data: {
        id_headtransaksi: results.id_headtransaksi,
        transaction_status,
        booking_status: results.head_status,
        head_status: results.head_status,
        head_payment_status: results.head_payment_status,
        booking_code: results.booking_code,
        gross_amount: results.gross_amount || results.payment_amount,
        invoice_id: results.invoice_id,
        expires_at: results.expires_at,
        // ✅ FIX: Include promo info for frontend restoration
        promo_code: results.promo_code,
        promo_discount: results.promo_discount,
        promo_name: results.promo_name,
        debug_statuses: {
          head_status: results.head_status,
          head_payment_status: results.head_payment_status,
          payment_transaction_status: results.transaction_status,
          final_status: transaction_status
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting combined payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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

module.exports = router;