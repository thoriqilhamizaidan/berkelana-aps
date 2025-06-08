import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from './footer';
import { ChevronLeft } from 'lucide-react';
import { transaksiService } from '../services/api';

const Pemesanan2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticket, formData, id_headtransaksi, totalAmount } = location.state || {};
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerSeats, setPassengerSeats] = useState({});
  const [passengerGenders, setPassengerGenders] = useState({});
  const [activePassenger, setActivePassenger] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Count how many passengers we have
  const passengerCount = [
    formData?.namaPenumpang1, 
    formData?.namaPenumpang2, 
    formData?.namaPenumpang3
  ].filter(Boolean).length;
  
  const [seatData, setSeatData] = useState({
    rows: 7,
    cols: 4,
    seatMap: {
      'A': 0,
      'B': 1,
      'C': 2,
      'D': 3
    }
  });
  
  useEffect(() => {
    const fetchBookedSeats = async () => {
      try {
        setLoading(true);
        
        // Ambil data user yang login
        const userData = await getCurrentUser();
        setCurrentUser(userData);
        
        // Ambil data kursi yang sudah DIBAYAR (status = 'paid') untuk jadwal ini
        const jadwalId = ticket?.id_jadwal || ticket?.id || ticket?.jadwal?.id_jadwal;
        if (jadwalId) {
          console.log('🔍 Fetching PAID booked seats for jadwal:', jadwalId);
          
          const response = await transaksiService.getBookedSeatsByJadwal(jadwalId);
          
          if (response?.success && response?.data) {
            const bookedSeatsData = response.data;
            
            // Format data menjadi object dengan seat ID sebagai key dan gender sebagai value
            const bookedSeatsMap = {};
            bookedSeatsData.forEach(seat => {
              if (seat.nomor_kursi) {
                bookedSeatsMap[seat.nomor_kursi] = seat.gender;
              }
            });
            
            setBookedSeats(bookedSeatsMap);
            console.log('✅ Booked seats (PAID ONLY) from database:', bookedSeatsMap);
          } else {
            console.log('ℹ️ No paid booked seats found');
            setBookedSeats({});
          }
        }
      } catch (error) {
        console.error('❌ Error fetching booked seats:', error);
        setBookedSeats({});
        
        // Tampilkan pesan error yang lebih user-friendly
        if (error.message?.includes('fetch') || error.message?.includes('network')) {
          console.warn('⚠️ Tidak dapat terhubung ke server. Menggunakan mode offline.');
        } else {
          console.warn('⚠️ Gagal memuat data kursi yang sudah dibayar.');
        }
      } finally {
        setLoading(false);
      }
    };
  
    fetchBookedSeats();
  }, [ticket]);

  const getCurrentUser = async () => {
    try {
      // Coba ambil dari localStorage terlebih dahulu
      const userFromStorage = localStorage.getItem('currentUser');
      if (userFromStorage) {
        return JSON.parse(userFromStorage);
      }
      
      // Coba ambil dari session storage
      const userFromSession = sessionStorage.getItem('user');
      if (userFromSession) {
        return JSON.parse(userFromSession);
      }
      
      // Default user jika tidak ada data
      return {
        gender: 'Laki-laki' // default
      };
    } catch (error) {
      console.error('❌ Error getting current user:', error);
      return { gender: 'Laki-laki' }; // default
    }
  };

  useEffect(() => {
    // Initialize passenger seats mapping and gender mapping
    if (passengerCount > 0) {
      const initialMapping = {};
      const genderMapping = {};
      
      if (formData?.namaPenumpang1) {
        initialMapping[formData.namaPenumpang1] = null;
        genderMapping[formData.namaPenumpang1] = formData.jenisKelamin1;
      }
      if (formData?.namaPenumpang2) {
        initialMapping[formData.namaPenumpang2] = null;
        genderMapping[formData.namaPenumpang2] = formData.jenisKelamin2;
      }
      if (formData?.namaPenumpang3) {
        initialMapping[formData.namaPenumpang3] = null;
        genderMapping[formData.namaPenumpang3] = formData.jenisKelamin3;
      }
      
      setPassengerSeats(initialMapping);
      setPassengerGenders(genderMapping);
      
      // Set the first passenger as active by default
      if (formData?.namaPenumpang1) {
        setActivePassenger(formData.namaPenumpang1);
      }
    }
  }, [formData, passengerCount]);

  const handleSeatClick = (seatId) => {
    // If seat is already booked (PAID) from database, do nothing
    if (bookedSeats[seatId]) {
      console.log(`❌ Seat ${seatId} is already booked and PAID`);
      return;
    }
    
    // If no active passenger, do nothing
    if (!activePassenger) {
      console.log('⚠️ No active passenger selected');
      return;
    }
    
    // Check if the seat is already assigned to another passenger in current session
    const passengerWithThisSeat = getPassengerForSeat(seatId);
    if (passengerWithThisSeat && passengerWithThisSeat !== activePassenger) {
      console.log(`❌ Seat ${seatId} is already assigned to ${passengerWithThisSeat}`);
      return; // Can't take someone else's seat
    }
    
    // If this passenger already has a seat, remove it from selectedSeats
    const currentSeat = passengerSeats[activePassenger];
    if (currentSeat) {
      setSelectedSeats(prev => prev.filter(seat => seat !== currentSeat));
    }
    
    // If clicking on the same seat they already have, unassign it
    if (currentSeat === seatId) {
      const updatedSeats = { ...passengerSeats };
      updatedSeats[activePassenger] = null;
      setPassengerSeats(updatedSeats);
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId));
      return;
    }
    
    // Assign new seat to active passenger
    const updatedSeats = { ...passengerSeats };
    updatedSeats[activePassenger] = seatId;
    setPassengerSeats(updatedSeats);
    
    // Update selected seats list
    if (!selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => [...prev, seatId]);
    }
    
    console.log(`✅ Seat ${seatId} assigned to ${activePassenger}`);
  };
  
  const handleSelectPassenger = (passenger) => {
    setActivePassenger(passenger);
    console.log(`Active passenger changed to: ${passenger}`);
  };
  
  const handleSubmit = async () => {
    // Validasi dasar
    const allSeatsAssigned = Object.values(passengerSeats).every(seat => seat !== null);
    
    if (!allSeatsAssigned) {
      alert('Silahkan pilih kursi untuk semua penumpang');
      return;
    }
  
    if (!id_headtransaksi) {
      alert('Data pemesanan tidak ditemukan. Silakan ulangi dari awal.');
      navigate('/pemesanan-1');
      return;
    }
  
    // Validasi ticket
    if (!ticket?.id_jadwal && !ticket?.id) {
      alert('Data jadwal tidak valid. Silakan pilih tiket ulang.');
      navigate('/pesan-tiket');
      return;
    }
  
    try {
      console.log('Processing seat selection and detail transaksi...');

      // Siapkan data detail transaksi untuk setiap penumpang
      const detailTransaksiData = [];
      const getJadwalId = () => {
        const jadwalId = ticket?.id_jadwal || ticket?.id || ticket?.jadwal?.id_jadwal;
        console.log('Using jadwal ID:', jadwalId, 'from ticket:', ticket);
        return jadwalId;
      };
      
      // Penumpang 1
      if (formData?.namaPenumpang1 && passengerSeats[formData.namaPenumpang1]) {
        detailTransaksiData.push({
          id_headtransaksi: id_headtransaksi,
          id_jadwal: getJadwalId(),
          nama_penumpang: formData.namaPenumpang1,
          gender: formData.jenisKelamin1,
          harga_kursi: ticket?.harga || 150000,
          nomor_kursi: passengerSeats[formData.namaPenumpang1]
        });
      }

      // Penumpang 2
      if (formData?.namaPenumpang2 && passengerSeats[formData.namaPenumpang2]) {
        detailTransaksiData.push({
          id_headtransaksi: id_headtransaksi,
          id_jadwal: getJadwalId(),
          nama_penumpang: formData.namaPenumpang2,
          gender: formData.jenisKelamin2,
          harga_kursi: ticket?.harga || 150000,
          nomor_kursi: passengerSeats[formData.namaPenumpang2]
        });
      }

      // Penumpang 3
      if (formData?.namaPenumpang3 && passengerSeats[formData.namaPenumpang3]) {
        detailTransaksiData.push({
          id_headtransaksi: id_headtransaksi,
          id_jadwal: getJadwalId(),
          nama_penumpang: formData.namaPenumpang3,
          gender: formData.jenisKelamin3,
          harga_kursi: ticket?.harga || 150000,
          nomor_kursi: passengerSeats[formData.namaPenumpang3]
        });
      }

      console.log('Detail transaksi data:', detailTransaksiData);

      // Cek apakah ada kursi yang dipilih sudah dibooking orang lain di saat yang bersamaan
      const selectedSeatIds = detailTransaksiData.map(detail => detail.nomor_kursi);
      
      // Re-fetch booked seats untuk memastikan data terbaru (hanya yang PAID)
      const jadwalId = getJadwalId();
      const recentBookedSeats = await transaksiService.getBookedSeatsByJadwal(jadwalId);
      
      if (recentBookedSeats?.success && recentBookedSeats?.data) {
        const recentBookedSeatIds = recentBookedSeats.data.map(seat => seat.nomor_kursi);
        const conflictSeats = selectedSeatIds.filter(seatId => recentBookedSeatIds.includes(seatId));
        
        if (conflictSeats.length > 0) {
          alert(`❌ Kursi ${conflictSeats.join(', ')} baru saja DIBAYAR oleh penumpang lain. Silakan pilih kursi yang lain.`);
          // Refresh booked seats
          const bookedSeatsMap = {};
          recentBookedSeats.data.forEach(seat => {
            if (seat.nomor_kursi) {
              bookedSeatsMap[seat.nomor_kursi] = seat.gender;
            }
          });
          setBookedSeats(bookedSeatsMap);
          return;
        }
      }

      // Simpan semua detail transaksi
      const detailResponse = await transaksiService.createMultipleDetailTransaksi(detailTransaksiData);
      
      console.log('✅ Detail transaksi created:', detailResponse);

      // Update total di head transaksi
      const finalTotal = calculateTotal();
      await transaksiService.updateHeadTransaksi(id_headtransaksi, {
        total: finalTotal
      });

      console.log('✅ Head transaksi updated with total:', finalTotal);

      // Navigate to payment page
      navigate('/pembayaran', { 
        state: { 
          ticket, 
          formData, 
          passengerSeats,
          id_headtransaksi: id_headtransaksi,
          totalPrice: finalTotal,
          detailTransaksi: detailTransaksiData
        } 
      });

    } catch (error) {
      console.error('❌ Error processing seat selection:', error);
      alert('Gagal menyimpan pilihan kursi. Silakan coba lagi.');
    }
  };
  
  // Get the passenger who selected this seat (if any)
  const getPassengerForSeat = (seatId) => {
    for (const [passenger, seat] of Object.entries(passengerSeats)) {
      if (seat === seatId) {
        return passenger;
      }
    }
    return null;
  };
  
  // Get gender-based color for a selected seat
  const getGenderColor = (gender) => {
    return gender === 'Perempuan' ? 'bg-pink-500' : 'bg-blue-500';
  };
  
  const getSeatColor = (rowIndex, colIndex) => {
    const seatId = getSeatId(rowIndex, colIndex);
    
    // If the seat is booked from database
    if (bookedSeats[seatId]) {
      const bookedGender = bookedSeats[seatId];
      const genderColor = bookedGender === 'Perempuan' ? 'bg-pink-400' : 'bg-blue-400';
      return `${genderColor} text-white opacity-70 cursor-not-allowed`; // Booked seat with gender color
    }
    
    // Get the passenger who has this seat in current session (if any)
    const seatOwner = getPassengerForSeat(seatId);
    
    if (selectedSeats.includes(seatId) && seatOwner) {
      // If this is active passenger's seat, add a highlight border
      const isActiveSeat = seatOwner === activePassenger;
      const borderClass = isActiveSeat ? 'ring-2 ring-yellow-400' : '';
      
      // Use gender-specific color for selected seats
      const gender = passengerGenders[seatOwner];
      return `${getGenderColor(gender)} text-white ${borderClass} cursor-pointer`; 
    }
    
    return 'bg-gray-200 hover:bg-gray-300 cursor-pointer'; // Available seat
  };
  
  const getSeatId = (rowIndex, colIndex) => {
    const row = rowIndex + 1;
    const col = Object.keys(seatData.seatMap).find(key => seatData.seatMap[key] === colIndex);
    return `${row}${col}`;
  };
  
  const calculateTotal = () => {
    const ticketPrice = ticket?.harga || 150000; // Ambil harga dari database
    const baseTotal = ticketPrice * passengerCount;
    const adminFee = 10000;
    return baseTotal + adminFee;
  };

  // Get passenger list item class
  const getPassengerItemClass = (passenger) => {
    const isActive = passenger === activePassenger;
    const hasSeat = passengerSeats[passenger] !== null;
    
    let baseClass = "p-3 rounded-lg cursor-pointer flex justify-between items-center";
    
    if (isActive) {
      return `${baseClass} bg-purple-100 border-2 border-purple-500`;
    } else if (hasSeat) {
      return `${baseClass} bg-gray-100`;
    }
    
    return `${baseClass} bg-white border border-gray-200`;
  };

  // Get information about reserved seat occupants (for tooltip or display)
  const getReservedSeatInfo = (seatId) => {
    if (bookedSeats[seatId]) {
      const gender = bookedSeats[seatId];
      // Tampilkan info gender hanya untuk user perempuan
      if (currentUser?.gender === 'Perempuan') {
        return `Kursi telah dipesan (${gender})`;
      } else {
        return 'Kursi telah dipesan';
      }
    }
    return '';
  };

  return (
    <>
      
      {loading ? (
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-lg">Memuat data kursi...</span>
        </div>
      </div>
    ) : (
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
        
        <p className="text-gray-600 mb-6">Pilih kursi Anda dan review pesanan Anda.</p>
        
        {/* Data Pemesanan Display */}
        <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">Data Pemesanan</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="font-semibold">Nama Pemesan</div>
              <div className="text-gray-700">{formData?.namaPesanan || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold">Email</div>
              <div className="text-gray-700">{formData?.email || 'N/A'}</div>
            </div>
            
            <div>
              <div className="font-semibold">No. Handphone</div>
              <div className="text-gray-700">{formData?.noHandphone || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        {/* Data Penumpang Display with Click to Select */}
        <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
          <p className="text-sm text-gray-600 mb-3">Klik pada penumpang untuk memilih kursinya</p>
          
          <div className="space-y-3">
            {formData?.namaPenumpang1 && (
              <div 
                className={getPassengerItemClass(formData.namaPenumpang1)}
                onClick={() => handleSelectPassenger(formData.namaPenumpang1)}
              >
                <div>
                  <div className="font-semibold">Data Penumpang 1</div>
                  <div className="text-gray-700">
                    {formData.namaPenumpang1} - {formData.jenisKelamin1}
                  </div>
                </div>
                <div className="font-medium">
                  {passengerSeats[formData.namaPenumpang1] ? 
                    `Kursi ${passengerSeats[formData.namaPenumpang1]}` : 
                    'Belum memilih kursi'}
                </div>
              </div>
            )}
            
            {formData?.namaPenumpang2 && (
              <div 
                className={getPassengerItemClass(formData.namaPenumpang2)}
                onClick={() => handleSelectPassenger(formData.namaPenumpang2)}
              >
                <div>
                  <div className="font-semibold">Data Penumpang 2</div>
                  <div className="text-gray-700">
                    {formData.namaPenumpang2} - {formData.jenisKelamin2}
                  </div>
                </div>
                <div className="font-medium">
                  {passengerSeats[formData.namaPenumpang2] ? 
                    `Kursi ${passengerSeats[formData.namaPenumpang2]}` : 
                    'Belum memilih kursi'}
                </div>
              </div>
            )}
            
            {formData?.namaPenumpang3 && (
              <div 
                className={getPassengerItemClass(formData.namaPenumpang3)}
                onClick={() => handleSelectPassenger(formData.namaPenumpang3)}
              >
                <div>
                  <div className="font-semibold">Data Penumpang 3</div>
                  <div className="text-gray-700">
                    {formData.namaPenumpang3} - {formData.jenisKelamin3}
                  </div>
                </div>
                <div className="font-medium">
                  {passengerSeats[formData.namaPenumpang3] ? 
                    `Kursi ${passengerSeats[formData.namaPenumpang3]}` : 
                    'Belum memilih kursi'}
                </div>
              </div>
            )}
          </div>
          
          {activePassenger && (
            <div className="mt-3 p-2 bg-gray-100 rounded text-center">
              <p className="text-sm font-medium">
                Pilih kursi untuk: <span className="font-bold">{activePassenger}</span>
                {passengerSeats[activePassenger] && 
                 ` (Kursi saat ini: ${passengerSeats[activePassenger]})`}
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Seat Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Pilih Kursi</h2>
              
              {/* Seat selection legend - tampilkan berdasarkan gender user */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                  <span>Tersedia</span>
                </div>
                
                {currentUser?.gender === 'Perempuan' ? (
                  // Tampilkan legend gender hanya untuk user perempuan
                  <>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-400 opacity-70 mr-2"></div>
                      <span>Sudah dipesan (Laki-laki)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-pink-400 opacity-70 mr-2"></div>
                      <span>Sudah dipesan (Perempuan)</span>
                    </div>
                  </>
                ) : (
                  // Untuk user laki-laki, hanya tampilkan "sudah dipesan" tanpa detail gender
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-400 opacity-70 mr-2"></div>
                    <span>Sudah dipesan</span>
                  </div>
                )}
              </div>
              
              {/* Bus layout */}
              <div className="flex flex-col items-center">
                {/* Front of the bus */}
                <div className="w-1/2 h-10 bg-gray-300 flex items-center justify-center mb-6 rounded">
                  Depan
                </div>
                
                {/* Seats */}
                <div className="grid grid-cols-4 gap-2 w-full max-w-md">
                  {Array.from({ length: seatData.rows }).map((_, rowIndex) => (
                    Array.from({ length: seatData.cols }).map((_, colIndex) => {
                      const seatId = getSeatId(rowIndex, colIndex);
                      // Skip the middle "aisle" by adding extra margin
                      const isLeftSide = colIndex < 2;
                      const marginClass = isLeftSide ? 'mr-4' : 'ml-4';
                      
                      // Only completely disable reserved seats
                      const isDisabled = bookedSeats[seatId]; // kursi yang sudah dipesan dari database
                      const reservedInfo = getReservedSeatInfo(seatId);
                      
                      return (
                        <div 
                          key={`${rowIndex}-${colIndex}`} 
                          className={`${colIndex === 1 || colIndex === 2 ? marginClass : ''}`}
                        >
                          <button 
                            onClick={() => handleSeatClick(seatId)}
                            disabled={isDisabled}
                            title={reservedInfo || ''}
                            className={`w-10 h-10 flex items-center justify-center rounded-md ${getSeatColor(rowIndex, colIndex)}`}
                          >
                            {seatId}
                          </button>
                        </div>
                      );
                    })
                  ))}
                </div>
                
                {/* Back of the bus */}
                <div className="w-1/2 h-10 bg-gray-300 flex items-center justify-center mt-6 rounded">
                  Belakang
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Payment Details */}
            <div className="lg:col-span-1">
              <div className="bg-purple-100 rounded-lg p-4 sticky top-4">
                {/* Dynamic Date from ticket */}
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
                
                <div className="space-y-3">
                  {/* Journey details from database */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-bold text-black">
                        {ticket?.kota_awal?.toUpperCase() || 'KOTA ASAL'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {ticket?.waktu_keberangkatan ? 
                          new Date(ticket.waktu_keberangkatan).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }) : 
                          'N/A'
                        }
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
                        {ticket?.waktu_sampai ? 
                          new Date(ticket.waktu_sampai).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          }) : 
                          'N/A'
                        }
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Terminal {ticket?.kota_tujuan || 'N/A'}
                      </div>
                    </div>
                  </div>
                  
                  {/* Duration calculation */}
                  <div className="text-sm text-gray-700 mt-3">
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
                      } else if (ticket?.durasi) {
                        return `${ticket.durasi} jam`;
                      }
                      return 'N/A';
                    })()}
                  </div>
                  
                  {/* Bus details from database */}
                  <div className="pt-3 border-t">
                    <div className="font-bold mb-1">
                      Tipe Bus: {ticket?.kendaraan?.tipe_armada || ticket?.busType || 'N/A'}
                    </div>
                    {ticket?.kendaraan?.kapasitas_kursi && (
                      <div className="text-sm text-gray-700">
                        Kapasitas: {ticket.kendaraan.kapasitas_kursi} kursi
                      </div>
                    )}
                    {ticket?.kendaraan?.format_kursi && (
                      <div className="text-sm text-gray-700">
                        Format: {ticket.kendaraan.format_kursi}
                      </div>
                    )}
                    {ticket?.kendaraan?.nomor_armada && (
                      <div className="text-sm text-gray-700">
                        No. Armada: {ticket.kendaraan.nomor_armada}
                      </div>
                    )}
                  </div>
                  
                  {/* Payment details */}
                  <div className="pt-3 border-t">
                    <h4 className="font-bold mb-2">Rincian Pembayaran</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>
                          Bus {ticket?.kendaraan?.tipe_armada || 'Berkelana'} {ticket?.kota_awal || ''} - {ticket?.kota_tujuan || ''} ({passengerCount}x)
                        </span>
                        <span>Rp {((ticket?.harga || 150000) * passengerCount).toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Biaya layanan</span>
                        <span>Rp 10.000</span>
                      </div>
                      
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>TOTAL PEMBAYARAN</span>
                        <span>Rp {calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Continue button */}
                  <div className="pt-4">
                    <button
                      onClick={handleSubmit}
                      className="w-full bg-emerald-400 hover:bg-emerald-500 text-black font-bold py-2 px-6 rounded-lg transition-colors duration-200"
                    >
                      Lanjutkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    )}
      <Footer />
    </>
  );
};

export default Pemesanan2;