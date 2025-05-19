import React, { useState, useRef } from 'react';
import { Bell, Search, User, ChevronLeft, ChevronRight, X, Mail } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';
import { Link, useNavigate } from 'react-router-dom';
import ArtikelDetail from './artikeldetail';

const Artikel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('populer');
  const [showDestinations, setShowDestinations] = useState(false);
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Function to handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Show destinations content when Destinasi tab is clicked
    if (tab === 'destinasi') {
      setShowDestinations(true);
    } else {
      setShowDestinations(false);
    }
  };

  // Function to handle email submission
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    // Handle email submission logic here
    console.log('Email submitted:', email);
    setEmail('');
  };

  // Functions to control modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Function to navigate to article detail
  const navigateToArticleDetail = () => {
    navigate('/artikel/detail');
  };

  // Functions to control carousel
  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -carouselRef.current.offsetWidth : carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      <Navbar />
      {/* Hero Section with Background */}
      <section className="relative h-125 bg-cover bg-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          {/* Mountain background image */}
          <img src="../images/arhero.png" alt="Mountain Background" className="w-full h-full object-cover" />
        </div>
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
              Berkelana ke <span className="text-black">Newsroom</span>
            </h1>
            
            {/* Search Bar */}
            <div className="relative mt-2 w-[280px]">
              <input
                type="text"
                className="w-full py-1 px-2 pr-5 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Cari artikel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-0 top-0 bottom-0 px-4 bg-green-400 hover:bg-green-500 rounded-r-full flex items-center justify-center">
                <Search size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-10 px-6">
      {/* Tab Navigation */}
      <h2 className="text-2xl font-bold text-center mb-6">Artikel</h2>
      
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 rounded-full p-1 flex space-x-1">
          <button 
            className={`px-6 py-2 rounded-full transition-all ${activeTab === 'populer' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('populer')}
          >
            Populer
          </button>
          <button 
            className={`px-6 py-2 rounded-full transition-all ${activeTab === 'terbaru' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('terbaru')}
          >
            Terbaru
          </button>
          <button 
            className={`px-6 py-2 rounded-full transition-all ${activeTab === 'destinasi' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('destinasi')}
          >
            Destinasi
          </button>
          <button 
            className={`px-6 py-2 rounded-full transition-all ${activeTab === 'inspirasi' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => handleTabChange('inspirasi')}
          >
            Inspirasi
          </button>
        </div>
      </div>
      
      {activeTab === 'destinasi' ? (
        /* Destinations Content - with purple border around images */
        <div className="bg-gray-200 rounded-lg p-6">
          {/* Featured destination (large at top) */}
          <div className="mb-12">
            <div 
              className="rounded-lg overflow-hidden border border-purple-200 shadow-sm cursor-pointer hover:shadow-lg hover:border-purple-300 transition-all transform hover:-translate-y-1 duration-300"
              onClick={navigateToArticleDetail}
            >
              <div className="h-64 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard.png" 
                  alt="Surabaya" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-6 bg-gray-100">
                <h3 className="text-xl font-bold mb-3">Mengenal Sejarah Kota Surabaya</h3>
                <div className="flex items-center text-sm text-gray-500">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Putrayasa" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium">Yosi Sofyan</p>
                    <p className="text-xs">26 Apr 2023 • 3 min read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Grid of destination articles - With purple borders around images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Destination Card 1 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard1.png" 
                  alt="Banyuwangi" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Jelajahi Wisata Banyuwangi ala Rafal Hady, Sunrise of Java</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Putrayasa" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Putrayasa Putra</p>
                    <p className="text-xs text-gray-600">25 Apr 2023 • 4 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Destination Card 2 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard2.png" 
                  alt="Alun-Alun Batu" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Lokasi, Fasilitas, Aktivitas Seru di Alun-Alun Batu</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Hana" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hana Ananda</p>
                    <p className="text-xs text-gray-600">23 Apr 2023 • 6 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Destination Card 3 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard3.png" 
                  alt="Filipina" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Seru-seruan Wisata di Filipina, Ngapain Aja Nih?</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Abdul" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Abdul Rahman</p>
                    <p className="text-xs text-gray-600">22 Apr 2023 • 5 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Cards */}
            {/* Destination Card 4 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard4.png" 
                  alt="Batu Kuda" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Wisata Alam Batu Kuda Manglayang di Bandung Timur</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Abdul" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Abdul Rahman</p>
                    <p className="text-xs text-gray-600">22 Apr 2023 • 5 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Destination Card 5 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard5.png" 
                  alt="Gunung Gede" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Nikmati Kesejukan Surga Tropis Kaki Gunung Gede</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Abdul" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Abdul Rahman</p>
                    <p className="text-xs text-gray-600">22 Apr 2023 • 5 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Destination Card 6 */}
            <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                <img 
                  src="../images/ard6.png" 
                  alt="Gunung Kidul" 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">Gunung Kidul: Surga Tersembunyi di selatan Yogyakarta</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="../images/arp.png" alt="Abdul" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Abdul Rahman</p>
                    <p className="text-xs text-gray-600">22 Apr 2023 • 5 Min Read</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Default Content with purple borders around images */
        <>
          {/* Featured Articles Carousel */}
          <div className="relative">
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              onClick={() => scrollCarousel('left')}
            >
              <ChevronLeft size={24} />
            </button>
            
            <div 
              ref={carouselRef}
              className="flex space-x-6 overflow-x-auto scrollbar-hide pb-2" 
              style={{ scrollBehavior: 'smooth' }}
            >
              {/* Article Card 1 */}
              <div className="flex-none w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                    <img 
                      src="../images/arp1.png" 
                      alt="Ketupat" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-4">Me Time di Tengah Ketupat dan Perintilannya</h3>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img src="../images/arp.png" alt="Stefanie" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Stefanie Tirza</p>
                        <p className="text-xs text-gray-600">24 Apr 2023 • 3 Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Article Card 2 */}
              <div className="flex-none w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                    <img 
                      src="../images/arp2.png" 
                      alt="Kota Rantau" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-4">Kembali ke Kota Rantau Bersama 'Rebecca'</h3>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img src="../images/arp.png" alt="Pandu" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Pandu Surya</p>
                        <p className="text-xs text-gray-600">18 Apr 2023 • 7 Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Article Card 3 */}
              <div className="flex-none w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                    <img 
                      src="../images/arp1.png" 
                      alt="Kebersamaan Liburan" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-4">Menjalin Kebersamaan Dengan Cara Liburan</h3>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img src="../images/arp3.png" alt="Leonard" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Leonard Firdiova</p>
                        <p className="text-xs text-gray-600">27 Apr 2023 • 5 Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Article Card 4 */}
              <div className="flex-none w-full md:w-1/3">
                <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                  <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                    <img 
                      src="../images/arp4.png" 
                      alt="Pantai Liburan" 
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-4">Keindahan Pantai Kuta yang Tak Lekang oleh Waktu</h3>
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                        <img src="../images/arp.png" alt="Hana" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Hana Ananda</p>
                        <p className="text-xs text-gray-600">20 Apr 2023 • 4 Min Read</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
              onClick={() => scrollCarousel('right')}
            >
              <ChevronRight size={24} />
            </button>
          </div>
          
          {/* Destinasi Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                Artikel Destinasi
                <button 
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => handleTabChange('destinasi')}
                >
                  <ChevronRight size={20} className="text-black" />
                </button>
              </h2>
            </div>
                
            <p className="text-gray-600 mb-6">Berkelana dan jelajahi destinasi di bawah ini, sekarang!</p>
                
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Destinasi Card 1 */}
              <div 
                className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                onClick={navigateToArticleDetail}
              >
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp4.png" 
                    alt="Surabaya" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">Mengenal Sejarah Kota Surabaya</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Yogi" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Yogi Safwan</p>
                      <p className="text-xs text-gray-600">26 Apr 2023 • 3 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Destinasi Card 2 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp5.png" 
                    alt="Yogyakarta" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">Di Balik Keindahan Yogyakarta</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Stefanie" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Stefanie Tirza</p>
                      <p className="text-xs text-gray-600">24 Apr 2023 • 4 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Destinasi Card 3 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp6.png" 
                    alt="Semarang" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">Sebenarnya Semarang terdapat apa saja?</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Naraissa" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Naraissa Putri</p>
                      <p className="text-xs text-gray-600">23 Apr 2023 • 6 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Inspirasi Section */}
          <div className="mt-16">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold flex items-center">
                Artikel Inspirasi
                <button 
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={() => handleTabChange('inspirasi')}
                >
                  <ChevronRight size={20} className="text-black" />
                </button>
              </h2>
            </div>
                
            <p className="text-gray-600 mb-6">Perkaya rencana perjalanan Anda dengan membaca artikel inspirasi berikut.</p>
                
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Inspirasi Card 1 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp7.png" 
                    alt="Tips Liburan" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">9 Tips Liburan Akhir Tahun agar Dompet Tidak Menipis</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Abdul" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Abdul Rahman</p>
                      <p className="text-xs text-gray-600">25 Apr 2023 • 3 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Inspirasi Card 2 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp8.png" 
                    alt="Pantai Liburan" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">Inilah Cara Memaksimalkan Waktu Liburan Anda yang Singkat!</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Hana" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hana Ananda</p>
                      <p className="text-xs text-gray-600">22 Apr 2023 • 5 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Inspirasi Card 3 */}
              <div className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="h-48 overflow-hidden border-4 border-purple-400 rounded-t-lg">
                  <img 
                    src="../images/arp9.png" 
                    alt="Remote Work" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-4">Liburan Kok Rebahan? Berikut Tips Mengisi Waktu Liburan</h3>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                      <img src="../images/arp.png" alt="Naraissa" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Naraissa Putri</p>
                      <p className="text-xs text-gray-600">21 Apr 2023 • 3 Min Read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>

      {/* Banner Section with Purple Background above Footer */}
      <div className="w-full bg-purple-500 py-12">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0 md:w-1/2 text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Ingin berbagi pengalaman bersama <span className="text-white">#Berkelana</span> ?
            </h2>
          </div>
          <div className="md:w-1/2">
            <div className="flex shadow-lg rounded-lg overflow-hidden">
              <input
                type="email"
                placeholder="Kirim pengalaman kalian ke email #Berkelana !"
                className="flex-grow px-4 py-3 bg-white text-black focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                className="bg-green-500 text-white px-4 py-3 hover:bg-green-600 focus:outline-none"
                onClick={openModal}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-white"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black opacity-50" onClick={closeModal}></div>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4 relative z-10">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="bg-purple-400 p-4 rounded-full mb-4">
                <Mail size={32} className="text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Kirim Pengalaman kalian pada kami!</h2>
              
              <p className="mb-2">kirim via email ke:</p>
              <p className="font-bold mb-6">maribekelana@gmail.com</p>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default Artikel;