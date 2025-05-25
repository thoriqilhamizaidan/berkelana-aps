import React, { useState } from "react";
import TambahPromo from "./TambahPromo";
import EditPromo from "./EditPromo";

const initialPromos = [
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
    image: "/images/hero.png",
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
    image: "/images/hero.png",
  },
];

const PromoTable = () => {
  const [promos, setPromos] = useState(initialPromos);
  const [showTambahPromo, setShowTambahPromo] = useState(false);
  const [showEditPromo, setShowEditPromo] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  const handleTambahPromo = (promo) => {
    setPromos([promo, ...promos]);
    setShowTambahPromo(false);
  };

  const handleEditPromo = (promo) => {
    setPromos(promos.map((p, i) => (i === editIndex ? promo : p)));
    setShowEditPromo(false);
    setEditIndex(null);
  };

  const handleDelete = (idx) => {
    if (window.confirm("Yakin hapus promo ini?")) {
      setPromos(promos.filter((_, i) => i !== idx));
    }
  };

  if (showEditPromo && editIndex !== null) {
    return (
      <EditPromo
        onBack={() => { setShowEditPromo(false); setEditIndex(null); }}
        onSave={handleEditPromo}
        editData={{
          ...promos[editIndex],
          details: promos[editIndex].details.join('\n'), // for input value
        }}
      />
    );
  }

  if (showTambahPromo) {
    return (
      <TambahPromo
        onBack={() => setShowTambahPromo(false)}
        onSave={handleTambahPromo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pt-18">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Promo</h1>
          <button
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => setShowTambahPromo(true)}
          >
            Tambah Promo +
          </button>
        </div>

        {/* Tabel Promo */}
        <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="py-4 px-6 font-medium text-gray-700 text-sm">Promo</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm">Detail Promo</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm">Kode Promo</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm">Gambar Promo</th>
                <th className="py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {promos.map((promo, i) => (
                <tr key={i} className="bg-gray-100">
                  <td className="py-6 px-6 align-top min-w-[160px] text-gray-900 font-medium">{promo.title}</td>
                  <td className="py-6 px-6 align-top min-w-[320px] text-gray-600">
                    <ul className="list-disc ml-6 text-[1rem]">
                      {promo.details.map((d, idx) => (
                        <li key={idx}>{d}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="py-6 px-6 align-top min-w-[120px] text-gray-600">{promo.code}</td>
                  <td className="py-6 px-6 align-top">
                    {promo.image ? (
                      <img
                        src={promo.image}
                        alt="Promo"
                        className="w-26 h-22 object-cover rounded border border-gray-200"
                      />
                    ) : (
                      <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="py-6 px-6 align-top">
                    <div className="flex gap-2">
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                        onClick={() => { setEditIndex(i); setShowEditPromo(true); }}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                        onClick={() => handleDelete(i)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {promos.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-400">Belum ada promo</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PromoTable;