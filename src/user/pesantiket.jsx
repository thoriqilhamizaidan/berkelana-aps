// src/user/pesantiket.jsx
import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';


const PesanTiket = () => {
  // State for form inputs
  const [fromCity, setFromCity] = useState('');
  const [toCity, setToCity] = useState('');
  const [departDate, setDepartDate] = useState('');
  const [accommodation, setAccommodation] = useState('Bus');

  // Sample data for ticket search results
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
      promo: true
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
      promo: false
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
      promo: false
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
      promo: true
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
      promo: false
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section with Search Form */}
      <section className="relative h-96 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          {/* Coastal or mountain background image */}
          <img src="/api/placeholder/1920/400" alt="Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold text-black mb-8">Cari Tiketmu!</h1>
          
          {/* Search Form */}
          <div className="bg-white/90 rounded-lg p-4 w-full max-w-4xl shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1">Dari</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white"
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
              
              {/* Arrow Icon */}
              <div className="flex items-end justify-center md:col-span-1 pb-2">
                <ArrowLeftRight className="text-gray-500" size={20} />
              </div>
              
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1">Ke</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white"
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
                <label className="text-gray-600 text-sm mb-1">Tanggal Pergi</label>
                <div className="relative">
                  <input 
                    type="date" 
                    placeholder="Pilih Tanggal" 
                    className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1">Pilih Akomodasi</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                >
                  <option value="Bus">Bus</option>
                  <option value="Kereta">Kereta</option>
                  <option value="Pesawat">Pesawat</option>
                </select>
              </div>
              
              <div className="md:col-span-1 flex items-end">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold p-2 rounded focus:outline-none w-full flex items-center justify-center">
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

      {/* Search Results Section */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-xl font-bold mb-6">Menampilkan 5 Jadwal Terbaik</h2>
          
          {/* Ticket Results */}
          <div className="space-y-4">
            {ticketResults.map((ticket) => (
              <div key={ticket.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    {/* From - To Details */}
                    <div className="flex items-center mb-4 md:mb-0">
                      {ticket.promo && (
                        <span className="bg-red-500 text-white text-xs font-bold mr-4 py-1 px-2 rounded">
                          PROMO
                        </span>
                      )}
                      <div className="flex flex-col items-center mr-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          <span className="font-bold">{ticket.fromCity}</span>
                        </div>
                        <span className="text-sm text-gray-600">{ticket.fromCode}</span>
                      </div>
                      
                      <div className="text-gray-500 mx-2 text-sm">
                        <div className="border-t border-gray-300 w-16 my-1"></div>
                        <div className="text-xs text-center">{ticket.duration}</div>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                          <span className="font-bold">{ticket.toCity}</span>
                        </div>
                        <span className="text-sm text-gray-600">{ticket.toCode}</span>
                      </div>
                    </div>
                    
                    {/* Amenities and Price */}
                    <div className="flex flex-col md:flex-row items-start md:items-center ml-0 md:ml-4">
                      {/* Amenities */}
                      <div className="flex flex-col mr-0 md:mr-6 mb-4 md:mb-0">
                        {ticket.amenities.map((amenity, index) => (
                          <div key={index} className="flex items-center mb-1">
                            <div className="w-4 h-4 rounded-full bg-gray-200 mr-2 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                            </div>
                            <span className="text-xs text-gray-600">{amenity}</span>
                          </div>
                        ))}
                        <a href="#" className="text-xs text-blue-500">View Detail</a>
                      </div>
                      
                      {/* Price and Book Button */}
                      <div className="flex flex-col items-end">
                        <div className="text-xl font-bold text-gray-900 mb-2">
                          Rp {ticket.price.toLocaleString('id-ID')}
                        </div>
                        <button className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-6 rounded focus:outline-none">
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
      
      {/* Footer Banner */}
      <section className="relative h-48 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="../images/banner.png" alt="Footer Banner" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <h2 className="text-2xl font-bold mb-2">Berkelana</h2>
          <p className="text-lg">Perjalanan Tak Terbatas, Keindahan Tanpa Batas</p>
        </div>
      </section>
      
      <Footer />
    </>
  );
};

export default PesanTiket;