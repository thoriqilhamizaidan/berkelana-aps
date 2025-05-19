import Navbar from "./navbar";
import Footer from "./footer";
import React from 'react';
import { ArrowLeftRight } from 'lucide-react';

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
    text: "Pergi ke halaman pesan tiket,\nlalu tempel kode",
  },
];

const PromoHowTo = () => (
  <div className="relative py-10 px-2 flex flex-col items-center w-full">
    <div className="w-full bg-white shadow-lg z-10 relative p-6 md:p-10">

      <h2 className="text-center font-bold text-lg md:text-xl mb-7 pt-8">Cara Menggunakan Promo</h2>

      <div className="relative flex items-start justify-between">
  
        <div className="absolute top-4 left-[17%] right-[17%] h-1">
          <div className="w-full h-1 bg-purple-500" style={{ position: "absolute", zIndex: 1 }} />
        </div>

        {steps.map((step) => (
          <div key={step.number} className="flex flex-col items-center flex-1 z-10">

            <div className="bg-purple-500 text-white font-bold rounded-full w-8 h-8 flex items-center justify-center text-base mb-4 z-10">
              {step.number}
            </div>
            <div className="text-center text-sm md:text-base whitespace-pre-line">{step.text}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

function handleCopyCode(code, e) {
  e.preventDefault();
  navigator.clipboard.writeText(code);
  alert(`Kode ${code} berhasil disalin!`);
}

const PromoPage = () => (
  <div className="min-h-screen bg-white flex flex-col">
    <Navbar />

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

    <section className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
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

      <div className="max-w-6xl mx-auto mt-12">
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

    <PromoHowTo />
    <Footer />
  </div>
);

export default PromoPage;