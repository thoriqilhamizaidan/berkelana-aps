import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './user/context/AuthContext';


import Footer from './user/footer';
import artikelService from './services/artikelService';

const API_URL = "http://localhost:3000/api/promos";

const TermsModal = ({ show, promo, onClose }) => {
  if (!show || !promo) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-2 sm:mx-0">
        <div className="bg-purple1 text-white p-3 sm:p-4 md:p-6 flex justify-between items-start sm:items-center">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg md:text-xl font-bold leading-tight">Syarat & Ketentuan</h2>
            <p className="text-purplelight text-xs sm:text-sm mt-1 truncate">{promo.title || promo.judul}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-purplelight transition-colors p-1 ml-2 flex-shrink-0"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)]">
          <div className="mb-4 p-3 sm:p-4 bg-purple-50 rounded-lg border-l-4 border-purple1">
            <div className="flex flex-col sm:flex-row sm:items-center mb-2">
              <div className="bg-purple1 text-white rounded-full w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-sm sm:text-base font-bold mb-2 sm:mb-0 sm:mr-3 self-start">
                {promo.potongan >= 1000 ? `${Math.floor(promo.potongan / 1000)}RB` : 
                promo.potongan >= 100 ? `${promo.potongan}` : `${promo.potongan}%`}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-purple1 text-sm sm:text-base md:text-lg break-words">
                  Kode: {promo.code || promo.kode_promo}
                </h3>
                {promo.berlakuHingga && (
                  <p className="text-xs sm:text-sm text-purple1 mt-1">
                    Berlaku hingga: {new Date(promo.berlakuHingga).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="text-black1 whitespace-pre-line leading-relaxed text-xs sm:text-sm md:text-base">
            {promo.details || promo.detail || 'Tidak ada detail tersedia untuk promo ini.'}
          </div>
        </div>
        <div className="bg-gray-50 px-3 py-3 sm:px-4 sm:py-3 md:px-6 md:py-4 flex justify-end border-t">
          <button 
            onClick={onClose}
            className="bg-purple1 hover:bg-purple-700 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm md:text-base font-medium"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BerkelanaLandingPage() {
  const [currentArticleIndex, setCurrentArticleIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [promos, setPromos] = useState([]);
  const [promosLoading, setPromosLoading] = useState(true);
  const [promosError, setPromosError] = useState(null);
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [articlesError, setArticlesError] = useState(null);
  const navigate = useNavigate();
  const articlesRef = useRef(null); // This ref is not currently used for scrolling; consider implementing it
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const { isLoggedIn } = useAuth();
  
  

  // Fetch articles from database
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setArticlesLoading(true);
        const data = await artikelService.getLatestArticles(6); // Ambil 6 artikel terbaru
        setArticles(data);
        setArticlesError(null);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setArticlesError(err.message || 'Gagal memuat artikel');
      } finally {
        setArticlesLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Fetch promos from database
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setPromosLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const activePromos = Array.isArray(data) 
          ? data.filter(promo => promo.is_active).slice(0, 3)
          : (data.data || []).filter(promo => promo.is_active).slice(0, 3);
        
        setPromos(activePromos);
        setPromosError(null);
      } catch (err) {
        console.error('Error fetching promos:', err);
        setPromosError(err.message || 'Gagal memuat data promo');
      } finally {
        setPromosLoading(false);
      }
    };

    fetchPromos();
  }, []);

  // Format functions
  const formatDiscount = (potongan) => {
    if (potongan >= 1000) return `${Math.floor(potongan / 1000)}RB`;
    if (potongan >= 100) return `${potongan}`;
    return `${potongan}%`;
  };

const getImageUrl = (image, type = 'artikel') => {
  if (!image) return null;

  if (image.startsWith('http://') || image.startsWith('https://')) return image;

  // Jika sudah mulai dengan "/uploads", berarti sudah lengkap
  if (image.startsWith('/uploads')) return `http://localhost:3000${image}`;

  const folder = type === 'promo' ? 'promo' : 'artikel';
  return `http://localhost:3000/uploads/${folder}/${image}`;
};

  const isPromoExpired = (berlakuHingga) => {
    if (!berlakuHingga) return false;
    return new Date(berlakuHingga) < new Date();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };


  const handleCariClick = () => {
  if (!isLoggedIn) {
    navigate('/daftar-masuk');
  } else {
    navigate('/cari-tiket');
  }
};

  // Navigation functions
  const scrollArticles = (direction) => {
    // This logic needs to be updated to actually scroll the visible articles container
    // and not just change the index if the container isn't directly controlled by this index for scrolling.
    const totalPages = Math.ceil(articles.length / 3);
    if (direction === 'prev') {
      setCurrentArticleIndex(currentArticleIndex > 0 ? currentArticleIndex - 1 : totalPages - 1);
    } else {
      setCurrentArticleIndex(currentArticleIndex < totalPages - 1 ? currentArticleIndex + 1 : 0);
    }
    
    // The current implementation of articlesRef.current.scrollTo is not correctly linked
    // to the actual visible articles display, which uses slice().
    // For proper scrolling, you'd typically have a direct ref on the scrollable container
    // and calculate scrollLeft based on item width and current index.
    // Given 'visibleArticles' handles the display, we might not need direct DOM scroll manipulation here
    // unless the intent is a horizontal scroll carousel.
    // If it's a carousel, ensure the `renderArticleCards` output is in a horizontally scrollable div.
    // For now, this just updates the index which changes the `visibleArticles` array.
  };

  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    if (!code) {
      alert('Kode promo tidak tersedia');
      return;
    }

    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
      alert('Gagal menyalin kode promo');
    });
  };

  const goToArticleDetail = async (id) => {
  try {
    await artikelService.incrementArticleViews(id); // Tambah jumlah pembaca
    navigate(`/artikel/detail/${id}`); // Arahkan ke halaman detail
  } catch (error) {
    console.error('Gagal menambah pembaca:', error);
    navigate(`/artikel/detail/${id}`); // Tetap arahkan meskipun gagal
  }
};

  const goToArticlesPage = () => navigate('/artikel');
  const goToPromoPage = () => navigate('/promo');

  // Get visible articles
  const visibleArticles = articles.slice(currentArticleIndex * 3, (currentArticleIndex + 1) * 3);

  const fontStyle = { fontFamily: "'League Spartan', sans-serif" };

  // Render functions
  const renderPromoCards = () => {
    if (promosLoading) {
      return (
  <div className="overflow-x-auto pb-4">
    <div className="flex space-x-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:gap-6 min-w-max md:min-w-0">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 rounded-lg shadow overflow-hidden animate-pulse h-80 flex-shrink-0 w-72 md:w-auto">
          <div className="h-3/5 bg-gray-300"></div>
          <div className="p-4 flex flex-col justify-between h-2/5">
            <div className="flex items-center mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full mr-2"></div>
              <div className="w-3/4 h-5 bg-gray-300 rounded"></div>
            </div>
            <div className="flex items-center justify-between">
              <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
              <div className="w-10 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
    }

    if (promosError) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600 text-sm mb-2">Gagal memuat promo: {promosError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    if (promos.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-gray-600 text-sm">Belum ada promo tersedia saat ini.</p>
          </div>
        </div>
      );
    }

    return (
  <div className="overflow-x-auto pb-4">
    <div className="flex space-x-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:gap-6 min-w-max md:min-w-0">
      {promos.map((promo) => {
        const imageUrl = getImageUrl(promo.image || promo.gambar, 'promo');
        const isExpired = isPromoExpired(promo.berlakuHingga);
        
        return (
          <div 
            key={promo.id || promo.id_promo} 
            className={`bg-gray-100 rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer flex-shrink-0 w-72 md:w-auto ${isExpired ? 'opacity-60' : ''}`}
          >
              <div className="relative h-48">
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt={promo.title || promo.judul} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      // e.target.nextSibling (the div with gradient) will be shown
                    }}
                  />
                ) : null}
                
                <div 
                  className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white absolute inset-0"
                  style={{ display: imageUrl ? 'none' : 'flex' }} // Show this div if no image
                >
                  <div className="text-center p-4"> {/* Added padding */}
                    <h3 className="text-lg font-bold">{promo.title || promo.judul}</h3>
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4"> {/* Added padding */}
                  <p className="text-sm uppercase mb-2">{promo.title || promo.judul}</p>
                  <h3 className="text-3xl sm:text-4xl font-bold">{formatDiscount(promo.potongan)}</h3> {/* Responsive font size */}
                </div>
                
                {promo.berlakuHingga && (
                  <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs text-gray-700">
                    Berlaku hingga: {new Date(promo.berlakuHingga).toLocaleDateString('id-ID')}
                  </div>
                )}
                
                {isExpired && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">EXPIRED</span>
                  </div>
                )}
              </div>
              
              <div className="p-4 flex justify-between items-center bg-gray-100">
                <div className="flex items-center">
                  <button
                    className="w-7 h-7 bg-purplelight rounded-full flex items-center justify-center mr-2 hover:bg-purple-200 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleShowTerms(promo);
                    }}
                    title="Lihat syarat dan ketentuan"
                  >
                    <span className="text-purple1 text-sm font-bold">!</span> {/* Adjusted font size */}
                  </button>
                  <span className="text-sm">Detail</span>
                </div>
                <div className="flex items-center">
                  <div className="bg-white px-3 py-1 rounded mr-2">
                    <span className="text-xs text-gray-600 font-mono">
                      {promo.code || promo.kode_promo}
                    </span>
                  </div>
                  <button 
                    className={`text-white w-8 h-8 flex items-center justify-center rounded transition-colors ${
                      isExpired 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-purple-500 hover:bg-purple-600 cursor-pointer'
                    }`}
                    onClick={(e) => !isExpired && handleCopyCode(promo.code || promo.kode_promo, e)}
                    disabled={isExpired}
                    title={isExpired ? 'Promo sudah kadaluarsa' : 'Salin kode promo'}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
          );
        })}
      </div>
       </div>
    );
  };

  const renderArticleCards = () => {
    if (articlesLoading) {
     return (
  <div className="overflow-x-auto pb-4">
    <div className="flex space-x-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:gap-6 min-w-max md:min-w-0">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer animate-pulse h-96 flex-shrink-0 w-72 md:w-auto">
          <div className="h-3/5 bg-gray-300"></div>
          <div className="p-4 flex flex-col justify-between h-2/5">
            <div className="h-6 bg-gray-300 rounded mb-4 w-3/4"></div>
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-300 rounded-full mr-2"></div>
              <div>
                <div className="h-4 bg-gray-300 rounded mb-1 w-24"></div>
                <div className="h-3 bg-gray-300 rounded w-32"></div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div className="h-5 bg-gray-300 rounded-full w-20"></div>
              <div className="h-4 bg-gray-300 rounded w-12"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
    }

    if (articlesError) {
      return (
        <div className="text-center py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-red-600 text-sm mb-2">Gagal memuat artikel: {articlesError}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    if (articles.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-gray-600 text-sm">Belum ada artikel tersedia saat ini.</p>
          </div>
        </div>
      );
    }

    return (
  <div className="overflow-x-auto pb-4">
    <div className="flex space-x-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:space-x-0 md:gap-6 min-w-max md:min-w-0">
      {visibleArticles.map((article) => (
        <div 
          key={article.id_artikel || article.id} 
          className="bg-gray-100 rounded-lg overflow-hidden shadow cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex-shrink-0 w-72 md:w-auto"
          onClick={() => goToArticleDetail(article.id_artikel || article.id)}
        >
            <div className="h-48 overflow-hidden border-2 border-gray-300 rounded-t-lg">
              {getImageUrl(article.gambar_artikel || article.gambar || article.image) ? (
                <img 
                  src={getImageUrl(article.gambar_artikel || article.gambar || article.image)} 
                  alt={article.judul || article.title} 
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "../images/ar1.png"; // Fallback image
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                  <span className="text-gray-500">Tidak ada gambar</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold flex-1 text-lg">{article.judul}</h3> {/* Adjusted font size */}
              </div>
              <div className="flex items-center">
  <div className="w-9 h-9 rounded-full overflow-hidden mr-2">
    {article.foto_penulis ? (
      <img
        src={`http://localhost:3000/uploads/artikel/${article.foto_penulis}`}
        alt={article.penulis || 'Admin'}
        className="w-full h-full object-cover"
      />
    ) : (
      <img
        src="../images/arp.png"
        alt="Admin"
        className="w-full h-full object-cover"
      />
    )}
  </div>
  <div>
    <p className="text-sm font-medium">{article.penulis || 'Admin'}</p>
    <p className="text-xs text-gray-600">
      {formatDate(article.tanggal_publikasi || article.createdAt)} • {article.estimasi_baca || '3'} Min Read
    </p>
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
                  <Eye className="h-3 w-3 mr-1" />
                  <span>{article.jumlah_pembaca || 0}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      </div>
    );
  };
  const handleShowTerms = (promo) => {
  setSelectedPromo(promo);
  setShowTermsModal(true);
};

const handleCloseTerms = () => {
  setSelectedPromo(null);
  setShowTermsModal(false);
};

  return (
    <div style={fontStyle}>
      {/* Navbar - Assuming it's already responsive or handled separately */}
      

      {/* Terms & Conditions Modal */}
      <TermsModal 
        show={showTermsModal} 
        promo={selectedPromo} 
        onClose={handleCloseTerms} 
      />
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 sm:top-6 sm:right-6 bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-lg z-50 flex items-center transition-all text-sm sm:text-base">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Redeem code <strong>{copiedCode}</strong> disalin!</span>
        </div>
      )}

      

      {/* Hero Section */}
      <section className="relative h-auto min-h-125 bg-cover bg-center pt-16 flex items-center justify-center"> {/* Added min-h-125 for consistent height */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
        <div className="absolute inset-0 z-0">
          <img src="../images/hero.png" alt="Mountain Background" className="w-full h-full object-cover" />
        </div>
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <img src="../images/lhero.png" alt="Berkelana Logo" className="mb-8 sm:mb-16 w-3/4 max-w-sm" /> {/* Responsive logo size */}
          
          <h1 className="text-3xl sm:text-5xl font-bold mb-2 leading-tight">Berkelana kemana hari ini?</h1> {/* Responsive font size, line height */}
          <p className="text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl">Bersama Berkelana - Perjalanan Tak Terbatas, Keindahan Tanpa Batas</p> {/* Responsive font size, max-width */}
          
          {/* Search Form */}
          <div className="bg-purplelight rounded-lg p-4 sm:p-6 w-full max-w-4xl mx-auto"> {/* Adjusted max-w */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="flex flex-col lg:col-span-3">
                <label className="text-gray-600 text-sm mb-1 text-left">Dari</label> {/* Adjusted label alignment */}
                <select className="w-full border border-gray-200 p-2 sm:p-3 rounded text-gray-800 appearance-none bg-white text-sm" style={fontStyle}>
                  <option value="">Pilih Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Malang">Malang</option>
                </select>
              </div>
              
              <div className="flex items-center justify-center lg:col-span-1 py-2 lg:py-0"> {/* Adjusted padding */}
                <ArrowLeftRight className="text-gray-500 rotate-90 md:rotate-0" size={24} /> {/* Rotate on small screens */}
              </div>
              
              <div className="flex flex-col lg:col-span-3">
                <label className="text-gray-600 text-sm mb-1 text-left">Ke</label> {/* Adjusted label alignment */}
                <select className="w-full border border-gray-200 p-2 sm:p-3 rounded text-gray-800 appearance-none bg-white text-sm" style={fontStyle}>
                  <option value="">Pilih Kota</option>
                  <option value="Jakarta">Jakarta</option>
                  <option value="Bandung">Bandung</option>
                  <option value="Surabaya">Surabaya</option>
                  <option value="Yogyakarta">Yogyakarta</option>
                  <option value="Malang">Malang</option>
                </select>
              </div>
              
              <div className="flex flex-col lg:col-span-2">
                <label className="text-gray-600 text-sm mb-1 text-left">Tanggal Pergi</label> {/* Adjusted label alignment */}
                <div className="relative">
                  <input 
                    type="date" 
                    placeholder="Pilih Tanggal" 
                    className="w-full border border-gray-200 bg-white p-2 sm:p-3 rounded text-gray-800 appearance-none text-sm"
                    style={fontStyle}
                  />
                  
                </div>
              </div>
              
              <div className="flex flex-col lg:col-span-2">
                <label className="text-gray-600 text-sm mb-1 text-left">Pilih Akomodasi</label> {/* Adjusted label alignment */}
                <select className="w-full border border-gray-200 p-2 sm:p-3 rounded text-gray-800 appearance-none bg-white text-sm" style={fontStyle}>
                  <option value="">Pilih Akomodasi</option>
                  <option>Bus</option>
                  <option>Shuttle</option>
                </select>
              </div>
              
             <div className="lg:col-span-1 flex items-end">
                <button 
  onClick={handleCariClick}
  className="bg-emerald1 hover:bg-green-600 text-white font-bold p-3 rounded focus:outline-none w-full flex items-center justify-center cursor-pointer text-sm sm:text-base"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
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
      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left">
  <div className="lg:w-1/3 mb-8 lg:mb-0">
              <h2 className="text-3xl sm:text-4xl font-bold mb-2">
                Rencanakan Sekali, Jelajahi Banyak - <br />
                Bersama <span className="text-purple-500">#Berkelana</span>.
              </h2>
            </div>
            
           <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">{/* Added sm:grid-cols-2 */}
              {[
                { img: "f1.png", title: "Ekonomis", desc: "Harga tiket terjangkau & banyak promo menarik yang disediakan." },
                { img: "f2.png", title: "Praktis", desc: "Semua proses jadi lebih cepat, pilih, dan aman." },
                { img: "f3.png", title: "Nyaman", desc: "Armada bersih, reclining seat dan jarak antar kaki yang nyaman." },
                { img: "f4.png", title: "Andal", desc: "Pengemudi selalu mendapat informasi terbaru tentang keadaan jalan keterlambatan." }
              ].map((feature, index) => (
                <div key={index} className="bg-purple-100 rounded-lg p-4 sm:p-6 flex items-start text-left"> {/* Aligned items to start, left text */}
                  <div className="mr-4 flex-shrink-0">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center"> {/* Responsive size */}
                      <img src={`../images/${feature.img}`} alt={feature.title} className="w-8 h-8 sm:w-10 sm:h-10" /> {/* Responsive icon size */}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-700">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8 text-center sm:text-left gap-4 sm:gap-0">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 md:mb-0">
              Serbu diskon <span className="text-purple-500">#Berkelana</span>
            </h2>
            <button 
              className="bg-emerald1 text-white px-4 py-2 rounded-lg flex items-center mt-4 md:mt-0 cursor-pointer hover:bg-green-600 transition-colors text-sm sm:text-base"
              onClick={goToPromoPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
              Jelajahi Promo
            </button>
          </div>
          
          {renderPromoCards()}
        </div>
      </section>
      
      {/* Articles Section */}
      <section className="py-12 px-4 rounded-3xl bg-purple-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">Baca dan bangkitkan semangat liburanmu</h2>
          
          <div className="relative">
            {/* Navigation buttons */}
            {articles.length > 3 && ( // Only show buttons if more than 3 articles for scrolling
                <>
                    <button 
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    onClick={() => scrollArticles('prev')}
                    aria-label="Previous article"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    </button>
                </>
            )}

            <div className="overflow-hidden" ref={articlesRef}> {/* Added ref here for potential future direct scrolling */}
              {renderArticleCards()}
            </div>
            
            {articles.length > 3 && ( // Only show buttons if more than 3 articles for scrolling
                <>
                    <button 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all"
                    onClick={() => scrollArticles('next')}
                    aria-label="Next article"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    </button>
                </>
            )}
          </div>
          
          {/* Pagination Indicators */}
          {articles.length > 3 && ( // Only show indicators if more than 3 articles
            <div className="flex justify-center mt-6 space-x-2">
                {Array.from({ length: Math.ceil(articles.length / 3) }, (_, index) => (
                <button
                    key={index}
                    onClick={() => setCurrentArticleIndex(index)}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${ // Responsive size
                    currentArticleIndex === index ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                    aria-label={`Page ${index + 1}`}
                />
                ))}
            </div>
          )}

          {/* View All Button */}
          <div className="flex justify-center mt-8">
            <button 
              className="bg-emerald1 text-white px-5 py-2 sm:px-6 sm:py-3 rounded-lg flex items-center hover:bg-green-600 transition-colors cursor-pointer text-sm sm:text-base"
              onClick={goToArticlesPage}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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