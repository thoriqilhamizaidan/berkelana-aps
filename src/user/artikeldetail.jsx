import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Eye, Calendar, Tag, Search, Mail, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';
import artikelService from '../services/artikelService';

const ArtikelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch artikel berdasarkan ID
        const articleData = await artikelService.getArticleById(id);
        
        if (!articleData) {
          throw new Error('Artikel tidak ditemukan');
        }

        // Transform data untuk konsistensi
        const transformedArticle = {
          ...articleData,
          id: articleData.id_artikel,
          penulis: articleData.nama_penulis,
          judul: articleData.judul,
          tanggal: new Date(articleData.createdAt).toLocaleDateString('id-ID', {
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
          }),
          gambarUrl: articleData.gambar_artikel ? 
            `http://localhost:5052/uploads/artikel/${articleData.gambar_artikel}` : null,
          authorPhotoUrl: articleData.foto_penulis ? 
            `http://localhost:5052/uploads/artikel/${articleData.foto_penulis}` : null,
          isiArtikel: articleData.isi || 'Konten artikel tidak tersedia.',
          jumlah_pembaca: parseInt(articleData.jumlah_pembaca) || 0
        };

        setArticle(transformedArticle);

        // Update view count
        await artikelService.incrementArticleViews(id);
        
        // Fetch artikel terkait (opsional)
        try {
          const allArticles = await artikelService.fetchArticles();
          const related = allArticles
            .filter(a => a.id_artikel !== parseInt(id) && a.kategori === articleData.kategori)
            .slice(0, 3);
          setRelatedArticles(related);
        } catch (relatedError) {
          console.warn('Gagal mengambil artikel terkait:', relatedError);
        }

      } catch (error) {
        console.error('Error fetching article detail:', error);
        setError(`Gagal memuat artikel: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticleDetail();
    }
  }, [id]);

  const handleBackClick = () => {
    navigate('/artikel');
  };

  const handleRelatedArticleClick = (articleId) => {
    navigate(`/artikel/detail/${articleId}`);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search functionality if needed
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        {/* Hero Section with Background - FIXED PATH */}
        <section className="relative h-125 bg-cover bg-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
          <div className="absolute inset-0 z-0">
            <img src="/images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
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
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Memuat artikel...</div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        {/* Hero Section with Background - FIXED PATH */}
        <section className="relative h-125 bg-cover bg-center pt-16">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
          <div className="absolute inset-0 z-0">
            <img src="/images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
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
            {error || 'Artikel tidak ditemukan'}
          </div>
          <button 
            onClick={handleBackClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Kembali ke Artikel
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const nextSlide = () => {
  setCurrentSlide((prev) => 
    prev >= relatedArticles.length - 1 ? 0 : prev + 1
  );
};

const prevSlide = () => {
  setCurrentSlide((prev) => 
    prev <= 0 ? relatedArticles.length - 1 : prev - 1
  );
};

  return (
    <>
      {/* Hero Section with Background - FIXED PATH */}
      <section className="relative h-64 sm:h-80 md:h-96 lg:h-125 bg-cover bg-center pt-16">
  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>
  <div className="absolute inset-0 z-0">
    <img src="/images/arhero.jpg" alt="Mountain Background" className="w-full h-full object-cover" />
  </div>
  <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
    <div className="max-w-3xl">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-2 text-white">
        Berkelana ke <span className="text-black">Newsroom</span>
      </h1>
      
      <form onSubmit={handleSearchSubmit} className="relative mt-2 w-full max-w-xs sm:max-w-sm md:w-[280px]">
        <input
          type="text"
          className="w-full py-2 px-3 pr-12 rounded-full border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          placeholder="Cari artikel"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="absolute right-0 top-0 bottom-0 px-3 sm:px-4 bg-emerald1 hover:bg-green-500 rounded-r-full flex items-center justify-center"
        >
          <Search size={16} className="text-white" />
        </button>
      </form>
    </div>
  </div>
</section>

      {/* Back Button */}
      <div className="container mx-auto px-4 sm:px-6 pt-6 sm:pt-8 pb-4">
  <button 
    onClick={handleBackClick}
    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
  >
    <ArrowLeft size={18} className="mr-2" />
    Kembali ke Artikel
  </button>
</div>

      {/* Article Content */}
      <article className="container mx-auto px-4 sm:px-6 pb-8 sm:pb-12">
  <div className="max-w-4xl mx-auto bg-gray-100 rounded-lg p-4 sm:p-6">
    {/* Article Header */}
    <header className="mb-6 sm:mb-8">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
        {article.judul}
      </h1>
      
      {/* Article Meta - RESPONSIVE */}
      <div className="space-y-4 sm:space-y-0 sm:flex sm:flex-wrap sm:items-center sm:gap-4 mb-4 sm:mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-3">
            {article.authorPhotoUrl ? (
              <img 
                src={article.authorPhotoUrl} 
                alt={article.penulis} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <div className="w-full h-full bg-gray-400 flex items-center justify-center">
                <User size={20} className="text-white sm:w-6 sm:h-6" />
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{article.penulis}</p>
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <Calendar size={12} className="mr-1 sm:w-4 sm:h-4" />
              <span>{article.tanggal}</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          {article.kategori && (
            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center ${
              article.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
              article.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              <Tag size={12} className="mr-1 sm:w-4 sm:h-4" />
              {article.kategori}
            </span>
          )}
          
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Eye size={12} className="mr-1 sm:w-4 sm:h-4" />
            <span>{article.jumlah_pembaca} views</span>
          </div>
        </div>
      </div>
    </header>

    {/* Featured Image - RESPONSIVE */}
    {article.gambarUrl && (
      <div className="mb-4 sm:mb-6">
        <div className="rounded-lg overflow-hidden border-2 border-purple-300">
          <img 
            src={article.gambarUrl} 
            alt={article.judul} 
            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
          />
        </div>
      </div>
    )}

    {/* Article Content - RESPONSIVE */}
    <div className="prose max-w-none">
      <div className="text-gray-700 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-line">
        {article.isiArtikel}
      </div>
    </div>
  </div>
</article>

     
{/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-8 sm:py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 sm:mb-8">Artikel Terkait</h2>
              
              {/* Desktop View - Grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <div 
                    key={relatedArticle.id_artikel}
                    className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleRelatedArticleClick(relatedArticle.id_artikel)}
                  >
                    <div className="h-48 overflow-hidden">
                      {relatedArticle.gambar_artikel ? (
                        <img 
                          src={`http://localhost:5052/uploads/artikel/${relatedArticle.gambar_artikel}`}
                          alt={relatedArticle.judul} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-500 text-sm">Tidak ada gambar</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
                        {relatedArticle.judul}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">
                        {relatedArticle.nama_penulis}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          relatedArticle.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
                          relatedArticle.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {relatedArticle.kategori || 'Umum'}
                        </span>
                        <div className="flex items-center text-xs text-gray-600">
                          <Eye size={10} className="mr-1" />
                          <span>{relatedArticle.jumlah_pembaca || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile & Tablet View - Horizontal Scrollable */}
              <div className="md:hidden">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex space-x-4 pb-4">
                    {relatedArticles.map((relatedArticle) => (
                      <div 
                        key={relatedArticle.id_artikel}
                        className="flex-shrink-0 w-72 sm:w-80"
                      >
                        <div 
                          className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow cursor-pointer h-full"
                          onClick={() => handleRelatedArticleClick(relatedArticle.id_artikel)}
                        >
                          <div className="h-40 sm:h-48 overflow-hidden">
                            {relatedArticle.gambar_artikel ? (
                              <img 
                                src={`http://localhost:5052/uploads/artikel/${relatedArticle.gambar_artikel}`}
                                alt={relatedArticle.judul} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                                <span className="text-gray-500 text-sm">Tidak ada gambar</span>
                              </div>
                            )}
                          </div>
                          <div className="p-3 sm:p-4">
                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm sm:text-base">
                              {relatedArticle.judul}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                              {relatedArticle.nama_penulis}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                relatedArticle.kategori === 'Destinasi' ? 'bg-blue-100 text-blue-800' :
                                relatedArticle.kategori === 'Inspirasi' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {relatedArticle.kategori || 'Umum'}
                              </span>
                              <div className="flex items-center text-xs text-gray-600">
                                <Eye size={10} className="mr-1" />
                                <span>{relatedArticle.jumlah_pembaca || 0}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
        

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
        <a 
          href="mailto:berkelanaapps@gmail.com"
          className="font-bold mb-6 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          berkelanaapps@gmail.com
        </a>
      </div>
    </div>
  </div>
)}

    <footer className="bg-white font-[League_Spartan] text-base">
           
     
           {/* Main Footer Content */}
           <div className="max-w-full mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
             <div className="max-w-7xl mx-auto">
               {/* Mobile Layout - Stack vertically */}
               <div className="block md:hidden space-y-6">
                 {/* Logo Section */}
                 <div className="text-center">
                   <img
                     src="/images/Berkelana-logo.png"
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
                     src="/images/Berkelana-logo.png"
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
                     <a href="https://www.facebook.com/profile.php?id=61577281496423" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
                       <i className="fab fa-facebook-f text-gray-700 hover:text-emerald-400"></i>
                     </a>
                     <a href="https://www.instagram.com/berkelanaapps?igsh=MXVnaWdsMjd3dHZuYg==" className="inline-block border border-gray-300 rounded-full p-3 hover:border-emerald-400 transition-colors">
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

export default ArtikelDetail;