import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { transaksiService } from '../services/transaksiService';
import { useAuth } from './context/AuthContext';
import kendaraanService from '../services/kendaraanService'; // Import kendaraanService

const ETicket = () => {
  const { bookingCode } = useParams(); // Mengambil booking code dari URL parameter
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicleImage, setVehicleImage] = useState(null); // State untuk gambar kendaraan

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Pastikan user sudah login
        if (!isLoggedIn) {
          navigate('/login');
          return;
        }
        
        // Ambil user ID dari context atau localStorage
        const userId = user?.id || user?.id_user || transaksiService.getCurrentUserId();
        
        if (!userId) {
          setError('User ID tidak ditemukan, silakan login ulang');
          setLoading(false);
          return;
        }
        
        // Ambil semua transaksi user
        const response = await transaksiService.getTransaksiByUser(userId);
        
        if (!response.success) {
          setError('Gagal mengambil data tiket');
          setLoading(false);
          return;
        }
        
        // Cari transaksi dengan booking code yang sesuai
        const ticketData = response.data.find(t => 
          t.booking_code === bookingCode && 
          (t.status === 'paid' || t.payment_status === 'settlement' || t.payment_status === 'capture')
        );
        
        if (!ticketData) {
          setError('Tiket tidak ditemukan atau belum dibayar');
          setLoading(false);
          return;
        }
        
        // Ambil detail transaksi untuk mendapatkan data penumpang
        const detailResponse = await transaksiService.getDetailTransaksi(ticketData.id_headtransaksi);
        
        // Format data penumpang dari detail transaksi
        let passengerDetails = [];
        let vehicleImageFilename = null;
        
        if (detailResponse.success && detailResponse.data && detailResponse.data.length > 0) {
          passengerDetails = detailResponse.data.map(detail => ({
            name: detail.nama_penumpang,
            seat: `Seat ${detail.nomor_kursi}`
          }));
          
          // Ambil data gambar kendaraan dari detail transaksi pertama
          if (detailResponse.data[0]?.Jadwal?.Kendaraan?.gambar) {
            vehicleImageFilename = detailResponse.data[0].Jadwal.Kendaraan.gambar;
            // Dapatkan URL gambar menggunakan kendaraanService
            const imageUrl = kendaraanService.getImageUrl(vehicleImageFilename);
            setVehicleImage(imageUrl);
          }
        } else {
          // Fallback jika tidak ada detail transaksi
          passengerDetails = [{ name: ticketData.nama_pemesan, seat: 'Seat 1' }];
        }
        
        // Format data tiket untuk ditampilkan
        setTicket({
          bookingCode: ticketData.booking_code,
          date: new Date(ticketData.waktu_keberangkatan).toLocaleDateString('id-ID', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          }),
          duration: formatDuration(ticketData.waktu_keberangkatan, ticketData.waktu_sampai),
          departureCity: ticketData.kota_awal,
          arrivalCity: ticketData.kota_tujuan,
          departureTime: new Date(ticketData.waktu_keberangkatan).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          departureDetails: `Terminal ${ticketData.kota_awal}`,
          arrivalTime: new Date(ticketData.waktu_sampai).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          arrivalDetails: `Terminal ${ticketData.kota_tujuan}`,
          passengerDetails: passengerDetails,
          contactPerson: {
            name: ticketData.nama_pemesan,
            no: ticketData.no_hp_pemesan,
            email: ticketData.email_pemesan
          },
          shuttleCode: ticketData.nomor_armada || '201A',
          kondekturNo: ticketData.nomor_kondektur || '081249401599'
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching ticket data:', error);
        setError('Terjadi kesalahan saat mengambil data tiket');
        setLoading(false);
      }
    };
    
    fetchTicketData();
  }, [bookingCode, isLoggedIn, navigate, user]);

  // Format durasi perjalanan
  const formatDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    
    const startTime = new Date(start);
    const endTime = new Date(end);
    
    const durationMs = endTime - startTime;
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours} jam${minutes > 0 ? ` ${minutes} menit` : ''}`;
    }
    return `${minutes} menit`;
  };

  const handleClose = () => {
    navigate('/tiket-saya'); // Navigate to Tiketsaya page when button is clicked
  };

  const ticketRef = useRef();

  const handleDownloadPDF = async () => {
    const element = ticketRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`E-Tiket_${ticket?.bookingCode || 'Ticket'}.pdf`);
  };

  // Tampilkan loading state
  if (loading) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data tiket...</p>
        </div>
      </div>
    );
  }

  // Tampilkan error state
  if (error || !ticket) {
    return (
      <div className="w-full h-screen flex justify-center items-center bg-white p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-6">{error || 'Tiket tidak tersedia atau belum dibayar'}</p>
          <button
            onClick={() => navigate('/tiket-saya')}
            className="bg-purple-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition-colors"
          >
            Kembali ke Tiket Saya
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto" ref={ticketRef}>
        {/* Header with Logo (No Padding) */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <img src="/images/Berkelana-logo.png" alt="Berkelana" className="h-20 text-purple-600" />
          </div>
          <button
            onClick={handleClose} // Add onClick event to handle the close button
            className="text-gray-400 hover:text-purplelight" // Change color on hover
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Title Section with Padding */}
        <div className="flex justify-between items-center mb-4 px-10">
          <h1 className="text-3xl font-bold text-black">E-Tiket Bus</h1>
          <div className="text-sm">
            <span className="bg-[#F1EAFF] text-black1 font-semibold px-6 py-3 rounded">
                Kode Booking: <span className="font-semibold">{ticket.bookingCode}</span>
            </span>
          </div>
        </div>
        <p className="text-gray-600 mb-4 px-10">Pilih kursi Anda dan review pesanan Anda.</p>

        {/* Bus Image and Details */}
        <div className="border border-gray-200 rounded-lg mb-6 overflow-hidden mx-10">
          <div className="flex flex-col md:flex-row">
            {/* Bus Image Side */}
            <div className="w-full md:w-1/3 bg-gray-50 p-4 flex flex-col">
              <img 
                src={vehicleImage || "/images/seat.jpg"} 
                alt="Interior Bus" 
                className="w-full h-48 object-cover rounded-lg mb-4" 
                onError={(e) => {
                  e.target.onerror = null; // Prevent infinite loop
                  e.target.src = "/images/seat.jpg"; // Fallback image
                }}
              />
              <div className="text-gray-600 text-sm space-y-1">
                <p>Kode Shuttle: {ticket.shuttleCode}</p>
                <p>No Kondektur: {ticket.kondekturNo}</p>
              </div>
            </div>

            {/* Journey Details Side */}
            <div className="w-full md:w-2/3 p-6 bg-white">
              <div className="text-xl font-semibold mb-6">{ticket.date}</div>
              {/* Journey Timeline */}
              <div className="relative">
                <div className="absolute left-3 top-3 w-0.5 h-40 bg-emerald1"></div>
                {/* From */}
                <div className="flex mb-8 relative">
                  <div className="mr-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald1"></div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{ticket.departureCity}</div>
                    <div className="text-gray-600">{ticket.departureTime}</div>
                    <div className="text-gray-500">{ticket.departureDetails}</div>
                  </div>
                </div>

                {/* Duration */}
                <div className="ml-12 mb-8 text-gray-500">{ticket.duration}</div>
                
                {/* To */}
                <div className="flex relative">
                  <div className="mr-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald1"></div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">{ticket.arrivalCity}</div>
                    <div className="text-gray-600">{ticket.arrivalTime}</div>
                    <div className="text-gray-500">{ticket.arrivalDetails}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 px-10">
          <div className="bg-gray-100 rounded-md flex items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" className="text-green-500 mr-2 flex-shrink-0">
              <path fill="currentColor" fillRule="evenodd" d="M7.5.85a.5.5 0 0 0-.5.5v2.172a.5.5 0 1 0 1 0v-1.65a5.65 5.65 0 1 1-4.81 1.974a.5.5 0 1 0-.762-.647A6.65 6.65 0 1 0 7.5.85m-.76 7.23L4.224 4.573a.25.25 0 0 1 .348-.348L8.081 6.74a.96.96 0 1 1-1.34 1.34" clipRule="evenodd"/>
            </svg>
            <span>Tiba di titik naik setidaknya 60 menit sebelum keberangkatan</span>
          </div>
          <div className="bg-gray-100 rounded-md flex items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" 
                viewBox="0 0 48 48" fill="none">
              <g stroke="currentColor" strokeLinecap="round" strokeWidth="4">
                <path strokeLinejoin="round" d="M9 16L34 6l4 10M4 16h40v6c-3 0-6 2-6 5.5s3 6.5 6 6.5v6H4v-6c3 0 6-2 6-6s-3-6-6-6z"/>
                <path d="M17 25.385h6m-6 6h14"/>
              </g>
            </svg>
            <span>Tunjukkan e-tiket ke petugas bus atau shuttle</span>
          </div>
          <div className="bg-gray-100 rounded-md flex items-center p-3 text-sm text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="M14 3.5h-4c-3.771 0-5.657 0-6.828 1.172S2 7.729 2 11.5v1c0 3.771 0 5.657 1.172 6.828S6.229 20.5 10 20.5h4c3.771 0 5.657 0 6.828-1.172S22 16.271 22 12.5v-1c0-3.771 0-5.657-1.172-6.828S17.771 3.5 14 3.5"/>
                <path d="M5 16c1.036-2.581 4.896-2.75 6 0M9.75 9.75a1.75 1.75 0 1 1-3.5 0a1.75 1.75 0 0 1 3.5 0M14 8.5h5M14 12h5m-5 3.5h2.5"/>
              </g>
            </svg>
            <span>Siapkan kartu identitas untuk verifikasi penumpang</span>
          </div>
        </div>

        {/* Passenger Data */}
        <div className="mb-6 px-10">
          <h2 className="text-xl font-semibold mb-3">Data Pemesan</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">{ticket.contactPerson.name}</p>
                <p className="text-gray-600">{ticket.contactPerson.no}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p>{ticket.contactPerson.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Passengers */}
        <div className="mb-6 px-10">
          <h2 className="text-xl font-semibold mb-3">Data Penumpang</h2>
          <div className="space-y-2">
            {ticket.passengerDetails.map((passenger, index) => (
              <div key={index} className="border border-gray-200 rounded-md p-3">
                <p className="text-gray-600">Data Penumpang {index + 1}</p>
                <p className="font-semibold">{passenger.name} - {passenger.seat}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Things to Know */}
        <div className="mb-6 px-10">
          <h2 className="text-xl font-semibold mb-3">Hal yang perlu diketahui</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <h3 className="font-semibold mb-2">Ketentuan Umum</h3>
            <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
              <li>Penumpang sudah siap setidaknya 60 menit sebelum keberangkatan di titik keberangkatan yang telah
 ditentukan oleh agen. Keterlambatan penumpang dapat menyebabkan tiket dibatalkan secara sepihak dan
 tidak mendapatkan pengembalian dana.</li>
              <li>Waktu keberangkatan yang tertera di aplikasi adalah waktu lokal di titik keberangkatan.</li>
              <li>Pelanggan diwajibkan untuk menunjukkan e-tiket dan identitas yang berlaku (KTP/ Paspor/ SIM).</li>
            </ul>
          </div>
        </div>

        {/* Luggage */}
        <div className="mb-6 px-10">
          <h2 className="text-xl font-semibold mb-3">Barang Bawaan</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <ul className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
              <li>Penumpang dilarang membawa barang terlarang/ilegal dan membahayakan seperti senjata tajam, mudah
 terbakar, dan berbau menyengat. Penumpang bertanggung jawab penuh untuk kepemilikan tersebut dan konsekuensinya.</li>
              <li>Ukuran dan berat bagasi per penumpang tidak melebihi aturan yang ditetapkan. Jika bagasi melebihi
ukuran atau berat tersebut, maka penumpang diharuskan membayar biaya tambahan sesuai ketentuan agen.</li>
              <li>Penumpang dilarang membawa hewan jenis apapun ke dalam kendaraan.</li>
            </ul>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div className="px-10">
          <h2 className="text-xl font-semibold mb-3">Kebijakan Pembatalan, Refund dan Reschedule</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <ul className="text-sm text-gray-700 space-y-1 list-decimal pl-5">
              <li>Pembatalan dan Refund dapat dilakukan sesuai dengan kebijakan perusahaan.</li>
              <li>Tidak dapat refund pada jam keberangkatan.</li>
            </ul>
          </div>
        </div>

        {/* Tombol Download */}
        <div className="text-center mt-6 mb-10 px-10">
          <button
            onClick={handleDownloadPDF}
            className="bg-emerald1 hover:bg-green-400 text-white px-6 py-3 rounded-md font-semibold"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ETicket;
