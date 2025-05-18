import { useState } from 'react';
import { Bell, Search, X, Mail } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';
import { useNavigate } from 'react-router-dom';

export default function ArtikelDetail() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('destinasi');
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Enhanced tab change handler with navigation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Navigate to the appropriate article category page
    navigate(`/artikel?category=${tab}`);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Navbar />
        {/* Hero Section with Background */}
<section className="relative h-125 bg-cover bg-center pt-16">
  {/* Overlay Gradient */}
  <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 z-0"></div>

  {/* Background Image */}
  <div className="absolute inset-0 z-0">
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


        {/* Article Content would go here */}
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

          {/* Article Content */}
          <div className="max-w-4xl mx-auto bg-gray-100 rounded-lg p-6">
            {/* Article Image */}
            <div className="mb-6">
              <div className="rounded-lg overflow-hidden border-2 border-purple-300">
                <img 
                  src="../images/ard.png" 
                  alt="Patung Sura dan Buaya" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Article Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Mengenal Sejarah Kota Surabaya!</h1>

            {/* Author Info */}
            <div className="flex items-center mb-4">
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden mr-2">
                <img 
                  src="../images/arp.png" 
                  alt="Author" 
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">Yosi Safyan</p>
                <p className="text-xs text-gray-500">25 Apr 2023 · 3 min read</p>
              </div>
            </div>

            {/* Article Content */}
            <div className="prose max-w-none text-gray-700">
              <p className="mb-4">
                Kota Surabaya, yang sering disebut sebagai "Kota Pahlawan", merupakan salah satu kota terbesar di Indonesia yang memiliki sejarah panjang dan kaya akan budaya serta keberagaman. Terletak di bagian timur Pulau Jawa, Surabaya telah menjadi pusat perdagangan dan industri yang penting sejak zaman kolonial Belanda. Dikenal dengan semangat juang dan keberaniannya selama masa perjuangan kemerdekaan, Surabaya memiliki banyak tempat bersejarah dan monumen yang menggambarkan peran pentingnya dalam sejarah Indonesia. Selain itu, kota ini juga dikenal karena kelezatan kuliner, seni, dan tradisi lokal yang membuatnya menjadi destinasi wisata yang menarik bagi wisatawan lokal maupun mancanegara. Dengan berbagai potensi dan pesona-nya, Kota Surabaya terus berkembang dan menjadi salah satu destinasi utama di Indonesia.
              </p>

              <p className="mb-4">
                Asal Usul Surabaya Nama tersebut juga terkait dengan legenda ikan hiu dan buaya yang berebut makanan. Cerita rakyat tentang adu hiu, sura, dan buaya terukir dalam sejarah nama kota Surabaya. Peristiwa ini pula yang melahirkan simbol Kota Surabaya, yakni Hiu Surabaya dan Buaya Baya. Ada pula yang mengatakan nama Surabaya berasal dari kata sura dan baya. Sura berarti keberanian atau kesalamatan, dan baya berarti bahaya. Oleh karena itu, Surabaya berarti "aman dari bahaya". Sebutan Surabaya mengartikan julukan "Kota Pahlawan" berasal dari pertempuran antara Raden Wijaya dan tentara Mongol pimpinan Kublai Khan pada tahun 1293.
              </p>

              <p className="mb-4">
                Pertempuran ini kemudian dinamakan sebagai Hari berdinya Kota Surabaya pada tanggal 31 Mei. Gelar Kota Pahlawan diberikan kepada Kota Surabaya sebagai pengingat perjuangan para pahlawan pada pertempuran 10 November 1945. Itulah momen yang menginspirasi Kota Surabaya untuk melawan penjajah pasca Bung Tomo, - pidato Pertempuran ini menjadikan Surabaya sebagai kota pahlawan. Selain itu, tanggal 10 November juga diperingati sebagai Hari Pahlawan, tempat wisata di surabaya yang paling terkenal adalah wisata sejarah, yang terdapat banyak museum yang mengenang jasa para pahlawan di surabaya, dijajarkan monumen peringatan kepahlawanan misalnya. Traveler bisa memesan tiket objek wisata berikut ini melalui objek wisata Surabaya ini:
              </p>

              <ul className="list-disc pl-6 mb-4">
                <li>Taman hiburan pantai kenjeran</li>
                <li>Museum sepuluh november</li>
                <li>Museum Dr. Soetomo</li>
                <li>Museum Pendidikan</li>
                <li>Museum Surabaya gedung siola</li>
                <li>Museum H.O.S Tjokroaminoto</li>
                <li>Museum W.R Soepratman</li>
                <li>Rumah kelahiran bung tomo</li>
                <li>Alun alun surabaya</li>
                <li>Wisata perahu kalimas</li>
              </ul>

              <p>
                disimpulkan bahwa kota Surabaya adalah sebuah kota yang kaya akan sejarah dan budaya, serta memiliki peran penting dalam perkembangan Indonesia. Sebagai Kota Pahlawan, Surabaya dikenal dengan semangat juangnya dalam merebut kemerdekaan dan pengaruh. Selain itu, Surabaya juga merupakan pusat perdagangan dan industri yang berkembang pesat. Keberagaman budaya, kuliner, seni, dan tradisi lokal menjadi daya tarik tersendiri bagi kota ini. Dengan potensi dan pesona-nya, Surabaya terus menjadi destinasi wisata yang menarik bagi wisatawan. Kesimpulannya, kota Surabaya merupakan sebuah tempat yang patut untuk dieksplorasi dan dinikmati kekayaan serta keragaman yang dimilikinya.
              </p>
            </div>
          </div>
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
}