import React, { useState, useRef } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from './user/navbar';
import Footer from './user/footer';

// Add League Spartan font import - can be placed in the main CSS file as well
// This is commented out as normally it would be in a separate CSS file
// but showing how it would be imported
/*
@import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;500;600;700&display=swap');

:root {
  font-family: 'League Spartan', sans-serif;
}
*/

export default function BerkelanaLandingPage() {
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const navigate = useNavigate();
  const articlesRef = useRef(null);
  
  // Sample article data
  const articles = [
    {
      id: 1,
      title: "Me Time di Tengah Ketupat dan Perintilannya",
      image: "../images/ar1.png",
      author: "Stefanie Tirza",
      date: "25 Apr 2025",
      readTime: "3 Min Read",
      slug: "me-time-ketupat"
    },
    {
      id: 2,
      title: "Kembali ke Kota Rantau Bersama 'Rebecca'",
      image: "../images/ar2.png",
      author: "Pandu Surya",
      date: "26 Apr 2025",
      readTime: "7 Min Read",
      slug: "kota-rantau-rebecca"
    },
    {
      id: 3,
      title: "Menjalin Kebersamaan Dengan Cara Liburan",
      image: "../images/ar3.png",
      author: "Leonardo Firdausi",
      date: "27 Apr 2025",
      readTime: "5 Min Read",
      slug: "kebersamaan-liburan"
    },
    {
      id: 4,
      title: "Mengenal Sejarah Kota Surabaya!",
      image: "../images/ard.png",
      author: "Yosi Safyan",
      date: "25 Apr 2023",
      readTime: "3 Min Read",
      slug: "sejarah-kota-surabaya"
    },
    {
      id: 5,
      title: "5 Destinasi Wisata Tersembunyi di Indonesia",
      image: "../images/ar1.png",
      author: "Rini Putri",
      date: "28 Apr 2025",
      readTime: "4 Min Read",
      slug: "destinasi-tersembunyi"
    },
    {
      id: 6,
      title: "Tips Backpacking Hemat untuk Pemula",
      image: "../images/ar2.png",
      author: "Budi Santoso",
      date: "29 Apr 2025",
      readTime: "6 Min Read",
      slug: "backpacking-hemat"
    }
  ];

  // Handle scrolling articles left and right
  const scrollArticles = (direction) => {
    if (direction === 'prev') {
      if (currentArticleIndex > 0) {
        setCurrentArticleIndex(currentArticleIndex - 1);
      } else {
        // Loop back to the end
        setCurrentArticleIndex(Math.max(0, Math.ceil(articles.length / 3) - 1));
      }
    } else {
      if (currentArticleIndex < Math.ceil(articles.length / 3) - 1) {
        setCurrentArticleIndex(currentArticleIndex + 1);
      } else {
        // Loop back to the beginning
        setCurrentArticleIndex(0);
      }
    }
    
    // Scroll the articles container
    if (articlesRef.current) {
      articlesRef.current.scrollTo({
        left: currentArticleIndex * articlesRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Handle copy promo code and show notification
  const handleCopyCode = (code, e) => {
    e.stopPropagation(); // Prevent card click event
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setShowNotification(true);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // Navigate to article detail page
  const goToArticleDetail = (slug) => {
    navigate(`/artikel/${slug}`);
  };

  // Navigate to articles page
  const goToArticlesPage = () => {
    navigate('/artikel');
  };

  // Get the current visible articles based on the index
  const visibleArticles = articles.slice(currentArticleIndex * 3, (currentArticleIndex + 1) * 3);

  // Apply League Spartan font globally
  const fontStyle = {
    fontFamily: "'League Spartan', sans-serif"
  };

  return (
    <div style={fontStyle}>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Redeem code <strong>{copiedCode}</strong> disalin!</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-125 bg-cover bg-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          {/* Mountain background image */}
          <img src="../images/hero.png" alt="Mountain Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <img src="../images/lhero.png" alt="Berkelana Logo" className="mb-16" />
          
          <h1 className="text-5xl font-bold mb-2">Berkelana kemana hari ini?</h1>
          <p className="text-lg mb-12">Bersama Berkelana - Perjalanan Tak Terbatas, Keindahan Tanpa Batas</p>

          {/* Search Form */}
          <div className="bg-white/90 rounded-lg p-6 w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1">Dari</label>
                <select className="w-full border border-gray-200 p-3 rounded text-gray-800 appearance-none bg-white" style={fontStyle}>
                  <option value="">Pilih Kota</option>
                  <option>Jakarta</option>
                  <option>Bandung</option>
                  <option>Surabaya</option>
                </select>
              </div>
              
              {/* Arrow Icon */}
              <div className="flex items-end justify-center md:col-span-1 pb-3">
                <ArrowLeftRight className="text-gray-500" size={24} />
              </div>
              
              <div className="flex flex-col md:col-span-3">
                <label className="text-gray-600 text-sm mb-1">Ke</label>
                <select className="w-full border border-gray-200 p-3 rounded text-gray-800 appearance-none bg-white" style={fontStyle}>
                  <option value="">Pilih Kota</option>
                  <option>Bali</option>
                  <option>Yogyakarta</option>
                  <option>Medan</option>
                </select>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1">Tanggal Pergi</label>
                <div className="relative">
                  <input 
                    type="date" 
                    placeholder="Pilih Tanggal" 
                    className="w-full border border-gray-200 bg-white p-3 rounded text-gray-800 appearance-none"
                    style={fontStyle}
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col md:col-span-2">
                <label className="text-gray-600 text-sm mb-1">Pilih Akomodasi</label>
                <select className="w-full border border-gray-200 p-3 rounded text-gray-800 appearance-none bg-white" style={fontStyle}>
                  <option value="">Pilih Akomodasi</option>
                  <option>Bus</option>
                  <option>Shuttle</option>
                </select>
              </div>
              
              <div className="md:col-span-1 flex items-end">
                <button className="bg-green-500 hover:bg-green-600 text-white font-bold p-3 rounded focus:outline-none w-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                  Cari
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* Left Side Text */}
            <div className="md:w-1/3 mb-8 md:mb-0">
              <h2 className="text-4xl font-bold mb-2">
                Rencanakan Sekali, Jelajahi Banyak - <br />
                Bersama <span className="text-purple-500">#Berkelana</span>.
              </h2>
            </div>
            
            {/* Right Side Features */}
            <div className="md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature 1 */}
              <div className="bg-purple-100 rounded-lg p-6 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <img src="../images/f1.png" alt="Wallet" className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Ekonomis</h3>
                  <p className="text-sm text-gray-700">Harga tiket terjangkau & banyak promo menarik yang disediakan.</p>
                </div>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-purple-100 rounded-lg p-6 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <img src="../images/f2.png" alt="Clock" className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Praktis</h3>
                  <p className="text-sm text-gray-700">Semua proses jadi lebih cepat, pilih, dan aman.</p>
                </div>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-purple-100 rounded-lg p-6 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <img src="../images/f3.png" alt="Seat" className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Nyaman</h3>
                  <p className="text-sm text-gray-700">Armada bersih, reclining seat dan jarak antar kaki yang nyaman.</p>
                </div>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-purple-100 rounded-lg p-6 flex">
                <div className="mr-4">
                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center">
                    <img src="../images/f4.png" alt="Check" className="w-10 h-10" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Andal</h3>
                  <p className="text-sm text-gray-700">Pengemudi selalu mendapat informasi terbaru tentang keadaan jalan keterlambatan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">
              Serbu diskon <span className="text-purple-500">#Berkelana</span>
            </h2>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center mt-4 md:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Jelajahi Promo
            </button>
          </div>
          
          {/* Promo Cards - Added hover effects and copy notification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Promo Card 1 */}
            <div className="bg-gray-100 rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="relative h-48">
                <img src="../images/p1.png" alt="Jawa Tengah" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm">PROMO KE JAWA TENGAH</p>
                  <h3 className="text-4xl font-bold">50%</h3>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="p-1 rounded-sm shadow">
                    <img src="../images/lp.png" alt="INBank Logo" className="h-6" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-500 text-xs">i</span>
                  </div>
                  <span className="text-sm">Detail</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white px-12 py-1 rounded">
                    <span className="text-xs text-gray-600">GADOGADO</span>
                  </div>
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded transition-colors"
                    onClick={(e) => handleCopyCode("GADOGADO", e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Promo Card 2 */}
            <div className="bg-gray-100 rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="relative h-48">
                <img src="../images/p2.png" alt="Road Trip" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm">ROAD TRIP NYAMAN DENGAN TIPE BUS LARGEST</p>
                  <h3 className="text-4xl font-bold">150RB</h3>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="p-1 rounded-sm shadow">
                    <img src="../images/lp.png" alt="INBank Logo" className="h-6" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-500 text-xs">i</span>
                  </div>
                  <span className="text-sm">Detail</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white px-12 py-1 rounded">
                    <span className="text-xs text-gray-600">TRIPNYAMAN</span>
                  </div>
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded transition-colors"
                    onClick={(e) => handleCopyCode("TRIPNYAMAN", e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Promo Card 3 */}
            <div className="bg-gray-100 rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
              <div className="relative h-48">
                <img src="../images/p3.png" alt="Malang-Surabaya" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-transparent"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <p className="text-sm">MALANG - SURABAYA</p>
                  <h3 className="text-4xl font-bold">100RB</h3>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="p-1 rounded-sm shadow">
                    <img src="../images/lp.png" alt="INBank Logo" className="h-6" />
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center bg-gray-100">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <span className="text-purple-500 text-xs">i</span>
                  </div>
                  <span className="text-sm">Detail</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white px-12 py-1 rounded">
                    <span className="text-xs text-gray-600">MALSUR</span>
                  </div>
                  <button 
                    className="bg-purple-500 hover:bg-purple-600 text-white w-8 h-8 flex items-center justify-center rounded transition-colors"
                    onClick={(e) => handleCopyCode("MALSUR", e)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      
     {/* Articles Section */}
<section className="py-12 px-4 rounded-3xl bg-purple-50">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-3xl font-bold text-center mb-12">Baca dan bangkitkan semangat liburanmu</h2>
    
    <div className="relative">
      {/* Previous Button */}
      <button 
        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
        onClick={() => scrollArticles('prev')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Articles Container */}
      <div className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {visibleArticles.map((article) => (
            <div 
              key={article.id} 
              className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer transform hover:scale-105 transition-transform"
              onClick={() => goToArticleDetail(article.slug)}
            >
              <div className="h-48">
                <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-4">{article.title}</h3>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                    <img src="/api/placeholder/40/40" alt={article.author} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{article.author}</p>
                    <p className="text-xs text-gray-600">{article.date} • {article.readTime}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Next Button */}
      <button 
        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/70 w-10 h-10 rounded-full flex items-center justify-center shadow hover:bg-white transition-all"
        onClick={() => scrollArticles('next')}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
    
    {/* Pagination Indicators */}
    <div className="flex justify-center mt-6 space-x-2">
      {Array.from({ length: Math.ceil(articles.length / 3) }, (_, index) => (
        <button
          key={index}
          onClick={() => setCurrentArticleIndex(index)}
          className={`w-3 h-3 rounded-full ${
            currentArticleIndex === index ? 'bg-purple-500' : 'bg-gray-300'
          }`}
          aria-label={`Page ${index + 1}`}
        />
      ))}
    </div>
    
    {/* View All Button */}
    <div className="flex justify-center mt-8">
      <button 
        className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center hover:bg-green-600 transition-colors"
        onClick={goToArticlesPage}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Jelajahi Artikel
      </button>
    </div>
  </div>
</section>
      <Footer />
    </div>
  );
}