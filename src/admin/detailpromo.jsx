import React from "react";

const DetailPromoModal = ({ show, promo, onClose }) => {
  if (!show || !promo) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Detail Promo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Image/Banner */}
            <div>
              {promo.image ? (
                <img 
                  src={promo.image} 
                  alt={promo.title || "Banner Promo"} 
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect width="20" height="20" x="2" y="2" rx="5" fill="#E5E7EB" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4a3 3 0 014 0l4 4m-6-4v.01" stroke="#B0B3B8"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Right Column - Promo Details */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Promo</label>
                <p className="text-lg font-semibold text-gray-900">{promo.title}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Kode Promo</label>
                <p className="text-lg font-semibold text-gray-900">{promo.code}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Potongan</label>
                <p className="text-lg font-semibold text-gray-900">
                  {promo.potongan}%
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Berlaku Hingga</label>
                <p className="text-lg font-semibold text-gray-900">{promo.berlakuHingga}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                  ${promo.is_active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-700"}`}>
                  {promo.is_active ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Detail Promo */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Detail Promo</h3>
            <ul className="list-disc ml-6 text-gray-700">
              {(Array.isArray(promo.details)
                ? promo.details
                : String(promo.details || "").split("\n")
              ).map((d, idx) => (
                <li key={`${idx}-${d}`}>{d}</li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DetailPromoModal;
