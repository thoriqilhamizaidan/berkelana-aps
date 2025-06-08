import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, ChevronLeft, ChevronRight, X, Mail, ChevronDown, ChevronUp, Eye } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';
import { Link, useNavigate } from 'react-router-dom';
import artikelService from '../services/artikelService';

const Artikel = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('populer');
  const [showDestinations, setShowDestinations] = useState(false);
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [articles, setArticles] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const carouselRef = useRef(null);
  const navigate = useNavigate();

  // Mengambil data artikel saat komponen dimuat
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await artikelService.fetchArticles();
        
        // Check if data is an array
        if (!Array.isArray(data)) {
          throw new Error('Data yang diterima bukan array');
        }
        
        // Transform data to match expected format
        const transformedData = data.map(article => {
          const tanggalUpload = new Date(article.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          });
          
          return {
            ...article,
            id: article.id_artikel, // Make sure we have consistent ID
            penulis: article.nama_penulis,
            judul: article.judul,
            tanggal: tanggalUpload,
            gambarUrl: article.gambar_artikel ? `http://localhost:3000/uploads/artikel/${article.gambar_artikel}` : null,
            authorPhotoUrl: article.foto_penulis ? `http://localhost:3000/uploads/artikel/${article.foto_penulis}` : null,
            // Menggunakan isi dari database, bukan konten dummy
            isiArtikel: article.isi || 'Konten artikel tidak tersedia.',
            // Pastikan jumlah_pembaca ada dan merupakan number
            jumlah_pembaca: parseInt(article.jumlah_pembaca) || 0
          };
        });
        
        // Sort by creation date - newest first by default
        const sortedData = transformedData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setArticles(sortedData);
        
      } catch (error) {
        console.error('Terjadi kesalahan saat mengambil artikel:', error);
        setError(`Gagal memuat artikel: ${error.message}`);
        setArticles([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Function to update article click count using service
  const updateArticleClickCount = async (articleId) => {
    try {
      console.log('Starting updateArticleClickCount for ID:', articleId);
      
      // Pastikan articleId valid
      if (!articleId) {
        throw new Error('Invalid article ID');
      }
      
      // Gunakan ID yang konsisten
      const idToUse = articleId;
      console.log('Using ID for API call:', idToUse);
      
      const updatedData = await artikelService.incrementArticleViews(idToUse);
      console.log('API response:', updatedData);
      
      // Update local state dengan data dari server
      setArticles(prevArticles => {
        const updated = prevArticles.map(article => {
          // Periksa kedua kemungkinan field ID
          const articleCurrentId = article.id_artikel || article.id;
          
          if (articleCurrentId == idToUse) { // Gunakan == untuk menghindari masalah tipe data
            console.log('Updating article in state:', article.judul);
            return { 
              ...article, 
              jumlah_pembaca: updatedData.jumlah_pembaca || updatedData.views || (article.jumlah_pembaca + 1)
            };
          }
          return article;
        });
        
        console.log('State updated');
        return updated;
      });
      
    } catch (error) {
      console.error('Error updating article view count:', error);
      // Jangan blokir UI jika gagal, tapi log error untuk debugging
    }
  };

  // Function to filter articles based on active tab and search query
  const getFilteredArticles = () => {
    let filtered = articles;
    
    // Filter by search query first
    if (searchQuery.trim()) {
      filtered = filtered.filter(article => 
        article.judul?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.penulis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.kategori?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.isi?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Then filter/sort by active tab
    if (activeTab === 'populer') {
      // Filter artikel yang memiliki jumlah_pembaca > 0 (sudah pernah diklik/dibaca)
      const popularArticles = filtered
        .filter(article => {
          const views = parseInt(article.jumlah_pembaca) || 0;
          return views > 0; // Hanya artikel yang sudah pernah diklik/dibaca
        })
        .sort((a, b) => {
          const aViews = parseInt(a.jumlah_pembaca) || 0;
          const bViews = parseInt(b.jumlah_pembaca) || 0;
          return bViews - aViews; // Sort descending berdasarkan jumlah pembaca
        });
      
      // Batasi hanya 6 artikel teratas
      return popularArticles.slice(0, 6);
      
    } else if (activeTab === 'terbaru') {
      // Sort by creation date - newest first
      return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (activeTab === 'destinasi') {
      // Filter by category 'Destinasi'
      return filtered.filter(article => 
        article.kategori && article.kategori.toLowerCase() === 'destinasi'
      );
    } else if (activeTab === 'inspirasi') {
      // Filter by category 'Inspirasi'
      return filtered.filter(article => 
        article.kategori && article.kategori.toLowerCase() === 'inspirasi'
      );
    }
    return filtered;
  };

  // Function to handle tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setExpandedArticle(null); // Reset expanded article when changing tabs
    
    // Show destinations content when Destinasi tab is clicked
    if (tab === 'destinasi') {
      setShowDestinations(true);
    } else {
      setShowDestinations(false);
    }
  };

  // Function to handle article click (expand/collapse)
  const handleArticleClick = async (articleId) => {
    try {
      // Update click count hanya jika artikel belum di-expand
      if (expandedArticle !== articleId) {
        await updateArticleClickCount(articleId);
      }

      // Toggle expand/collapse
      if (expandedArticle === articleId) {
        setExpandedArticle(null);
      } else {
        setExpandedArticle(articleId);
      }
    } catch (error) {
      console.error('Error handling article click:', error);
      // Tetap lanjutkan untuk expand/collapse meskipun update gagal
      if (expandedArticle === articleId) {
        setExpandedArticle(null);
      } else {
        setExpandedArticle(articleId);
      }
    }
  };

  // Function to handle email submission
  const handleEmailSubmit = (e) => {
    e.preventDefault();
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

  // Fungsi untuk menavigasi ke detail artikel
const navigateToArticleDetail = async (articleId) => {
  // Update jumlah pembaca sebelum navigasi
  await updateArticleClickCount(articleId);
  navigate(`/artikel/detail/${articleId}`);
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

  // Function to handle search
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is handled automatically through getFilteredArticles()
  };

  const filteredArticles = getFilteredArticles();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section with Background */}
        <section className="relative h-80 sm:h-96 md:h-125 bg-cover bg-center pt-16">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
  <div className="absolute inset-0 z-0">
    <img src="../images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
  </div>
  <div className="relative z-10 container mx-auto px-4 sm:px-6 h-full flex flex-col justify-center">
    <div className="max-w-3xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-white text-center sm:text-left">
        Berkelana ke <span className="text-black">Newsroom</span>
      </h1>
      
      <form onSubmit={handleSearchSubmit} className="relative mt-4 w-full sm:w-80 mx-auto sm:mx-0">
        <input
          type="text"
          className="w-full py-2 sm:py-1 px-4 sm:px-2 pr-12 sm:pr-5 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
          placeholder="Cari artikel"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-4 bg-emerald1 hover:bg-green-500 rounded-r-full flex items-center justify-center"
        >
          <Search size={16} className="text-white" />
        </button>
      </form>
    </div>
  </div>
</section>
        
        <div className="container mx-auto py-10 px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Memuat artikel...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section with Background */}
        <section className="relative h-125 bg-cover bg-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
          <div className="absolute inset-0 z-0">
            <img src="../images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
          </div>
          <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
            <div className="max-w-3xl">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
                Berkelana ke <span className="text-black">Newsroom</span>
              </h1>
            </div>
          </div>
        </section>
        
        <div className="container mx-auto py-10 px-6">
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  return (
    <>
      {/* Hero Section with Background */}
      <section className="relative h-125 bg-cover bg-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="../images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-white">
              Berkelana ke <span className="text-black">Newsroom</span>
            </h1>
            
            <form onSubmit={handleSearchSubmit} className="relative mt-2 w-[280px]">
              <input
                type="text"
                className="w-full py-1 px-2 pr-5 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Cari artikel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-0 top-0 bottom-0 px-4 bg-emerald1 hover:bg-green-500 rounded-r-full flex items-center justify-center"
              >
                <Search size={16} className="text-white" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <div className="container mx-auto py-6 sm:py-8 md:py-10 px-4 sm:px-6">
  {/* Tab Navigation */}
  <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">Artikel</h2>
  
  <div className="flex justify-center mb-6 sm:mb-8">
    <div className="bg-gray-100 rounded-full p-1 flex flex-wrap sm:flex-nowrap space-x-1 w-full sm:w-auto justify-center">
      <button 
        className={`px-3 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'populer' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => handleTabChange('populer')}
      >
        Populer
      </button>
      <button 
        className={`px-3 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'terbaru' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => handleTabChange('terbaru')}
      >
        Terbaru
      </button>
      <button 
        className={`px-3 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'destinasi' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => handleTabChange('destinasi')}
      >
        Destinasi
      </button>
      <button 
        className={`px-3 sm:px-6 py-2 rounded-full transition-all text-sm sm:text-base whitespace-nowrap ${activeTab === 'inspirasi' ? 'text-purple-500 font-medium' : 'text-gray-700 hover:bg-gray-200'}`}
        onClick={() => handleTabChange('inspirasi')}
      >
        Inspirasi
      </button>
    </div>
  </div>
        
        {/* Search Results Info */}
        {searchQuery.trim() && (
          <div className="mb-4 text-center">
            <p className="text-gray-600">
              Menampilkan {filteredArticles.length} hasil untuk "{searchQuery}"
            </p>
          </div>
        )}
        
        {/* Articles Content */}
        <div className="bg-gray-200 rounded-lg p-6">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {searchQuery.trim() 
                  ? `Tidak ada artikel yang ditemukan untuk pencarian "${searchQuery}".`
                  : activeTab === 'populer'
                  ? 'Belum ada artikel populer. Artikel akan muncul setelah dibaca oleh pengguna.'
                  : `Tidak ada artikel yang ditemukan untuk kategori ${activeTab}.`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Tambahkan info khusus untuk tab populer */}
              {activeTab === 'populer' && (
                <div className="mb-4 text-center">
                  <p className="text-gray-600 text-sm">
                    Menampilkan {filteredArticles.length} artikel paling populer (berdasarkan jumlah pembaca)
                  </p>
                </div>
              )}

              {/* Jika ada artikel yang diperluas, tampilkan hanya artikel tersebut */}
              {expandedArticle ? (
                <div>
                  {(() => {
                    const article = filteredArticles.find(a => a.id_artikel === expandedArticle);
                    if (!article) return null;
                    
                    return (
                      <div className="bg-white rounded-lg overflow-hidden shadow-lg">
                        {/* Header artikel yang diperluas */}
                        <div 
                          className="cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => handleArticleClick(article.id_artikel)}
                        >
                          <div className="p-6 border-b">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-4 text-gray-900">{article.judul}</h3>
                                <div className="flex items-center">
                                  <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                                    {article.authorPhotoUrl ? (
                                      <img src={article.authorPhotoUrl} alt={article.penulis} className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                                        <User size={20} className="text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{article.penulis}</p>
                                    <p className="text-sm text-gray-600">{article.tanggal}</p>
                                  </div>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    article.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
                                    article.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
                                    article.kategori === 'Popular' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {article.kategori || 'Umum'}
                                  </span>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Eye size={16} className="mr-1" />
                                    <span>{article.jumlah_pembaca || 0} views</span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center">
                                <ChevronUp size={24} className="text-gray-500" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Konten detail artikel dari database */}
                        <div className="p-6">
                          {article.gambarUrl && (
                            <div className="mb-6">
                              <img 
                                src={article.gambarUrl} 
                                alt={article.judul} 
                                className="w-full h-64 object-cover rounded-lg"
                              />
                            </div>
                          )}
                          <div className="prose max-w-none">
                            <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                              {article.isiArtikel}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
               <div>
  {/* Desktop Grid - 3 columns */}
  <div className="hidden md:grid md:grid-cols-3 gap-6">
    {filteredArticles.map((article) => (
      <div 
        key={article.id_artikel} 
        className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        onClick={() => navigateToArticleDetail(article.id_artikel)}
      >
        <div className={`h-48 overflow-hidden ${activeTab === 'destinasi' ? 'border-4 border-purple-400' : 'border-2 border-gray-300'} rounded-t-lg`}>
          {article.gambarUrl ? (
            <img 
              src={article.gambarUrl} 
              alt={article.judul} 
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-500">Tidak ada gambar</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-bold flex-1">{article.judul}</h3>
            <ChevronDown size={20} className="text-gray-500 ml-2 flex-shrink-0" />
          </div>
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
              {article.authorPhotoUrl ? (
                <img src={article.authorPhotoUrl} alt={article.penulis} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
            <div>
              <p className="text-sm font-medium">{article.penulis}</p>
              <p className="text-xs text-gray-600">{article.tanggal}</p>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              article.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
              article.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
              article.kategori === 'Popular' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {article.kategori || 'Umum'}
            </span>
            <div className="flex items-center text-xs text-gray-600">
              <Eye size={12} className="mr-1" />
              <span>{article.jumlah_pembaca || 0}</span>
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Mobile Horizontal Scroll */}
  <div className="md:hidden">
    <div className="flex overflow-x-auto space-x-4 pb-6 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      {filteredArticles.map((article) => (
        <div 
          key={article.id_artikel} 
          className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 flex-shrink-0 w-72"
          onClick={() => navigateToArticleDetail(article.id_artikel)}
        >
          <div className={`h-40 overflow-hidden ${activeTab === 'destinasi' ? 'border-4 border-purple-400' : 'border-2 border-gray-300'} rounded-t-lg`}>
            {article.gambarUrl ? (
              <img 
                src={article.gambarUrl} 
                alt={article.judul} 
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-500 text-sm">Tidak ada gambar</span>
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-bold text-sm flex-1 line-clamp-2">{article.judul}</h3>
              <ChevronDown size={18} className="text-gray-500 ml-2 flex-shrink-0" />
            </div>
            <div className="flex items-center mb-3">
              <div className="w-6 h-6 rounded-full overflow-hidden mr-2">
                {article.authorPhotoUrl ? (
                  <img src={article.authorPhotoUrl} alt={article.penulis} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                    <User size={12} className="text-white" />
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-medium">{article.penulis}</p>
                <p className="text-xs text-gray-600">{article.tanggal}</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                article.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
                article.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
                article.kategori === 'Popular' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {article.kategori || 'Umum'}
              </span>
              <div className="flex items-center text-xs text-gray-600">
                <Eye size={10} className="mr-1" />
                <span>{article.jumlah_pembaca || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Scroll indicator dots (optional) */}
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: Math.ceil(filteredArticles.length / 3) }).map((_, index) => (
        <div key={index} className="w-2 h-2 bg-gray-300 rounded-full"></div>
      ))}
    </div>
  </div>
</div>
                    
                
              )}
            </div>
          )}
        </div>
      </div>

      {/* Banner Section dengan Purple Background above Footer */}
      <div className="w-full bg-purple1 py-12">
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
                className="bg-emerald1 text-white px-4 py-3 hover:bg-green-600 focus:outline-none"
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
              <p className="font-bold mb-6">berkelanaindonesia@gmail.com</p>
            </div>
          </div>
        </div>
      )}

        <footer className="bg-white font-[League_Spartan] text-base">
       <div className="max-w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
               <div className="max-w-7xl mx-auto">
                 {/* Mobile Layout - Stack vertically */}
                 <div className="block md:hidden space-y-6">
                   {/* Logo Section */}
                   <div className="text-center">
                     <img
                       src="../images/berkelana-logo.png"
                       alt="Berkelana Logo"
                       className="h-16 sm:h-20 mx-auto"
                       onError={(e) => {
                         e.target.onerror = null;
                         e.target.src = "/api/placeholder/160/60";
                       }}
                     />
                   </div>
                   
                   {/* Contact Section */}
                   <div className="text-center">
                     <h3 className="font-medium mb-3 text-gray-900">Hubungi Kami</h3>
                     <div className="space-y-2">
                       <div className="flex items-center justify-center">
                         <i className="fa-solid fa-phone-alt mr-2 text-gray-700"></i>
                         <a href="tel:08124494015" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           08124494015
                         </a>
                       </div>
                       <div className="flex items-center justify-center">
                         <i className="fas fa-envelope mr-2 text-gray-700"></i>
                         <a href="mailto:berkelanaapps@gmail.com" className="text-gray-700 hover:text-emerald-400 transition-colors break-all">
                           berkelanaapps@gmail.com
                         </a>
                       </div>
                     </div>
                   </div>
                   
                   {/* Services and Others in 2 columns */}
                   <div className="grid grid-cols-2 gap-6">
                     {/* Services Section */}
                     <div className="text-center">
                       <h3 className="font-medium mb-3 text-gray-900">Layanan</h3>
                       <ul className="space-y-2">
                         <li>
                           <Link to="/cari-tiket" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Cari tiket
                           </Link>
                         </li>
                         <li>
                           <Link to="/promo" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Promo
                           </Link>
                         </li>
                       </ul>
                     </div>
                     
                     {/* Others Section */}
                     <div className="text-center">
                       <h3 className="font-medium mb-3 text-gray-900">Lainnya</h3>
                       <ul className="space-y-2">
                         <li>
                           <Link to="/artikel" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Artikel
                           </Link>
                         </li>
                         <li>
                           <Link to="/tiket-saya" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Tiket Saya
                           </Link>
                         </li>
                         <li>
                           <Link to="/tentang-kami" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Tentang kami
                           </Link>
                         </li>
                         <li>
                           <Link to="/syarat-ketentuan" className="text-gray-700 hover:text-emerald-400 transition-colors text-sm">
                             Kebijakan Kami
                           </Link>
                         </li>
                       </ul>
                     </div>
                   </div>
                   
                   {/* Social Media Section */}
                   <div className="text-center">
                     <h3 className="font-medium mb-3 text-gray-900">Temukan Kami di</h3>
                     <div className="flex justify-center space-x-4">
                       <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                         <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
                       </a>
                       <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                         <i className="fab fa-instagram text-gray-700 hover:text-emerald-400"></i>
                       </a>
                     </div>
                   </div>
                 </div>
       
                 {/* Desktop/Tablet Layout - Horizontal */}
                 <div className="hidden md:flex flex-wrap justify-between items-start gap-6 lg:gap-8">
                   {/* Logo Section */}
                   <div className="flex-shrink-0">
                     <img
                       src="../images/berkelana-logo.png"
                       alt="Berkelana Logo"
                       className="h-20 lg:h-25"
                       onError={(e) => {
                         e.target.onerror = null;
                         e.target.src = "/api/placeholder/160/60";
                       }}
                     />
                   </div>
                   
                   {/* Contact Section */}
                   <div className="min-w-0 flex-1 max-w-xs">
                     <h3 className="font-medium mb-4 text-gray-900">Hubungi Kami</h3>
                     <div className="space-y-2">
                       <div className="flex items-center">
                         <i className="fa-solid fa-phone-alt mr-2 text-gray-700 flex-shrink-0"></i>
                         <a href="tel:08124494015" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           08124494015
                         </a>
                       </div>
                       <div className="flex items-center">
                         <i className="fas fa-envelope mr-2 text-gray-700 flex-shrink-0"></i>
                         <a href="mailto:berkelanaapps@gmail.com" className="text-gray-700 hover:text-emerald-400 transition-colors break-words">
                           berkelanaapps@gmail.com
                         </a>
                       </div>
                     </div>
                   </div>
                   
                   {/* Services Section */}
                   <div className="min-w-0 flex-1 max-w-xs">
                     <h3 className="font-medium mb-4 text-gray-900">Layanan</h3>
                     <ul className="space-y-2">
                       <li>
                         <Link to="/cari-tiket" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Cari tiket
                         </Link>
                       </li>
                       <li>
                         <Link to="/promo" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Promo
                         </Link>
                       </li>
                     </ul>
                   </div>
                   
                   {/* Others Section */}
                   <div className="min-w-0 flex-1 max-w-xs">
                     <h3 className="font-medium mb-4 text-gray-900">Lainnya</h3>
                     <ul className="space-y-2">
                       <li>
                         <Link to="/artikel" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Artikel
                         </Link>
                       </li>
                       <li>
                         <Link to="/tiket-saya" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Tiket Saya
                         </Link>
                       </li>
                       <li>
                         <Link to="/tentang-kami" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Tentang kami
                         </Link>
                       </li>
                       <li>
                         <Link to="/syarat-ketentuan" className="text-gray-700 hover:text-emerald-400 transition-colors">
                           Kebijakan Kami
                         </Link>
                       </li>
                     </ul>
                   </div>
                   
                   {/* Social Media Section */}
                   <div className="flex-shrink-0">
                     <h3 className="font-medium mb-4 text-gray-900">Temukan Kami di</h3>
                     <div className="flex space-x-4">
                       <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                         <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
                       </a>
                       <a href="#" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                         <i className="fab fa-instagram text-gray-700 hover:text-emerald-400"></i>
                       </a>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
             
             {/* Copyright Section */}
             <div className="bg-emerald1 py-3">
               <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                 <p className="text-center text-black text-sm sm:text-base">
                   Copyright © 2025 BERKELANA®, All rights reserved.
                 </p>
               </div>
             </div>
           </footer>
    </>
  );
};

export default Artikel;
