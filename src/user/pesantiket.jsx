import React, { useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';

const PesanTiket = () => {
  
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [accommodation, setAccommodation] = useState('Bus');
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [animationState, setAnimationState] = useState('');
  const navigate = useNavigate();

  const ticketResults = [
    {
      id: 1,
      fromCity: 'GROGOL',
      fromCode: '04:20',
      toCity: 'CIAMPELAS',
      toCode: '09:50',
      duration: '5 jam',
      amenities: ['TV Pribadi', 'Free WiFi', 'Free Snack'],
      price: 150000,
      originalPrice: 180000,
      promo: true,
      busType: "Largest",
      capacity: "28 Kursi",
      format: "2-2",
      facilities: ["AC", "Hiburan Sentral", "Wi-Fi", "Kursi Recliner", "Selimut", "Mineral dan Snack"]
    },
    {
      id: 2,
      fromCity: 'TEBET',
      fromCode: '03:15',
      toCity: 'CIAMPELAS',
      toCode: '09:45',
      duration: '6 jam 30 menit',
      amenities: ['TV Pribadi', 'Free WiFi', 'Free Snack'],
      price: 165000,
      originalPrice: 165000,
      promo: false,
      busType: "Executive",
      capacity: "24 Kursi",
      format: "2-1",
      facilities: ["AC", "Wi-Fi", "Kursi Recliner", "Selimut"]
    },
    {
      id: 3,
      fromCity: 'GROGOL',
      fromCode: '04:30',
      toCity: 'CIAMPELAS',
      toCode: '09:30',
      duration: '5 jam',
      amenities: ['TV Pribadi', 'Free WiFi', 'Free Snack'],
      price: 150000,
      originalPrice: 150000,
      promo: false,
      busType: "Standard",
      capacity: "36 Kursi",
      format: "2-2",
      facilities: ["AC", "Hiburan Sentral", "Wi-Fi"]
    },
    {
      id: 4,
      fromCity: 'SPBU RAWAMANGUN',
      fromCode: '05:30',
      toCity: 'DIPATIKUR',
      toCode: '10:45',
      duration: '5 jam 15 menit',
      amenities: ['TV Pribadi', 'Free WiFi', 'Free Snack'],
      price: 145000,
      originalPrice: 175000,
      promo: true,
      busType: "VIP",
      capacity: "18 Kursi",
      format: "1-1",
      facilities: ["AC", "Hiburan Sentral", "Wi-Fi", "Kursi Recliner", "Selimut", "Mineral dan Snack", "USB Charger"]
    },
    {
      id: 5,
      fromCity: 'GROGOL',
      fromCode: '06:30',
      toCity: 'DIPATIKUR',
      toCode: '11:30',
      duration: '5 jam',
      amenities: ['TV Pribadi', 'Free WiFi', 'Free Snack'],
      price: 120000,
      originalPrice: 120000,
      promo: false,
      busType: "Economy",
      capacity: "40 Kursi",
      format: "2-2",
      facilities: ["AC", "Wi-Fi"]
    }
  ];

  const handleViewDetail = (ticket) => {
    setSelectedTicket(ticket);
    setAnimationState('entering');
    setShowDetailPopup(true);
  };

  const handleBuyTicket = (ticket) => {
    navigate('/pemesanan-1', { state: { ticket } });
  };
  const handleClosePopup = () => {
    setAnimationState('exiting');
    setTimeout(() => {
      setShowDetailPopup(false);
      setAnimationState('');
    }, 300); 
  };

  const DetailPopup = ({ ticket, onClose }) => {
    if (!ticket) return null;
    
    const handleBackdropClick = (e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };
    
    return (
      <div 
        className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/30 transition-opacity duration-300 ${animationState === 'entering' ? 'animate-fadeIn' : animationState === 'exiting' ? 'animate-fadeOut' : ''}`}
        onClick={handleBackdropClick}
      >
        <div className={`bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden shadow-xl transition-all duration-300 ${animationState === 'entering' ? 'animate-popIn' : animationState === 'exiting' ? 'animate-popOut' : ''}`}>
          <div className="p-4 flex justify-between items-center bg-white border-b">
            <h2 className="text-xl font-bold">Detail Armada</h2>
            <button 
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 hover:rotate-90 transition-transform duration-300"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6 bg-gray-50">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-1/2">
                <div className="mb-6">
                  <p className="font-bold">Tipe Bus: {ticket.busType || 'Largest'}</p>
                  <p className="font-bold">Kapasitas Kursi: {ticket.capacity || '28 Kursi'}</p>
                  <p className="font-bold">Format Kursi: {ticket.format || '2-2'}</p>
                </div>
                
                <div>
                  <p className="font-bold mb-2">Fasilitas:</p>
                  <div className="grid grid-cols-2 gap-y-2">
                    {[
                      { icon: '🧊', label: 'AC' },
                      { icon: '📺', label: 'Hiburan Sentral' },
                      { icon: '📶', label: 'Wi-Fi' },
                      { icon: '🪑', label: 'Kursi Recliner' },
                      { icon: '🛌', label: 'Selimut' },
                      { icon: '🧴', label: 'Mineral dan Snack' }
                    ].map((facility, index) => (
                      <div key={index} className="flex items-center">
                        <span className="inline-block w-6 h-6 mr-2 text-purple-600">{facility.icon}</span>
                        <span>{facility.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:w-1/2 mt-4 md:mt-0">
                <img 
                  src="/api/placeholder/600/400" 
                  alt="Bus interior" 
                  className="w-full h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-transform"
                />
              </div>
            </div>

            <div className="mt-6 border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Informasi Tiket</h3>
              <div className="mb-4">
                <h4 className="font-bold mb-2">Cara Pakai Tiket</h4>
                <ul className="list-disc pl-6 space-y-2">
                  {[
                    'Sesampainya di titik keberangkatan, Anda harus menunjukkan e-tiket ke staf bus dan mendapatkan tiket kertas dari operator',
                    'E-tiket Berkelana akan terbit setelah pembayaran anda di konfirmasi',
                    'Anda dapat menggunakan e-tiket dan tanda pengenal ke titik keberangkatan',
                    'Waktu berangkat, tipe bus atau shuttle dapat berubah sewaktu-waktu karena alesan operasional'
                  ].map((instruction, index) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-100 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="/images/janke-laskowski-jz-ayLjk2nk-unsplash.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold text-black mb-8">Cari Tiketmu!</h1>
          
          {/* Search Form */}
          <div className="bg-purplelight rounded-lg p-3 w-full max-w-350 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
              <div className="flex flex-col md:col-span-3">
                <label className=" relative right-36 text-gray-600 text-sm mb-1">Dari</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg cursor-pointer"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                >
                  <option value="">Pilih Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Malang">Malang</option>
                </select>
              </div>
              
              <div className="flex items-end justify-center md:col-span-1 pb-1 pt-7">
                <ArrowLeftRight className="text-black" size={20} />
              </div>
              
              <div className="flex flex-col md:col-span-3">
                <label className=" relative right-38 text-gray-600 text-sm mb-1">Ke</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg cursor-pointer"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                >
                  <option value="">Pilih Kota</option>
                  <option value="Bali">Bali</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Medan">Medan</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                </select>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className=" relative right-7 text-gray-600 text-sm mb-1">Tanggal Pergi</label>
                <div className="relative">
                  <input 
                    type="date" 
                    placeholder="Pilih Tanggal" 
                    className="w-full border border-gray-200 p-2 rounded text-gray-800 bg-white shadow-lg cursor-pointer"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1">Pilih Akomodasi</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg cursor-pointer"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                >
                  <option value="Bus">Bus</option>
                  <option value="Kereta">Shuttle</option>
                </select>
              </div>
              
              <div className="md:col-span-1 flex items-end">
                <button className="relative left-0 top-3 bg-emerald1 hover:bg-green-600 text-black font-bold p-2 rounded focus:outline-none w-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform duration-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">Cari</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hasil Search */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Menampilkan 5 Jadwal Terbaik</h2>
          
          {/* Ticket Results*/}
          <div className="space-y-8">
            {ticketResults.map((ticket) => (
              <div key={ticket.id} className="bg-neutral-100 rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition-transform duration-300">
                {ticket.promo && (
                  <div className="bg-red-600 text-white text-sm font-bold py-1 px-4 inline-block">
                    Gampang habis!
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex flex-row">
                    {/* asal */}
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="relative">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center">
                              <div className="relative left-4 h-6 w-6 rounded-full bg-emerald1"></div>
                              <span className="font-bold text-xl ml-3 relative left-5">{ticket.fromCity}</span>
                            </div>
                            <span className="text-gray-600 ml-11 relative left-3.5" >{ticket.fromCode}</span>
                          </div>
                          
                          <div className="absolute left-6.5 top-9" style={{width: '2px', height: '130px', backgroundColor: '#33CB98'}}>
                            <span className="absolute left-8 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
                              {ticket.duration}
                            </span>
                          </div>
                          
                          {/* tujuan */}
                          <div className="flex flex-col items-start" style={{marginTop: '120px'}}>
                            <div className="flex items-center">
                              <div className="relative left-4 h-6 w-6 rounded-full bg-emerald1"></div>
                              <span className="font-bold text-xl ml-3 relative left-5">{ticket.toCity}</span>
                            </div>
                            <span className="text-gray-600 ml-11 relative left-3.5">{ticket.toCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* fasilitas */}
                    <div className="flex flex-col justify-between">
                      <div className="flex flex-col space-y-2 mb-4">
                        <div className="flex flex-wrap gap-2">
                          {ticket.amenities.map((amenity, index) => (
                            <span key={index} className="px-3 py-1 border border-purple-800 rounded-full text-xs text-black font-semibold">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        
                        {/* View Detail */}
                        <div>
                          <button 
                            onClick={() => handleViewDetail(ticket)}
                            className="relative left-46 text-purple-700 text-sm cursor-pointer hover:underline"
                          >
                            View Detail
                          </button>
                        </div>
                      </div>
                      
                      {/* harga dan beli button*/}
                      <div className="flex flex-col items-end">
                        {ticket.originalPrice > ticket.price && (
                          <div className="text-sm text-gray-500 line-through">
                            Rp {ticket.originalPrice.toLocaleString('id-ID')}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                          Rp {ticket.price.toLocaleString('id-ID')}
                        </div>
                        <button 
                          className="bg-emerald1 hover:bg-green-600 text-black text-sm font-bold py-2 px-6 rounded-lg mt-1 cursor-pointer hover:scale-110 transition-transform duration-300"
                          onClick={() => handleBuyTicket(ticket)}
                        >
                          Beli
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Detail Popup */}
      {showDetailPopup && (
        <DetailPopup 
          ticket={selectedTicket} 
          onClose={handleClosePopup} 
        />
      )}
      
      <Footer />
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes popIn {
          0% {
            opacity: 0;
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes popOut {
          0% {
            opacity: 1;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.9);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out forwards;
        }
        
        .animate-fadeOut {
          animation: fadeOut 0.3s ease-in-out forwards;
        }
        
        .animate-popIn {
          animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .animate-popOut {
          animation: popOut 0.3s cubic-bezier(0.6, -0.28, 0.735, 0.045) forwards;
        }
      `}</style>
    </>
  );
};

export default PesanTiket;