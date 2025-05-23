// src/user/tiketSaya.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate untuk navigasi
import Navbar from './navbar'; // Mengimpor Navbar
import Footer from './footer'; // Mengimpor Footer

const TiketSaya = () => {
  const navigate = useNavigate();  // Inisialisasi useNavigate

  // Data tiket sementara
  const tickets = [
    {
      id: 1,
      date: 'Selasa, 29 April 2025',
      departureCity: 'GROGOL',
      arrivalCity: 'CIHAMPELAS',
      busImage: '/images/Bis ungu.png', // Ganti dengan path gambar bus yang sesuai
      departureTime: '03:00',
      arrivalTime: '06:00',
      departureLocation: 'Jl Daan Mogot Raya KM 1N',
      arrivalLocation: 'Jl Cihampelas No 64N',
      duration: '4 jam',
      bookingCode: '29052025A',
      busCode: '201A',
      conductor: '081249401599',
      status: 'Dalam proses',  // Status aktif
    },
    {
      id: 2,
      date: 'Selasa, 29 April 2025',
      departureCity: 'GROGOL',
      arrivalCity: 'DIPATIKUR',
      busImage: '/images/Bis putih..png', // Ganti dengan path gambar bus yang sesuai
      departureTime: '06:00',
      arrivalTime: '09:00',
      departureLocation: 'Jl Pasar Baru No 3',
      arrivalLocation: 'Jl Raya Dipatikur',
      duration: '3 jam',
      bookingCode: '29052025B',
      busCode: '202B',
      conductor: '081249401600',
      status: 'Selesai',  // Status selesai
    },
  ];

  // Function to handle E-Tiket click
  const handleETicketClick = (bookingCode) => {
    // Navigate to e-ticket page with bookingCode as a URL parameter
    navigate(`/e-ticket/${bookingCode}`);
  };

  return (
    <>

      
      {/* Gambar Latar */}
      <div className="relative bg-cover bg-center h-80" style={{ backgroundImage: "url('/images/backgroundtiketsaya.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(0,0,0,0.6)] via-transparent to-transparent z-1"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
          <h1 className="text-4xl font-bold">Tiket Saya</h1>
          <p className="text-lg mt-2">Check tiket kamu disini!</p>
        </div>
      </div>

      {/* Daftar Tiket */}
      <div className="py-8 px-4 bg-neutral1 min-h-screen">
        <div className="max-w-6xl mx-auto">
          {/* Menampilkan Tiket */}
          <div className="space-y-6">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
                <div className="flex p-4">
                  {/* Left Section - Gambar Bus */}
                  <div className="w-1/4">
                    <img
                      src={ticket.busImage}
                      alt="Bus"
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>

                  {/* Middle Section - Rincian Tiket */}
                  <div className="w-2/4 pl-6 pr-4 flex flex-col">
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold text-black mr-2">{ticket.date}</h3>
                      {/* Conditional styling based on status */}
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${ticket.status === 'Selesai' ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-600'}`}>
                        {ticket.status}
                      </span>
                    </div>

                    {/* Keberangkatan dan Kedatangan - Vertikal */}
                    <div className="flex flex-col mt-4 relative">
                      {/* Vertical Line */}
                      <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-emerald1"></div>
                       {/* Departure */}
                      <div className="flex items-center mb-6 relative">
                        <div className="h-6 w-6 bg-emerald1 rounded-full flex items-center justify-center z-10"></div>
                        <div className="ml-6">
                          <div className="font-bold text-black uppercase">{ticket.departureCity}</div>
                          <div className="font-bold text-black">{ticket.departureTime}</div>
                          <div className="text-xs text-gray-600">{ticket.departureLocation}</div>
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="ml-12 text-sm text-gray-500">{ticket.duration}</div>
                       {/* Arrival */}
                      <div className="flex items-center mt-6 relative">
                        <div className="h-6 w-6 bg-emerald1 rounded-full flex items-center justify-center z-10"></div>
                        <div className="ml-6">
                          <div className="font-bold text-black uppercase">{ticket.arrivalCity}</div>
                          <div className="font-bold text-black">{ticket.arrivalTime}</div>
                          <div className="text-xs text-gray-600">{ticket.arrivalLocation}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Info Booking (no border-left) */}
                  <div className="w-1/4 flex flex-col justify-between pl-4">
                    <div>
                      <div className="bg-purple-100 rounded-lg p-3 mb-4">
                        <div className="text-sm font-semibold text-black">Kode Booking: {ticket.bookingCode}</div>
                      </div>
                      <div className="text-sm text-gray-600">Kode Bus: {ticket.busCode}</div>
                      <div className="text-sm text-gray-600 mt-1">No Kondektur: {ticket.conductor}</div>
                      {/* E-Tiket moved up and made clickable */}
                      <div 
                        className="text-sm text-emerald1 font-medium mt-1 cursor-pointer hover:underline"
                        onClick={() => handleETicketClick(ticket.bookingCode)}  // Handle click
                      >
                        E-Tiket
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};



 
export default TiketSaya;
