// src/services/transaksiService.js - UPDATED WITH XENDIT SUPPORT
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5052/api';

// Helper function untuk handle fetch response
const handleResponse = async (response) => {
  const text = await response.text();
  try {
    const json = JSON.parse(text);
    if (!response.ok) {
      console.error('🧨 Error Response Body:', json);
      throw new Error(json.message || `HTTP ${response.status}`);
    }
    return json;
  } catch (err) {
    console.error('🧨 Invalid JSON response:', text);
    throw new Error(`HTTP ${response.status}`);
  }
};

// Helper function untuk fetch request
const apiRequest = async (url, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  console.log(`🔄 API Request: ${config.method || 'GET'} ${url}`);
  
  try {
    const response = await fetch(url, config);
    const data = await handleResponse(response);
    console.log(`✅ API Response: ${response.status} ${url}`);
    return data;
  } catch (error) {
    console.error(`❌ API Error: ${url}`, error);
    throw error;
  }
};




export const transaksiService = {


  // ✅ ADD: Delete & validation methods - TAMBAH SEBELUM };

// Delete transaction
deleteTransaction: async (id_headtransaksi) => {
  try {
    console.log('🗑️ Deleting transaction:', id_headtransaksi);
    const response = await apiRequest(`${API_BASE_URL}/transaksi/${id_headtransaksi}`, {
      method: 'DELETE',
    });
    console.log('✅ Transaction deleted successfully');
    return response;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
},

// Validate transaction before payment
validateTransactionForPayment: async (transaksiId) => {
  try {
    const response = await transaksiService.checkPaymentStatusByHeadTransaksi(transaksiId);
    
    if (!response.success) {
      return { valid: false, reason: 'Transaksi tidak ditemukan' };
    }
    
    const { transaction_status, createdAt } = response.data;
    
    // Check if already paid
    if (['paid', 'settlement', 'capture'].includes(transaction_status)) {
      return { valid: false, reason: 'Pembayaran sudah selesai' };
    }
    
    // Check if expired/failed
    if (['expired', 'failed', 'cancelled'].includes(transaction_status)) {
      return { valid: false, reason: 'Pembayaran tidak dapat dilanjutkan' };
    }
    
    // Check if auto-expired (15+ minutes old)
    if (createdAt && transaction_status === 'pending') {
      const created = new Date(createdAt);
      const now = new Date();
      const minutesSinceCreated = Math.floor((now - created) / (1000 * 60));
      
      if (minutesSinceCreated >= 15) {
        return { valid: false, reason: 'Transaksi telah kedaluwarsa' };
      }
      
      const remainingMinutes = 15 - minutesSinceCreated;
      return { 
        valid: true, 
        remainingMinutes,
        message: `Sisa waktu: ${remainingMinutes} menit`
      };
    }
    
    return { valid: true };
    
  } catch (error) {
    console.error('Error validating transaction:', error);
    return { valid: false, reason: 'Error validating transaction' };
  }
},

// Check if transaction can be deleted
canDeleteTransaction: (ticket) => {
  const status = ticket.payment_transaction_status || ticket.payment_status || ticket.status;
  const allowedStatuses = ['expired', 'failed', 'cancelled', 'pending'];
  
  // Also check if payment is auto-expired (15+ minutes old and pending)
  if (status === 'pending') {
    const createdAt = new Date(ticket.createdAt);
    const now = new Date();
    const minutesSinceCreated = Math.floor((now - createdAt) / (1000 * 60));
    
    return minutesSinceCreated >= 15; // Can delete if 15+ minutes old
  }
  
  return allowedStatuses.includes(status?.toLowerCase());
},
  // ✅ NEW: Get transaksi by user ID
// ✅ TAMBAH: Method untuk get transaksi by user (yang sudah ada di artifact sebelumnya)
getTransaksiByUser: async (userId) => {
  try {
    console.log('🔄 Getting transaksi for user:', userId);
    const response = await apiRequest(`${API_BASE_URL}/transaksi/user/${userId}`, {
      method: 'GET',
    });
    console.log('✅ User transaksi response:', response);
    return response;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
},

getCurrentUserId: () => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.id_user || user.id;
    }
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
},

// ✅ NEW: Get detail transaksi lengkap
getDetailTransaksi: async (transaksiId) => {
  try {
    console.log('🔄 Getting detail transaksi:', transaksiId);
    const response = await apiRequest(`${API_BASE_URL}/transaksi/${transaksiId}/detail`, {
      method: 'GET',
    });
    console.log('✅ Detail transaksi response:', response);
    return response;
  } catch (error) {
    console.error('Error getting transaction detail:', error);
    throw error;
  }
},

// ✅ NEW: Continue payment untuk transaksi yang pending
continuePayment: async (transaksiId) => {
  try {
    console.log('🔄 Continue payment for transaksi:', transaksiId);
    
    // Check existing payment first
    const existingPayment = await transaksiService.getExistingPayment(transaksiId);
    
    if (existingPayment.success && existingPayment.data) {
      const payment = existingPayment.data;
      
      // Check if payment is still valid (not expired)
      if (payment.expiry_time) {
        const expiryTime = new Date(payment.expiry_time);
        const now = new Date();
        
        if (now < expiryTime && payment.transaction_status === 'pending') {
          console.log('✅ Using existing valid payment');
          return {
            success: true,
            data: payment,
            message: 'Using existing payment'
          };
        }
      }
    }
    
    // Create new payment if no valid existing payment
    console.log('🆕 Creating new payment...');
    const response = await transaksiService.createPaymentToken(transaksiId);
    return response;
    
  } catch (error) {
    console.error('Error continuing payment:', error);
    throw error;
  }
},

  // ✅ NEW: Enhanced Direct Xendit Status Check
  checkDirectXenditStatus: async (invoiceId) => {
    try {
      console.log('🔍 Checking direct Xendit status for:', invoiceId);
      const response = await apiRequest(`${API_BASE_URL}/payment/xendit/check-direct/${invoiceId}`, {
        method: 'GET',
      });
      console.log('✅ Direct Xendit check response:', response);
      return response;
    } catch (error) {
      console.error('Error checking direct Xendit status:', error);
      throw error;
    }
  },
  
  // Head Transaksi
  createHeadTransaksi: async (data) => {
    try {
      // ✅ AUTO-ADD: id_user dari localStorage
      const currentUserId = transaksiService.getCurrentUserId();
      
      const dataWithUserId = {
        ...data,
        id_user: currentUserId || data.id_user // Fallback ke data.id_user jika ada
      };
      
      console.log('🔄 Creating head transaksi with user ID:', dataWithUserId.id_user);
      
      return await apiRequest(`${API_BASE_URL}/headtransaksi`, {
        method: 'POST',
        body: JSON.stringify(dataWithUserId),
      });
    } catch (error) {
      console.error('Error creating head transaksi:', error);
      throw error;
    }
  },
  updateHeadTransaksi: async (id, data) => {
    try {
      return await apiRequest(`${API_BASE_URL}/headtransaksi/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error updating head transaksi:', error);
      throw error;
    }
  },

  updateHeadTransaksiStatus: async (id_headtransaksi, status) => {
    try {
      console.log('🔄 Updating head transaksi status:', { id_headtransaksi, status });
      const response = await apiRequest(`${API_BASE_URL}/transaksi/update-status/${id_headtransaksi}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          status: status, 
          payment_status: status 
        }),
      });
      console.log('✅ Head transaksi status updated:', response);
      return response;
    } catch (error) {
      console.error('Error updating head transaksi status:', error);
      return { success: false, message: error.message };
    }
  },

  updateHeadTransaksiWithPromo: async (id_headtransaksi, promoData) => {
    try {
      console.log('🎁 Updating head transaksi with promo:', { id_headtransaksi, promoData });
      
      const response = await apiRequest(`${API_BASE_URL}/headtransaksi/${id_headtransaksi}/promo`, {
        method: 'PUT',
        body: JSON.stringify(promoData),
      });
      
      console.log('✅ Head transaksi updated with promo response:', response);
      return response;
    } catch (error) {
      console.error('Error updating head transaksi with promo:', error);
      throw error;
    }
  },

  getHeadTransaksiById: async (id) => {
    try {
      return await apiRequest(`${API_BASE_URL}/headtransaksi/${id}`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error getting head transaksi:', error);
      throw error;
    }
  },

  // Detail Transaksi
  createDetailTransaksi: async (data) => {
    try {
      return await apiRequest(`${API_BASE_URL}/detailtransaksi`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating detail transaksi:', error);
      throw error;
    }
  },

  createMultipleDetailTransaksi: async (data) => {
    try {
      console.log('📦 Creating multiple detail transaksi:', data);
      return await apiRequest(`${API_BASE_URL}/detailtransaksi/multiple`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Error creating multiple detail transaksi:', error);
      throw error;
    }
  },

  getBookedSeatsByJadwal: async (jadwalId) => {
    try {
      return await apiRequest(`${API_BASE_URL}/detail-transaksi/jadwal/${jadwalId}/seats`, {
        method: 'GET',
      });
    } catch (error) {
      console.error('Error getting booked seats:', error);
      throw error;
    }
  },

  // UNIVERSAL PAYMENT - Auto-routes to configured gateway (Xendit/DOKU/Midtrans)
  createPaymentToken: async (id_headtransaksi) => {
    try {
      console.log('🔄 Creating payment token for head transaksi:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payment/create-token/${id_headtransaksi}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      console.log('✅ Payment token response:', response);
      return response;
    } catch (error) {
      console.error('Error creating payment token:', error);
      throw error;
    }
  },

  checkPaymentStatus: async (order_id) => {
    try {
      console.log('🔄 Checking payment status for order:', order_id);
      const response = await apiRequest(`${API_BASE_URL}/payment/status/${order_id}`, {
        method: 'GET',
      });
      console.log('✅ Payment status response:', response);
      return response;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  },
  checkPaymentStatusByHeadTransaksi: async (id_headtransaksi) => {
    try {
      console.log('🔍 Checking payment status by head transaksi ID:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payments/status-by-head/${id_headtransaksi}`, {
        method: 'GET',
      });
      console.log('✅ Payment status by head transaksi response:', response);
      return response;
    } catch (error) {
      console.error('Error checking payment status by head transaksi:', error);
      return { success: false, message: error.message };
    }
  },
  getExistingPayment: async (id_headtransaksi) => {
    try {
      console.log('🔍 Getting existing payment for head transaksi:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payments/by-head-transaksi/${id_headtransaksi}`, {
        method: 'GET',
      });
      console.log('✅ Existing payment response:', response);
      return response;
    } catch (error) {
      console.error('Error getting existing payment:', error);
      return { success: false, message: error.message };
    }
  },
  

  // XENDIT SPECIFIC METHODS - NEW
  createXenditPayment: async (id_headtransaksi) => {
    try {
      console.log('🟦 Creating Xendit payment for head transaksi:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payment/xendit/create-payment/${id_headtransaksi}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      console.log('✅ Xendit payment response:', response);
      return response;
    } catch (error) {
      console.error('Error creating Xendit payment:', error);
      throw error;
    }
  },

  checkXenditPaymentStatus: async (invoice_id) => {
    try {
      console.log('🟦 Checking Xendit payment status for invoice:', invoice_id);
      const response = await apiRequest(`${API_BASE_URL}/payment/xendit/status/${invoice_id}`, {
        method: 'GET',
      });
      console.log('✅ Xendit status response:', response);
      return response;
    } catch (error) {
      console.error('Error checking Xendit payment status:', error);
      throw error;
    }
  },

  // DOKU SPECIFIC METHODS - Keep as backup
  createDokuPayment: async (id_headtransaksi) => {
    try {
      console.log('🟨 Creating DOKU payment for head transaksi:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payment/doku/create-payment/${id_headtransaksi}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      console.log('✅ DOKU payment response:', response);
      return response;
    } catch (error) {
      console.error('Error creating DOKU payment:', error);
      throw error;
    }
  },

  checkDokuPaymentStatus: async (order_id) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/payment/doku/status/${order_id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error checking DOKU payment status:', error);
      throw error;
    }
  },

  // MIDTRANS SPECIFIC METHODS - Keep as backup
  createMidtransToken: async (id_headtransaksi) => {
    try {
      console.log('🟩 Creating Midtrans token for head transaksi:', id_headtransaksi);
      const response = await apiRequest(`${API_BASE_URL}/payment/midtrans/create-token/${id_headtransaksi}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return response;
    } catch (error) {
      console.error('Error creating Midtrans token:', error);
      throw error;
    }
  },

  checkMidtransPaymentStatus: async (order_id) => {
    try {
      const response = await apiRequest(`${API_BASE_URL}/payment/midtrans/status/${order_id}`, {
        method: 'GET',
      });
      return response;
    } catch (error) {
      console.error('Error checking Midtrans payment status:', error);
      throw error;
    }
  },

  // HELPER METHODS - NEW
  getPaymentGateway: () => {
    // Detect current gateway from environment
    return import.meta.env.VITE_PAYMENT_GATEWAY || 'xendit';
  },

  // Complete transaction flow helper
  createCompleteTransaction: async (headTransaksiData, detailTransaksiArray) => {
    try {
      console.log('🔄 Creating complete transaction...');
      
      // Step 1: Create head transaksi
      const headResponse = await transaksiService.createHeadTransaksi(headTransaksiData);
      
      if (!headResponse.success) {
        throw new Error(headResponse.message || 'Failed to create head transaksi');
      }

      const headTransaksiId = headResponse.data.id_headtransaksi;
      console.log('✅ Head transaksi created with ID:', headTransaksiId);

      // Step 2: Create multiple detail transaksi
      const detailsWithHeadId = detailTransaksiArray.map(detail => ({
        ...detail,
        id_headtransaksi: headTransaksiId
      }));

      const detailResponse = await transaksiService.createMultipleDetailTransaksi(detailsWithHeadId);
      
      if (!detailResponse.success) {
        throw new Error(detailResponse.message || 'Failed to create detail transaksi');
      }

      console.log('✅ Detail transaksi created:', detailResponse.data.length, 'records');

      // Step 3: Create payment token (auto-routes to configured gateway)
      const paymentResponse = await transaksiService.createPaymentToken(headTransaksiId);
      
      if (!paymentResponse.success) {
        throw new Error(paymentResponse.message || 'Failed to create payment token');
      }

      console.log('✅ Payment token created successfully');

      return {
        success: true,
        data: {
          headTransaksi: headResponse.data,
          detailTransaksi: detailResponse.data,
          payment: paymentResponse.data,
          id_headtransaksi: headTransaksiId
        }
      };

    } catch (error) {
      console.error('❌ Complete transaction error:', error);
      throw new Error(error.message || 'Gagal membuat transaksi lengkap');
    }
  },

  // Payment status poller helper
  pollPaymentStatus: async (orderId, onStatusChange, maxAttempts = 60, intervalMs = 5000) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        console.log(`🔄 Polling payment status (${attempts}/${maxAttempts}):`, orderId);
        
        const statusResponse = await transaksiService.checkPaymentStatus(orderId);
        
        if (statusResponse.success) {
          const status = statusResponse.data.booking_status || statusResponse.data.transaction_status;
          
          // Call the callback with status update
          if (onStatusChange) {
            onStatusChange(status, statusResponse.data);
          }
          
          // Stop polling if payment is complete or failed
          if (status === 'paid' || status === 'settlement' || status === 'expired' || status === 'failed') {
            console.log('✅ Payment polling completed with status:', status);
            return { status, data: statusResponse.data };
          }
        }
        
        // Continue polling if max attempts not reached
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          console.log('⏰ Payment polling timeout reached');
          return { status: 'timeout', data: null };
        }
        
      } catch (error) {
        console.error('❌ Error polling payment status:', error);
        
        // Continue polling on error (network issues etc)
        if (attempts < maxAttempts) {
          setTimeout(poll, intervalMs);
        } else {
          throw error;
        }
      }
    };
    
    // Start polling
    return poll();
  }
};

// Add environment info helper
transaksiService.getEnvironmentInfo = () => {
  return {
    apiBaseUrl: API_BASE_URL,
    paymentGateway: transaksiService.getPaymentGateway(),
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD
  };
};

// Log environment info on import
console.log('🔧 TransaksiService Environment:', transaksiService.getEnvironmentInfo());

