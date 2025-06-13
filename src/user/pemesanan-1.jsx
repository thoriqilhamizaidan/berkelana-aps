import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './footer';
import { ChevronLeft, User, Info } from 'lucide-react';
import { Icon } from '@iconify/react'; 
import { transaksiService } from '../services/api';
import { useAuth } from './context/AuthContext'; // ✅ Import useAuth

const Pemesanan1 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth(); // ✅ Get user data from context
  const ticket = location.state?.ticket || {};
  
  // Mendapatkan jumlah kursi yang tersisa dari data tiket
  const remainingSeats = ticket?.remainingSeats || 0;
  
  const [formData, setFormData] = useState({
    namaPesanan: '',
    noHandphone: '',
    email: '',
    namaPenumpang1: '',
    jenisKelamin1: 'Laki-laki',
    namaPenumpang2: '',
    jenisKelamin2: 'Laki-laki',
    namaPenumpang3: '',
    jenisKelamin3: 'Laki-laki'
  });
  
  const [addSecondPassenger, setAddSecondPassenger] = useState(false);
  const [addThirdPassenger, setAddThirdPassenger] = useState(false);

  // State untuk checkbox "Pemesan adalah penumpang"
  const [isPesananPenumpang, setIsPesananPenumpang] = useState(false);

  // ✅ NEW: Auto-fill user data when component mounts
  useEffect(() => {
    if (isLoggedIn && user) {
      console.log('Auto-filling user data:', user);
      
      // Map user data to form fields - coba berbagai kemungkinan field name
      const userData = {
        namaPesanan: user.nama_user || user.nama_admin || user.nama || '',
        noHandphone: user.no_hp_user || user.no_hp_admin || user.no_hp || user.phone || '',
        email: user.email_user || user.email_admin || user.email || '',
      };

      console.log('Mapped user data:', userData);

      // Update form data with user info
      setFormData(prev => ({
        ...prev,
        ...userData
      }));
    }
  }, [isLoggedIn, user]);

  // Debug: Log user data when component mounts
  useEffect(() => {
    if (user) {
      console.log('DEBUG - User data structure:', user);
      console.log('DEBUG - Gender fields available:', {
        gender_user: user.gender_user,
        gender: user.gender,
        jenis_kelamin: user.jenis_kelamin
      });
    }
  }, [user]);

  // Fungsi untuk handle checkbox "Pemesan adalah penumpang"
  const handlePesananPenumpangChange = (e) => {
    const checked = e.target.checked;
    setIsPesananPenumpang(checked);

    if (checked) {
      // Jika checkbox dicentang, copy data pemesan ke penumpang 1
      // Coba berbagai kemungkinan field name untuk gender
      const userGender = user?.gender_user || user?.gender || user?.jenis_kelamin || 'Laki-laki';
      console.log('User gender detected:', userGender);
      
      setFormData(prev => ({
        ...prev,
        namaPenumpang1: prev.namaPesanan,
        jenisKelamin1: userGender
      }));
    } else {
      // Jika checkbox tidak dicentang, kosongkan data penumpang 1
      setFormData(prev => ({
        ...prev,
        namaPenumpang1: '',
        jenisKelamin1: 'Laki-laki'
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Jika checkbox aktif dan user mengubah data pemesan (nama), 
    // otomatis update nama penumpang 1 juga
    if (isPesananPenumpang && name === 'namaPesanan') {
      setFormData(prev => ({
        ...prev,
        namaPenumpang1: value
      }));
    }
  };

  // Effect untuk sinkronisasi real-time saat checkbox aktif
  useEffect(() => {
    if (isPesananPenumpang) {
      setFormData(prev => ({
        ...prev,
        namaPenumpang1: prev.namaPesanan
      }));
    }
  }, [formData.namaPesanan, isPesananPenumpang]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi form
    if (!formData.namaPesanan || !formData.noHandphone || !formData.email || !formData.namaPenumpang1) {
      alert('Mohon lengkapi semua data yang wajib diisi');
      return;
    }

    try {
      // Hitung jumlah penumpang
      const passengerCount = [
        formData.namaPenumpang1,
        formData.namaPenumpang2,
        formData.namaPenumpang3
      ].filter(Boolean).length;

      // Hitung total
      const ticketPrice = ticket?.harga || 150000;
      const baseTotal = ticketPrice * passengerCount;
      const adminFee = 10000;
      const totalAmount = baseTotal + adminFee;

      // Data untuk head transaksi
      const headTransaksiData = {
        nama_pemesan: formData.namaPesanan,
        no_hp_pemesan: formData.noHandphone,
        email_pemesan: formData.email,
        total: totalAmount,
        status: 'pending',
        potongan: 0
      };

      console.log('Sending head transaksi data:', headTransaksiData);
      console.log('Ticket data:', ticket);

      // Simpan head transaksi
      const headResponse = await transaksiService.createHeadTransaksi(headTransaksiData);
      
      console.log('Head transaksi created:', headResponse);

      if (headResponse.success) {
        // Navigate ke pemesanan-2 dengan id_headtransaksi
        navigate('/pemesanan-2', { 
          state: { 
            ticket, 
            formData,
            id_headtransaksi: headResponse.data.id_headtransaksi,
            totalAmount: totalAmount
          } 
        });
      } else {
        throw new Error(headResponse.message || 'Gagal menyimpan data pemesanan');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menyimpan data pemesanan. Silakan coba lagi.');
    }
  };

  // Helper functions untuk booking summary
  const formatDate = (dateString) => {
    if (!dateString) return 'Tanggal tidak tersedia';
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                   'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${dayName}, ${day} ${month} ${year}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) {
      // Fallback ke field durasi dari database jika ada
      if (ticket?.durasi) {
        return `${ticket.durasi} jam`;
      }
      return 'N/A';
    }
    
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    
    if (diffMs <= 0) return 'N/A';
    
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} menit`;
    } else if (minutes === 0) {
      return `${hours} jam`;
    } else {
      return `${hours} jam ${minutes} menit`;
    }
  };

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
      'Mineral': 'tabler:bottle-filled'
    };

    const facilityNameLower = facilityName.toLowerCase();
    const exactMatch = Object.keys(facilityIcons).find(key => 
      key.toLowerCase() === facilityNameLower
    );
    
    if (exactMatch) {
      return facilityIcons[exactMatch];
    }
    
    const partialMatch = Object.keys(facilityIcons).find(key => 
      facilityNameLower.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(facilityNameLower)
    );
    
    if (partialMatch) {
      return facilityIcons[partialMatch];
    }
    
    return 'material-symbols:check-circle';
  };

  // Calculate passenger count for summary
  const passengerCount = [
    formData.namaPenumpang1,
    formData.namaPenumpang2,
    formData.namaPenumpang3
  ].filter(Boolean).length || 1; // Minimum 1 passenger

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
        
        <p className="text-gray-600 mb-6">Isi data Anda dan review pesanan Anda.</p>
        
        {/* Login Reminder for non-logged users only */}
        {!isLoggedIn && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <Info className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <div className="font-medium text-yellow-800">
                  Belum masuk akun?
                </div>
                <div className="text-sm text-yellow-600">
                  <button 
                    onClick={() => navigate('/daftar-masuk')}
                    className="underline hover:text-yellow-700"
                  >
                    Masuk ke akun Anda
                  </button> untuk mengisi data secara otomatis
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Data Pemesanan */}
              <div className="bg-neutral-100 rounded-lg shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4">Data Pemesanan</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap* (tanpa gelar dan tanda baca)
                    </label>
                    <input
                      type="text"
                      name="namaPesanan"
                      value={formData.namaPesanan}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                    {isLoggedIn && formData.namaPesanan && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Data dari akun Anda (dapat diedit jika perlu)
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Handphone*
                    </label>
                    <input
                      type="tel"
                      name="noHandphone"
                      value={formData.noHandphone}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                    {isLoggedIn && formData.noHandphone && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Data dari akun Anda (dapat diedit jika perlu)
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email*
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      required
                    />
                    {isLoggedIn && formData.email && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Data dari akun Anda (dapat diedit jika perlu)
                      </p>
                    )}
                  </div>
                  
                  {/* Checkbox: Pemesan adalah penumpang */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isPesananPenumpang"
                      checked={isPesananPenumpang}
                      onChange={handlePesananPenumpangChange}
                      className="w-4 h-4 text-purple-600 border-purple1 rounded focus:ring-purple-500 bg-white"
                    />
                    <label htmlFor="isPesananPenumpang" className="ml-2 text-sm text-gray-700">
                      <span className="font-semibold">Pemesan adalah penumpang</span>
                    </label>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    Centang jika Anda (pemesan) adalah penumpang pertama yang akan bepergian
                  </p>      
                </div>
              </div>
              
              {/* Data Penumpang */}
              <div className="bg-neutral1 rounded-lg shadow-lg p-5">
                <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
                
                {/* Penumpang 1 */}
                <div className="space-y-3 mb-4">
                  <div className="font-semibold text-gray-700">Data Penumpang 1</div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap* (tanpa gelar dan tanda baca)
                    </label>
                    <input
                      type="text"
                      name="namaPenumpang1"
                      value={formData.namaPenumpang1}
                      onChange={handleInputChange}
                      disabled={isPesananPenumpang}
                      className={`w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isPesananPenumpang 
                          ? 'bg-gray-100 cursor-not-allowed text-gray-600' 
                          : 'bg-white'
                      }`}
                      placeholder={isPesananPenumpang ? "Akan terisi otomatis dari data pemesan" : ""}
                      required
                    />
                    {isPesananPenumpang && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✓ Data terisi otomatis dari nama pemesan
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Kelamin*
                    </label>
                    <select
                      name="jenisKelamin1"
                      value={formData.jenisKelamin1}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>
                
                {/* Penumpang 2 (Optional) */}
                {!addSecondPassenger ? (
                  <div className="text-center py-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (remainingSeats < 2) {
                          alert('Maaf, hanya tersisa 1 kursi. Anda tidak dapat menambahkan penumpang lagi.');
                          return;
                        }
                        setAddSecondPassenger(true);
                      }}
                      className={`text-purple-600 hover:text-purple-700 font-medium ${remainingSeats < 2 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      + Tambah Penumpang
                    </button>
                    {remainingSeats < 2 && (
                      <p className="text-xs text-red-500 mt-1">Hanya tersisa 1 kursi</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-700">Data Penumpang 2</div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddSecondPassenger(false);
                          setAddThirdPassenger(false);
                          setFormData(prev => ({
                            ...prev,
                            namaPenumpang2: '',
                            jenisKelamin2: 'Laki-laki',
                            namaPenumpang3: '',
                            jenisKelamin3: 'Laki-laki'
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Hapus Penumpang
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap* (tanpa gelar dan tanda baca)
                      </label>
                      <input
                        type="text"
                        name="namaPenumpang2"
                        value={formData.namaPenumpang2}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin*
                      </label>
                      <select
                        name="jenisKelamin2"
                        value={formData.jenisKelamin2}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    
                    {/* Button to add third passenger */}
                    {!addThirdPassenger && (
                      <div className="text-center py-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (remainingSeats < 3) {
                              alert('Maaf, hanya tersisa 2 kursi. Anda tidak dapat menambahkan penumpang lagi.');
                              return;
                            }
                            setAddThirdPassenger(true);
                          }}
                          className={`text-purple-600 hover:text-purple-700 font-medium ${remainingSeats < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          + Tambah Penumpang
                        </button>
                        {remainingSeats < 3 && (
                          <p className="text-xs text-red-500 mt-1">Hanya tersisa 2 kursi</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Penumpang 3 (Optional) */}
                {addSecondPassenger && addThirdPassenger && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-gray-700">Data Penumpang 3</div>
                      <button
                        type="button"
                        onClick={() => {
                          setAddThirdPassenger(false);
                          setFormData(prev => ({
                            ...prev,
                            namaPenumpang3: '',
                            jenisKelamin3: 'Laki-laki'
                          }));
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-sm"
                      >
                        Hapus Penumpang
                      </button>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap* (tanpa gelar dan tanda baca)
                      </label>
                      <input
                        type="text"
                        name="namaPenumpang3"
                        value={formData.namaPenumpang3}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Kelamin*
                      </label>
                      <select
                        name="jenisKelamin3"
                        value={formData.jenisKelamin3}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-purple1 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  Lanjutkan
                </button>
              </div>
            </form>
          </div>
          
          {/* Right Side - Dynamic Booking Summary */}
          <div className="lg:col-span-1">
            <div className="bg-purple-100 rounded-lg p-4 sticky top-4">
              <h3 className="font-bold text-lg mb-3">
                {formatDate(ticket?.waktu_keberangkatan)}
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-black">
                      {ticket?.kota_awal?.toUpperCase() || 'KOTA ASAL'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(ticket?.waktu_keberangkatan)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Terminal {ticket?.kota_asal || 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">
                      {ticket?.kota_tujuan?.toUpperCase() || 'KOTA TUJUAN'}
                    </div>
                    <div className="text-sm text-gray-600">
                      {formatTime(ticket?.waktu_sampai)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Terminal {ticket?.kota_tujuan || 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 mt-3">
                  Estimasi waktu: {calculateDuration(ticket?.waktu_keberangkatan, ticket?.waktu_sampai)}
                </div>
                
                <div className="pt-3 border-t">
                  <div className="font-bold mb-1">
                    Tipe Bus: {ticket?.kendaraan?.tipe_armada || ticket?.busType || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-700">
                    Kapasitas kursi: {ticket?.kendaraan?.kapasitas_kursi || 'N/A'} kursi
                  </div>
                  <div className="text-sm text-gray-700">
                    Format kursi: {ticket?.kendaraan?.format_kursi || 'N/A'}
                  </div>
                  {ticket?.kendaraan?.nomor_armada && (
                    <div className="text-sm text-gray-700">
                      Nomor armada: {ticket.kendaraan.nomor_armada}
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t">
                  <div className="font-bold mb-1">Fasilitas:</div>
                  <div className="grid grid-cols-2 gap-1 text-sm">
                    {ticket?.kendaraan?.fasilitas && ticket.kendaraan.fasilitas.length > 0 ? (
                      ticket.kendaraan.fasilitas.slice(0, 6).map((facility, index) => (
                        <div key={index} className="flex items-center">
                          <Icon 
                            icon={getFacilityIcon(facility)} 
                            className="w-4 h-4 mr-1 text-purple-600" 
                          />
                          <span>{facility}</span>
                        </div>
                      ))
                    ) : ticket?.amenities && ticket.amenities.length > 0 ? (
                      ticket.amenities.slice(0, 6).map((amenity, index) => (
                        <div key={index} className="flex items-center">
                          <Icon 
                            icon={getFacilityIcon(amenity)} 
                            className="w-4 h-4 mr-1 text-purple-600" 
                          />
                          <span>{amenity}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center col-span-2">
                        <Icon 
                          icon="material-symbols:info" 
                          className="w-4 h-4 mr-1 text-purple-600" 
                        />
                        <span className="text-gray-500">Fasilitas tidak tersedia</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="pt-3 border-t">
                  <div className="font-bold mb-1">Rincian Harga:</div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Harga tiket ({passengerCount}x)</span>
                      <span>Rp {((ticket?.harga || 150000) * passengerCount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Biaya admin</span>
                      <span>Rp 10.000</span>
                    </div>
                    <div className="flex justify-between font-bold pt-1 border-t">
                      <span>Total</span>
                      <span>Rp {((ticket?.harga || 150000) * passengerCount + 10000).toLocaleString()}</span>
                    </div>
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

export default Pemesanan1;