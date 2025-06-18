import React from 'react';
import Navbar from './navbar';
import Footer from './footer';

const Tc = () => {
  return (
    <div className="bg-white font-[League_Spartan]">

      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-96"
        style={{ backgroundImage: "url('/public/images/backgroundtentangkami.jpg')" }}
      >
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center text-white z-10">
          <h1 className="text-4xl font-bold">Syarat dan Ketentuan & Kebijakan Privasi</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Term & Condition Box */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg shadow-md p-4 mb-4">
          <span className="text-2xl mr-2">📝</span>
          <h3 className="text-xl font-bold">Syarat & Ketentuan</h3>
        </div>

        {/* Detail Content Box */}
        <div className="bg-gray-100 rounded-lg shadow-md px-6 py-6 mb-20">
          {/* Keberangkatan */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Keberangkatan</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Penumpang wajib hadir 60 menit sebelum jadwal keberangkatan di titik yang telah ditentukan.</li>
              <li>Keterlambatan penumpang dapat mengakibatkan tiket dibatalkan secara sepihak tanpa pengembalian dana.</li>
              <li>Waktu keberangkatan mengikuti waktu lokal.</li>
              <li>Penumpang wajib menunjukkan e-ticket dan identitas yang sah (KTP/SIM/Paspor).</li>
            </ol>
          </div>

          {/* Barang Bawaan */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Barang Bawaan</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Dilarang membawa barang terlarang seperti senjata tajam, barang mudah terbakar, berbau menyengat, atau hewan.</li>
              <li>Penumpang bertanggung jawab penuh atas barang bawaannya.</li>
              <li>Batas ukuran dan berat bagasi mengikuti ketentuan operator, dan kelebihan dikenakan biaya tambahan.</li>
            </ol>
          </div>

          {/* Pembatalan dan Refund */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Pembatalan dan Refund</h2>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Tidak ada pengembalian dana (non-refundable).</li>
              <li>Tidak ada reschedule (perubahan jadwal).</li>
              <li>Pembatalan sepihak oleh penumpang tidak mendapatkan kompensasi.</li>
            </ol>
          </div>
        </div>

        {/* Privacy Policy */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg shadow-md p-4 mb-4">
          <span className="text-2xl mr-2">🔒</span>
          <h3 className="text-xl font-bold">Privacy & Policy</h3>
        </div>
        <div>
          <div className="bg-gray-100 rounded-lg shadow-md p-6">
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>
                <span className="font-semibold">Apa yang dilakukan Berkelana dengan data pribadi saya?</span><br />
                Kami hanya mengumpulkan data yang diperlukan untuk pemesanan dan verifikasi tiket. Data Anda tidak akan dibagikan kepada pihak ketiga tanpa persetujuan Anda, kecuali untuk keperluan operasional pemesanan tiket.
              </li>
              <li>
                <span className="font-semibold">Apakah data saya aman?</span><br />
                Ya. Berkelana menggunakan sistem keamanan data terenkripsi untuk melindungi semua informasi pengguna.
              </li>
              <li>
                <span className="font-semibold">Data apa saja yang dikumpulkan?</span><br />
                Nama, email, nomor telepon, identitas (KTP/SIM/Paspor), dan data transaksi pemesanan Anda.
              </li>
              <li>
                <span className="font-semibold">Bagaimana jika saya ingin menghapus akun saya?</span><br />
                Anda bisa menghubungi layanan pelanggan kami untuk permintaan penghapusan akun dan data pribadi.
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Tc;
