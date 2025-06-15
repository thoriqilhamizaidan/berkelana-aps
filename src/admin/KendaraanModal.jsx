// src/admin/kendaraanmodal.jsx
import React from 'react';

export const DeleteModal = ({ show, onClose, onConfirm }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/30 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 sm:p-6 text-center">
          <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Apakah anda yakin?
          </h3>
          <p className="text-gray-600 mb-6">
            Data yang dihapus tidak dapat dikembalikan lagi.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Tidak
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
            >
              Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DetailModal = ({ show, kendaraan, onClose }) => {
  if (!show || !kendaraan) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Detail Kendaraan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Column - Image */}
            <div>
              {kendaraan.gambarPreview ? (
                <img 
                  src={kendaraan.gambarPreview} 
                  alt="Kendaraan" 
                  className="w-full h-40 sm:h-48 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-40 sm:h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tipe Armada</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{kendaraan.tipeArmada}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Nomor Armada</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{kendaraan.nomorArmada}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Nomor Kendaraan</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{kendaraan.nomorKendaraan}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Format & Kapasitas Kursi</label>
                <p className="text-base sm:text-lg font-semibold text-gray-900">{kendaraan.kapasitasKursi} kursi ({kendaraan.formatKursi})</p>
              </div>
            </div>
          </div>

          {/* Kondektur Info */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Informasi Kondektur</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nama Kondektur</label>
                <p className="text-base font-semibold text-gray-900">{kendaraan.namaKondektur}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nomor Kondektur</label>
                <p className="text-base font-semibold text-gray-900">{kendaraan.nomorKondektur}</p>
              </div>
            </div>
          </div>

          {/* Fasilitas */}
          <div className="mt-4 sm:mt-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Fasilitas</h3>
            <div className="flex flex-wrap gap-2">
              {kendaraan.fasilitas.map((fasilitas, index) => (
                <span key={index} className="inline-flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-full bg-blue-100 text-blue-800">
                  {fasilitas}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end sticky bottom-0 bg-white z-10">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};