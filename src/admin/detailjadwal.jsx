// src/admin/detailjadwal.jsx
import React from 'react';

const DetailJadwal = ({ jadwal, onBack }) => {
  if (!jadwal) {
    return (
      <div className="p-8 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-500">Data jadwal tidak ditemukan</p>
            <button
              onClick={onBack}
              className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
    <div className="p-8 bg-white min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-purple-600 hover:text-purple-700"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Detail Jadwal Keberangkatan</h1>
          <p className="text-gray-600">Informasi lengkap jadwal keberangkatan</p>
        </div>

        {/* Main Content */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">{jadwal.kota_awal} → {jadwal.kota_tujuan}</h2>
                <p className="text-purple-100">{formatDateTime(jadwal.waktu_keberangkatan)}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  jadwal.Kendaraan?.tipe_armada === 'Bus' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}>
                  {jadwal.Kendaraan?.tipe_armada || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Detail Information */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informasi Waktu */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Waktu
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Waktu Keberangkatan:</span>
                    <span className="font-medium text-gray-900">{formatTime(jadwal.waktu_keberangkatan)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Waktu Sampai:</span>
                    <span className="font-medium text-gray-900">{formatTime(jadwal.waktu_sampai)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Durasi Perjalanan:</span>
                    <span className="font-medium text-gray-900">{formatDuration(jadwal.durasi)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Tanggal:</span>
                    <span className="font-medium text-gray-900">{formatDate(jadwal.waktu_keberangkatan)}</span>
                  </div>
                </div>
              </div>

              {/* Informasi Kendaraan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Informasi Kendaraan
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Kategori Armada:</span>
                    <span className="font-medium text-gray-900">{jadwal.Kendaraan?.tipe_armada || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">Nomor Armada:</span>
                    <span className="font-medium text-gray-900">{jadwal.Kendaraan?.nomor_armada || 'N/A'}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600">ID Kendaraan:</span>
                    <span className="font-medium text-gray-900">{jadwal.id_kendaraan}</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Status Promo:</span>
                    <span className="font-medium text-gray-900">
                      {jadwal.id_promo ? `Promo ID: ${jadwal.id_promo}` : 'Tidak ada promo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Informasi Harga */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium text-gray-700">Harga Tiket:</span>
                <span className="text-2xl font-bold text-purple-600">{formatCurrency(jadwal.harga)}</span>
              </div>
            </div>

            {/* Informasi Rute Detail */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-4">
                Detail Rute Perjalanan
              </h3>
              
              <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <p className="font-semibold text-gray-900">{jadwal.kota_awal}</p>
                  <p className="text-sm text-gray-600">Keberangkatan</p>
                  <p className="text-sm font-medium text-green-600">{formatTime(jadwal.waktu_keberangkatan)}</p>
                </div>
                
                <div className="flex-1 mx-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 py-1 text-sm text-gray-500 rounded-full border">
                        {formatDuration(jadwal.durasi)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mx-auto mb-2"></div>
                  <p className="font-semibold text-gray-900">{jadwal.kota_tujuan}</p>
                  <p className="text-sm text-gray-600">Tujuan</p>
                  <p className="text-sm font-medium text-red-600">{formatTime(jadwal.waktu_sampai)}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                onClick={onBack}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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