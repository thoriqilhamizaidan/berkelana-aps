import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';
import { ChevronLeft, Copy, Check, Ticket } from 'lucide-react';
import { Icon } from '@iconify/react'; 

const Pembayaran = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticket, formData, passengerSeats, totalPrice } = location.state || {};
  
  const [countdown, setCountdown] = useState(900); // 15 minutes in seconds
  const [copied, setCopied] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [bookingCode] = useState('BKL' + Math.random().toString(36).substring(2, 8).toUpperCase());
  
  // Format countdown to minutes and seconds
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
    // Handle countdown expiry
  }, [countdown]);
  
  // Get number of passengers
  const getPassengerCount = () => {
    if (!formData) return 0;
    return [formData.namaPenumpang1, formData.namaPenumpang2, formData.namaPenumpang3].filter(Boolean).length;
  };
  
  // Calculate the price breakdown
  const calculatePriceBreakdown = () => {
    const passengerCount = getPassengerCount();
    const ticketPrice = 150000; // Per ticket price
    const baseTotal = ticketPrice * passengerCount;
    const adminFee = 10000;
    
    return {
      ticketPrice: baseTotal,
      adminFee: adminFee,
      total: baseTotal + adminFee
    };
  };
  
  const handlePromoCodeSubmit = (e) => {
    e.preventDefault();
    // Promo code logic would go here
    console.log('Promo code submitted:', promoCode);
  };
  
  const handleCopyClick = () => {
    navigator.clipboard.writeText(bookingCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Simulate payment completion and navigate to e-ticket
  const handlePaymentComplete = () => {
    // In a real application, you would verify payment completion first
    navigate(`/e-ticket/${bookingCode}`, { 
      state: { 
        bookingCode,
        ticket, 
        formData, 
        passengerSeats,
        priceBreakdown: calculatePriceBreakdown()
      } 
    });
  };
  
  // For future payment gateway integration
  const initializePaymentGateway = () => {
    // This would be where you initialize your payment gateway SDK
    console.log('Payment gateway would be initialized here');
  };
  
  // Call payment gateway initialization on component mount
  useEffect(() => {
    initializePaymentGateway();
  }, []);
  
  const priceBreakdown = calculatePriceBreakdown();

  return (
    <>
      
      
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Back button and title */}
        <div className="flex items-center mb-4">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Pemesanan Anda!</h1>
        </div>
        
        <p className="text-gray-600 mb-6">Review pesanan Anda dan lakukan pembayaran</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Main Content */}
          <div className="lg:col-span-2">
            {/* Data Pemesanan Display */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
              <h2 className="text-xl font-bold mb-4">Data Pemesanan</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold text-gray-700">Nama Pemesan</div>
                  <div className="text-gray-900">{formData?.namaPesanan || 'Nasywa Putri Nataliza'}</div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700">Email</div>
                  <div className="text-gray-900">{formData?.email || 'natalizanasywaputri@gmail.com'}</div>
                </div>
                
                <div>
                  <div className="font-semibold text-gray-700">No. Handphone</div>
                  <div className="text-gray-900">{formData?.noHandphone || '081249401599'}</div>
                </div>
              </div>
            </div>
            
            {/* Promo Code Section */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-4 mb-6">
              <form onSubmit={handlePromoCodeSubmit} className="flex items-center">
                <Ticket size={20} className="text-gray-700 mr-2" />
                <span className="mr-3 font-medium">Redeem kode promo</span>
                <input
                  type="text"
                  placeholder=""
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white ml-auto"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
              </form>
            </div>
            
            {/* Payment Details */}
            <div className="bg-neutral-100 rounded-lg shadow-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-3">
                <span>Bus Berkelana Grogol - Ciampelas (x{getPassengerCount()})</span>
                <span>Rp {priceBreakdown.ticketPrice.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span>Biaya layanan</span>
                <span>Rp {priceBreakdown.adminFee.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between items-center mt-3">
                <span className="font-bold">TOTAL PEMBAYARAN</span>
                <span className="font-bold text-xl">Rp {priceBreakdown.total.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Payment Method Section */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Metode Pembayaran</h3>
              
              {/* QRIS Payment */}
              <div className="bg-neutral-100 rounded-lg p-6">
                <p className="text-center mb-2">Kode hanya akan berlaku selama {formatCountdown()}</p>
                
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-3 rounded-lg border border-gray-300 w-64 h-64 flex items-center justify-center">
                    {/* QR code */}
                    <img 
                      src="/qris.png" 
                      alt="QRIS Payment Code"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjxnIHRyYW5zZm9ybT0idHJhbnNsYXRlKDUwLDUwKSI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSIwIiB5PSIwIiBmaWxsPSIjMDAwIi8+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSIxMCIgeT0iMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgeD0iMjAiIHk9IjAiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTQh1Y1JjA3yW21RewAhxjanvaUoSkVZF3PwIi8+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSI0MCIgeT0iMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgeD0iNTQh1Y1JjA3yW21RewAhxjanvaUoSkVZF3PjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTQh1Y1JjA3yW21RewAhxjanvaUoSkVZF3PwIi8+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiB4PSI3MCIgeT0iMCIgZmlsbD0iIzAwMCIvPjxyZWN0IHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgeD0iODAiIHk9IjAiIGZpbGw9IiMwMDAiLz48cmVjdCB3aWR0aD0iMTAiIGhlaWdodD0iMTQh1Y1JjA3yW21RewAhxjanvaUoSkVZF3PwIi8+PC9nPjwvc3ZnPg==";
                      }}
                    />
                  </div>
                </div>
                
                
                
                <p className="text-center text-sm text-gray-500 mb-6">Sumber: QRIS</p>
              </div>
            </div>
          </div>
          
          {/* Right Side - Trip Details */}
          <div className="lg:col-span-1">
            {/* Trip Details - Updated to match image 2 example */}
            <div className="bg-purple-100 rounded-lg p-4 sticky top-4">
              <h3 className="font-bold text-lg mb-3">Selasa, 29 April 2025</h3>
              
              <div className="flex items-center mb-2">
                <div className="flex-1">
                  <div className="flex items-center">
                    <div className="w-4 h-4 rounded-full bg-emerald1 mb-1.5 mr-2"></div>
                    <div className="font-bold text-black">GROGOL</div>
                  </div>
                  <div className="ml-6 text-sm">04:20</div>
                  <div className="ml-6 text-xs text-gray-600">
                    Jl Plaza Mayjen<br />
                    Raya No.111
                  </div>
                </div>
                
                <div className="flex-grow text-center mb-18">
                  <div className="border-t-2 border-dashed border-gray-400 w-16 mx-auto"></div>
                </div>
                
                <div className="flex-1 text-right mb-4">
                  <div className="flex items-center justify-end">
                    <div className="font-bold text-black">CIAMPELAS</div>
                    <div className="w-4 h-4 rounded-full bg-emerald1 mb-1.5 ml-2"></div>
                  </div>
                  <div className="mr-6 text-sm">09:50</div>
                  <div className="mr-6 text-xs text-gray-600">
                    Jl. Ciampelas No GHI
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-700 mb-3">
                Estimasi waktu: 5 jam perjalanan
              </div>
              
              <div className="pt-3 border-t border-gray-200">
                <div className="font-bold mb-1">Tipe Bus: Largest</div>
                <div className="text-sm text-gray-700">Kapasitas Kursi: 28 Kursi</div>
                <div className="text-sm text-gray-700">Format Kursi: 2-2</div>
              </div>
              
              <div className="pt-3 ">
                <div className="font-bold mb-1">Fasilitas:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default Pembayaran;