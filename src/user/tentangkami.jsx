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
      answer: 'Tidak ada biaya pendaftaran untuk bergabung dengan Berkelana. Anda hanya perlu membuat akun secara gratis dan mulai menikmati layanan kami.'
    },
    {
      question: 'Bagaimana cara memesan tiket bus melalui Berkelana?',
      answer: 'Untuk memesan tiket bus, cukup pilih rute dan tanggal perjalanan yang diinginkan, pilih bus yang tersedia, dan lanjutkan ke proses pembayaran. Tiket akan dikirimkan ke email Anda setelah pembayaran selesai.'
    },
    {
      question: 'Apakah Berkelana menyediakan layanan pemesanan tiket untuk Shufell?',
      answer: 'Ya, Berkelana juga menyediakan layanan pemesanan tiket untuk Shufell. Anda dapat memilih jadwal dan lokasi yang tersedia untuk perjalanan Shufell dan memesan tiket dengan mudah melalui platform kami.'
    },
    {
      question: 'Bagaimana cara membatalkan pemesanan tiket bus atau Shufell?',
      answer: 'Untuk membatalkan pemesanan, kunjungi halaman pesanan Anda dan pilih opsi pembatalan. Pastikan untuk memeriksa kebijakan pembatalan terkait dengan jadwal yang Anda pilih.'
    },
    {
      question: 'Apakah Berkelana menyediakan diskon atau promo untuk tiket bus atau Shufell?',
      answer: 'Berkelana secara berkala menawarkan promo dan diskon khusus untuk tiket bus dan Shufell. Pastikan untuk memeriksa halaman promo kami atau mengikuti akun media sosial kami untuk mendapatkan informasi terbaru.'
    },
    {
      question: 'Apakah Berkelana menyediakan layanan selain pemesanan tiket bus dan Shufell?',
      answer: 'Selain pemesanan tiket bus dan Shufell, Berkelana juga menyediakan informasi destinasi wisata, rekomendasi akomodasi, dan artikel perjalanan yang dapat membantu Anda merencanakan perjalanan dengan lebih lengkap.'
    },
    {
      question: 'Bisakah saya berbagi pengalaman menggunakan Berkelana?',
      answer: 'Tentu! Kami sangat menghargai pengalaman dan feedback dari pengguna. Anda dapat mengirim cerita, pengalaman, atau saran melalui email ke berkelana@gmail.com. Setiap cerita Anda sangat berarti bagi kami untuk meningkatkan layanan.'
    },
    {
      question: 'Apakah ada artikel atau tips perjalanan yang bisa saya baca di Berkelana?',
      answer: 'Ya, Berkelana menyediakan berbagai artikel dan tips perjalanan yang informatif dan inspiratif untuk membantu Anda merencanakan perjalanan yang menyenangkan dan aman.'
    },
    {
      question: 'Apakah Berkelana aman untuk digunakan?',
      answer: 'Berkelana menjaga data pribadi dan transaksi Anda dengan sangat aman. Kami menggunakan enkripsi data yang kuat untuk melindungi informasi pengguna dan transaksi pembayaran.'
    }
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
            className={`h-6 w-6 text-gray-600 transform transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
        style={{ backgroundImage: "url('/public/images/backgroundtentangkami.jpg')" }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
          <h1 className="text-4xl font-bold">Lebih Dekat dengan Berkelana</h1>
          <p className="text-lg mt-2">Know our journey, and the people behind it.</p>
        </div>
      </div>

      {/* Section 2 */}
      <div
        className="relative bg-cover bg-center py-12"
        style={{ backgroundImage: "url('/public/images/tentangkami2.jpg')" }}
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
                src="/public/images/bagicon.png"
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
              src="/public/images/tentangkami3.png"
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
