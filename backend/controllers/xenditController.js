// backend/controllers/xenditController.js - COMPLETELY FIXED VERSION
const { Xendit } = require('xendit-node');
const db = require('../models');

// Initialize Xendit with correct modern format
const axios = require('axios');
const authToken = Buffer.from(`${process.env.XENDIT_SECRET_KEY}:`).toString('base64');

const xenditController = {
  createXenditPayment: async (req, res) => {
    console.log('🟦 Creating Xendit Payment...');
    
    try {
      const { id_headtransaksi } = req.params;
        
        // ✅ NEW: Check for promo_updated payments ONLY
        const promoUpdatedPayment = await db.tabel_payments.findOne({
          where: {
            id_headtransaksi: id_headtransaksi,
            transaction_status: 'promo_updated'
          }
        });
    
        if (promoUpdatedPayment) {
          console.log('🎁 Found promo-updated payment, deleting to recreate with correct amount');
          await promoUpdatedPayment.destroy();
          console.log('🗑️ Promo-updated payment deleted');
        }
      
      // 🔧 CRITICAL: Always fetch fresh data from database
      const headTransaksi = await db.tabel_headtransaksi.findByPk(id_headtransaksi, {
        include: [
          {
            model: db.tabel_detailtransaksi,
            as: 'DetailTransaksi'
          },
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
      
      console.log('✅ Fresh database data retrieved:', {
        id: headTransaksi.id_headtransaksi,
        final_total: headTransaksi.total,  // Should be discounted amount
        nama: headTransaksi.nama_pemesan,
        promo_id: headTransaksi.id_promo,
        promo_name: headTransaksi.Promo?.judul || 'No Promo',
        potongan: headTransaksi.potongan || 0
      });
  
      // 🔧 IMPORTANT: Delete existing pending payments to force recreate
      await db.tabel_payments.destroy({
        where: {
          id_headtransaksi: id_headtransaksi,
          transaction_status: 'pending'
        }
      });
  
      console.log('🗑️ Deleted existing pending payments');
    
      // Generate unique invoice ID
      const invoiceId = `INV-BKL-${id_headtransaksi}-${Date.now()}`;
      
      // 🎯 CRITICAL: Use FINAL amount from database (after promo discount)
      const finalAmount = headTransaksi.total;  // This should already be discounted
      const adminFee = 10000;
      const basePrice = finalAmount - adminFee;  // Base price = total - admin fee
      
      console.log('💰 Payment amounts (FIXED FOR PROMO):', {
        finalAmount: finalAmount,          // Total customer pays (discounted)
        basePrice: basePrice,              // Base price after promo discount
        adminFee: adminFee,                // Admin fee
        promoDiscount: headTransaksi.potongan || 0,
        promoName: headTransaksi.Promo?.judul || 'No Promo',
        calculation: `${basePrice} + ${adminFee} = ${finalAmount}`
      });
      
      
      // Create Xendit invoice with CORRECT amount
      const invoiceData = {
        external_id: invoiceId,
        amount: finalAmount,  // ✅ Total amount customer pays (discounted)
        currency: 'IDR',
        customer: {
          given_names: headTransaksi.nama_pemesan,
          email: headTransaksi.email_pemesan,
          mobile_number: headTransaksi.no_hp_pemesan,
        },
        customer_notification_preference: {
          invoice_paid: ['email']
        },
        success_redirect_url: `${process.env.FRONTEND_URL}/payment-close`,
        failure_redirect_url: `${process.env.FRONTEND_URL}/payment-failed?invoice_id=${invoiceId}`,
        items: [
          {
            name: headTransaksi.Promo ? 
            `Tiket Bus - ${headTransaksi.DetailTransaksi?.length || 1} Penumpang (Promo: ${headTransaksi.Promo.judul})` :
            `Tiket Bus - ${headTransaksi.DetailTransaksi?.length || 1} Penumpang`,
            quantity: 1,
            price: basePrice,  // ✅ Base price after promo discount
            category: 'Transportation'
          }
        ],
        fees: [
          {
            type: "Admin",
            value: adminFee  // ✅ Admin fee
          }
        ],
        description: headTransaksi.potongan > 0 
          ? `Pembayaran tiket bus dengan promo ${headTransaksi.Promo?.judul} (Hemat Rp ${headTransaksi.potongan?.toLocaleString('id-ID')})`
          : 'Pembayaran tiket bus',
        invoice_duration: 86400
      };
      
      console.log('📦 Creating Xendit Invoice with CORRECT structure:', {
        amount: invoiceData.amount,
        items_price: basePrice,
        fees_value: adminFee,
        total_calculation: basePrice + adminFee,
        description: invoiceData.description
      });

      const calculatedTotal = basePrice + adminFee;
      if (Math.abs(calculatedTotal - finalAmount) > 1) {
        console.error('❌ Amount calculation error!', {
          expected: finalAmount,
          calculated: calculatedTotal,
          difference: Math.abs(finalAmount - calculatedTotal)
        });
        return res.status(400).json({
          success: false,
          message: 'Error in amount calculation'
        });
      }

      // Create invoice with Xendit API
      const response = await axios.post('https://api.xendit.co/v2/invoices', invoiceData, {
        headers: {
          'Authorization': `Basic ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Xendit Invoice Created:', response.data.id);

      // Save to database
const transaction = await db.sequelize.transaction();

try {
  // ✅ CRITICAL FIX: Generate and save booking code FIRST
  let bookingCode = headTransaksi.booking_code;
  if (!bookingCode) {
    bookingCode = `BKL${headTransaksi.id_headtransaksi}${Date.now().toString().slice(-4)}`;
    console.log('📝 Generated booking code:', bookingCode);
  }

  // ✅ FIX: Update head transaksi with booking code AND status
  await headTransaksi.update({
    status: 'pending',
    booking_code: bookingCode  // ✅ SAVE BOOKING CODE
  }, { transaction });

  console.log('✅ Head transaksi updated with booking code:', bookingCode);

  // ✅ FIX: Check if payment already exists to prevent duplicates
  const existingPayment = await db.tabel_payments.findOne({
    where: {
      id_headtransaksi: id_headtransaksi,
      transaction_status: ['pending', 'paid']
    },
    transaction
  });

  if (existingPayment) {
    console.log('⚠️ Payment already exists, updating instead of creating new');
    
    // Update existing payment
    await existingPayment.update({
      order_id: invoiceId,
      gross_amount: finalAmount,
      transaction_id: response.data.id,
      snap_redirect_url: response.data.invoice_url,
      expiry_time: new Date(response.data.expiry_date),
      raw_response: JSON.stringify(response.data),
    }, { transaction });

    console.log('✅ Existing payment updated');
  } else {
    // Create new payment record
    const paymentRecord = await db.tabel_payments.create({
      id_headtransaksi: id_headtransaksi,
      order_id: invoiceId,
      gross_amount: finalAmount,
      payment_gateway: 'xendit',
      payment_method: 'invoice',
      transaction_id: response.data.id,
      transaction_status: 'pending',
      snap_redirect_url: response.data.invoice_url,
      expiry_time: new Date(response.data.expiry_date),
      raw_response: JSON.stringify(response.data),
    }, { transaction });
    
    console.log('💾 New payment record created:', paymentRecord.id_payment);
  }
  
  await transaction.commit();
  console.log('✅ Database transaction committed successfully');
  
  // ✅ RETURN with booking code
  res.json({
    success: true,
    data: {
      invoice_url: response.data.invoice_url,
      invoice_id: invoiceId,
      booking_code: bookingCode,  // ✅ RETURN BOOKING CODE
      expires_at: response.data.expiry_date,
      gateway: 'xendit',
      amount: finalAmount,
      customer_name: headTransaksi.nama_pemesan,
      status: 'pending'
    }
  });

} catch (dbError) {
  await transaction.rollback();
  console.error('❌ Database transaction failed:', dbError);
  throw dbError;
}

    } catch (error) {
      console.error('❌ Xendit Payment Error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal membuat pembayaran Xendit',
        error: error.message
      });
    }
  },

  // 🎯 UPDATED: Handle Xendit Webhook dengan promo support
  handleXenditWebhook: async (req, res) => {
    console.log('🔔 Xendit Webhook received');
    
    try {
      // 1. Immediately acknowledge receipt with 200
      res.status(200).json({ received: true });
      
      // 2. Get headers and body
      const headers = req.headers;
      const webhookData = req.body;
      
      console.log('📥 Webhook data:', JSON.stringify(webhookData, null, 2));

      // 3. Verify webhook token
      const incomingToken = headers['x-callback-token'];
      const expectedToken = process.env.XENDIT_WEBHOOK_TOKEN;
      
      if (incomingToken !== expectedToken) {
        console.log('❌ Invalid webhook token - but already responded 200');
        return;
      }
      
      console.log('✅ Webhook token verified');

      // 4. Extract data
      const { 
        external_id, 
        status, 
        id: invoice_id, 
        paid_at, 
        amount,
        payment_method,      // ✅ ADD: Extract payment method
        payment_channel,     // ✅ ADD: Extract payment channel  
        payment_destination  // ✅ ADD: Extract payment destination
      } = webhookData;
      
      console.log('🔍 Processing webhook:', { 
        external_id, 
        status, 
        invoice_id, 
        amount, 
        paid_at,
        payment_method,      // ✅ LOG: Payment method
        payment_channel      // ✅ LOG: Payment channel
      });

      // 5. Find payment record dengan relasi
      const payment = await db.tabel_payments.findOne({
        where: { order_id: external_id },
        include: [{
          model: db.tabel_headtransaksi,
          as: 'HeadTransaksi',
          include: [{
            model: db.Promo,  // ✅ FIXED: Gunakan 'Promo' bukan 'tabel_promo'
            as: 'Promo',
            required: false
          }]
        }]
      });

      if (!payment) {
        console.log('❌ Payment not found for external_id:', external_id);
        return;
      }

      console.log('✅ Payment found:', {
        id: payment.id_payment,
        order_id: payment.order_id,
        current_status: payment.transaction_status,
        expected_amount: payment.gross_amount,
        webhook_amount: amount
      });

      // 6. VALIDASI AMOUNT - pastikan amount cocok
      if (amount && Math.abs(amount - payment.gross_amount) > 1) {
        console.log('⚠️ Amount mismatch:', {
          expected: payment.gross_amount,
          received: amount,
          difference: Math.abs(amount - payment.gross_amount)
        });
        // Masih lanjut proses, tapi log warning
      }

      // 7. Update payment status
      let newStatus = 'pending';
      let paidAt = null;

      switch (status) {
        case 'PAID':      // ✅ Customer paid, funds not settled yet
        case 'SETTLED':   // ✅ Funds settled to Xendit account
          newStatus = 'paid';
          paidAt = paid_at ? new Date(paid_at) : new Date();
          console.log(`💰 Status: ${status} (treating as PAID)`);
          break;
        case 'EXPIRED':
          newStatus = 'expired';
          console.log('⏰ Status: EXPIRED');
          break;
        case 'FAILED':
          newStatus = 'failed';
          console.log('❌ Status: FAILED');
          break;
        default:
          console.log('ℹ️ Unknown status:', status);
          return;
      }

      // 8. Prevent duplicate updates
      if (payment.transaction_status === newStatus) {
        console.log(`ℹ️ Status already ${newStatus}, skipping update`);
        return;
      }

      console.log(`🔄 Updating status: ${payment.transaction_status} → ${newStatus}`);

      // 9. Update database
      const dbTransaction = await db.sequelize.transaction();

try {
  // ✅ ENHANCED: Update payment record with payment method
  await payment.update({
    transaction_status: newStatus,
    transaction_time: paidAt,
    payment_method: payment_method || payment_channel || 'xendit_invoice', // ✅ SAVE PAYMENT METHOD
    virtual_account_number: payment_destination || null,  // ✅ SAVE VA NUMBER if available
    raw_response: JSON.stringify(webhookData),
  }, { transaction: dbTransaction });

  // ✅ ENHANCED: Update head transaksi with payment method
  await payment.HeadTransaksi.update({
    status: newStatus,
    payment_method: payment_method || payment_channel || 'xendit_invoice', // ✅ SAVE TO HEAD TRANSAKSI
    paid_at: paidAt,
  }, { transaction: dbTransaction });

  await dbTransaction.commit();
  
  console.log('✅ Database updated successfully with payment method:', payment_method || payment_channel);
  console.log(`🎉 Payment ${external_id} processed: ${newStatus}`);

  // ✅ ENHANCED LOG: Payment method info
  if (payment_method || payment_channel) {
    console.log('💳 Payment method saved:', {
      method: payment_method,
      channel: payment_channel,
      destination: payment_destination
    });
  }

  // LOG PROMO INFO jika ada (existing code)
  if (payment.HeadTransaksi.Promo) {
    console.log('🎁 Promo applied:', {
      promo_name: payment.HeadTransaksi.Promo.judul,
      discount: payment.HeadTransaksi.potongan,
      final_amount: payment.gross_amount
    });
  }

} catch (dbError) {
  await dbTransaction.rollback();
  console.error('❌ Database update failed:', dbError);
  throw dbError;
}

    } catch (error) {
      console.error('❌ Webhook processing error:', error);
    }
  },

  // Check Xendit Payment Status - UPDATED
  checkXenditPaymentStatus: async (req, res) => {
    try {
      const { invoice_id } = req.params;

      const payment = await db.tabel_payments.findOne({
        where: { order_id: invoice_id },
        include: [{
          model: db.tabel_headtransaksi,
          as: 'HeadTransaksi',
          include: [{
            model: db.Promo,  // ✅ FIXED: Gunakan 'Promo' bukan 'tabel_promo'
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

      // Check if payment is expired
      const isExpired = payment.expiry_time && new Date() > new Date(payment.expiry_time);
      const currentStatus = isExpired && payment.transaction_status === 'pending' ? 'expired' : payment.transaction_status;

      // Generate booking code if missing
      let bookingCode = payment.HeadTransaksi.booking_code;
      if (!bookingCode) {
        bookingCode = `BKL${payment.HeadTransaksi.id_headtransaksi}${Date.now().toString().slice(-4)}`;
        await payment.HeadTransaksi.update({ booking_code: bookingCode });
      }

      res.json({
        success: true,
        data: {
          invoice_id,
          payment_id: payment.id_payment,
          transaction_status: currentStatus,
          booking_status: payment.HeadTransaksi.status,
          payment_method: payment.payment_method,
          payment_gateway: payment.payment_gateway,
          gross_amount: payment.gross_amount,
          transaction_time: payment.transaction_time,
          expiry_time: payment.expiry_time,
          booking_code: bookingCode,
          invoice_url: payment.snap_redirect_url,
          // TAMBAHKAN PROMO INFO
          promo_applied: payment.HeadTransaksi.Promo ? {
            name: payment.HeadTransaksi.Promo.judul,  // ✅ FIXED
            discount: payment.HeadTransaksi.potongan,
            type: payment.HeadTransaksi.Promo.jenis_promo  // ✅ TAMBAH jenis promo
          } : null,
          created_at: payment.createdAt,
          updated_at: payment.updatedAt,
          is_expired: isExpired
        }
      });

    } catch (error) {
      console.error('Error checking Xendit payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking payment status',
        error: error.message
      });
    }
  },

  // ✅ NEW: Enhanced Direct Xendit Status Check
  checkDirectXenditStatus: async (req, res) => {
    try {
      const { invoice_id } = req.params;
      
      console.log('🔍 Checking direct Xendit status for ORDER ID:', invoice_id);
      
      // First, get payment record to find the Xendit transaction_id
      const paymentRecord = await db.tabel_payments.findOne({
        where: { order_id: invoice_id },
        include: [{
          model: db.tabel_headtransaksi,
          as: 'HeadTransaksi'
        }]
      });
      
      if (!paymentRecord) {
        console.log('❌ Payment record not found for order_id:', invoice_id);
        return res.status(404).json({
          success: false,
          message: 'Payment record not found in database'
        });
      }
      
      // CRITICAL: Use the Xendit transaction_id, NOT order_id!
      const xenditInvoiceId = paymentRecord.transaction_id;
      console.log('📋 Found Xendit Invoice ID:', xenditInvoiceId);
      
      if (!xenditInvoiceId) {
        return res.status(400).json({
          success: false,
          message: 'No Xendit transaction ID found'
        });
      }
      
      try {
        // Call Xendit API with the correct invoice ID
        const response = await axios.get(
          `https://api.xendit.co/v2/invoices/${xenditInvoiceId}`,
          {
            headers: {
              'Authorization': `Basic ${authToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const invoiceData = response.data;
        console.log('✅ Xendit API Response:', {
          id: invoiceData.id,
          status: invoiceData.status,
          paid_amount: invoiceData.paid_amount,
          amount: invoiceData.amount,
          payment_method: invoiceData.payment_method,
          paid_at: invoiceData.paid_at
        });
        
        // Determine if payment is complete
        const isPaid = invoiceData.status === 'PAID' || 
                       invoiceData.status === 'SETTLED' ||
                       (invoiceData.paid_amount && invoiceData.paid_amount >= invoiceData.amount);
        
        // If paid, force update database
        if (isPaid && paymentRecord.transaction_status !== 'paid') {
          console.log('💰 PAYMENT IS PAID! Forcing database update...');
          
          const dbTransaction = await db.sequelize.transaction();
          
          try {
            // Update payment record
            await paymentRecord.update({
              transaction_status: 'paid',
              transaction_time: invoiceData.paid_at ? new Date(invoiceData.paid_at) : new Date(),
              payment_method: invoiceData.payment_method || 'xendit'
            }, { transaction: dbTransaction });
            
            // Update head transaksi
            await paymentRecord.HeadTransaksi.update({
              status: 'paid',
              paid_at: invoiceData.paid_at ? new Date(invoiceData.paid_at) : new Date()
            }, { transaction: dbTransaction });
            
            await dbTransaction.commit();
            console.log('✅ Database updated successfully!');
            
            // Return success with updated status
            return res.json({
              success: true,
              data: {
                payment_complete: true,
                database_status: 'paid',
                updated: true,
                xendit_status: invoiceData.status,
                payment_details: {
                  amount: invoiceData.amount,
                  paid_amount: invoiceData.paid_amount,
                  payment_method: invoiceData.payment_method,
                  paid_at: invoiceData.paid_at
                }
              }
            });
            
          } catch (dbError) {
            await dbTransaction.rollback();
            console.error('❌ Database update error:', dbError);
            throw dbError;
          }
        }
        
        // Return current status
        return res.json({
          success: true,
          data: {
            payment_complete: isPaid,
            database_status: paymentRecord.transaction_status,
            updated: false,
            xendit_status: invoiceData.status,
            payment_details: {
              amount: invoiceData.amount,
              paid_amount: invoiceData.paid_amount || 0,
              payment_method: invoiceData.payment_method,
              paid_at: invoiceData.paid_at
            }
          }
        });
        
      } catch (xenditError) {
        console.error('❌ Xendit API Error:', xenditError.response?.data || xenditError.message);
        
        // Handle rate limit
        if (xenditError.response?.status === 429) {
          return res.status(429).json({
            success: false,
            message: 'Rate limit exceeded. Please wait before retrying.',
            retry_after: 60
          });
        }
        
        // Handle not found
        if (xenditError.response?.status === 404) {
          return res.status(404).json({
            success: false,
            message: 'Invoice not found in Xendit'
          });
        }
        
        throw xenditError;
      }
      
    } catch (error) {
      console.error('❌ checkDirectXenditStatus error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to check Xendit status',
        error: error.message
      });
    }
  },
};
module.exports = xenditController;