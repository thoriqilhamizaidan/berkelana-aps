import React, { useState } from 'react';
import Navbar from './navbar';
import Footer from './footer';

const TentangKami = () => {
  const [openIndex, setOpenIndex] = useState(null); // simpan index yang aktif

  const faqData = [
    {
      question: 'Apa itu "Berkelana" dan bagaimana cara bergabung?',
      answer:
        'Berkelana adalah platform perjalanan yang membantu pengguna merencanakan dan memesan tiket untuk perjalanan domestik dan internasional. Untuk bergabung, Anda hanya perlu membuat akun di platform kami.',
    },
    {
      question: 'Apakah ada biaya pendaftaran untuk bergabung dengan Berkelana?',
      answer:
        'Tidak ada biaya pendaftaran untuk bergabung dengan Berkelana. Anda hanya perlu membuat akun secara gratis dan mulai menikmati layanan kami.',
    },
    {
      question: 'Apakah Berkelana aman untuk digunakan?',
      answer:
        'Berkelana menjaga data pribadi dan transaksi Anda dengan sangat aman. Kami menggunakan enkripsi data yang kuat untuk melindungi informasi pengguna.',
    },
  ];

  const handleToggle = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  const FAQItem = ({ question, answer, isOpen, onClick }) => (
    <div className="bg-white p-6 rounded-lg shadow-md transition duration-300">
      <button
        className="w-full flex items-center justify-between focus:outline-none"
        onClick={onClick}
      >
        <p className="font-semibold text-lg text-left">{question}</p>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 text-gray-600 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 7a1 1 0 011.414 0L10 10.586l3.586-3.586A1 1 0 1114.414 7l-4 4a1 1 0 01-1.414 0l-4-4A1 1 0 015 7z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {isOpen && (
        <div className="mt-4">
          <p className="text-gray-600">{answer}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white1">


      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96"
        style={{ backgroundImage: "url('/images/backgroundtentangkami.jpg')" }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
          <h1 className="text-4xl font-bold">Lebih Dekat dengan Berkelana</h1>
          <p className="text-lg mt-2">Know our journey, and the people behind it.</p>
        </div>
      </div>

      {/* Section 2 */}
      <div
        className="relative bg-cover bg-center py-12"
        style={{ backgroundImage: "url('/images/tentangkami2.jpg')" }}
      >
        <div className="absolute inset-0 bg-white1 opacity-60"></div>

        <div className="relative z-10 max-w-6xl mx-auto px-4">
          {/* Flex container kiri-kanan + jarak */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between md:gap-x-16">
            
            {/* Kiri: Paragraf */}
            <div className="md:w-2/3">
              <p className="text-black1 mb-4">
                Dengan fokus pada transportasi, platform “Berkelana” memiliki tujuan untuk memberikan kemudahan akses, transparansi harga, dan efisiensi waktu bagi para wisatawan yang ingin merencanakan perjalanan mereka dengan lebih praktis dan nyaman.
                Dengan menghadirkan sistem pemesanan tiket yang efisien, platform ini tidak hanya menghubungkan pengguna dengan penyedia transportasi, tetapi juga menawarkan informasi real-time yang diperlukan untuk perencanaan perjalanan yang lebih baik, mulai dari pilihan transportasi yang sesuai hingga rekomendasi destinasi wisata yang relevan. 
              </p>
              <p className="text-black1">
                Dengan solusi yang praktis dan ramah pengguna, “Berkelana” berfokus pada pengembangan sistem yang menyederhanakan pengalaman pengguna dalam merencanakan perjalanan, memastikan mereka bisa menikmati perjalanan dengan lebih lancar, aman, dan tanpa kendala.
              </p>
            </div>

            {/* Kanan: Judul + Icon (lebih rapat dan icon lebih besar) */}
            <div className="md:w-1/3 mt-6 md:mt-0 flex items-center justify-center gap-0">
              <h2 className="text-3xl font-semibold text-black1">
                Jadi Apa itu <span className="font-bold text-purple1">#Berkelana?</span>
              </h2>
              <img
                src="/images/bagicon.png"
                alt="Travel Bag Icon"
                className="h-36 w-36"
              />
            </div>

          </div>
        </div>
      </div>

      {/* Section 3 - Peta */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/3 text-center md:text-left mb-6 md:mb-0">
            <p className="text-2xl font-semibold text-black">
              <span className="text-emerald1 font-semibold">#Berkelana</span> siap
            </p>
            <p className="text-2xl font-semibold text-black">membersamai kalian</p>
            <p className="text-2xl font-semibold text-black">kemanapun kalian pergi!</p>
          </div>
          <div className="md:w-2/3">
            <img
              src="/images/tentangkami3.png"
              alt="Peta Indonesia"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>

      {/* Section 4 - FAQ */}
      <div className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-6">FAQ'S</h2>
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <FAQItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default TentangKami;
