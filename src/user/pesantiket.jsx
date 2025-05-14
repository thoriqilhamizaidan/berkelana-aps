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
      originalPrice: 180000, // Added originalPrice
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
      originalPrice: 165000, // Added originalPrice (same as price)
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
      originalPrice: 150000, // Added originalPrice (same as price)
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
      originalPrice: 175000, // Added originalPrice
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
      originalPrice: 120000, // Added originalPrice (same as price)
      promo: false
    }
  ];

  // Adding the missing tickets data for the alternative ticket display
  const tickets = [
    {
      id: 1,
      route: 'Jakarta - Bandung',
      bus: 'Executive Class',
      duration: '3 jam',
      departure: '08:00',
      arrival: '11:00',
      price: 175000,
      discount: 10,
      soldOut: false
    },
    {
      id: 2,
      route: 'Jakarta - Bandung',
      bus: 'Economy Class',
      duration: '3 jam 30 menit',
      departure: '09:00',
      arrival: '12:30',
      price: 125000,
      discount: null,
      soldOut: false
    },
    {
      id: 3,
      route: 'Jakarta - Bandung',
      bus: 'VIP Class',
      duration: '2 jam 45 menit',
      departure: '10:00',
      arrival: '12:45',
      price: 200000,
      discount: 5,
      soldOut: true
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section with Search Form */}
      <section className="relative h-100 bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-blue-500/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          {/* Coastal or mountain background image */}
          <img src="/images/janke-laskowski-jz-ayLjk2nk-unsplash.jpg" alt="Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-4">
          <h1 className="text-4xl font-bold text-black mb-8">Cari Tiketmu!</h1>
          
          {/* Search Form */}
          <div className="bg-purplelight rounded-lg p-3 w-full max-w-350 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-7 items-center">
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1 " >Dari</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg"
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
              <div className="flex items-end justify-center md:col-span-1 pb-1 pt-7">
                <ArrowLeftRight className="text-black" size={20} />
              </div>
              
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1">Ke</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg"
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
                <label className="text-gray-600 text-sm mb-1 ">Tanggal Pergi</label>
                <div className="relative">
                  <input 
                    type="date" 
                    placeholder="Pilih Tanggal" 
                    className="w-full border border-gray-200 p-2 rounded text-gray-800 bg-white shadow-lg"
                    value={departDate}
                    onChange={(e) => setDepartDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1">Pilih Akomodasi</label>
                <select 
                  className="w-full border border-gray-200 p-2 rounded text-gray-800 appearance-none bg-white shadow-lg"
                  value={accommodation}
                  onChange={(e) => setAccommodation(e.target.value)}
                >
                  <option value="Bus">Bus</option>
                  <option value="Kereta">Shuttle</option>
                </select>
              </div>
              
              <div className="md:col-span-1 flex items-end">
                <button className="bg-emerald-500 hover:bg-green-600 text-white font-bold p-2 rounded focus:outline-none w-full flex items-center justify-center">
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
          
          {/* Ticket Results - Redesigned to match the image */}
          <div className="space-y-4">
            {ticketResults.map((ticket) => (
              <div key={ticket.id} className="bg-neutral-100 rounded-lg shadow-md overflow-hidden">
                {ticket.promo && (
                  <div className="bg-red-600 text-white text-sm font-bold py-1 px-4 inline-block">
                    Gampang habis!
                  </div>
                )}
                
                <div className="p-4">
                  <div className="flex flex-row">
                    {/* Left Side - Route Info */}
                    <div className="flex-1">
                      <div className="flex items-start">
                        <div className="relative">
                          {/* From */}
                          <div className="flex flex-col items-start">
                            <div className="flex items-center">
                              <div className=" relative left-1 h-6 w-6 rounded-full bg-emerald1"></div>
                              <span className="font-bold text-xl ml-3">{ticket.fromCity}</span>
                            </div>
                            <span className="text-gray-600 ml-11">{ticket.fromCode}</span>
                          </div>
                          
                          {/* Travel Line connecting circles */}
                          <div className="absolute left-3.5 top-9" style={{width: '2px', height: '130px', backgroundColor: '#33CB98'}}>
                            {/* Duration text */}
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-sm text-gray-500 whitespace-nowrap">
                              {ticket.duration}
                            </span>
                          </div>
                          
                          {/* To */}
                          <div className="flex flex-col items-start" style={{marginTop: '120px'}}>
                            <div className="flex items-center">
                              <div className="relative left-1 h-6 w-6 rounded-full bg-emerald1"></div>
                              <span className="font-bold text-xl ml-3">{ticket.toCity}</span>
                            </div>
                            <span className="text-gray-600 ml-11">{ticket.toCode}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right Side - Amenities and Pricing */}
                    <div className="flex flex-col justify-between">
                      {/* Top section - Amenities and View Details */}
                      <div className="flex items-center space-x-6 mb-4">
                        {/* Amenities */}
                        <div className="flex space-x-2">
                          {ticket.amenities.map((amenity, index) => (
                            <span key={index} className="px-3 py-1 border border-purple-800 rounded-full text-xs text-black font-semibold">
                              {amenity}
                            </span>
                          ))}
                        </div>
                        
                        {/* View Details Link */}
                        <div>
                          <a href="#" className="text-purple1 text-sm">View Detail</a>
                        </div>
                      </div>
                      
                      {/* Bottom section - Price and Book Button */}
                      <div className="flex flex-col items-end">
                        {ticket.originalPrice > ticket.price && (
                          <div className="text-sm text-gray-500 line-through">
                            Rp {ticket.originalPrice.toLocaleString('id-ID')}
                          </div>
                        )}
                        <div className="text-2xl font-bold text-gray-900">
                          Rp {ticket.price.toLocaleString('id-ID')}
                        </div>
                        <button className="bg-emerald-500 hover:bg-green-600 text-white text-sm font-bold py-2 px-6 rounded-lg mt-1">
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
      
      <Footer />
    </>
  );
};

export default PesanTiket;