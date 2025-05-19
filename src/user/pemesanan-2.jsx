import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import Footer from './footer';
import { ChevronLeft } from 'lucide-react';

const Pemesanan2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ticket, formData } = location.state || {};
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerSeats, setPassengerSeats] = useState({});
  
  // Count how many passengers we have
  const passengerCount = [
    formData?.namaPenumpang1, 
    formData?.namaPenumpang2, 
    formData?.namaPenumpang3
  ].filter(Boolean).length;
  
  // Setup dummy seat data
  const [seatData, setSeatData] = useState({
    rows: 7,
    cols: 4,
    reservedSeats: [
      '1B', '2A', '3D', '4C', '5A', '5B', '6C', '6D', '7A'
    ],
    seatMap: {
      'A': 0,
      'B': 1,
      'C': 2,
      'D': 3
    }
  });
  
  useEffect(() => {
    // Initialize passenger seats mapping
    if (passengerCount > 0) {
      const initialMapping = {};
      if (formData?.namaPenumpang1) {
        initialMapping[formData.namaPenumpang1] = null;
      }
      if (formData?.namaPenumpang2) {
        initialMapping[formData.namaPenumpang2] = null;
      }
      if (formData?.namaPenumpang3) {
        initialMapping[formData.namaPenumpang3] = null;
      }
      setPassengerSeats(initialMapping);
    }
  }, [formData, passengerCount]);

  const handleSeatClick = (seatId) => {
    // If seat is already reserved, do nothing
    if (seatData.reservedSeats.includes(seatId)) {
      return;
    }
    
    // If seat is already selected, deselect it
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(prev => prev.filter(seat => seat !== seatId));
      
      // Remove seat from passenger mapping
      const updatedMapping = { ...passengerSeats };
      Object.keys(updatedMapping).forEach(passenger => {
        if (updatedMapping[passenger] === seatId) {
          updatedMapping[passenger] = null;
        }
      });
      setPassengerSeats(updatedMapping);
      return;
    }
    
    // If we've already selected maximum seats, do nothing
    if (selectedSeats.length >= passengerCount) {
      return;
    }
    
    // Add seat to selected seats
    setSelectedSeats(prev => [...prev, seatId]);
    
    // Assign seat to first passenger without a seat
    const passengerWithoutSeat = Object.keys(passengerSeats).find(
      passenger => passengerSeats[passenger] === null
    );
    
    if (passengerWithoutSeat) {
      setPassengerSeats(prev => ({
        ...prev,
        [passengerWithoutSeat]: seatId
      }));
    }
  };
  
  const handleSubmit = () => {
    // Check if all passengers have seats assigned
    const allSeatsAssigned = Object.values(passengerSeats).every(seat => seat !== null);
    
    if (!allSeatsAssigned) {
      alert('Silahkan pilih kursi untuk semua penumpang');
      return;
    }
    
    // Process payment or navigate to payment page
    console.log('Proceeding to payment with seats:', passengerSeats);
    navigate('/pembayaran', { 
      state: { 
        ticket, 
        formData, 
        passengerSeats,
        totalPrice: calculateTotal()
      } 
    });
  };
  
  const getSeatColor = (rowIndex, colIndex) => {
    const seatId = getSeatId(rowIndex, colIndex);
    
    if (seatData.reservedSeats.includes(seatId)) {
      return 'bg-gray-400 text-white cursor-not-allowed'; // Reserved seat
    }
    
    if (selectedSeats.includes(seatId)) {
      return 'bg-pink-500 text-white cursor-pointer'; // Selected seat
    }
    
    return 'bg-gray-200 hover:bg-gray-300 cursor-pointer'; // Available seat
  };
  
  const getSeatId = (rowIndex, colIndex) => {
    const row = rowIndex + 1;
    const col = Object.keys(seatData.seatMap).find(key => seatData.seatMap[key] === colIndex);
    return `${row}${col}`;
  };
  
  const calculateTotal = () => {
    const ticketPrice = 150000; // Per ticket price
    const baseTotal = ticketPrice * passengerCount;
    const adminFee = 10000;
    return baseTotal + adminFee;
  };

  return (
    <>
      <Navbar />
      
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
        
        {/* Data Penumpang Display */}
        <div className="bg-neutral-100 rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-xl font-bold mb-4">Data Penumpang</h2>
          
          <div className="space-y-4">
            {formData?.namaPenumpang1 && (
              <div>
                <div className="font-semibold">Data Penumpang 1</div>
                <div className="flex justify-between">
                  <div className="text-gray-700">
                    {formData.namaPenumpang1} - {formData.jenisKelamin1}
                  </div>
                  <div className="font-medium">
                    {passengerSeats[formData.namaPenumpang1] ? 
                      `Kursi ${passengerSeats[formData.namaPenumpang1]}` : 
                      'Belum memilih kursi'}
                  </div>
                </div>
              </div>
            )}
            
            {formData?.namaPenumpang2 && (
              <div>
                <div className="font-semibold">Data Penumpang 2</div>
                <div className="flex justify-between">
                  <div className="text-gray-700">
                    {formData.namaPenumpang2} - {formData.jenisKelamin2}
                  </div>
                  <div className="font-medium">
                    {passengerSeats[formData.namaPenumpang2] ? 
                      `Kursi ${passengerSeats[formData.namaPenumpang2]}` : 
                      'Belum memilih kursi'}
                  </div>
                </div>
              </div>
            )}
            
            {formData?.namaPenumpang3 && (
              <div>
                <div className="font-semibold">Data Penumpang 3</div>
                <div className="flex justify-between">
                  <div className="text-gray-700">
                    {formData.namaPenumpang3} - {formData.jenisKelamin3}
                  </div>
                  <div className="font-medium">
                    {passengerSeats[formData.namaPenumpang3] ? 
                      `Kursi ${passengerSeats[formData.namaPenumpang3]}` : 
                      'Belum memilih kursi'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Side - Seat Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-5">
              <h2 className="text-xl font-bold mb-4">Pilih Kursi</h2>
              
              {/* Seat selection legend */}
              <div className="flex space-x-4 mb-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-200 mr-2"></div>
                  <span>Tersedia</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-400 mr-2"></div>
                  <span>Sudah dipesan</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-pink-500 mr-2"></div>
                  <span>Kursi dipilih</span>
                </div>
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
                      
                      return (
                        <div 
                          key={`${rowIndex}-${colIndex}`} 
                          className={`${colIndex === 1 || colIndex === 2 ? marginClass : ''}`}
                        >
                          <button 
                            onClick={() => handleSeatClick(seatId)}
                            disabled={seatData.reservedSeats.includes(seatId)}
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
              <h3 className="font-bold text-lg mb-3">Selasa, 29 April 2025</h3>
              
              <div className="space-y-3">
                {/* Journey details */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-black">GROGOL</div>
                    <div className="text-sm text-gray-600">04:20</div>
                    <div className="text-xs text-gray-500 mt-1">
                      JI Plaza Mayjen<br />
                      Raya No.111
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-black">CIAMPELAS</div>
                    <div className="text-sm text-gray-600">09:50</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Jl. Ciampelas No GHI
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 mt-3">
                  Estimasi waktu: 5 jam perjalanan
                </div>
                
                {/* Payment details */}
                <div className="pt-3 border-t">
                  <h4 className="font-bold mb-2">Rincian Pembayaran</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Bus Bekerlana Grogol - Ciampelas ({passengerCount}x)</span>
                      <span>Rp {(150000 * passengerCount).toLocaleString()}</span>
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
      
      <Footer />
    </>
  );
};

export default Pemesanan2;