// backend/controllers/dokuController.js - FIXED VERSION

const crypto = require('crypto-js');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

const dokuController = {
  // Create DOKU Virtual Account Payment
  createDokuPayment: async (req, res) => {
    console.log('🟦 Creating DOKU Virtual Account Payment...');
    try {
      const { id_headtransaksi } = req.params;
      
      // FIXED: Simple query without scope first
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

      // FIXED: Check existing payment manually
      const existingPayment = await db.tabel_payments.findOne({
        where: { 
          id_headtransaksi: id_headtransaksi,
          transaction_status: ['pending', 'paid']
        },
        order: [['createdAt', 'DESC']]
      });

      // Check if payment already exists and is still valid
      if (existingPayment && 
          existingPayment.transaction_status === 'pending' &&
          existingPayment.expiry_time &&
          new Date() < new Date(existingPayment.expiry_time)) {
        console.log('🔄 Returning existing payment');
        
        // Generate booking code if missing
        let bookingCode = headTransaksi.booking_code;
        if (!bookingCode) {
          bookingCode = `BKL${headTransaksi.id_headtransaksi}${Date.now().toString().slice(-4)}`;
          await headTransaksi.update({ booking_code: bookingCode });
        }

        return res.json({
          success: true,
          data: {
            virtual_account_number: existingPayment.virtual_account_number,
            bank_code: 'BCA',
            order_id: existingPayment.order_id,
            booking_code: bookingCode,
            expires_at: existingPayment.expiry_time,
            gateway: 'doku_va',
            amount: headTransaksi.total,
            customer_name: headTransaksi.nama_pemesan,
            payment_instructions: {
              virtual_account_number: existingPayment.virtual_account_number,
              how_to_pay_page: existingPayment.how_to_pay_page
            }
          }
        });
      }

      // DOKU Configuration
      const clientId = process.env.DOKU_CLIENT_ID;
      const clientSecret = process.env.DOKU_CLIENT_SECRET;
      const baseUrl = process.env.DOKU_BASE_URL;

      console.log('🔑 DOKU Config:', { clientId, baseUrl });

      // Generate unique IDs
      const invoiceNumber = `INV-BKL-${id_headtransaksi}-${Date.now()}`;
      const requestId = uuidv4();
      const timestamp = new Date().toISOString();

      // DOKU Virtual Account payload sesuai docs
      const paymentData = {
        order: {
          invoice_number: invoiceNumber,
          amount: headTransaksi.total
        },
        virtual_account_info: {
          billing_type: "FIX_BILL",
          expired_time: 60, // 60 minutes
          reusable_status: false,
          info1: "Berkelana Bus Ticket",
          info2: "Thank you for choosing us",
          info3: "Have a safe journey!"
        },
        customer: {
          name: headTransaksi.nama_pemesan,
          email: headTransaksi.email_pemesan
        }
      };

      console.log('📦 Payment Data:', JSON.stringify(paymentData, null, 2));

      // Generate digest for VA API
      const digest = generateDigest(JSON.stringify(paymentData));
      console.log('🔐 Digest generated:', digest);

      // Generate signature for VA API (complex format)
      const signature = generateVASignature(
        clientId,
        requestId, 
        timestamp,
        '/bca-virtual-account/v2/payment-code',
        digest,
        clientSecret
      );

      console.log('🔐 Signature generated');

      // Send request to DOKU VA endpoint
      const response = await axios.post(
        `${baseUrl}/bca-virtual-account/v2/payment-code`,
        paymentData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Client-Id': clientId,
            'Request-Id': requestId,
            'Request-Timestamp': timestamp,
            'Signature': signature,
            'Digest': digest
          },
          timeout: 30000
        }
      );

      console.log('✅ DOKU Response Status:', response.status);
      console.log('📄 DOKU Response:', response.data);

      // FIXED: Use manual transaction
      const transaction = await db.sequelize.transaction();

      try {
        // Update head transaksi
        await headTransaksi.update({
          status: 'pending'
        }, { transaction });

        // Save payment record in separate payments table
        const paymentRecord = await db.tabel_payments.create({
          id_headtransaksi: id_headtransaksi,
          order_id: invoiceNumber,
          gross_amount: headTransaksi.total,
          payment_gateway: 'doku',
          payment_method: 'virtual_account_bca',
          transaction_status: 'pending',
          virtual_account_number: response.data.virtual_account_info?.virtual_account_number,
          how_to_pay_page: response.data.virtual_account_info?.how_to_pay_page,
          expiry_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
          raw_response: response.data,
        }, { transaction });

        // Generate booking code if not exists
        let bookingCode = headTransaksi.booking_code;
        if (!bookingCode) {
          bookingCode = `BKL${headTransaksi.id_headtransaksi}${Date.now().toString().slice(-4)}`;
          await headTransaksi.update({ booking_code: bookingCode }, { transaction });
        }

        await transaction.commit();
        console.log('💾 Payment record saved:', paymentRecord.id_payment);

        // Return success response
        res.json({
          success: true,
          data: {
            virtual_account_number: response.data.virtual_account_info?.virtual_account_number,
            bank_code: 'BCA',
            order_id: invoiceNumber,
            booking_code: bookingCode,
            expires_at: new Date(Date.now() + 60 * 60 * 1000),
            gateway: 'doku_va',
            amount: headTransaksi.total,
            customer_name: headTransaksi.nama_pemesan,
            payment_instructions: {
              virtual_account_number: response.data.virtual_account_info?.virtual_account_number,
              how_to_pay_page: response.data.virtual_account_info?.how_to_pay_page,
              how_to_pay_api: response.data.virtual_account_info?.how_to_pay_api
            }
          }
        });

      } catch (dbError) {
        await transaction.rollback();
        throw dbError;
      }

    } catch (error) {
        console.error('❌ DOKU VA Payment Error Details:');
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        console.error('Error headers:', error.response?.headers);
        console.error('Request URL:', error.config?.url);
        console.error('Request method:', error.config?.method);
        console.error('Request headers:', error.config?.headers);
        console.error('Full error:', error);
        
        res.status(500).json({
          success: false,
          message: 'Gagal membuat pembayaran DOKU Virtual Account',
          error: error.response?.data?.message || error.message,
          details: error.response?.data || null,
          debug: {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            method: error.config?.method,
            responseHeaders: error.response?.headers
          }
        });
      }
  },

  // Handle DOKU Callback
  handleDokuCallback: async (req, res) => {
    console.log('🔔 DOKU Callback received');
    try {
      const callbackData = req.body;
      console.log('📥 Callback Data:', JSON.stringify(callbackData, null, 2));

      // Process callback - you can implement this based on DOKU callback format
      res.json({ 
        success: true,
        message: 'Callback processed successfully' 
      });

    } catch (error) {
      console.error('❌ DOKU Callback Error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Internal server error',
        error: error.message 
      });
    }
  },

  // Check DOKU Payment Status
  checkDokuPaymentStatus: async (req, res) => {
    try {
      const { order_id } = req.params;

      // FIXED: Manual join query
      const payment = await db.tabel_payments.findOne({
        where: { order_id },
        include: [{
          model: db.tabel_headtransaksi,
          as: 'HeadTransaksi'
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

      // Update status if expired
      if (isExpired && payment.transaction_status === 'pending') {
        await payment.update({ transaction_status: 'expired' });
        await payment.HeadTransaksi.update({ status: 'expired' });
      }

      // Generate booking code if missing
      let bookingCode = payment.HeadTransaksi.booking_code;
      if (!bookingCode) {
        bookingCode = `BKL${payment.HeadTransaksi.id_headtransaksi}${Date.now().toString().slice(-4)}`;
        await payment.HeadTransaksi.update({ booking_code: bookingCode });
      }

      res.json({
        success: true,
        data: {
          order_id,
          payment_id: payment.id_payment,
          transaction_status: currentStatus,
          payment_method: payment.payment_method,
          virtual_account_number: payment.virtual_account_number,
          gross_amount: payment.gross_amount,
          payment_gateway: payment.payment_gateway,
          transaction_time: payment.transaction_time,
          expiry_time: payment.expiry_time,
          booking_status: payment.HeadTransaksi.status,
          booking_code: bookingCode,
          created_at: payment.createdAt,
          updated_at: payment.updatedAt,
          is_expired: isExpired
        }
      });

    } catch (error) {
      console.error('Error checking DOKU payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking payment status',
        error: error.message
      });
    }
  }
};

// Helper functions (unchanged)
function generateDigest(jsonBody) {
  const jsonStringHash256 = crypto.SHA256(jsonBody).toString();
  const bufferFromJsonStringHash256 = Buffer.from(jsonStringHash256, 'hex');
  return bufferFromJsonStringHash256.toString('base64');
}

function generateVASignature(clientId, requestId, requestTimestamp, requestTarget, digest, secret) {
  let componentSignature = "Client-Id:" + clientId;
  componentSignature += "\n";
  componentSignature += "Request-Id:" + requestId;
  componentSignature += "\n";
  componentSignature += "Request-Timestamp:" + requestTimestamp;
  componentSignature += "\n";
  componentSignature += "Request-Target:" + requestTarget;
  
  if (digest) {
    componentSignature += "\n";
    componentSignature += "Digest:" + digest;
  }

  console.log('🔐 Component Signature:', componentSignature);

  const hmac256Value = crypto.HmacSHA256(componentSignature, secret).toString(crypto.enc.Base64);
  return "HMACSHA256=" + hmac256Value;
}

module.exports = dokuController;