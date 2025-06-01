import Navbar from "./navbar";
import Footer from "./footer";
import React, { useState, useEffect } from 'react';
import { ArrowLeftRight } from 'lucide-react';

const API_URL = "http://localhost:3000/api/promos";

// Modal Component for Terms and Conditions
const TermsModal = ({ show, promo, onClose }) => {
  if (!show || !promo) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-purple1 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Syarat & Ketentuan</h2>
            <p className="text-purplelight text-sm mt-1">{promo.title || promo.judul}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-purplelight transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-96">
          <div className="mb-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple1">
            <div className="flex items-center mb-2">
              <div className="bg-purple1 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold mr-3">
                {promo.potongan >= 1000 ? `${Math.floor(promo.potongan / 1000)}RB` : 
                 promo.potongan >= 100 ? `${promo.potongan}` : `${promo.potongan}%`}
              </div>
              <div>
                <h3 className="font-semibold text-purple1">Kode: {promo.code || promo.kode_promo}</h3>
                {promo.berlakuHingga && (
                  <p className="text-sm text-purple1">
                    Berlaku hingga: {new Date(promo.berlakuHingga).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <h4 className="text-lg font-semibold text-black1 mb-3">Detail Promo:</h4>
            <div className="text-black1 whitespace-pre-line leading-relaxed">
              {promo.details || promo.detail || 'Tidak ada detail tersedia untuk promo ini.'}
            </div>
          </div>
        </div>
        
        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-purple1 hover:bg-purple1 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Steps and How-To Component
const steps = [
  {
    number: 1,
    text: "Salin kode promo yang ingin kamu gunakan",
  },
  {
    number: 2,
    text: "Pergi ke halaman pesan tiket,\nlalu tempel kode",
  },
  {
    number: 3,
    text: "Nikmati potongan harga\nsesuai dengan promo",
  },
];

const PromoHowTo = () => (
  <div className="relative py-10 px-2 flex flex-col items-center w-full">
    <div className="w-full bg-white shadow-lg z-10 relative p-6 md:p-10">
      <h2 className="text-center font-bold text-lg md:text-xl mb-7 pt-8">Cara Menggunakan Promo</h2>

      <div className="relative flex items-start justify-between">
        <div className="absolute top-4 left-[17%] right-[17%] h-1">
          <div className="w-full h-1 bg-purple1" style={{ position: "absolute", zIndex: 1 }} />
        </div>

        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1 z-10">
            <div className="bg-purple1 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-base mb-4 z-10">
              {step.number}
            </div>
            <div className="text-center text-sm md:text-base whitespace-pre-line">{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Loading Skeleton Component
const PromoCardSkeleton = () => (
  <div className="bg-gray-100 rounded-lg shadow overflow-hidden animate-pulse">
    <div className="h-48 bg-gray-300"></div>
    <div className="p-4 flex justify-between items-center bg-gray-100">
      <div className="flex items-center">
        <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
        <div className="w-12 h-4 bg-gray-300 rounded"></div>
      </div>
      <div className="flex items-center">
        <div className="w-24 h-6 bg-gray-300 rounded mr-2"></div>
        <div className="w-8 h-8 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

// Promo Card Component
const PromoCard = ({ promo, onCopyCode, onShowTerms }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDiscount = (potongan) => {
    // If the value is greater than or equal to 1000, it's a fixed amount discount
    if (potongan >= 1000) {
      // For thousands, display as "XRB" (e.g., 5000 -> 5RB)
      return `${Math.floor(potongan / 1000)}RB`;
    } else if (potongan >= 100) {
      // For hundreds, display the full amount (e.g., 500 -> 500)
      return `${potongan}`;
    } else {
      // For values less than 100, treat as percentage
      return `${potongan}%`;
    }
  };

  const formatExpiry = (berlakuHingga) => {
    if (!berlakuHingga) return null;
    const date = new Date(berlakuHingga);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays <= 7) return `${diffDays} hari lagi`;
    return date.toLocaleDateString('id-ID');
  };

  const isExpired = () => {
    if (!promo.berlakuHingga) return false;
    return new Date(promo.berlakuHingga) < new Date();
  };

  const expired = isExpired();

  // Process image URL to ensure it's correct
  const getImageUrl = (image) => {
    if (!image) return null;
    
    // If already a full URL, use as is
    if (image.startsWith('http://') || image.startsWith('https://')) {
      return image;
    }
    
    // If starts with /, it's a relative path from server root
    if (image.startsWith('/')) {
      return `http://localhost:3000${image}`;
    }
    
    // Otherwise, assume it's a relative path that needs /uploads/ prefix
    return `http://localhost:3000/uploads/${image}`;
  };

  const imageUrl = getImageUrl(promo.image || promo.gambar);

  const handleImageError = (e) => {
    console.log(`Image failed to load: ${imageUrl}`);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <div className={`bg-gray-100 rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 cursor-pointer ${expired ? 'opacity-60' : ''}`}>
      <div className="relative h-48">
        {/* Image container */}
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={promo.title || promo.judul} 
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={handleImageLoad}
            style={{ display: imageLoaded ? 'block' : 'none' }}
          />
        ) : null}
        
        {/* Loading state for image */}
        {imageUrl && !imageError && !imageLoaded && (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Fallback gradient background */}
        <div 
          className="w-full h-full bg-gradient-to-r from-purple1 to-blue-500 flex items-center justify-center text-white"
          style={{ display: (!imageUrl || imageError) ? 'flex' : 'none' }}
        >
          <div className="text-center">
            <h3 className="text-xl font-bold">{promo.title || promo.judul}</h3>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        
        {/* Centered title and discount */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center">
          <p className="text-sm uppercase mb-2">{promo.title || promo.judul}</p>
          <h3 className="text-4xl font-bold">{formatDiscount(promo.potongan)}</h3>
        </div>
        
        {promo.berlakuHingga && (
          <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded text-xs text-gray-700">
            {formatExpiry(promo.berlakuHingga)}
          </div>
        )}
        
        {expired && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-xl font-bold">EXPIRED</span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex justify-between items-center bg-gray-100">
        <div className="flex items-center">
          <button
            className="w-6 h-6 bg-purplelight rounded-full flex items-center justify-center mr-2 hover:bg-purplelight transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onShowTerms(promo);
            }}
            title="Lihat syarat dan ketentuan"
          >
            <span className="text-purple1 text-xs font-bold">!</span>
          </button>
          <span className="text-sm">Detail</span>
        </div>
        <div className="flex items-center">
          <div className="bg-white px-3 py-1 rounded mr-2">
            <span className="text-xs text-gray-600 font-mono">{promo.code || promo.kode_promo}</span>
          </div>
          <button 
            className={`text-white w-8 h-8 flex items-center justify-center rounded transition-colors ${
              expired 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-purple1 hover:bg-purple1 cursor-pointer'
            }`}
            onClick={(e) => !expired && onCopyCode(promo.code || promo.kode_promo, e)}
            disabled={expired}
            title={expired ? 'Promo sudah kadaluarsa' : 'Salin kode promo'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const PromoPage = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [copiedCode, setCopiedCode] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Fetch promos from API
  useEffect(() => {
    const fetchPromos = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Filter only active promos for public display
        const activePromos = Array.isArray(data) 
          ? data.filter(promo => promo.is_active) 
          : (data.data || []).filter(promo => promo.is_active);
        
        setPromos(activePromos);
        setError(null);
      } catch (err) {
        console.error('Error fetching promos:', err);
        setError(err.message || 'Gagal memuat data promo');
      } finally {
        setLoading(false);
      }
    };

    fetchPromos();
  }, []);

  // Handle copy promo code and show notification
  const handleCopyCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setShowNotification(true);
      
      // Hide notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }).catch(err => {
      console.error('Failed to copy code:', err);
      alert('Gagal menyalin kode promo');
    });
  };

  // Handle show terms modal
  const handleShowTerms = (promo) => {
    setSelectedPromo(promo);
    setShowTermsModal(true);
  };

  // Handle close terms modal
  const handleCloseTerms = () => {
    setShowTermsModal(false);
    setSelectedPromo(null);
  };

  // Render content based on state
  const renderPromoContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <PromoCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.068 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Gagal Memuat Promo</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    if (promos.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">Belum Ada Promo</h3>
            <p className="text-gray-600 text-sm">Promo menarik akan segera hadir. Pantau terus halaman ini!</p>
          </div>
        </div>
      );
    }

    // Split promos into chunks of 3 for rows
    const promoChunks = [];
    for (let i = 0; i < promos.length; i += 3) {
      promoChunks.push(promos.slice(i, i + 3));
    }

    return promoChunks.map((chunk, chunkIndex) => (
      <div key={chunkIndex} className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${chunkIndex > 0 ? 'mt-12' : ''}`}>
        {chunk.map((promo) => (
          <PromoCard 
            key={promo.id || promo.id_promo} 
            promo={promo} 
            onCopyCode={handleCopyCode}
            onShowTerms={handleShowTerms}
          />
        ))}
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Redeem code <strong>{copiedCode}</strong> disalin!</span>
        </div>
      )}

      {/* Terms Modal */}
      <TermsModal 
        show={showTermsModal} 
        promo={selectedPromo} 
        onClose={handleCloseTerms} 
      />

      {/* Hero Section */}
      <section className="relative h-[320px] md:h-[370px] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-purple-950/40 z-0"></div>
        <img
          src="/images/Rectangle 65.png"
          alt="Bus Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative z-10 h-full flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-0 mt-12 md:mt-0">
            Dapatkan promo khusus hari ini <br /> hanya pada <span className="text-green-400">#Berkelana</span>
          </h1>
        </div>
      </section>

      {/* Promo Cards Section */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {renderPromoContent()}
        </div>
      </section>

      {/* How to use promo section */}
      <PromoHowTo />
      <Footer />
    </div>
  );
};

export default PromoPage;