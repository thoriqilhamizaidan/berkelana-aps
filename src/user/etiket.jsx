import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import the useNavigate hook

const ETicket = () => {
  const ticket = {
    bookingCode: "29052025A",
    date: "Selasa, 29 April 2025",
    duration: "3 jam",
    departureCity: "GROGOL",
    arrivalCity: "CIHAMPELAS",
    departureTime: "03:00",
    departureDetails: "Jl Daan Mogot Raya KM 1N",
    arrivalTime: "06:00 ",
    arrivalDetails: "Jl Cihampelas No 64N",
    passengerDetails: [
      { name: "Nasywa Putri Nataliza", seat: "Seat 5" },
      { name: "Irene Arawinda", seat: "Seat 6" }
    ],
    contactPerson: {
      name: "Nasywa Putri Nataliza",
      no: "08124940599",
      email: "natalizanasywaputri@gmail.com"
    },
    shuttleCode: "201A",
    kondekturNo: "081249401599"
  };

  const navigate = useNavigate(); // Initialize navigate function

  const handleClose = () => {
    navigate('/tiket-saya'); // Navigate to Tiketsaya page when button is clicked
  };

  return (
    <div className="w-full bg-white p-4 md:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header with Logo (No Padding) */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <img src="/images/Berkelana-logo.png" alt="Berkelana" className="h-20 text-purple-600" />
          </div>
          <button
            onClick={handleClose} // Add onClick event to handle the close button
            className="text-gray-400 hover:text-[#9966FF]" // Change color on hover
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
              <img src="/images/seat.jpg" alt="Interior Bus" className="w-full h-48 object-cover rounded-lg mb-4" />
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
                <div className="absolute left-3 top-3 w-0.5 h-40 bg-green-500"></div>
                {/* From */}
                <div className="flex mb-8 relative">
                  <div className="mr-4 z-10">
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
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
                    <div className="w-6 h-6 rounded-full bg-green-500"></div>
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
      </div>
    </div>
  );
};

export default ETicket;
