import React from "react";

const promos = [
  {
    title: "Promo Jawa Tengah",
    details: [
      "Periode Promo : 06 - 08 May 2025",
      "Periode Perjalanan : Kapanpun",
      "Promo berlaku untuk pembelian tiket keseluruhan pembelian ke Jawa tengah",
      "Kuota : Terbatas",
      "Penggunaan : Terbatas",
    ],
    code: "GADOGADO",
    image: "/images/promo-placeholder.png",
  },
  {
    title: "Promo Jawa Tengah",
    details: [
      "Periode Promo : 06 - 08 May 2025",
      "Periode Perjalanan : Kapanpun",
      "Promo berlaku untuk pembelian tiket keseluruhan pembelian ke Jawa tengah",
      "Kuota : Terbatas",
      "Penggunaan : Terbatas",
    ],
    code: "GADOGADO",
    image: "/images/promo-placeholder.png",
  },
];

const PromoTable = () => (
  <div className="w-full h-full">
    <div className="flex justify-between items-center mb-7">
      <button className="px-6 py-2 bg-white border-2 border-purple-300 text-purple-500 font-bold text-lg rounded-full shadow transition hover:bg-purple-50 focus:outline-none">
        <span className="px-4 py-2 border border-purple-300 rounded-lg font-bold bg-white text-purple-700 shadow-sm">Promo</span>
      </button>
      <button className="bg-purple-100 text-purple-700 font-semibold rounded-xl px-6 py-2 shadow transition hover:bg-purple-200">
        Tambah Promo
      </button>
    </div>
    <div className="rounded-xl shadow-lg bg-[#F6F6F6] overflow-hidden w-full">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#F6F6F6] border-b border-gray-300">
            <th className="py-4 px-4 font-semibold">Promo</th>
            <th className="py-4 px-4 font-semibold">Detail Promo</th>
            <th className="py-4 px-4 font-semibold">Kode promo</th>
            <th className="py-4 px-4 font-semibold">Gambar Promo</th>
            <th className="py-4 px-4 font-semibold">Action</th>
          </tr>
        </thead>
        <tbody>
          {promos.map((promo, i) => (
            <tr key={i} className="border-t border-gray-200">
              <td className="py-6 px-4 align-top min-w-[160px]">{promo.title}</td>
              <td className="py-6 px-4 align-top min-w-[320px]">
                <ul className="list-disc ml-6 text-[1rem]">
                  {promo.details.map((d, idx) => (
                    <li key={idx}>{d}</li>
                  ))}
                </ul>
              </td>
              <td className="py-6 px-4 align-top min-w-[120px]">{promo.code}</td>
              <td className="py-6 px-4 align-top">
                <div className="w-24 h-24 bg-gray-300 rounded-md flex items-center justify-center">
                  {/* Placeholder image icon */}
                  <svg width="48" height="48" fill="none" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#C6C6C6"/><path d="M36 34H12l6-8 5 7 3-4 6 5z" fill="#A3A3A3"/><circle cx="16.5" cy="18.5" r="3" fill="#A3A3A3"/></svg>
                </div>
              </td>
              <td className="py-6 px-4 align-top">
                <div className="flex gap-3">
                  <button className="px-5 py-2 bg-green-400 text-white rounded font-semibold hover:bg-green-500 transition">Edit</button>
                  <button className="px-5 py-2 bg-red-400 text-white rounded font-semibold hover:bg-red-500 transition">Hapus</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default PromoTable;