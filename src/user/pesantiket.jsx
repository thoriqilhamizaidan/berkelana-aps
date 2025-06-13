import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Footer from './footer';
import { Icon } from '@iconify/react'; 
import { jadwalService, kendaraanService } from '../services/api';

const PesanTiket = () => {
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [accommodation, setAccommodation] = useState('Bus');
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [animationState, setAnimationState] = useState('');
  const [ticketResults, setTicketResults] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  
  // Debug state
  const [debugInfo, setDebugInfo] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil parameter dari URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const dateParam = searchParams.get('date');
    const accommodationParam = searchParams.get('accommodation');
    
    if (fromParam) setFromCity(fromParam);
    if (toParam) setToCity(toParam);
    if (dateParam) setDepartDate(dateParam);
    if (accommodationParam) setAccommodation(accommodationParam);
    
    // Simpan parameter pencarian untuk digunakan nanti
    if (fromParam && toParam) {
      // Set flag untuk menandakan ada parameter pencarian
      sessionStorage.setItem('autoSearch', 'true');
    }
  }, [location.search]);
  
  // Lakukan pencarian otomatis setelah cities diload
  useEffect(() => {
    // Hanya jalankan jika cities sudah terload dan ada flag autoSearch
    if (cities.length > 0 && sessionStorage.getItem('autoSearch') === 'true') {
      // Hapus flag agar tidak search berulang kali
      sessionStorage.removeItem('autoSearch');
      // Jalankan pencarian
      handleSearch();
    }
  }, [cities]);
  
  //mapping city
  // Fungsi untuk mendapatkan singkatan kota
  const getCityCode = (city) => {
    const cityCodes = {
      "Jakarta": "JKT",
      "Bandung": "BDG",
      "Surabaya": "SBY",
      "Yogyakarta": "YOG",
      "Solo": "SOL",  // TAMBAHKAN INI
      "Semarang": "SMG",
      "Medan": "MDN",
      "Makassar": "MKS",
      "Palembang": "PLM",
      "Denpasar": "DPS",
      "Malang": "MLG",
      "Batam": "BTM",
      "Balikpapan": "BPP",
      "Bandar Lampung": "BDL",
      "Pontianak": "PTK",
      "Ambon": "AMB",
      "Banjarmasin": "BJM",
      "Manado": "MND",
      "Cirebon": "CRB",
      "Surakarta": "SKT",
      "Jambi": "JMB",
      "Tangerang": "TNG",
      "Bekasi": "BKS",
      "Purwokerto": "PWT",
      // Tambahkan kota lainnya sesuai kebutuhan
    };

  return cityCodes[city] || city.substring(0, 3).toUpperCase(); // default: ambil 3 huruf pertama jika tidak ditemukan
};

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      try {
        console.log('Fetching cities...');
        const response = await jadwalService.getAllJadwal();
        console.log('Response:', response);
        
        const jadwalData = response?.data?.data || response?.data || [];
        console.log('Jadwal data:', jadwalData);
        
        const kotaSet = new Set();
        jadwalData.forEach(j => {
          if (j.kota_awal) kotaSet.add(j.kota_awal);
          if (j.kota_tujuan) kotaSet.add(j.kota_tujuan);
        });
        
        const citiesArray = Array.from(kotaSet).sort();
        console.log('Cities found:', citiesArray);
        setCities(citiesArray);
        
      } catch (err) {
        console.error('Error fetching cities:', err);
        setCities(['Jakarta', 'Bandung', 'Surabaya', 'Yogyakarta', 'Semarang']);
      }
    };

    fetchCities();
  }, []);

  // Fetch best schedules on component mount
  // Ganti fungsi fetchBestSchedules di useEffect dengan ini:
useEffect(() => {
  const fetchBestSchedules = async () => {
    setLoading(true);
    try {
      console.log('Fetching best schedules...');
      const response = await jadwalService.getAllJadwal();
      const jadwalData = response?.data?.data || response?.data || [];
      console.log('Fetched jadwal data:', jadwalData);
      
      if (!jadwalData || jadwalData.length === 0) {
        console.log('No jadwal data found');
        setTicketResults([]);
        setLoading(false);
        return;
      }
  
      // Sort by price and take top 5
      const sortedJadwal = jadwalData
        .sort((a, b) => (a.harga || 0) - (b.harga || 0))
        .slice(0, 5);
      console.log('Sorted jadwal (top 5):', sortedJadwal);

      // Transform using the same function as search
      const transformedResults = await transformJadwalData(sortedJadwal);
      console.log('Transformed results for best schedules:', transformedResults);
      
      if (transformedResults && transformedResults.length > 0) {
        setTicketResults(transformedResults);
        console.log('Ticket results set successfully:', transformedResults.length);
      } else {
        console.log('No transformed results available');
        setTicketResults([]);
      }

    } catch (error) {
      console.error('Error fetching best schedules:', error);
      setTicketResults([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBestSchedules();
}, []);



  // Transform jadwal data helper function
  // Perbaiki fungsi transformJadwalData untuk konsistensi:
const transformJadwalData = async (jadwalData) => {
  const transformedResults = await Promise.all(jadwalData.map(async (jadwal) => {
    try {
      let kendaraan = null;
      
      // Cek apakah kendaraan sudah ada dalam jadwal (dari relasi)
      if (jadwal.Kendaraan) {
        kendaraan = jadwal.Kendaraan;
        console.log('Using existing kendaraan from relation:', kendaraan);
      } else {
        // Fetch kendaraan jika belum ada
        try {
          console.log('Fetching kendaraan for id:', jadwal.id_kendaraan);
          const kendaraanResponse = await kendaraanService.getKendaraanById(jadwal.id_kendaraan);
          kendaraan = kendaraanResponse?.data || {};
          console.log('Fetched kendaraan:', kendaraan);
        } catch (err) {
          console.error('Error fetching kendaraan:', err);
          kendaraan = {
            tipe_armada: 'Bus',
            fasilitas: '[]'
          };
        }
      }
      
      // Parse fasilitas dengan lebih robust
      let fasilitas = [];
      if (kendaraan?.fasilitas) {
        try {
          if (typeof kendaraan.fasilitas === 'string') {
            fasilitas = JSON.parse(kendaraan.fasilitas);
          } else if (Array.isArray(kendaraan.fasilitas)) {
            fasilitas = kendaraan.fasilitas;
          }
        } catch (e) {
          console.error('Error parsing fasilitas:', e);
          console.log('Raw fasilitas data:', kendaraan.fasilitas);
          fasilitas = [];
        }
      }

      console.log('Final fasilitas for jadwal', jadwal.id_jadwal, ':', fasilitas);

      const formatTime = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleTimeString('id-ID', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      };

      const calculateDuration = (start, end) => {
        if (!start || !end) return jadwal.durasi ? `${jadwal.durasi} jam` : 'N/A';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime - startTime;
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}j ${minutes}m`;
      };

      const result = {
        id: jadwal.id_jadwal,
        id_kendaraan: jadwal.id_kendaraan,
        fromCity: jadwal.kota_awal,
        toCity: jadwal.kota_tujuan,
        fromCode: getCityCode(jadwal.kota_awal), // Gunakan fungsi getCityCode
        toCode: getCityCode(jadwal.kota_tujuan),  // Gunakan fungsi getCityCode
        departureTime: formatTime(jadwal.waktu_keberangkatan),
        arrivalTime: formatTime(jadwal.waktu_sampai),
        duration: calculateDuration(jadwal.waktu_keberangkatan, jadwal.waktu_sampai),
        price: jadwal.harga || 0,
        originalPrice: jadwal.id_promo ? (jadwal.harga || 0) + 50000 : null,
        promo: !!jadwal.id_promo,
        busType: kendaraan?.tipe_armada || jadwal.tipe_armada || 'Bus',
        amenities: Array.isArray(fasilitas) ? fasilitas.slice(0, 3) : [], // Ambil max 3 fasilitas
        kendaraan: {
          ...kendaraan,
          fasilitas: fasilitas // Pastikan fasilitas sudah ter-parse
        },
        jadwal: jadwal
      };

      console.log('Final transformed result:', result);
      return result;
    } catch (error) {
      console.error('Error processing jadwal:', error);
      return null;
    }
  }));

  return transformedResults.filter(result => result !== null);
};

const handleSearch = async () => {
  console.log('Search clicked');
  console.log('Form values:', { fromCity, toCity, departDate, accommodation });
  
  if (!fromCity || !toCity) {
    alert('Mohon pilih kota asal dan kota tujuan');
    return;
  }

  setLoading(true);
  setSearchPerformed(true);
  setCurrentPage(1);

  try {
    const filters = {
      kota_awal: fromCity,
      kota_tujuan: toCity
    };
    
    // Hanya tambahkan tipe_armada ke filter jika bukan "Semua" (nilai kosong)
    if (accommodation) {
      filters.tipe_armada = accommodation;
    }
    
    if (departDate) {
      filters.tanggal = departDate;
    }
    
    console.log('=== SEARCH DEBUG ===');
    console.log('Search filters:', filters);
    console.log('From city exact:', `"${fromCity}"`);
    console.log('To city exact:', `"${toCity}"`);
    console.log('Available cities:', cities);
    
    const response = await jadwalService.getJadwalByFilter(filters);
    console.log('Search response:', response);
    
    const jadwalData = response?.data || [];
    console.log('Jadwal data from search:', jadwalData);
    console.log('Number of results:', jadwalData.length);
    
    // Debug: Check if Yogyakarta-Solo exists in all jadwal
    if (fromCity === 'Yogyakarta' && toCity === 'Solo') {
      console.log('=== YOGYAKARTA-SOLO DEBUG ===');
      console.log('Searching for Yogyakarta to Solo route...');
      
      // Get all jadwal to check
      const allJadwalResponse = await jadwalService.getAllJadwal();
      const allJadwal = allJadwalResponse?.data?.data || allJadwalResponse?.data || [];
      
      console.log('All jadwal count:', allJadwal.length);
      
      const yogyaSoloRoutes = allJadwal.filter(j => 
        j.kota_awal === 'Yogyakarta' && j.kota_tujuan === 'Solo'
      );
      
      console.log('Found Yogyakarta-Solo routes in all jadwal:', yogyaSoloRoutes);
      
      if (yogyaSoloRoutes.length > 0) {
        console.log('Yogyakarta-Solo route exists in database but not returned by filter');
        console.log('Check backend filter logic!');
      }
    }
    
    if (!Array.isArray(jadwalData)) {
      console.error('Jadwal data is not an array:', jadwalData);
      setTicketResults([]);
      return;
    }
    
    const transformedResults = await transformJadwalData(jadwalData);
    console.log('Final transformed results:', transformedResults);
    setTicketResults(transformedResults);
    
  } catch (error) {
    console.error('Error searching jadwal:', error);
    alert('Gagal mencari jadwal. Silakan coba lagi.');
    setTicketResults([]);
  } finally {
    setLoading(false);
  }
};

  // Pagination logic
  // Tambahkan ini di bagian atas komponen, setelah state declarations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ticketResults.slice(indexOfFirstItem, indexOfLastItem);
  
  // Tambahkan log untuk debugging
  useEffect(() => {
    console.log('Current items to display:', currentItems);
  }, [currentItems]);
  const totalPages = Math.ceil(ticketResults.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = async (ticket) => {
    try {
      setSelectedTicket({
        ...ticket.kendaraan,
        kota_awal: ticket.fromCity,
        kota_tujuan: ticket.toCity,
        waktu_keberangkatan: ticket.departureTime,
        waktu_sampai: ticket.arrivalTime,
        harga: ticket.price,
        durasi: ticket.duration,
        fasilitas: ticket.kendaraan.fasilitas || [],
        gambar: ticket.kendaraan.gambar
      });
      setAnimationState('entering');
      setShowDetailPopup(true);
    } catch (error) {
      console.error('Error showing detail:', error);
    }
  };

  const handleBuyTicket = (ticket) => {
    navigate('/pemesanan-1', { 
      state: { 
        ticket: {
          ...ticket.jadwal,
          kendaraan: ticket.kendaraan
        }
      }
    });
  };
  

  const handleClosePopup = () => {
    setAnimationState('exiting');
    setTimeout(() => {
      setShowDetailPopup(false);
      setAnimationState('');
    }, 300); 
  };

  const swapCities = () => {
    const temp = fromCity;
    setFromCity(toCity);
    setToCity(temp);
  };

  // GANTI SELURUH KOMPONEN DetailPopup dengan ini:

const DetailPopup = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Ambil URL gambar kendaraan menggunakan kendaraanService
  const vehicleImageUrl = ticket.gambar ? kendaraanService.getImageUrl(ticket.gambar) : null;

  const getFacilityIcon = (facilityName) => {
    const facilityIcons = {
      'AC': 'mynaui:air-conditioner-solid',
      'Air Conditioner': 'mynaui:air-conditioner-solid',
      'Hiburan Sentral': 'f7:tv-fill',
      'TV': 'f7:tv-fill',
      'Entertainment': 'f7:tv-fill',
      'Wi-Fi': 'material-symbols:wifi-rounded',
      'WiFi': 'material-symbols:wifi-rounded',
      'Internet': 'material-symbols:wifi-rounded',
      'Kursi Recliner': 'ph:seat-fill',
      'Recliner': 'ph:seat-fill',
      'Reclining Seat': 'ph:seat-fill',
      'Seat': 'ph:seat-fill',
      'Selimut': 'material-symbols:bed',
      'Blanket': 'material-symbols:bed',
      'Snack': 'tabler:bottle-filled',
      'Mineral dan Snack': 'tabler:bottle-filled',
      'Food': 'tabler:bottle-filled',
      'Mineral': 'tabler:bottle-filled',
      'Toilet': 'material-symbols:wc',
      'WC': 'material-symbols:wc',
      'Kamar Mandi': 'material-symbols:wc',
      'Charging Port': 'material-symbols:charging-station',
      'USB': 'material-symbols:usb',
      'Power': 'material-symbols:power',
      'Bantal': 'material-symbols:bed',
      'Pillow': 'material-symbols:bed',
      'Music': 'material-symbols:music-note',
      'Musik': 'material-symbols:music-note',
      'Reading Light': 'material-symbols:lightbulb',
      'Lampu Baca': 'material-symbols:lightbulb'
    };

    // PERBAIKAN: Exact match dulu, baru partial match
    const facilityNameLower = facilityName.toLowerCase();
    
    // 1. Cari exact match dulu
    const exactMatch = Object.keys(facilityIcons).find(key => 
      key.toLowerCase() === facilityNameLower
    );
    
    if (exactMatch) {
      return facilityIcons[exactMatch];
    }
    
    // 2. Cari partial match (contains)
    const partialMatch = Object.keys(facilityIcons).find(key => 
      facilityNameLower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(facilityNameLower)
    );
    
    if (partialMatch) {
      return facilityIcons[partialMatch];
    }
    
    // 3. Default icon
    return 'material-symbols:check-circle';
  };

  const fasilitas = ticket.fasilitas || [];
  
  // Debug logging
  console.log('=== CURRENT ITEMS DEBUG ===');
  currentItems.forEach(ticket => {
    console.log('Ticket Debug:', {
      id: ticket.id,
      amenities: ticket.amenities,
      amenitiesLength: ticket.amenities?.length,
      kendaraan: ticket.kendaraan,
      kendaraanFasilitas: ticket.kendaraan?.fasilitas
    });
  });

  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md bg-black/30 transition-opacity duration-300 ${animationState === 'entering' ? 'animate-fadeIn' : animationState === 'exiting' ? 'animate-fadeOut' : ''}`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg w-full max-w-3xl mx-4 overflow-hidden shadow-xl transition-all duration-300 ${animationState === 'entering' ? 'animate-popIn' : animationState === 'exiting' ? 'animate-popOut' : ''} scale-[0.85] sm:scale-100`}>
        <div className="p-3 sm:p-4 flex justify-between items-center bg-white border-b">
          <h2 className="text-lg sm:text-xl font-bold">Detail Armada</h2>
          <button 
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 hover:rotate-90 transition-transform duration-300"
          >
            <X size={20} sm:size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2">
              <div className="mb-4 sm:mb-6">
                <p className="font-bold text-sm sm:text-base">Tipe Bus: {ticket.tipe_armada}</p>
                <p className="font-bold text-sm sm:text-base">Kapasitas Kursi: {ticket.kapasitas_kursi}</p>
                <p className="font-bold text-sm sm:text-base">Format Kursi: {ticket.format_kursi}</p>
                <p className="font-bold text-sm sm:text-base">Nomor Armada: {ticket.nomor_armada}</p>
              </div>
              <div>
                <p className="font-bold mb-2 text-sm sm:text-base">Fasilitas:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2">
                  {fasilitas.length > 0 ? (
                    fasilitas.map((f, index) => (
                      <div key={index} className="flex items-center">
                        <Icon 
                          icon={getFacilityIcon(f)} 
                          className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" 
                          style={{ color: '#9966FF' }}
                        />
                        <span className="text-xs sm:text-sm">{f}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center col-span-2">
                      <Icon 
                        icon="material-symbols:info" 
                        className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" 
                        style={{ color: '#9966FF' }}
                      />
                      <span className="text-gray-500 text-xs sm:text-sm">Tidak ada fasilitas tersedia</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="md:w-1/2 mt-4 md:mt-0">
              <img 
                src={vehicleImageUrl || "/images/Detail Armada.png"} 
                alt="Bus interior" 
                className="w-full h-48 sm:h-64 object-cover rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/images/Detail Armada.png"; // Fallback image
                }}
              />
            </div>
          </div>

          <div className="mt-4 sm:mt-6 border-t pt-4 sm:pt-6">
            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Informasi Tiket</h3>
            <ul className="list-disc pl-4 sm:pl-6 space-y-1 sm:space-y-2 text-xs sm:text-sm">
              {[
                'Sesampainya di titik keberangkatan, Anda harus menunjukkan e-tiket ke staf bus dan mendapatkan tiket kertas dari operator',
                'E-tiket Berkelana akan terbit setelah pembayaran anda di konfirmasi',
                'Anda dapat menggunakan e-tiket dan tanda pengenal ke titik keberangkatan',
                'Waktu berangkat, tipe bus atau shuttle dapat berubah sewaktu-waktu karena alesan operasional'
              ].map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-160 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.4)] via-transparent to-transparent z-10"></div>
        <div className="absolute inset-0 z-0">
          <img src="/images/janke-laskowski-jz-ayLjk2nk-unsplash.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-20 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold text-white mb-8">Cari Tiketmu!</h1>
          
          {/* Debug Info */}
          {debugInfo && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
              Debug: {debugInfo}
            </div>
          )}
          
          {/* Search Form */}
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-5 w-full max-w-5xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1 text-left">Dari</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={fromCity}
                  onChange={(e) => setFromCity(e.target.value)}
                >
                  <option value="">Pilih Kota</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center justify-center md:col-span-1">
                <button 
                  onClick={swapCities}
                  className="text-purple-600 hover:text-purple-800 transition-colors duration-200 mt-5"
                >
                  <ArrowLeftRight size={24} />
                </button>
              </div>
              
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1 text-left">Ke</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={toCity}
                  onChange={(e) => setToCity(e.target.value)}
                >
                  <option value="">Pilih Kota</option>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1 text-left">Tanggal Pergi</label>
                <input 
                  type="date" 
                  className="w-full border border-gray-300 p-2 rounded text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={departDate}
                  onChange={(e) => setDepartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1 text-left">Pilih Akomodasi</label>
                <select 
                  className="w-full border border-gray-300 p-2 rounded text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                >
                  <option value="Bus">Bus</option>
                  <option value="Shuttle">Shuttle</option>
                </select>
              </div>
              
              <div className="flex flex-col md:col-span-1">
                <label className="text-gray-600 text-sm mb-1 text-left">&nbsp;</label>
                <button 
                  className="bg-emerald1 hover:bg-green-600 text-black font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-green-500 w-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    <span>Cari</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

       {/* Hasil Search */}
       <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6">
            {!searchPerformed 
              ? 'Menampilkan 5 Jadwal Terbaik'
              : ticketResults.length > 0 
                ? `Menampilkan ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, ticketResults.length)} dari ${ticketResults.length} Jadwal`
                : 'Tidak ada jadwal ditemukan'
            }
          </h2>
          
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-lg">Mencari jadwal...</span>
            </div>
          )}

          {/* No Results */}
          {searchPerformed && !loading && ticketResults.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">Tidak ada jadwal yang ditemukan</p>
              <p className="text-gray-500">Coba ubah kriteria pencarian Anda</p>
            </div>
          )}
          
          {/* Ticket Results */}
          <div className="space-y-8">
            {currentItems.map((ticket) => (
              <div key={ticket.id} className="bg-neutral-100 rounded-lg shadow-md hover:shadow-lg hover:scale-102 transition-transform duration-300">
                {ticket.promo && (
                  <div className="bg-red-600 text-white text-sm font-bold py-1 px-4 inline-block">
                    Gampang habis!
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex flex-row">
                    {/* asal tujuan - TIDAK BERUBAH */}
                    <div className="flex-1">
                            <div className="flex items-start">
                              <div className="relative">
                                <div className="flex flex-col items-start">
                                  <div className="flex items-center">
                                    <div className="relative left-4 h-6 w-6 rounded-full bg-emerald-400"></div>
                                    <span className="font-bold text-xl ml-3 relative left-5">{ticket.fromCity}</span>
                                  </div>
                                  {/* Tambahkan jam keberangkatan */}
                                  <span className="text-gray-800 font-bold ml-11 relative left-3.5">{ticket.departureTime}</span>
                                </div>
                                
                                <div className="absolute left-6.5 top-6.5" style={{width: '4px', height: '160px', backgroundColor: '#33CB98'}}>
                                  <span className="absolute left-8 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
                                    {ticket.duration}
                                  </span>
                                </div>
                                
                                {/* tujuan */}
                                <div className="flex flex-col items-start" style={{marginTop: '120px'}}>
                                  <div className="flex items-center">
                                    <div className="relative left-4 h-6 w-6 rounded-full bg-emerald-400"></div>
                                    <span className="font-bold text-xl ml-3 relative left-5">{ticket.toCity}</span>
                                  </div>
                                  {/* Tambahkan jam kedatangan */}
                                  <span className="text-gray-800 font-bold ml-11 relative left-3.5">{ticket.arrivalTime}</span>
                                </div>
                              </div>
                            </div>
                     </div>
                    
                    {/* PERBAIKAN: fasilitas dengan flexbox normal */}
                    <div className="flex flex-col justify-between" style={{minHeight: '120px'}}>
                      <div className="flex flex-col space-y-2 mb-4">
                        <div className="flex flex-wrap gap-2">
                          {ticket.amenities && ticket.amenities.length > 0 ? (
                            ticket.amenities.map((amenity, index) => (
                              <span key={index} className="px-3 py-1 border border-purple-800 rounded-full text-xs text-black font-semibold">
                                {amenity}
                              </span>
                            ))
                          ) : (
                            <span className="px-3 py-1 border border-gray-400 rounded-full text-xs text-gray-500 font-semibold">
                              Tidak ada fasilitas
                            </span>
                          )}
                        </div>
                        
                        {/* View Detail dengan positioning yang baik */}
                        <div className="flex justify-end mt-2">
                          <button 
                            onClick={() => handleViewDetail(ticket)}
                            className="text-purple-700 text-xs sm:text-sm hover:text-purple-900 hover:underline focus:outline-none transition-colors duration-200 px-2 py-1 sm:px-3 sm:py-1.5 border border-purple-700 rounded-md sm:rounded-lg"
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
                          className="bg-emerald-400 hover:bg-green-600 text-black text-sm font-bold py-2 px-6 rounded-lg mt-1 cursor-pointer hover:scale-110 transition-transform duration-300"
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

          {/* Pagination - TIDAK BERUBAH */}
          {ticketResults.length > itemsPerPage && (
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Previous
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1 ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
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

      {/* CSS yang benar - DI DALAM return statement */}
      <style>{`
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