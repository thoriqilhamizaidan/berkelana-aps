// backend/controllers/transaksiController.js
const db = require('../models'); // Import models
const midtransClient = require('midtrans-client');

// Inisialisasi Midtrans
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true', // false untuk sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
});

// Helper functions
const generateBookingCode = () => {
  return 'BKL' + Date.now().toString().slice(-6) + Math.random().toString(36).substring(2, 5).toUpperCase();
};

const generateOrderId = (headTransaksiId) => {
  return `ORDER-${headTransaksiId}-${Date.now()}`;
};

const transaksiController = {
  // Create Head Transaksi (existing function - updated)
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

      // Generate booking code
      const bookingCode = generateBookingCode();

      // Set expiry time (15 minutes from now)
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 15);

      const headTransaksi = await db.tabel_headtransaksi.create({
        id_user: id_user || null,
        nama_pemesan,
        no_hp_pemesan,
        email_pemesan,
        id_promo: id_promo || null,
        potongan: potongan || 0,
        total: total || 0,
        status: status || 'pending',
        booking_code: bookingCode,
        expired_at: expiryTime
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

  // Get Head Transaksi by ID (existing function)
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

  // Create Detail Transaksi (existing function)
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

  // Create Multiple Detail Transaksi (NEW)
createMultipleDetailTransaksi: async (req, res) => {
  try {
    const detailTransaksiArray = req.body;

    if (!Array.isArray(detailTransaksiArray) || detailTransaksiArray.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Data detail transaksi harus berupa array dan tidak boleh kosong'
      });
    }

    const results = [];
    
    for (const detail of detailTransaksiArray) {
      const {
        id_headtransaksi,
        id_jadwal,
        harga_kursi,
        gender,
        nama_penumpang,
        nomor_kursi
      } = detail;

      // Validasi input yang BENAR untuk detail transaksi
      if (!id_headtransaksi || !id_jadwal || !nama_penumpang) {
        return res.status(400).json({
          success: false,
          message: 'ID head transaksi, ID jadwal, dan nama penumpang wajib diisi untuk setiap detail'
        });
      }

      // Cek apakah head transaksi ada
      const headExists = await db.tabel_headtransaksi.findByPk(id_headtransaksi);
      if (!headExists) {
        return res.status(400).json({
          success: false,
          message: `Head transaksi dengan ID ${id_headtransaksi} tidak ditemukan`
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

      results.push(detailTransaksi);
    }

    res.status(201).json({
      success: true,
      message: `${results.length} detail transaksi berhasil dibuat`,
      data: results
    });
  } catch (error) {
    console.error('Error creating multiple detail transaksi:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal membuat detail transaksi',
      error: error.message
    });
  }
},

  // Get Detail Transaksi by Head ID (existing function)
  getDetailTransaksiByHeadId: async (req, res) => {
    try {
      const { headId } = req.params;

      const detailTransaksi = await db.tabel_detailtransaksi.findAll({
        where: { id_headtransaksi: headId },
        include: [{
          model: db.tabel_jadwal,
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
  },

  // Get booked seats by jadwal ID (NEW)
  // PERBAIKAN untuk method getBookedSeatsByJadwal di transaksiController.js
// Ganti method yang ada dengan yang ini:

// FINAL FIX - Ganti method getBookedSeatsByJadwal dengan yang ini:

getBookedSeatsByJadwal: async (req, res) => {
  try {
    const { jadwalId } = req.params;

    console.log('🔍 Getting paid booked seats for jadwal:', jadwalId);

    // Query untuk mengambil kursi yang BENAR-BENAR PAID
    // Berdasarkan data Anda: head_status = 'paid' DAN payment_status = 'paid'
    const paidSeats = await db.sequelize.query(`
      SELECT DISTINCT
        d.nomor_kursi,
        d.gender,
        d.nama_penumpang
      FROM tabel_detailtransaksi d
      JOIN tabel_headtransaksi h ON d.id_headtransaksi = h.id_headtransaksi
      LEFT JOIN tabel_payments p ON h.id_headtransaksi = p.id_headtransaksi
      WHERE d.id_jadwal = ?
      AND d.nomor_kursi IS NOT NULL
      AND h.status = 'paid'
      AND (p.transaction_status = 'paid' OR p.transaction_status IS NULL)
    `, {
      replacements: [jadwalId],
      type: db.Sequelize.QueryTypes.SELECT
    });

    console.log(`✅ Found ${paidSeats.length} PAID seats for jadwal ${jadwalId}:`, paidSeats);

    // Debug info (akan dihapus nanti)
    const allSeats = await db.sequelize.query(`
      SELECT 
        d.nomor_kursi,
        h.status as head_status,
        p.transaction_status as payment_status
      FROM tabel_detailtransaksi d
      JOIN tabel_headtransaksi h ON d.id_headtransaksi = h.id_headtransaksi
      LEFT JOIN tabel_payments p ON h.id_headtransaksi = p.id_headtransaksi
      WHERE d.id_jadwal = ?
      AND d.nomor_kursi IS NOT NULL
    `, {
      replacements: [jadwalId],
      type: db.Sequelize.QueryTypes.SELECT
    });

    console.log(`📊 Debug - All seats for jadwal ${jadwalId}:`, allSeats);

    res.json({
      success: true,
      data: paidSeats,
      message: `Berhasil mengambil ${paidSeats.length} kursi yang sudah dibayar`
    });

  } catch (error) {
    console.error('❌ Error getting booked seats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data kursi yang sudah dipesan',
      error: error.message
    });
  }
},

  // ===== MIDTRANS PAYMENT FUNCTIONS =====

  // Create Payment Token (NEW)
  createPaymentToken: async (req, res) => {
    console.log('🔑 MIDTRANS_IS_PRODUCTION:', process.env.MIDTRANS_IS_PRODUCTION);
  console.log('🔑 MIDTRANS_SERVER_KEY:', process.env.MIDTRANS_SERVER_KEY?.substring(0, 20) + '...');
  console.log('🔑 MIDTRANS_CLIENT_KEY:', process.env.MIDTRANS_CLIENT_KEY?.substring(0, 20) + '...');
    try {
      const { id_headtransaksi } = req.params;

      // Get transaction data
      const headTransaksi = await db.tabel_headtransaksi.findByPk(id_headtransaksi, {
        include: [
          {
            model: db.tabel_detailtransaksi,
            as: 'DetailTransaksi'
          }
        ]
      });

      if (!headTransaksi) {
        return res.status(404).json({
          success: false,
          message: 'Transaksi tidak ditemukan'
        });
      }

      // Generate order ID
      const orderId = generateOrderId(id_headtransaksi);

      // Prepare Midtrans parameters
      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: headTransaksi.total,
        },
        credit_card: {
          secure: true,
        },
        customer_details: {
          first_name: headTransaksi.nama_pemesan,
          email: headTransaksi.email_pemesan,
          phone: headTransaksi.no_hp_pemesan,
        },
        item_details: [
          {
            id: `ticket-${id_headtransaksi}`,
            price: headTransaksi.total - 10000,
            quantity: 1,
            name: `Tiket Bus - Booking ${headTransaksi.booking_code || id_headtransaksi}`,
          },
          {
            id: 'admin-fee',
            price: 10000,
            quantity: 1,
            name: 'Biaya Admin',
          }
        ],
        custom_field1: headTransaksi.booking_code,
        custom_field2: id_headtransaksi.toString(),
        expiry: {
          start_time: new Date().toISOString(),
          unit: "minutes",
          duration: 15
        },
        callbacks: {
          finish: `${process.env.FRONTEND_URL}/payment-success?order_id=${orderId}`,
          error: `${process.env.FRONTEND_URL}/payment-failed?order_id=${orderId}`,
          pending: `${process.env.FRONTEND_URL}/payment-pending?order_id=${orderId}`,
        }
      };

      // Create transaction token
      const transaction = await snap.createTransaction(parameter);

      // Save payment record to payments table (if you created it)
      try {
        await db.tabel_payments?.create({
          id_headtransaksi: id_headtransaksi,
          order_id: orderId,
          gross_amount: headTransaksi.total,
          transaction_status: 'pending',
          snap_token: transaction.token,
          snap_redirect_url: transaction.redirect_url,
          expiry_time: headTransaksi.expired_at,
          raw_response: JSON.stringify(transaction),
        });
      } catch (paymentError) {
        console.log('Payment table not found, skipping payment record creation');
      }

      // Update head transaksi
      await headTransaksi.update({
        midtrans_order_id: orderId,
        status: 'pending'
      });

      res.json({
        success: true,
        data: {
          token: transaction.token,
          redirect_url: transaction.redirect_url,
          order_id: orderId,
          booking_code: headTransaksi.booking_code,
          expiry_time: headTransaksi.expired_at,
        }
      });

    } catch (error) {
      console.error('Error creating payment token:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat token pembayaran',
        error: error.message
      });
    }
  },

  // Handle Midtrans Notification (NEW)
  handleMidtransNotification: async (req, res) => {
    try {
      const notification = req.body;
      console.log('Midtrans Notification:', notification);

      const {
        order_id,
        transaction_status,
        fraud_status,
        transaction_id,
        payment_type,
        transaction_time,
        settlement_time,
        gross_amount
      } = notification;

      // Verify notification
      const statusResponse = await core.transaction.notification(notification);
      
      // Find head transaksi by order_id
      const headTransaksi = await db.tabel_headtransaksi.findOne({
        where: { midtrans_order_id: order_id }
      });

      if (!headTransaksi) {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found'
        });
      }

      // Update payment record if payments table exists
      try {
        const payment = await db.tabel_payments?.findOne({
          where: { order_id }
        });

        if (payment) {
          await payment.update({
            transaction_id,
            payment_type,
            transaction_status,
            fraud_status,
            transaction_time: transaction_time ? new Date(transaction_time) : null,
            settlement_time: settlement_time ? new Date(settlement_time) : null,
            raw_response: JSON.stringify(statusResponse),
          });
        }
      } catch (error) {
        console.log('Payment table not found, skipping payment record update');
      }

      // Update head transaksi status based on transaction status
      let newStatus = 'pending';
      let paidAt = null;

      if (transaction_status === 'capture' || transaction_status === 'settlement') {
        if (fraud_status === 'accept' || fraud_status === null) {
          newStatus = 'paid';
          paidAt = new Date();
        }
      } else if (transaction_status === 'cancel' || transaction_status === 'deny') {
        newStatus = 'cancelled';
      } else if (transaction_status === 'expire') {
        newStatus = 'expired';
      } else if (transaction_status === 'failure') {
        newStatus = 'failed';
      }

      await headTransaksi.update({
        status: newStatus,
        payment_method: payment_type,
        paid_at: paidAt,
      });

      res.json({
        success: true,
        message: 'Notification handled successfully'
      });

    } catch (error) {
      console.error('Error handling notification:', error);
      res.status(500).json({
        success: false,
        message: 'Error handling notification',
        error: error.message
      });
    }
  },

  // Check Payment Status (NEW)
  // REPLACE entire checkPaymentStatus function:
// 🔧 FIX 1: Update checkPaymentStatus function in transaksiController.js
checkPaymentStatus: async (req, res) => {
  try {
    const { order_id } = req.params;
    
    console.log('🔍 Checking payment status for:', order_id);
    
    if (!order_id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required'
      });
    }
    
    // 🔧 FIX: Use correct model reference
    const payment = await db.tabel_payments.findOne({
      where: { order_id: order_id },
      include: [{
        model: db.tabel_headtransaksi,
        as: 'HeadTransaksi',
        include: [{
          model: db.Promo,  // ✅ FIXED: Use db.Promo not db.tabel_promo
          as: 'Promo',
          required: false
        }]
      }]
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        order_id: payment.order_id,
        booking_code: payment.HeadTransaksi?.booking_code,
        transaction_status: payment.transaction_status,
        booking_status: payment.HeadTransaksi?.status,
        amount: payment.gross_amount,
        payment_method: payment.payment_gateway,
        gateway: 'xendit',
        promo_applied: payment.HeadTransaksi?.Promo ? {
          name: payment.HeadTransaksi.Promo.judul,  // ✅ FIXED: Use judul not nama_promo
          discount: payment.HeadTransaksi.potongan
        } : null
      }
    });
    
  } catch (error) {
    console.error('❌ Error details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
},

// 🔧 FIX 2: Update updateHeadTransaksiWithPromo function
// 🔧 COMPLETE FIX: updateHeadTransaksiWithPromo in transaksiController.js
// Replace your existing updateHeadTransaksiWithPromo function with this

// ✅ GANTI fungsi updateHeadTransaksiWithPromo di transaksiController.js dengan ini:

updateHeadTransaksiWithPromo: async (req, res) => {
  try {
    const { id } = req.params;
    const { id_promo, promo_code, promo_discount, new_total } = req.body;
    
    console.log('🎁 Updating head transaksi with promo:', {
      id_headtransaksi: id,
      id_promo,
      promo_code,
      promo_discount,
      new_total
    });
    
    // Find the head transaksi
    const headTransaksi = await db.tabel_headtransaksi.findByPk(id);
    
    if (!headTransaksi) {
      return res.status(404).json({
        success: false,
        message: 'Head transaksi tidak ditemukan'
      });
    }
    
    // ✅ CRITICAL: Mark any existing payments as 'promo_updated' so they get deleted
    await db.tabel_payments.update(
      { transaction_status: 'promo_updated' },
      { 
        where: { 
          id_headtransaksi: id,
          transaction_status: 'pending'
        }
      }
    );
    
    console.log('🔄 Marked existing payments as promo_updated');
    
    // ✅ CRITICAL FIX: Update head transaksi with new total (discounted amount)
    const updatedData = {
      id_promo: id_promo,
      potongan: promo_discount,  // Save the discount amount
      total: new_total,          // ✅ SAVE THE DISCOUNTED TOTAL
      updatedAt: new Date()
    };
    
    await headTransaksi.update(updatedData);
    
    console.log('✅ Head transaksi updated with promo data:', {
      new_total: new_total,
      discount: promo_discount,
      promo_id: id_promo
    });
    
    // Fetch updated data with promo info
    const updatedHeadTransaksi = await db.tabel_headtransaksi.findByPk(id, {
      include: [
        {
          model: db.Promo,
          as: 'Promo',
          required: false
        }
      ]
    });
    
    res.json({
      success: true,
      message: 'Head transaksi berhasil diupdate dengan promo',
      data: {
        id_headtransaksi: updatedHeadTransaksi.id_headtransaksi,
        total: updatedHeadTransaksi.total,  // This should be the discounted amount
        potongan: updatedHeadTransaksi.potongan,
        id_promo: updatedHeadTransaksi.id_promo,
        promo_info: updatedHeadTransaksi.Promo ? {
          name: updatedHeadTransaksi.Promo.judul,
          code: updatedHeadTransaksi.Promo.kode_promo,
          discount: updatedHeadTransaksi.potongan
        } : null,
        payment_recreation_needed: true  // Signal that payment needs recreation
      }
    });
    
  } catch (error) {
    console.error('Error updating head transaksi with promo:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengupdate head transaksi dengan promo',
      error: error.message
    });
  }
},

// 2. TAMBAHKAN fungsi ini SEBELUM penutup }; di transaksiController:

getTransactionStatus: async (req, res) => {
  try {
    const { id } = req.params;
    
    const headTransaksi = await db.tabel_headtransaksi.findByPk(id, {
      include: [
        {
          model: db.Promo,
          as: 'Promo',
          required: false
        }
      ]
    });
    
    if (!headTransaksi) {
      return res.status(404).json({
        success: false,
        message: 'Transaksi tidak ditemukan'
      });
    }
    
    // Get latest payment info
    let paymentInfo = null;
    try {
      const payment = await db.tabel_payments.findOne({
        where: { id_headtransaksi: id },
        order: [['createdAt', 'DESC']]
      });
      
      if (payment) {
        paymentInfo = {
          transaction_status: payment.transaction_status,
          gross_amount: payment.gross_amount,
          invoice_id: payment.order_id
        };
      }
    } catch (paymentError) {
      console.log('Payment table not found, skipping payment info');
    }
    
    res.json({
      success: true,
      data: {
        id_headtransaksi: headTransaksi.id_headtransaksi,
        transaction_status: paymentInfo?.transaction_status || headTransaksi.status,
        booking_status: headTransaksi.status,
        head_status: headTransaksi.status,
        booking_code: headTransaksi.booking_code,
        gross_amount: paymentInfo?.gross_amount || headTransaksi.total,
        invoice_id: paymentInfo?.invoice_id || null,
        promo_code: headTransaksi.Promo?.kode_promo || null,
        promo_discount: headTransaksi.potongan || 0,
        promo_name: headTransaksi.Promo?.judul || null,
        debug_statuses: {
          head_status: headTransaksi.status,
          payment_transaction_status: paymentInfo?.transaction_status || null
        }
      }
    });
    
  } catch (error) {
    console.error('Error getting transaction status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
},
};
module.exports = transaksiController;

