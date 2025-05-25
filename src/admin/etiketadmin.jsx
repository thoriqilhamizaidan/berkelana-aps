import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ETicketAdmin = () => {
  const { kodePesanan } = useParams();
  const navigate = useNavigate();

  // Data dummy e-ticket berdasarkan kode pesanan
  const ticketData = {
    kodePesanan: kodePesanan || '29052025A',
    pemesan: 'Nasywa Putri Natalisa',
    email: 'natalianasywaputri@gmail.com',
    telepon: '081234567890',
    tanggalKeberangkatan: 'Selasa, 29 April 2025',
    waktuKeberangkatan: '03:00',
    waktuKedatangan: '06:00',
    ruteAsal: 'GROGOL',
    ruteTujuan: 'CIHAMPELAS',
    lokasiAsal: 'Jl Daan Mogot Raya KM 1N',
    lokasiTujuan: 'Jl Cihampelas No 64N',
    banyakPenumpang: 2,
    totalBayar: 'Rp 310.000',
    kodeBus: '201A',
    noKondektur: '081249401599',
    status: 'Lunas',
    penumpang: [
      {
        nama: 'Nasywa Putri Natalisa',
        nik: '1234567890123456',
        noKursi: 'A1'
      },
      {
        nama: 'John Doe',
        nik: '6543210987654321',
        noKursi: 'A2'
      }
    ]
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            ← Kembali
          </button>
          <button
            onClick={handlePrint}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            🖨️ Print E-Tiket
          </button>
        </div>

        {/* E-Ticket Content */}
        <div className="bg-white rounded-lg shadow-lg p-8" id="eticket-content">
          {/* Header E-Ticket */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">BERKELANA</h1>
            <h2 className="text-xl font-semibold text-gray-800">E-TICKET</h2>
            <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-emerald-500 mt-4"></div>
          </div>

          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Left Side - Booking Details */}
            <div>
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg text-purple-700 mb-2">Informasi Booking</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kode Booking:</span>
                    <span className="font-semibold">{ticketData.kodePesanan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">{ticketData.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Bayar:</span>
                    <span className="font-semibold text-lg">{ticketData.totalBayar}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-700 mb-2">Informasi Pemesan</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nama:</span>
                    <span className="font-semibold">{ticketData.pemesan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold">{ticketData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Telepon:</span>
                    <span className="font-semibold">{ticketData.telepon}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Trip Details */}
            <div>
              <div className="bg-emerald-50 rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg text-emerald-700 mb-4">Detail Perjalanan</h3>
                
                {/* Route */}
                <div className="flex flex-col space-y-4">
                  {/* Departure */}
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-bold text-lg">{ticketData.ruteAsal}</div>
                      <div className="text-emerald-600 font-semibold">{ticketData.waktuKeberangkatan}</div>
                      <div className="text-sm text-gray-600">{ticketData.lokasiAsal}</div>
                    </div>
                  </div>

                  {/* Duration Line */}
                  <div className="ml-2 border-l-2 border-emerald-300 h-8"></div>

                  {/* Arrival */}
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full mr-4"></div>
                    <div>
                      <div className="font-bold text-lg">{ticketData.ruteTujuan}</div>
                      <div className="text-emerald-600 font-semibold">{ticketData.waktuKedatangan}</div>
                      <div className="text-sm text-gray-600">{ticketData.lokasiTujuan}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-semibold">{ticketData.tanggalKeberangkatan}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Kode Bus:</span>
                    <span className="font-semibold">{ticketData.kodeBus}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">No. Kondektur:</span>
                    <span className="font-semibold">{ticketData.noKondektur}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Passenger Details */}
          <div className="bg-blue-50 rounded-lg p-4 mb-8">
            <h3 className="font-bold text-lg text-blue-700 mb-4">Detail Penumpang ({ticketData.banyakPenumpang} Orang)</h3>
            <div className="space-y-3">
              {ticketData.penumpang.map((penumpang, index) => (
                <div key={index} className="bg-white rounded p-3 border border-blue-200">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <span className="text-gray-600 text-sm">Nama:</span>
                      <div className="font-semibold">{penumpang.nama}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">NIK:</span>
                      <div className="font-semibold">{penumpang.nik}</div>
                    </div>
                    <div>
                      <span className="text-gray-600 text-sm">No. Kursi:</span>
                      <div className="font-semibold text-blue-600">{penumpang.noKursi}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* QR Code & Footer */}
          <div className="text-center">
            <div className="bg-gray-100 w-32 h-32 mx-auto mb-4 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">QR CODE</span>
            </div>
            <p className="text-sm text-gray-600 mb-2">Tunjukkan e-tiket ini kepada kondektur saat naik bus</p>
            <p className="text-xs text-gray-500">Dicetak pada: {new Date().toLocaleString('id-ID')}</p>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #eticket-content, #eticket-content * {
            visibility: visible;
          }
          #eticket-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ETicketAdmin;