// src/user/LanjutkanPembayaran.jsx - Separate component for continue payment
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { transaksiService } from '../services/transaksiService';
import Footer from './footer';
import { 
  ChevronLeft, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

const LanjutkanPembayaran = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { headTransaksiId } = useParams();
  
  // Get data from state or use headTransaksiId from URL
  const ticketData = location.state?.ticket;
  const transactionId = headTransaksiId || location.state?.id_headtransaksi;
  
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [countdown, setCountdown] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Initialize payment continuation
  const initializeContinuePayment = async () => {
    if (!transactionId) {
      setError('ID transaksi tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Continuing payment for transaction:', transactionId);
      
      // 1. Get transaction status first
      const statusCheck = await transaksiService.checkPaymentStatusByHeadTransaksi(transactionId);
      
      if (statusCheck.success && statusCheck.data) {
        const { transaction_status, booking_code, gross_amount } = statusCheck.data;
        
        // Check if already paid
        if (['paid', 'settlement', 'capture'].includes(transaction_status)) {
          setPaymentStatus('paid');
          setPaymentData({
            booking_code,
            status: 'paid',
            amount: gross_amount
          });
          setLoading(false);
          return;
        }
        
        // Check if expired/failed
        if (['expired', 'failed'].includes(transaction_status)) {
          setError(`Pembayaran ${transaction_status}. Silakan buat pesanan baru.`);
          setLoading(false);
          return;
        }
      }
      
      // 2. Try to get existing payment first
      const existingPayment = await transaksiService.getExistingPayment(transactionId);
      
      if (existingPayment.success && existingPayment.data) {
        const payment = existingPayment.data;
        
        // Check if payment is still valid
        if (payment.expiry_time) {
          const expiryTime = new Date(payment.expiry_time);
          const now = new Date();
          
          if (now < expiryTime && payment.transaction_status === 'pending') {
            console.log('✅ Using existing valid payment');
            setPaymentData(payment);
            setPaymentStatus(payment.transaction_status);
            
            // Set countdown
            const remainingSeconds = Math.floor((expiryTime - now) / 1000);
            setCountdown(Math.max(0, remainingSeconds));
            
            setLoading(false);
            return;
          }
        }
      }
      
      // 3. Create new payment if no valid existing payment
      console.log('🆕 Creating new payment...');
      const response = await transaksiService.createPaymentToken(transactionId);
      
      if (response.success) {
        setPaymentData(response.data);
        setPaymentStatus(response.data.status || 'pending');
        
        // Set countdown for new payment (15 minutes)
        setCountdown(15 * 60); // 15 minutes in seconds
        
        console.log('✅ New payment created successfully');
      } else {
        throw new Error(response.message || 'Gagal membuat pembayaran baru');
      }
      
    } catch (error) {
      console.error('❌ Error continuing payment:', error);
      setError(error.message || 'Gagal melanjutkan pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && paymentStatus === 'pending') {
      setPaymentStatus('expired');
      setError('Waktu pembayaran telah habis');
    }
  }, [countdown, paymentStatus]);

  // Format countdown
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle payment action
  const handlePayNow = () => {
    if (paymentData?.snap_redirect_url || paymentData?.invoice_url) {
      const paymentUrl = paymentData.snap_redirect_url || paymentData.invoice_url;
      console.log('🚀 Opening payment URL:', paymentUrl);
      window.open(paymentUrl, '_blank');
    } else {
      console.warn('⚠️ No payment URL available');
      setError('URL pembayaran tidak tersedia');
    }
  };

  // Retry payment
  const handleRetryPayment = async () => {
    setRetryCount(prev => prev + 1);
    setError(null);
    await initializeContinuePayment();
  };

  // Check payment status
  const checkPaymentStatus = async () => {
    try {
      setLoading(true);
      const response = await transaksiService.checkPaymentStatusByHeadTransaksi(transactionId);
      
      if (response.success && response.data) {
        const status = response.data.transaction_status;
        setPaymentStatus(status);
        
        if (status === 'paid') {
          setPaymentData(prev => ({
            ...prev,
            status: 'paid',
            booking_code: response.data.booking_code
          }));
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize on mount
  useEffect(() => {
    initializeContinuePayment();
  }, [transactionId]);

  // Auto-check payment status every 10 seconds
  useEffect(() => {
    if (paymentStatus === 'pending' && paymentData) {
      const interval = setInterval(checkPaymentStatus, 10000);
      return () => clearInterval(interval);
    }
  }, [paymentStatus, paymentData, transactionId]);

  // Loading state
  if (loading && !paymentData) {
    return (
      <>
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-lg">Memproses pembayaran...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/tiket-saya')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Lanjutkan Pembayaran</h1>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
            {!['expired', 'failed'].some(status => error.includes(status)) && (
              <button 
                onClick={handleRetryPayment}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Coba Lagi ({retryCount})
              </button>
            )}
          </div>
        )}

        {/* Payment Status */}
        <div className={`rounded-lg p-6 mb-6 ${
          paymentStatus === 'paid' ? 'bg-green-50 border-l-4 border-green-500' :
          paymentStatus === 'expired' ? 'bg-orange-50 border-l-4 border-orange-500' :
          paymentStatus === 'failed' ? 'bg-red-50 border-l-4 border-red-500' :
          'bg-blue-50 border-l-4 border-blue-500'
        }`}>
          <div className="flex items-center mb-3">
            {paymentStatus === 'paid' && <CheckCircle className="w-6 h-6 text-green-600 mr-2" />}
            {paymentStatus === 'pending' && <Clock className="w-6 h-6 text-blue-600 mr-2" />}
            {paymentStatus === 'expired' && <XCircle className="w-6 h-6 text-orange-600 mr-2" />}
            {paymentStatus === 'failed' && <XCircle className="w-6 h-6 text-red-600 mr-2" />}
            
            <h2 className={`text-xl font-bold ${
              paymentStatus === 'paid' ? 'text-green-800' :
              paymentStatus === 'expired' ? 'text-orange-800' :
              paymentStatus === 'failed' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {paymentStatus === 'paid' ? 'Pembayaran Berhasil!' :
               paymentStatus === 'expired' ? 'Pembayaran Kedaluwarsa' :
               paymentStatus === 'failed' ? 'Pembayaran Gagal' :
               'Menunggu Pembayaran'}
            </h2>
          </div>
          
          {/* Countdown for pending payments */}
          {paymentStatus === 'pending' && countdown > 0 && (
            <div className="text-blue-700">
              <p className="font-medium">Sisa waktu pembayaran: {formatCountdown()}</p>
              <p className="text-sm mt-1">Selesaikan pembayaran sebelum waktu habis</p>
            </div>
          )}
          
          {/* Success message */}
          {paymentStatus === 'paid' && paymentData && (
            <div className="text-green-700">
              <p className="font-medium">Pembayaran telah berhasil diproses</p>
              <p className="text-sm mt-1">Kode Booking: {paymentData.booking_code}</p>
            </div>
          )}
        </div>

        {/* Transaction Info */}
        {(ticketData || paymentData) && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-lg font-bold mb-4">Detail Perjalanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Rute</div>
                <div className="font-medium">
                  {ticketData?.kota_awal || 'N/A'} → {ticketData?.kota_tujuan || 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tanggal Keberangkatan</div>
                <div className="font-medium">
                  {ticketData?.waktu_keberangkatan ? 
                    new Date(ticketData.waktu_keberangkatan).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    }) : 'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Waktu Keberangkatan</div>
                <div className="font-medium">
                  {ticketData?.waktu_keberangkatan ? 
                    new Date(ticketData.waktu_keberangkatan).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'
                  }
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Pembayaran</div>
                <div className="font-bold text-lg text-purple-600">
                  Rp {(paymentData?.gross_amount || ticketData?.total || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4">Aksi Pembayaran</h3>
          
          {paymentStatus === 'pending' && paymentData && countdown > 0 && (
            <div className="space-y-4">
              <button
                onClick={handlePayNow}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <CreditCard className="w-6 h-6 mr-2" />
                Bayar Sekarang
                <ExternalLink className="w-4 h-4 ml-2" />
              </button>
              
              <button
                onClick={checkPaymentStatus}
                disabled={loading}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Periksa Status Pembayaran
              </button>
            </div>
          )}
          
          {paymentStatus === 'paid' && (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-bold text-xl">✅ Pembayaran Berhasil!</div>
              <button
                onClick={() => navigate('/tiket-saya')}
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
              >
                Lihat E-Tiket
              </button>
            </div>
          )}
          
          {(paymentStatus === 'expired' || paymentStatus === 'failed') && (
            <div className="text-center space-y-4">
              <div className={`font-bold text-xl ${
                paymentStatus === 'expired' ? 'text-orange-600' : 'text-red-600'
              }`}>
                {paymentStatus === 'expired' ? '⏰ Pembayaran Kedaluwarsa' : '❌ Pembayaran Gagal'}
              </div>
              <p className="text-gray-600 mb-4">
                {paymentStatus === 'expired' 
                  ? 'Waktu pembayaran telah habis. Silakan buat pesanan baru.'
                  : 'Pembayaran tidak dapat diproses. Silakan coba lagi atau buat pesanan baru.'
                }
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200"
                >
                  Buat Pesanan Baru
                </button>
                <button
                  onClick={() => navigate('/tiket-saya')}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium transition-all duration-200"
                >
                  Kembali ke Tiket Saya
                </button>
              </div>
            </div>
          )}
          
          {countdown === 0 && paymentStatus === 'pending' && (
            <div className="text-center space-y-4">
              <div className="text-orange-600 font-bold text-xl">⏰ Waktu Pembayaran Habis</div>
              <p className="text-gray-600 mb-4">
                Pembayaran tidak dapat dilanjutkan karena waktu telah habis.
              </p>
              <button
                onClick={handleRetryPayment}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Buat Pembayaran Baru
              </button>
            </div>
          )}
        </div>

        {/* Back to Tiket Saya */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/tiket-saya')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Kembali ke Tiket Saya
          </button>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default LanjutkanPembayaran;