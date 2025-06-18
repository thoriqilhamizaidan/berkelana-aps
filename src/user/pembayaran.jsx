// 🎯 FINAL CLEAN VERSION - Pembayaran.jsx (Hapus duplikasi)

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './footer';
import { ChevronLeft, Copy, Check, Ticket, CreditCard, ExternalLink, Clock, Shield, X, Gift, AlertCircle, CheckCircle } from 'lucide-react';
import { Icon } from '@iconify/react'; 
import { transaksiService } from '../services/transaksiService';

const Pembayaran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticket, formData, passengerSeats, id_headtransaksi, totalPrice, detailTransaksi } = location.state || {};
  
  const [countdown, setCountdown] = useState(900);
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  // Promo states
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [originalTotal, setOriginalTotal] = useState(0);
  const [paymentAttempts, setPaymentAttempts] = useState(0);

  // Get number of passengers
  const getPassengerCount = () => {
    if (!formData) return 0;
    return [formData.namaPenumpang1, formData.namaPenumpang2, formData.namaPenumpang3].filter(Boolean).length;
  };
  
  // Calculate price breakdown with promo
  const calculatePriceBreakdown = () => {
    const passengerCount = getPassengerCount();
    const ticketPrice = ticket?.harga || 150000;
    const baseTotal = ticketPrice * passengerCount;
    const adminFee = 10000;
    const subtotal = baseTotal + adminFee;
    
    let discount = 0;
    let finalTotal = subtotal;
    
    if (appliedPromo) {
      if (appliedPromo.jenis_promo === 'persen') {
        discount = Math.floor((subtotal * appliedPromo.potongan) / 100);
      } else if (appliedPromo.jenis_promo === 'nominal') {
        discount = appliedPromo.potongan;
      }
      discount = Math.min(discount, subtotal);
      finalTotal = subtotal - discount;
    }
    
    return {
      ticketPrice: baseTotal,
      adminFee: adminFee,
      subtotal: subtotal,
      discount: discount,
      total: finalTotal,
      savings: discount
    };
  };

  const savePromoToDatabase = async (promoData) => {
    try {
      if (!id_headtransaksi) {
        console.error('No head transaksi ID available');
        setPromoError('Error: Data transaksi tidak ditemukan');
        setLoading(false);
        return;
      }
      
      // ✅ CRITICAL FIX: Calculate discount properly
      let discount = 0;
      const currentSubtotal = calculatePriceBreakdown().subtotal;
      
      if (promoData.jenis_promo === 'persen') {
        discount = Math.floor((currentSubtotal * promoData.potongan) / 100);
      } else if (promoData.jenis_promo === 'nominal') {
        discount = promoData.potongan;
      }
      
      // Ensure discount doesn't exceed subtotal
      discount = Math.min(discount, currentSubtotal);
      const newTotal = currentSubtotal - discount;
      
      const updateData = {
        id_promo: promoData.id_promo,
        promo_code: promoData.kode_promo,
        promo_discount: discount,  // ✅ FIXED: Use calculated discount
        new_total: newTotal        // ✅ FIXED: Use calculated new total
      };
      
      console.log('🎁 Saving promo to database with correct amounts:', updateData);
      console.log('💰 Expected new total:', newTotal);
      
      // ✅ CRITICAL: Set loading BEFORE calling API
      setLoading(true);
      
      const response = await transaksiService.updateHeadTransaksiWithPromo(id_headtransaksi, updateData);
      
      if (response.success) {
        console.log('✅ Promo saved successfully');
        
        // ✅ IMPORTANT: Clear current payment data to force recreation
        setPaymentData(null);
        
        // ✅ Wait for database update to complete
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // ✅ FORCE: Create new payment with updated amount
        console.log('🔄 Creating new payment with discounted amount...');
        const newPayment = await transaksiService.createPaymentToken(id_headtransaksi);
        
        if (newPayment.success) {
          setPaymentData(newPayment.data);
          console.log('🎉 Payment recreated with correct amount:', newPayment.data.amount);
          
          // ✅ VERIFY: Log the amount comparison
          console.log('💯 Amount verification:', {
            expected: newTotal,
            actual: newPayment.data.amount,
            matches: newPayment.data.amount === newTotal
          });
          
          // Update countdown if needed
          if (newPayment.data.expires_at) {
            const expiryTime = new Date(newPayment.data.expires_at);
            const now = new Date();
            const remainingSeconds = Math.floor((expiryTime - now) / 1000);
            if (remainingSeconds > 0) {
              setCountdown(remainingSeconds);
            }
          }
        } else {
          throw new Error(newPayment.message || 'Failed to recreate payment');
        }
        
        setError(null);
      } else {
        console.error('❌ Failed to save promo:', response.message);
        setPromoError('Gagal menyimpan promo. Coba lagi.');
        setAppliedPromo(null);
      }
    } catch (error) {
      console.error('Error saving promo:', error);
      setPromoError('Gagal menyimpan promo. Coba lagi.');
      setAppliedPromo(null);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced initializePayment with promo restoration
  const initializePayment = async () => {
    if (!id_headtransaksi) {
      setError('Data transaksi tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('🔄 Initializing payment for head transaksi:', id_headtransaksi);
      
      // Check database status FIRST
      const statusCheck = await transaksiService.checkPaymentStatusByHeadTransaksi(id_headtransaksi);
      
      if (statusCheck.success && statusCheck.data) {
        const { 
          transaction_status, 
          booking_status, 
          head_status, 
          head_payment_status,
          booking_code, 
          gross_amount,
          invoice_id,
          promo_code,
          promo_discount,
          debug_statuses 
        } = statusCheck.data;
        
        console.log('📊 Database status check result:', debug_statuses);
        
        // ✅ Restore promo state from database
        if (promo_code && promo_discount) {
          console.log('🎁 Restoring promo from database:', promo_code);
          setAppliedPromo({
            kode_promo: promo_code,
            potongan: promo_discount,
            jenis_promo: 'nominal',
            judul: `Promo ${promo_code}`
          });
          setPromoSuccess(`Promo "${promo_code}" telah diterapkan`);
        }
        
        // Check if already paid
        const isPaid = ['paid', 'settlement', 'capture'].includes(transaction_status) || 
                      ['paid', 'settlement', 'capture'].includes(booking_status) ||
                      ['paid', 'settlement', 'capture'].includes(head_status) ||
                      ['paid', 'settlement', 'capture'].includes(head_payment_status);
        
        if (isPaid) {
          console.log('✅ Payment already completed in database!');
          setPaymentStatus('paid');
          setPaymentData({
            booking_code,
            status: 'paid',
            transaction_status: 'paid',
            gross_amount,
            invoice_id
          });
          
          setSuccessData({
            booking_code,
            invoice_id,
            amount: gross_amount,
            promo_applied: appliedPromo
          });
          
          setError(null);
          setLoading(false);
          const breakdown = calculatePriceBreakdown();
          setOriginalTotal(breakdown.total);
          return;
        }
      }
      
      // Check existing payment
      const existingPayment = await transaksiService.getExistingPayment(id_headtransaksi);
      
      if (existingPayment.success && existingPayment.data) {
        const payment = existingPayment.data;
        console.log('📋 Found existing payment:', payment.order_id);
        
        setPaymentData(payment);
        setPaymentStatus(payment.transaction_status || 'pending');
        
        if (payment.expiry_time) {
          const expiryTime = new Date(payment.expiry_time);
          const now = new Date();
          const remainingSeconds = Math.floor((expiryTime - now) / 1000);
          if (remainingSeconds > 0) {
            setCountdown(remainingSeconds);
          }
        }
      } else {
        // Create new payment
        console.log('🆕 Creating new payment...');
        const response = await transaksiService.createPaymentToken(id_headtransaksi);
        
        if (response.success) {
          setPaymentData(response.data);
          setPaymentStatus(response.data.status || 'pending');
          
          if (response.data.expires_at) {
            const expiryTime = new Date(response.data.expires_at);
            const now = new Date();
            const remainingSeconds = Math.floor((expiryTime - now) / 1000);
            if (remainingSeconds > 0) {
              setCountdown(remainingSeconds);
            }
          }
        } else {
          throw new Error(response.message || 'Gagal membuat pembayaran');
        }
      }
      
      const breakdown = calculatePriceBreakdown();
      setOriginalTotal(breakdown.total);
      setError(null);
      
    } catch (error) {
      console.error('❌ Payment initialization error:', error);
      setError(error.message || 'Gagal menginisialisasi pembayaran');
    } finally {
      setLoading(false);
    }
  };

  // Initialize payment when component mounts
  useEffect(() => {
    initializePayment();
  }, []);

  // Handle promo code validation
  const handlePromoCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setPromoError('Masukkan kode promo');
      return;
    }
    
    setPromoLoading(true);
    setPromoError('');
    setPromoSuccess('');
    
    try {
      const currentTotal = calculatePriceBreakdown().subtotal;
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/promo/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kode_promo: promoCode.trim(),
          total_amount: currentTotal
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setAppliedPromo(data.data);
        const promoName = data.data.judul || data.data.nama_promo || 'Promo';
        setPromoSuccess(`Promo "${promoName}" berhasil diterapkan! 🎉`);
        setPromoCode('');
        
        // ✅ Set loading true only when saving promo
        setLoading(true);
        await savePromoToDatabase(data.data);
        
      } else {
        setPromoError(data.message || 'Kode promo tidak valid');
      }
    } catch (error) {
      console.error('Promo validation error:', error);
      setPromoError('Gagal memvalidasi kode promo. Coba lagi.');
    } finally {
      setPromoLoading(false);
    }
  };

  // ✅ CLEAN: Button state logic
  const getPaymentButtonState = () => {
    if (loading) {
      return {
        disabled: true,
        text: 'Memproses...',
        className: 'bg-gray-300 text-gray-500 cursor-not-allowed'
      };
    }
    
    if (paymentStatus === 'paid') {
      return {
        disabled: true,
        text: 'Pembayaran Berhasil ✅',
        className: 'bg-green-600 text-white cursor-not-allowed'
      };
    }
    
    if (paymentStatus === 'failed') {
      return {
        disabled: true,
        text: 'Pembayaran Gagal ❌',
        className: 'bg-red-600 text-white cursor-not-allowed'
      };
    }
    
    if (paymentStatus === 'expired') {
      return {
        disabled: true,
        text: 'Pembayaran Kedaluwarsa ⏰',
        className: 'bg-red-600 text-white cursor-not-allowed'
      };
    }
    
    if (paymentData?.invoice_url && paymentStatus === 'pending') {
      return {
        disabled: false,
        text: 'Bayar Sekarang',
        className: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
      };
    }
    
    return {
      disabled: true,
      text: 'Memproses...',
      className: 'bg-gray-300 text-gray-500 cursor-not-allowed'
    };
  };

  // ✅ Payment button component
  const PaymentButton = () => {
    const buttonState = getPaymentButtonState();
    
    return (
      <button
        onClick={handlePayNow}
        disabled={buttonState.disabled}
        className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center ${buttonState.className}`}
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Memproses...
          </>
        ) : paymentStatus === 'pending' && paymentData?.invoice_url ? (
          <>
            <CreditCard className="w-5 h-5 mr-2" />
            Bayar Sekarang
            <ExternalLink className="w-4 h-4 ml-2" />
          </>
        ) : paymentStatus === 'paid' ? (
          <>
            <Check className="w-5 h-5 mr-2" />
            Pembayaran Berhasil ✅
          </>
        ) : paymentStatus === 'failed' ? (
          <>
            <X className="w-5 h-5 mr-2" />
            Pembayaran Gagal ❌
          </>
        ) : paymentStatus === 'expired' ? (
          <>
            <Clock className="w-5 h-5 mr-2" />
            Pembayaran Kedaluwarsa ⏰
          </>
        ) : (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Memproses...
          </>
        )}
      </button>
    );
  };

  // Remove applied promo
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoSuccess('');
    setPromoError('');
    setPromoCode('');
  };
  
  const handleCopyBookingCode = () => {
    if (paymentData?.booking_code) {
      navigator.clipboard.writeText(paymentData.booking_code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleRetryPayment = () => {
    setError(null);
    setLoading(true);
    setPaymentAttempts(0);
    initializePayment();
  };

  const handlePayNow = () => {
    if (paymentData?.invoice_url && paymentStatus === 'pending') {
      console.log('🚀 Opening payment URL:', paymentData.invoice_url);
      window.open(paymentData.invoice_url, '_blank');
    } else {
      console.warn('⚠️ Payment not available:', {
        hasUrl: !!paymentData?.invoice_url,
        status: paymentStatus
      });
    }
  };

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPaymentStatus('expired');
    }
  }, [countdown]);

  // Format countdown
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Enhanced polling
  useEffect(() => {
    if (!paymentData?.invoice_id || paymentStatus !== 'pending') {
      return;
    }
    
    let isActive = true;
    let attempts = 0;
    const maxAttempts = 20;
    
    const checkStatus = async () => {
      if (!isActive) return;
      
      attempts++;
      console.log(`🔄 Status check attempt ${attempts}/${maxAttempts}`);
      
      try {
        const directCheck = await transaksiService.checkDirectXenditStatus(paymentData.invoice_id);
        
        if (directCheck.success && directCheck.data.payment_complete) {
          console.log('✅ PAYMENT COMPLETE DETECTED!');
          
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const statusCheck = await transaksiService.checkPaymentStatus(paymentData.invoice_id);
          
          if (statusCheck.success && statusCheck.data.transaction_status === 'paid') {
            console.log('🎉 Payment confirmed as PAID!');
            setPaymentStatus('paid');
            setShowSuccessPopup(true);
            return;
          }
        }
        
        if (attempts < maxAttempts && isActive) {
          setTimeout(checkStatus, 6000);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        if (attempts < maxAttempts && isActive) {
          setTimeout(checkStatus, 6000);
        }
      }
    };
    
    const timeoutId = setTimeout(checkStatus, 3000);
    
    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [paymentData?.invoice_id, paymentStatus]);

  // Message listener
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        setSuccessData({
          booking_code: paymentData?.booking_code,
          invoice_id: paymentData?.invoice_id,
          amount: paymentData?.amount,
          promo_applied: appliedPromo
        });
        setShowSuccessPopup(true);
        setPaymentStatus('paid');
      } else if (event.data.type === 'PAYMENT_FAILED') {
        setPaymentStatus('failed');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paymentData, appliedPromo]);
  
  const priceBreakdown = calculatePriceBreakdown();

  // Loading state
  if (loading && !paymentData) {
    return (
      <>
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <span className="ml-3 text-lg">Memproses pembayaran...</span>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && !paymentData) {
    return (
      <>
        <div className="max-w-6xl mx-auto py-6 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <Icon icon="material-symbols:error" className="w-6 h-6 mr-2" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
            <button 
              onClick={handleRetryPayment}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Coba Lagi
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Pembayaran</h1>
        </div>
        
        {paymentStatus !== 'paid' && (
          <p className="text-gray-600 mb-6">
            Selesaikan pembayaran dalam {formatCountdown()}
          </p>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side */}
          <div className="lg:col-span-2">
            
            {/* Payment Status */}
            {paymentStatus !== 'pending' && (
              <div className={`rounded-lg p-4 mb-6 border-l-4 ${
                paymentStatus === 'paid' ? 'bg-green-50 border-green-500' :
                paymentStatus === 'failed' ? 'bg-red-50 border-red-500' :
                paymentStatus === 'expired' ? 'bg-orange-50 border-orange-500' :
                'bg-blue-50 border-blue-500'
              }`}>
                <div className={`font-medium ${
                  paymentStatus === 'paid' ? 'text-green-800' :
                  paymentStatus === 'failed' ? 'text-red-800' :
                  paymentStatus === 'expired' ? 'text-orange-800' :
                  'text-blue-800'
                }`}>
                  {paymentStatus === 'paid' ? '✅ Pembayaran Berhasil!' :
                   paymentStatus === 'failed' ? '❌ Pembayaran Gagal' :
                   paymentStatus === 'expired' ? '⏰ Pembayaran Kedaluwarsa' :
                   '⏳ Memproses Pembayaran...'}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {paymentStatus === 'paid' ? 'Pembayaran Anda telah berhasil diproses' :
                   paymentStatus === 'failed' ? 'Silakan coba lagi atau hubungi customer service' :
                   paymentStatus === 'expired' ? 'Silakan buat pembayaran baru' :
                   'Silakan tunggu beberapa saat...'}
                </div>
              </div>
            )}
            
            {/* Booking Code */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
              <h2 className="text-xl font-bold mb-4">Kode Booking</h2>
              <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {loading && !paymentData?.booking_code ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      paymentData?.booking_code || 'Generating...'
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Simpan kode booking ini untuk referensi Anda
                  </p>
                  {paymentData?.booking_code && (
                    <button
                      onClick={handleCopyBookingCode}
                      className="flex items-center justify-center mx-auto text-purple-600 hover:text-purple-700 text-sm"
                    >
                      {copied ? <Check size={16} className="mr-1" /> : <Copy size={16} className="mr-1" />}
                      {copied ? 'Tersalin!' : 'Salin Kode'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Data Pemesanan */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
              <h2 className="text-xl font-bold mb-4">Data Pemesanan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-700">Nama Pemesan</div>
                  <div className="text-gray-900">{formData?.namaPesanan || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700">Email</div>
                  <div className="text-gray-900">{formData?.email || 'N/A'}</div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700">No. Handphone</div>
                  <div className="text-gray-900">{formData?.noHandphone || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            {/* Promo Code Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6 mb-6 border border-green-200">
              {!appliedPromo ? (
                <>
                  <div className="flex items-center mb-4">
                    <Gift className="w-6 h-6 text-green-600 mr-2" />
                    <h3 className="text-lg font-bold text-green-800">Punya Kode Promo?</h3>
                  </div>
                  
                  <form onSubmit={handlePromoCodeSubmit} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Masukkan kode promo..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          disabled={promoLoading}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={promoLoading || !promoCode.trim()}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                          promoLoading || !promoCode.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg'
                        }`}
                      >
                        {promoLoading ? (
                          <div className="flex items-center">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Cek...
                          </div>
                        ) : (
                          'Terapkan'
                        )}
                      </button>
                    </div>
                    
                    {/* Error/Success Messages */}
                    {promoError && (
                      <div className="flex items-start bg-red-50 border border-red-200 rounded-lg p-3">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{promoError}</span>
                      </div>
                    )}
                    
                    {promoSuccess && (
                      <div className="flex items-start bg-green-50 border border-green-200 rounded-lg p-3">
                        <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-green-700 text-sm">{promoSuccess}</span>
                      </div>
                    )}
                  </form>
                </>
              ) : (
                /* Applied Promo Display */
                <div className="bg-green-100 border border-green-300 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Gift className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <div className="font-bold text-green-800">
                          {appliedPromo.judul || appliedPromo.nama_promo}
                        </div>
                        <div className="text-sm text-green-600">
                          Hemat Rp {priceBreakdown.savings.toLocaleString()} 
                          ({appliedPromo.jenis_promo === 'persen' ? `${appliedPromo.potongan}%` : `Rp ${appliedPromo.potongan.toLocaleString()}`})
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                      title="Hapus promo"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Payment Details */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-6 mb-6">
              <h3 className="font-bold text-lg mb-4">Rincian Pembayaran</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Bus {ticket?.kendaraan?.tipe_armada || 'Berkelana'} {ticket?.kota_awal || ''} - {ticket?.kota_tujuan || ''} (x{getPassengerCount()})</span>
                  <span>Rp {priceBreakdown.ticketPrice.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Biaya layanan</span>
                  <span>Rp {priceBreakdown.adminFee.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">Rp {priceBreakdown.subtotal.toLocaleString()}</span>
                </div>
                
                {/* Promo Discount Display */}
                {appliedPromo && priceBreakdown.discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center">
                      <Gift className="w-4 h-4 mr-1" />
                      Diskon ({appliedPromo.judul || appliedPromo.nama_promo})
                    </span>
                    <span>-Rp {priceBreakdown.discount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                  <span className="font-bold text-lg">TOTAL PEMBAYARAN</span>
                  <div className="text-right">
                    {appliedPromo && priceBreakdown.discount > 0 && (
                      <div className="text-sm text-gray-500 line-through">
                        Rp {priceBreakdown.subtotal.toLocaleString()}
                      </div>
                    )}
                    <span className="font-bold text-xl text-purple-600">
                      Rp {priceBreakdown.total.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Savings Display */}
                {appliedPromo && priceBreakdown.savings > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                    <div className="text-center text-green-700">
                      <span className="font-medium">🎉 Anda hemat Rp {priceBreakdown.savings.toLocaleString()}!</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Payment Method Section */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Metode Pembayaran</h3>
              
              {/* Payment Status Indicator */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-800">
                      Status: {paymentStatus === 'pending' ? 'Menunggu Pembayaran' : 
                               paymentStatus === 'paid' ? 'Pembayaran Berhasil' :
                               paymentStatus === 'failed' ? 'Pembayaran Gagal' :
                               paymentStatus === 'expired' ? 'Pembayaran Kedaluwarsa' : 'Unknown'}
                    </span>
                  </div>
                  {paymentData?.gateway === 'xendit' && (
                    <div className="text-sm text-blue-600 font-medium">
                      Powered by Xendit
                    </div>
                  )}
                </div>
              </div>
              
              {/* XENDIT Payment Methods */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 text-blue-600 mr-2" />
                  <h4 className="font-bold text-lg text-blue-800">Bayar dengan Xendit</h4>
                </div>
                
                <p className="text-center mb-4 text-sm text-gray-700">
                  Pilih metode pembayaran yang Anda inginkan
                </p>
                
                {/* Payment Options Preview */}
                <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                  <div className="text-center mb-3">
                    <div className="text-sm text-gray-600 mb-1">Total Pembayaran</div>
                    {appliedPromo && priceBreakdown.discount > 0 && (
                      <div className="text-lg text-gray-400 line-through mb-1">
                        Rp {priceBreakdown.subtotal.toLocaleString()}
                      </div>
                    )}
                    <div className="text-2xl font-bold text-gray-800">
                      Rp {priceBreakdown.total.toLocaleString()}
                    </div>
                    {appliedPromo && priceBreakdown.savings > 0 && (
                      <div className="text-sm text-green-600 font-medium">
                        Hemat Rp {priceBreakdown.savings.toLocaleString()}!
                      </div>
                    )}
                  </div>
                  
                  {/* Available Payment Methods Icons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="flex flex-col items-center text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <Icon icon="logos:visa" className="w-8 h-5 mb-1" />
                      <span>Kartu Kredit</span>
                    </div>
                    <div className="flex flex-col items-center text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <img src="/public/images/va-logo.svg" alt="Virtual Account" className="w-6 h-6 mb-1" />
                      <span>Virtual Account</span>
                    </div>
                    <div className="flex flex-col items-center text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <img src="/public/images/qris.png" alt="QRIS" className="w-6 h-6 mb-1" />
                      <span>QRIS</span>
                    </div>
                    <div className="flex flex-col items-center text-xs text-gray-600 p-2 bg-gray-50 rounded">
                      <img src="/public/images/ewallet-logo.svg" alt="E-Wallet" className="w-6 h-6 mb-1" />
                      <span>E-Wallet</span>
                    </div>
                  </div>
                </div>
                
                {/* Main Payment Button */}
                <div className="text-center">
                  <PaymentButton />
                  
                  {/* Status Message Below Button */}
                  {paymentStatus !== 'pending' && (
                    <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                      paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                      paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                      paymentStatus === 'expired' ? 'bg-orange-100 text-orange-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {paymentStatus === 'paid' ? '✅ Pembayaran telah berhasil diproses' :
                      paymentStatus === 'failed' ? '❌ Pembayaran gagal, silakan coba lagi' :
                      paymentStatus === 'expired' ? '⏰ Waktu pembayaran habis, buat pembayaran baru' :
                      '⏳ Sedang memproses pembayaran...'}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">
                    Dengan mengklik "Bayar Sekarang", Anda akan diarahkan ke halaman pembayaran Xendit yang aman
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Pembayaran akan otomatis terverifikasi dalam 1-3 menit setelah berhasil
                  </p>
                </div>
                
                {/* Security Info */}
                <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <Shield className="w-5 h-5 text-green-600 mr-2 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <div className="font-medium mb-1">Pembayaran Aman & Terpercaya</div>
                      <ul className="text-xs space-y-1">
                        <li>• Transaksi dilindungi enkripsi SSL 256-bit</li>
                        <li>• Data kartu tidak disimpan oleh sistem kami</li>
                        <li>• Refund otomatis jika pembayaran gagal</li>
                        <li>• Certified PCI DSS Level 1</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Trip Details */}
          <div className="lg:col-span-1">
            <div className="bg-purple-100 rounded-lg p-4 sticky top-4">
              <h3 className="font-bold text-lg mb-3">
                {ticket?.waktu_keberangkatan ? 
                  new Date(ticket.waktu_keberangkatan).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric', 
                    month: 'long',
                    year: 'numeric'
                  }) : 
                  'Tanggal tidak tersedia'
                }
              </h3>
              
              <div className="flex items-center mb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 mb-1.5 mr-2"></div>
                    <div className="font-bold text-black">{ticket?.kota_awal?.toUpperCase() || 'KOTA ASAL'}</div>
                  </div>
                  <div className="ml-6 text-sm">
                    {ticket?.waktu_keberangkatan ? 
                      new Date(ticket.waktu_keberangkatan).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : 
                      'N/A'
                    }
                  </div>
                  <div className="ml-6 text-xs text-gray-600">
                    Terminal {ticket?.kota_asal || 'N/A'}
                  </div>
                </div>
                
                <div className="flex-grow text-center mb-18">
                  <div className="border-t-2 border-dashed border-gray-400 w-16 mx-auto"></div>
                </div>
                
                <div className="flex-1 text-right mb-4">
                  <div className="flex items-center justify-end">
                    <div className="font-bold text-black">{ticket?.kota_tujuan?.toUpperCase() || 'KOTA TUJUAN'}</div>
                    <div className="w-4 h-4 rounded-full bg-emerald-500 mb-1.5 ml-2"></div>
                  </div>
                  <div className="mr-6 text-sm">
                    {ticket?.waktu_sampai ? 
                      new Date(ticket.waktu_sampai).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                      }) : 
                      'N/A'
                    }
                  </div>
                  <div className="mr-6 text-xs text-gray-600">
                    Terminal {ticket?.kota_tujuan || 'N/A'}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                Estimasi waktu: {(() => {
                  if (ticket?.waktu_keberangkatan && ticket?.waktu_sampai) {
                    const start = new Date(ticket.waktu_keberangkatan);
                    const end = new Date(ticket.waktu_sampai);
                    const diffMs = end - start;
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    if (hours === 0) {
                      return `${minutes} menit`;
                    } else if (minutes === 0) {
                      return `${hours} jam`;
                    } else {
                      return `${hours} jam ${minutes} menit`;
                    }
                  }
                  return '5 jam perjalanan';
                })()}
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="font-bold mb-1">Tipe Bus: {ticket?.kendaraan?.tipe_armada || 'Largest'}</div>
                <div className="text-sm text-gray-700">Kapasitas Kursi: {ticket?.kendaraan?.kapasitas_kursi || '28'} Kursi</div>
                <div className="text-sm text-gray-700">Format Kursi: {ticket?.kendaraan?.format_kursi || '2-2'}</div>
              </div>
              
              <div className="pt-3">
                <div className="font-bold mb-1">Fasilitas:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {ticket?.kendaraan?.fasilitas ? (
                    ticket.kendaraan.fasilitas.map((fasilitas, index) => {
                      let icon;
                      switch(fasilitas.toLowerCase()) {
                        case 'ac':
                          icon = <Icon icon="mynaui:air-conditioner-solid" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'wifi':
                        case 'wi-fi':
                          icon = <Icon icon="material-symbols:wifi-rounded" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'toilet':
                          icon = <Icon icon="mdi:toilet" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'tv':
                        case 'hiburan sentral':
                          icon = <Icon icon="f7:tv-fill" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'reclining seat':
                        case 'kursi recliner':
                          icon = <Icon icon="ph:seat-fill" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'charging port':
                          icon = <Icon icon="mdi:power-plug" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'snack':
                        case 'mineral dan snack':
                          icon = <Icon icon="tabler:bottle-filled" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'selimut':
                          icon = <Icon icon="material-symbols:bed" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        case 'bantal':
                          icon = <Icon icon="mdi:pillow" className="w-5 h-5 mr-2 text-purple-600" />;
                          break;
                        default:
                          icon = <Icon icon="mdi:check-circle" className="w-5 h-5 mr-2 text-purple-600" />;
                      }
                      return (
                        <div key={index} className="flex items-center">
                          {icon}
                          <span>{fasilitas}</span>
                        </div>
                      );
                    })
                  ) : (
                    // Fallback jika tidak ada data fasilitas
                    <>
                      <div className="flex items-center">
                        <Icon icon="mynaui:air-conditioner-solid" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>AC</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon="f7:tv-fill" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>Hiburan Sentral</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon="material-symbols:wifi-rounded" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>Wi-Fi</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon="ph:seat-fill" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>Kursi Recliner</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon="material-symbols:bed" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>Selimut</span>
                      </div>
                      <div className="flex items-center">
                        <Icon icon="tabler:bottle-filled" className="w-5 h-5 mr-2 text-purple-600" />
                        <span>Mineral dan Snack</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {/* Promo Summary in Sidebar */}
              {appliedPromo && (
                <div className="mt-4 pt-3 border-t border-purple-200">
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <Gift className="w-4 h-4 text-green-600 mr-2" />
                      <span className="font-bold text-green-800 text-sm">Promo Aktif</span>
                    </div>
                    <div className="text-xs text-green-700">
                      <div className="font-medium">{appliedPromo.judul || appliedPromo.nama_promo}</div>
                      <div>Hemat: Rp {priceBreakdown.savings.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-xl">
            <div className="bg-green-600 text-white p-4 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h2 className="text-xl font-bold">Pembayaran Berhasil!</h2>
            </div>
            
            <div className="p-6 text-center">
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600 mb-2">✅ PAID</div>
                <p className="text-gray-600">Pembayaran Anda telah berhasil diproses</p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4 text-left">
                <div className="text-sm text-gray-600 mb-1">Kode Booking:</div>
                <div className="font-bold text-lg">{successData?.booking_code}</div>
                
                <div className="text-sm text-gray-600 mt-2 mb-1">Invoice ID:</div>
                <div className="font-mono text-sm">{successData?.invoice_id}</div>
                
                <div className="text-sm text-gray-600 mt-2 mb-1">Total Dibayar:</div>
                <div className="font-bold">Rp {successData?.amount?.toLocaleString()}</div>
                
                {/* Show promo savings in success popup */}
                {successData?.promo_applied && priceBreakdown.savings > 0 && (
                  <>
                    <div className="text-sm text-gray-600 mt-2 mb-1">Promo Digunakan:</div>
                    <div className="text-green-600 font-medium">
                      {successData.promo_applied.judul || successData.promo_applied.nama_promo} 
                      (Hemat Rp {priceBreakdown.savings.toLocaleString()})
                    </div>
                  </>
                )}
              </div>
              
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
                >
                  Kembali ke Beranda
                </button>
                <button 
                  onClick={() => setShowSuccessPopup(false)}
                  className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Pembayaran;