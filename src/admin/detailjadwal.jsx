// src/admin/detailjadwal.jsx
import React from 'react';

const DetailJadwal = ({ jadwal, onBack }) => {
  if (!jadwal) {
    return (
      <div className="p-4 sm:p-8 bg-white min-h-screen overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-8 sm:py-12">
            <p className="text-gray-500">Data jadwal tidak ditemukan</p>
            <button
              onClick={onBack}
              className="mt-4 px-4 sm:px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 w-full sm:w-auto"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours} jam ${mins > 0 ? mins + ' menit' : ''}`;
    }
    return `${mins} menit`;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen overflow-x-hidden w-full">
      <div className="max-w-4xl mx-auto overflow-hidden">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm sm:text-base">Kembali</span>
            </button>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Detail Jadwal Keberangkatan</h1>
          <p className="text-sm sm:text-base text-gray-600">Informasi lengkap jadwal keberangkatan</p>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 sm:p-6 rounded-t-lg">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-full sm:w-auto">
                <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 break-words">{jadwal.kota_awal} → {jadwal.kota_tujuan}</h2>
                <p className="text-xs sm:text-sm text-purple-100">{formatDateTime(jadwal.waktu_keberangkatan)}</p>
              </div>
              <div className="text-left sm:text-right mt-2 sm:mt-0">
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${jadwal.Kendaraan?.tipe_armada === 'Bus' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                  {jadwal.Kendaraan?.tipe_armada || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Detail Information */}
          <div className="p-4 sm:p-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Informasi Waktu */}
              <div className="space-y-3 sm:space-y-4 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Waktu
                </h3>
                
                <div className="space-y-2 sm:space-y-3 w-full">
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Waktu Keberangkatan:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{formatTime(jadwal.waktu_keberangkatan)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Waktu Sampai:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{formatTime(jadwal.waktu_sampai)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Durasi Perjalanan:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{formatDuration(jadwal.durasi)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Tanggal:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{formatDate(jadwal.waktu_keberangkatan)}</span>
                  </div>
                </div>
              </div>

              {/* Informasi Kendaraan */}
              <div className="space-y-3 sm:space-y-4 mt-4 md:mt-0 w-full">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Kendaraan
                </h3>
                
                <div className="space-y-2 sm:space-y-3 w-full">
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Kategori Armada:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{jadwal.Kendaraan?.tipe_armada || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Nomor Armada:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{jadwal.Kendaraan?.nomor_armada || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 border-b border-gray-100 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">ID Kendaraan:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">{jadwal.id_kendaraan}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 sm:py-2 w-full">
                    <span className="text-xs sm:text-sm text-gray-600 mr-2 min-w-[120px]">Status Promo:</span>
                    <span className="text-xs sm:text-sm font-medium text-gray-900 break-words truncate">
                      {jadwal.id_promo ? `Promo ID: ${jadwal.id_promo}` : 'Tidak ada promo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Harga */}
            <div className="mt-5 sm:mt-6 p-3 sm:p-4 bg-gray-50 rounded-lg w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-2 w-full">
                <span className="text-sm sm:text-base font-medium text-gray-700">Harga Tiket:</span>
                <span className="text-lg sm:text-xl font-bold text-purple-600">{formatCurrency(jadwal.harga)}</span>
              </div>
            </div>

            {/* Informasi Rute Detail */}
            <div className="mt-5 sm:mt-6 w-full">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-3 sm:mb-4">
                Detail Rute Perjalanan
              </h3>
              
              <div className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg w-full">
                <div className="text-center mb-3 sm:mb-0 w-full sm:w-auto">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words max-w-[150px] mx-auto truncate">{jadwal.kota_awal}</p>
                  <p className="text-xs text-gray-600">Keberangkatan</p>
                  <p className="text-xs font-medium text-green-600">{formatTime(jadwal.waktu_keberangkatan)}</p>
                </div>
                
                <div className="flex-1 mx-0 sm:mx-4 w-full sm:w-auto my-3 sm:my-0 max-w-full">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-2 sm:px-3 py-1 text-xs text-gray-500 rounded-full border truncate max-w-[120px] sm:max-w-[150px]">
                        {formatDuration(jadwal.durasi)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center w-full sm:w-auto">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full mx-auto mb-1 sm:mb-2"></div>
                  <p className="text-sm sm:text-base font-semibold text-gray-900 break-words max-w-[150px] mx-auto truncate">{jadwal.kota_tujuan}</p>
                  <p className="text-xs text-gray-600">Tujuan</p>
                  <p className="text-xs font-medium text-red-600">{formatTime(jadwal.waktu_sampai)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 sm:mt-6 flex justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-xs sm:text-sm w-full sm:w-auto"
              >
                Kembali ke Daftar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailJadwal;