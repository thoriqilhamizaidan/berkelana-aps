// src/user/tiketsaya.jsx - FIX DUPLICATE KEYS & MULTIPLE CALLS
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { transaksiService } from '../services/transaksiService';
import kendaraanService from '../services/kendaraanService';
import Footer from './footer';
import { 
  Clock, 
  CreditCard, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';

const TiketSaya = () => {
  const navigate = useNavigate();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false); // ✅ FIXED: Start with false instead of true
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState({});
  
  const getStatusInfo = (ticket) => {
    // ✅ PRIORITIZE MAIN STATUS FIRST
    const mainStatus = ticket.status?.toLowerCase();
    const paymentStatus = ticket.payment_status?.toLowerCase();
    
    // ✅ PAID TRANSACTIONS: Always show as completed (HIGHEST PRIORITY)
    if (mainStatus === 'paid') {
      return {
        text: 'Selesai',
        className: 'bg-green-100 text-green-600',
        icon: <CheckCircle className="w-4 h-4" />,
        showContinue: false,
        showDelete: false // ✅ NEVER allow delete for paid transactions
      };
    }
    
    // For non-paid transactions, check payment status and auto-expiry
    const status = ticket.payment_transaction_status || paymentStatus || mainStatus;
    
    const isAutoExpired = () => {
      if (status === 'pending' && ticket.createdAt) {
        const createdAt = new Date(ticket.createdAt);
        const now = new Date();
        const minutesSinceCreated = Math.floor((now - createdAt) / (1000 * 60));
        return minutesSinceCreated >= 15;
      }
      return false;
    };
    
    const autoExpired = isAutoExpired();
    
    switch (status) {
      case 'settlement':
      case 'capture':
      case 'settled':
        // Additional paid statuses
        return {
          text: 'Selesai',
          className: 'bg-green-100 text-green-600',
          icon: <CheckCircle className="w-4 h-4" />,
          showContinue: false,
          showDelete: false
        };
        
      case 'pending':
        if (autoExpired) {
          return {
            text: 'Kedaluwarsa',
            className: 'bg-orange-100 text-orange-600',
            icon: <XCircle className="w-4 h-4" />,
            showContinue: false,
            showDelete: true, // ✅ Allow delete for expired pending
            autoExpired: true
          };
        }
        return {
          text: 'Dalam proses',
          className: 'bg-yellow-100 text-yellow-600',
          icon: <Clock className="w-4 h-4" />,
          showContinue: true,
          showDelete: false
        };
        
      case 'failed':
        return {
          text: 'Pembayaran Gagal',
          className: 'bg-red-100 text-red-600',
          icon: <XCircle className="w-4 h-4" />,
          showContinue: false,
          showDelete: true
        };
        
      case 'expired':
        return {
          text: 'Kedaluwarsa',
          className: 'bg-orange-100 text-orange-600',
          icon: <XCircle className="w-4 h-4" />,
          showContinue: false,
          showDelete: true
        };
        
      case 'cancelled':
      case 'cancel':
        return {
          text: 'Dibatalkan',
          className: 'bg-gray-100 text-gray-600',
          icon: <XCircle className="w-4 h-4" />,
          showContinue: false,
          showDelete: true
        };
        
      default:
        return {
          text: status || 'Tidak diketahui',
          className: 'bg-gray-100 text-gray-600',
          icon: <AlertCircle className="w-4 h-4" />,
          showContinue: false,
          showDelete: false
        };
    }
  };

  // ✅ DEBUG: Log auth state only when it changes significantly
  useEffect(() => {
    console.log('🔍 DEBUG Auth State:', {
      isLoggedIn,
      userId: user?.id_user || user?.id, // ✅ Check both fields
      fullUser: user,
      authLoading
    });
  }, [isLoggedIn, user?.id_user, user?.id, authLoading]);

  // ✅ FIXED: Use useCallback to prevent multiple API calls
  const fetchUserTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // ✅ GET USER ID
      let userId = user?.id || user?.id_user;
      
      if (!userId) {
        try {
          const userDataString = localStorage.getItem('user');
          if (userDataString) {
            const userData = JSON.parse(userDataString);
            userId = userData.id || userData.id_user;
            console.log('📦 Got user ID from localStorage:', userId);
          }
        } catch (err) {
          console.error('Error parsing localStorage user data:', err);
        }
      }
  
      if (!userId) {
        throw new Error('User ID tidak ditemukan. Silakan login ulang.');
      }
      
      console.log('🎫 Fetching tickets for user ID:', userId);
      
      // ✅ FETCH FROM API
      const response = await transaksiService.getTransaksiByUser(userId);
      
      if (response.success) {
        console.log('✅ Tickets fetched successfully:', response.data.length);
        
        // ✅ REMOVE DUPLICATES
        const uniqueTickets = response.data.filter((ticket, index, self) => 
          index === self.findIndex(t => t.id_headtransaksi === ticket.id_headtransaksi)
        );
        
        console.log('🔧 Unique tickets after deduplication:', uniqueTickets.length);
        setTickets(uniqueTickets);
      } else {
        console.error('❌ API returned error:', response);
        setError(response.message || 'Gagal mengambil data tiket');
      }
    } catch (error) {
      console.error('❌ Error fetching tickets:', error);
      setError(`Gagal mengambil data tiket: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]); // ✅ Depend on entire user object

  // ✅ IMPROVED: Better useEffect logic to prevent multiple calls
  useEffect(() => {
    console.log('🔍 UseEffect triggered:', { authLoading, isLoggedIn, user: !!user, tickets: tickets.length, loading, refreshing });
    
    if (authLoading) {
      console.log('⏳ Auth still loading...');
      return;
    }

    if (!isLoggedIn) {
      console.log('🔒 User not logged in, redirecting to login');
      navigate('/login');
      return;
    }

    if (!user) {
      console.log('❌ No user data available');
      setError('Data user tidak ditemukan, silakan login ulang');
      setLoading(false);
      return;
    }

    // ✅ FIXED: Simplified condition - only fetch once
    const userId = user?.id || user?.id_user;
    if (userId && tickets.length === 0 && !refreshing) {
      console.log('✅ User authenticated with ID:', userId, 'fetching tickets...');
      fetchUserTickets();
    } else if (!userId) {
      console.log('❌ User ID still not found:', user);
      setError('User ID tidak ditemukan dalam data pengguna');
      setLoading(false);
    } else if (tickets.length > 0) {
      console.log('🔍 Tickets already loaded, skipping fetch');
    } else {
      console.log('🔍 Skipping fetch:', { userId, ticketsLength: tickets.length, loading, refreshing });
    }
  }, [authLoading, isLoggedIn, user?.id, navigate, tickets.length, refreshing]); // ✅ Only depend on user.id specifically
  
  const handleRefresh = async () => {
    const userId = user?.id || user?.id_user; // ✅ Use correct field
    if (!userId) {
      setError('User tidak ditemukan, silakan login ulang');
      return;
    }
    
    setRefreshing(true);
    setTickets([]); // Clear current tickets to force refresh
    await fetchUserTickets();
    setRefreshing(false);
  };

  const handleContinuePayment = async (ticket) => {
    try {
      setPaymentLoading(prev => ({ ...prev, [ticket.id_headtransaksi]: true }));
      
      console.log('💳 Continue payment for:', ticket.booking_code);
      
      // ✅ NAVIGATE TO PAYMENT PAGE
      navigate(`/lanjutkan-pembayaran/${ticket.id_headtransaksi}`, {
        state: {
          ticket: {
            kota_awal: ticket.kota_awal,
            kota_tujuan: ticket.kota_tujuan,
            waktu_keberangkatan: ticket.waktu_keberangkatan,
            waktu_sampai: ticket.waktu_sampai,
            harga: ticket.harga_tiket,
            total: ticket.total,
            kendaraan: {
              tipe_armada: ticket.tipe_armada,
              nomor_armada: ticket.nomor_armada,
              kapasitas_kursi: 28,
              format_kursi: '2-2'
            }
          },
          formData: {
            namaPesanan: ticket.nama_pemesan,
            email: ticket.email_pemesan,
            noHandphone: ticket.no_hp_pemesan
          }
        }
      });
    } catch (error) {
      console.error('❌ Error continuing payment:', error);
      alert(`Gagal melanjutkan pembayaran: ${error.message}`);
    } finally {
      setPaymentLoading(prev => ({ ...prev, [ticket.id_headtransaksi]: false }));
    }
  };

  const [deleteLoading, setDeleteLoading] = useState({});

// ✅ TAMBAH: Delete ticket function
const handleDeleteTicket = async (ticket) => {
  const statusInfo = getStatusInfo(ticket);
  
  // ✅ PROTECTION: Check if ticket can be deleted
  if (!statusInfo.showDelete) {
    alert('Tiket ini tidak dapat dihapus');
    return;
  }
  
  // ✅ CONFIRM BEFORE DELETE
  const confirmMessage = statusInfo.autoExpired 
    ? `Hapus tiket yang kedaluwarsa?\n\nKode Booking: ${ticket.booking_code || 'N/A'}\nRute: ${ticket.kota_awal} → ${ticket.kota_tujuan}`
    : `Hapus tiket yang ${statusInfo.text.toLowerCase()}?\n\nKode Booking: ${ticket.booking_code || 'N/A'}\nRute: ${ticket.kota_awal} → ${ticket.kota_tujuan}\n\nTindakan ini tidak dapat dibatalkan.`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  try {
    setDeleteLoading(prev => ({ ...prev, [ticket.id_headtransaksi]: true }));
    
    console.log('🗑️ Deleting ticket:', ticket.booking_code);
    
    const response = await transaksiService.deleteTransaction(ticket.id_headtransaksi);
    
    if (response.success) {
      console.log('✅ Ticket deleted successfully');
      
      // ✅ REMOVE FROM UI
      setTickets(prev => prev.filter(t => t.id_headtransaksi !== ticket.id_headtransaksi));
      
      alert('Tiket berhasil dihapus');
    } else {
      throw new Error(response.message || 'Gagal menghapus tiket');
    }
  } catch (error) {
    console.error('❌ Error deleting ticket:', error);
    alert(`Gagal menghapus tiket: ${error.message}`);
  } finally {
    setDeleteLoading(prev => ({ ...prev, [ticket.id_headtransaksi]: false }));
  }
};

  const handleETicketClick = (bookingCode) => {
    navigate(`/e-ticket/${bookingCode}`);
  };

  

  const formatDuration = (start, end) => {
    if (!start || !end) return '5 jam perjalanan';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime - startTime;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) return `${minutes} menit`;
    if (minutes === 0) return `${hours} jam`;
    return `${hours} jam ${minutes} menit`;
  };

  const getBusImage = (imageName) => {
    if (!imageName) return '/images/Bis ungu.png';
    return kendaraanService.getImageUrl(imageName);
  };

  // ✅ IMPROVED: Show loading while auth is loading
  if (authLoading || loading) {
    return (
      <>
        {/* Background Header */}
        <div className="relative bg-cover bg-center h-80" style={{ backgroundImage: "url('/images/backgroundtiketsaya.jpg')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-transparent to-transparent z-1"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
            <h1 className="text-4xl font-bold">Tiket Saya</h1>
            <p className="text-lg mt-2">Check tiket kamu disini!</p>
          </div>
        </div>
        
        <div className="py-8 px-4 bg-neutral1 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-lg">
                {authLoading ? 'Memuat data pengguna...' : 'Memuat tiket Anda...'}
              </span>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // ✅ IMPROVED: Show better error state
  if (error && !tickets.length) {
    return (
      <>
        {/* Background Header */}
        <div className="relative bg-cover bg-center h-80" style={{ backgroundImage: "url('/images/backgroundtiketsaya.jpg')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-transparent to-transparent z-1"></div>
          <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
            <h1 className="text-4xl font-bold">Tiket Saya</h1>
            <p className="text-lg mt-2">Check tiket kamu disini!</p>
          </div>
        </div>
        
        <div className="py-8 px-4 bg-neutral1 min-h-screen">
          <div className="max-w-6xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-6 h-6 mr-2" />
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
              <div className="mt-3 space-x-2">
                <button 
                  onClick={handleRefresh}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  disabled={refreshing}
                >
                  {refreshing ? 'Refreshing...' : 'Coba Lagi'}
                </button>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    navigate('/login');
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Login Ulang
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      {/* Background Header */}
      <div className="relative bg-cover bg-center h-80" style={{ backgroundImage: "url('/images/backgroundtiketsaya.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-transparent to-transparent z-1"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
          <h1 className="text-4xl font-bold">Tiket Saya</h1>
          <p className="text-lg mt-2">Check tiket kamu disini!</p>
        </div>
      </div>

      {/* Tickets List */}
      <div className="py-8 px-4 bg-neutral1 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Error Banner (if any) */}
          {error && (
            <div className="bg-orange-100 border border-orange-400 text-orange-700 px-4 py-3 rounded mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-orange-700 hover:text-orange-900"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Tickets Display */}
          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎫</div>
              <h2 className="text-2xl font-bold text-gray-700 mb-2">Belum Ada Tiket</h2>
              <p className="text-gray-600 mb-6">Anda belum memiliki tiket perjalanan. Pesan tiket pertama Anda sekarang!</p>
              <button 
                onClick={() => navigate('/')}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Pesan Tiket Sekarang
              </button>
            </div>
          ) : (
            <div className="space-y-6">
    {tickets
      .filter(ticket => {
        // Filter tiket yang sudah dibayar saja
        const status = ticket.status?.toLowerCase();
        const paymentStatus = ticket.payment_status?.toLowerCase();
        const transactionStatus = ticket.payment_transaction_status?.toLowerCase();
        
        // Hanya tampilkan tiket dengan status paid, settlement, capture, atau settled
        return status === 'paid' || 
               paymentStatus === 'paid' || 
               transactionStatus === 'settlement' || 
               transactionStatus === 'capture' || 
               transactionStatus === 'settled';
      })
      .map((ticket, index) => {
        const statusInfo = getStatusInfo(ticket);
        
        // ✅ FIX DUPLICATE KEYS: Use combination of id and index
        const uniqueKey = `${ticket.id_headtransaksi}_${index}`;
                
                return (
                  <div key={uniqueKey} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                    <div className="flex p-4">
                      {/* Left Section - Bus Image */}
                      <div className="w-1/4">
                        <img
                          src={getBusImage(ticket.bus_image)}
                          alt="Bus"
                          className="w-full h-40 object-cover rounded"
                          onError={(e) => {
                            e.target.src = '/images/Bis ungu.png';
                          }}
                        />
                      </div>

                      {/* Middle Section - Trip Details */}
                      <div className="w-2/4 pl-6 pr-4 flex flex-col">
                        <div className="flex items-center mb-3">
                          <h3 className="text-lg font-semibold text-black mr-3">
                            {ticket.waktu_keberangkatan ? 
                              new Date(ticket.waktu_keberangkatan).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              }) : 
                              'Tanggal tidak tersedia'
                            }
                          </h3>
                          
                          {/* Status Badge */}
                          <div className={`flex items-center text-xs px-3 py-1 rounded-full font-medium ${statusInfo.className}`}>
                            {statusInfo.icon}
                            <span className="ml-1">{statusInfo.text}</span>
                          </div>
                        </div>

                        {/* Route Information */}
                        <div className="flex flex-col mt-2 relative">
                          {/* Vertical Line */}
                          <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-emerald-500"></div>
                          
                          {/* Departure */}
                          <div className="flex items-center mb-6 relative">
                            <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                            <div className="ml-6">
                              <div className="font-bold text-black uppercase">{ticket.kota_awal || 'KOTA ASAL'}</div>
                              <div className="font-bold text-black">
                                {ticket.waktu_keberangkatan ? 
                                  new Date(ticket.waktu_keberangkatan).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  }) : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-xs text-gray-600">Terminal {ticket.kota_awal || 'N/A'}</div>
                            </div>
                          </div>

                          {/* Duration */}
                          <div className="ml-12 text-sm text-gray-500 mb-3">
                            {formatDuration(ticket.waktu_keberangkatan, ticket.waktu_sampai)}
                          </div>
                          
                          {/* Arrival */}
                          <div className="flex items-center relative">
                            <div className="h-6 w-6 bg-emerald-500 rounded-full flex items-center justify-center z-10">
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            </div>
                            <div className="ml-6">
                              <div className="font-bold text-black uppercase">{ticket.kota_tujuan || 'KOTA TUJUAN'}</div>
                              <div className="font-bold text-black">
                                {ticket.waktu_sampai ? 
                                  new Date(ticket.waktu_sampai).toLocaleTimeString('id-ID', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false
                                  }) : 
                                  'N/A'
                                }
                              </div>
                              <div className="text-xs text-gray-600">Terminal {ticket.kota_tujuan || 'N/A'}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Booking Info */}
                      <div className="w-1/4 flex flex-col justify-between pl-4">
                        <div>
                          {/* Booking Code */}
                          <div className="bg-purple-100 rounded-lg p-3 mb-4">
                            <div className="text-sm font-semibold text-black">
                              Kode Booking: {ticket.booking_code || 'N/A'}
                            </div>
                          </div>
                          
                          {/* Bus & Contact Info */}
                          <div className="space-y-1 text-sm text-gray-600 mb-3">
                            <div>Kode Bus: {ticket.nomor_armada || 'N/A'}</div>
                            <div>No Kondektur: {ticket.nomor_kondektur || 'N/A'}</div>
                            <div className="flex items-center">
                              <Users className="w-4 h-4 mr-1" />
                              {ticket.jumlah_penumpang || 1} Penumpang
                            </div>
                          </div>
                          
                          {/* Price Info */}
                          <div className="text-sm mb-3">
                            <div className="font-bold text-lg text-purple-600">
                              Rp {ticket.total?.toLocaleString() || '0'}
                            </div>
                            {ticket.potongan > 0 && (
                              <div className="text-green-600 text-xs">
                                Hemat Rp {ticket.potongan.toLocaleString()}
                              </div>
                            )}
                          </div>
                          
                          {/* E-Ticket Link */}
                          {statusInfo.text === 'Selesai' && (
                            <div 
                              className="text-sm text-emerald-500 font-medium cursor-pointer hover:underline mb-2"
                              onClick={() => handleETicketClick(ticket.booking_code)}
                            >
                              📱 Lihat E-Tiket
                            </div>
                          )}
                        </div>
                        
                        {/* Continue Payment Button */}
                        {/* Action Buttons */}
                        <div className="space-y-2">
                          {/* Continue Payment Button */}
                          {statusInfo.showContinue && (
                            <button
                              onClick={() => handleContinuePayment(ticket)}
                              disabled={paymentLoading[ticket.id_headtransaksi]}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                                paymentLoading[ticket.id_headtransaksi]
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                              }`}
                            >
                              {paymentLoading[ticket.id_headtransaksi] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Loading...
                                </>
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Lanjutkan Bayar
                                </>
                              )}
                            </button>
                          )}
                          
                          {/* Delete Button */}
                          {statusInfo.showDelete && (
                            <button
                              onClick={() => handleDeleteTicket(ticket)}
                              disabled={deleteLoading[ticket.id_headtransaksi]}
                              className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                                deleteLoading[ticket.id_headtransaksi]
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : statusInfo.autoExpired
                                    ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg'
                                    : 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                              }`}
                              title={statusInfo.autoExpired ? 'Hapus tiket kedaluwarsa' : 'Hapus tiket gagal'}
                            >
                              {deleteLoading[ticket.id_headtransaksi] ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                  Menghapus...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  {statusInfo.autoExpired ? 'Hapus Kedaluwarsa' : 'Hapus Tiket'}
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Back to Home Button */}
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Pesan Tiket Lainnya
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default TiketSaya;