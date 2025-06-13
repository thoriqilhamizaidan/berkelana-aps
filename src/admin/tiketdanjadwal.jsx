// src/admin/tiketdanjadwal.jsx
import React, { useState, useEffect } from 'react';
import TambahJadwal from './tambahjadwal';
import EditJadwal from './editjadwal';
import DetailJadwal from './detailjadwal';
import jadwalService from '../services/jadwalService';

const TiketDanJadwal = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [editingJadwal, setEditingJadwal] = useState(null);
  const [selectedJadwal, setSelectedJadwal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk modal konfirmasi hapus
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [jadwalToDelete, setJadwalToDelete] = useState(null);
  
  // Filter states
  const [selectedKendaraan, setSelectedKendaraan] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  
  // Data state
  const [jadwalData, setJadwalData] = useState([]);
  
  const itemsPerPage = 5;

  // Load data from API on mount
  useEffect(() => {
    loadJadwalData();
  }, []);

  const loadJadwalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await jadwalService.getAllJadwal();
      
      if (response && response.success && response.data) {
        // Transform data from API to match frontend format
        const transformedData = response.data.map(item => {
          const departure = new Date(item.waktu_keberangkatan);
          const arrival = new Date(item.waktu_sampai);
          
          const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          
          const formattedDate = `${dayNames[departure.getDay()]}, ${departure.getDate()} ${monthNames[departure.getMonth()]} ${departure.getFullYear()}`;
          const waktuKeberangkatan = departure.toTimeString().slice(0, 5).replace(':', '.');
          const waktuSampai = arrival.toTimeString().slice(0, 5).replace(':', '.');
          
          return {
            id: item.id_jadwal,
            jadwalKeberangkatan: formattedDate,
            waktu: `${waktuKeberangkatan} - ${waktuSampai}`,
            ruteKeberangkatan: item.kota_awal,
            ruteTujuan: item.kota_tujuan,
            kategoriArmada: item.Kendaraan?.tipe_armada || 'Unknown',
            nomorArmada: item.Kendaraan?.nomor_armada || 'Unknown',
            tanggal: departure.getDate(),
            bulan: departure.getMonth() + 1,
            tahun: departure.getFullYear(),
            waktuKeberangkatan: departure.toTimeString().slice(0, 5),
            waktuSampai: arrival.toTimeString().slice(0, 5),
            durasi: item.durasi,
            harga: item.harga,
            idKendaraan: item.id_kendaraan,
            idPromo: item.id_promo,
            // Keep original data for API operations
            _original: item
          };
        });
        
        setJadwalData(transformedData);
      } else {
        throw new Error('Format response tidak valid');
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data jadwal');
      console.error('Failed to load jadwal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter data berdasarkan semua filter yang dipilih
  const filteredData = React.useMemo(() => {
    return jadwalData.filter(item => {
      // Filter berdasarkan jenis kendaraan
      if (selectedKendaraan && selectedKendaraan !== '' && item.kategoriArmada.toLowerCase() !== selectedKendaraan.toLowerCase()) {
        return false;
      }
      
      // Filter berdasarkan tanggal
      if (selectedTanggal && selectedTanggal !== '' && item.tanggal !== parseInt(selectedTanggal)) {
        return false;
      }
      
      // Filter berdasarkan bulan
      if (selectedBulan && selectedBulan !== '' && item.bulan !== parseInt(selectedBulan)) {
        return false;
      }
      
      // Filter berdasarkan tahun
      if (selectedTahun && selectedTahun !== '' && item.tahun !== parseInt(selectedTahun)) {
        return false;
      }
      
      return true;
    });
  }, [jadwalData, selectedKendaraan, selectedTanggal, selectedBulan, selectedTahun]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentTablePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset ke page 1 ketika filter berubah
  useEffect(() => {
    setCurrentTablePage(1);
  }, [selectedKendaraan, selectedTanggal, selectedBulan, selectedTahun]);

  // Helper function untuk format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Helper function untuk format durasi
  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}j ${mins > 0 ? mins + 'm' : ''}`;
    }
    return `${mins}m`;
  };

  // Event handlers
  const handleTambahClick = () => {
    setCurrentPage('add');
    setEditingJadwal(null);
  };

  const handleEditClick = (jadwal) => {
    // Pass original data for editing
    setEditingJadwal(jadwal._original || jadwal);
    setCurrentPage('edit');
  };

  const handleDetailClick = (jadwal) => {
    setSelectedJadwal(jadwal._original || jadwal);
    setCurrentPage('detail');
  };

  // Handler untuk membuka modal konfirmasi hapus
  const handleDeleteClick = (jadwal) => {
    setJadwalToDelete(jadwal);
    setShowDeleteModal(true);
  };

  // Handler untuk konfirmasi hapus
  const handleConfirmDelete = async () => {
    if (jadwalToDelete) {
      try {
        setLoading(true);
        setError(null);
        
        const jadwalId = jadwalToDelete.id || jadwalToDelete.id_jadwal;
        const response = await jadwalService.deleteJadwal(jadwalId);
        
        if (response.success) {
          // Reload data
          await loadJadwalData();
          alert('Jadwal berhasil dihapus!');
        }
        
        setShowDeleteModal(false);
        setJadwalToDelete(null);
      } catch (err) {
        setError(err.message || 'Gagal menghapus jadwal');
        alert(`Gagal menghapus jadwal: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handler untuk membatalkan hapus
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setJadwalToDelete(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Reload data after submit
      await loadJadwalData();
      setCurrentPage('list');
    } catch (err) {
      alert(`Gagal menyimpan data: ${err.message}`);
    }
  };

  const handleFormCancel = () => {
    setCurrentPage('list');
    setEditingJadwal(null);
    setSelectedJadwal(null);
  };

  // Error display component
  const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-800">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 text-red-600 hover:text-red-800 underline"
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      <span className="ml-2 text-gray-600">Memuat data...</span>
    </div>
  );

  // Modal Konfirmasi Hapus dengan background blur
  const DeleteConfirmationModal = () => {
    if (!showDeleteModal || !jadwalToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Background overlay dengan blur */}
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          onClick={handleCancelDelete}
        ></div>
        
        {/* Modal container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all animate-in zoom-in-95 duration-300">
            {/* Header Modal */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Konfirmasi Hapus</h3>
              </div>
              
              {/* Close button */}
              <button
                onClick={handleCancelDelete}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content Modal */}
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                Apakah Anda yakin ingin menghapus jadwal ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              
              {/* Detail Jadwal yang akan dihapus */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Jadwal:</span>
                    <span className="text-gray-900 text-right">{jadwalToDelete.jadwalKeberangkatan}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Rute:</span>
                    <span className="text-gray-900 text-right">{jadwalToDelete.ruteKeberangkatan} → {jadwalToDelete.ruteTujuan}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Waktu:</span>
                    <span className="text-gray-900 text-right">{jadwalToDelete.waktu}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Kendaraan:</span>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        jadwalToDelete.kategoriArmada === 'Bus' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {jadwalToDelete.kategoriArmada}
                      </span>
                      <div className="text-gray-900 text-sm mt-1">{jadwalToDelete.nomorArmada}</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-gray-700">Harga:</span>
                    <span className="text-gray-900 font-medium text-right">{formatCurrency(jadwalToDelete.harga)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render different pages
  if (currentPage === 'add') {
    return (
      <TambahJadwal 
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    );
  }

  if (currentPage === 'edit') {
    return (
      <EditJadwal 
        jadwal={editingJadwal}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    );
  }

  if (currentPage === 'detail') {
    return (
      <DetailJadwal 
        jadwal={selectedJadwal}
        onBack={handleFormCancel}
      />
    );
  }

  // Main list page
  return (
    <div className="p-3 sm:p-8 bg-gray-50 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tiket dan Jadwal</h1>
            <p className="text-gray-600 mt-2">Kelola jadwal keberangkatan dan tiket perjalanan</p>
          </div>
          <button
            onClick={handleTambahClick}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Jadwal
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={loadJadwalData} 
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Jadwal</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{jadwalData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-full">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Jadwal Bus</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {jadwalData.filter(j => j.kategoriArmada === 'Bus').length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-purple-100 rounded-full">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Jadwal Shuttle</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {jadwalData.filter(j => j.kategoriArmada === 'Shuttle').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-full">
                <svg className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Rata-rata Harga</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {jadwalData.length > 0 
                    ? formatCurrency(jadwalData.reduce((sum, j) => sum + j.harga, 0) / jadwalData.length)
                    : 'Rp 0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-6 mb-6 sm:mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Jadwal</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Jenis Kendaraan</label>
              <select 
                value={selectedKendaraan}
                onChange={(e) => setSelectedKendaraan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Semua kendaraan</option>
                <option value="Bus">Bus</option>
                <option value="Shuttle">Shuttle</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tanggal</label>
              <select 
                value={selectedTanggal}
                onChange={(e) => setSelectedTanggal(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Semua Tanggal</option>
                {[...Array(31)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Bulan</label>
              <select 
                value={selectedBulan}
                onChange={(e) => setSelectedBulan(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Semua Bulan</option>
                <option value="1">Januari</option>
                <option value="2">Februari</option>
                <option value="3">Maret</option>
                <option value="4">April</option>
                <option value="5">Mei</option>
                <option value="6">Juni</option>
                <option value="7">Juli</option>
                <option value="8">Agustus</option>
                <option value="9">September</option>
                <option value="10">Oktober</option>
                <option value="11">November</option>
                <option value="12">Desember</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">Tahun</label>
              <select 
                value={selectedTahun}
                onChange={(e) => setSelectedTahun(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Semua Tahun</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-3 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Jadwal Keberangkatan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Menampilkan {filteredData.length} dari {jadwalData.length} jadwal
            </p>
          </div>
          
          {loading && jadwalData.length === 0 ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jadwal
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rute
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kendaraan
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harga
                      </th>
                      <th className="px-2 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-2 sm:px-6 py-8 text-center text-gray-500">
                          {filteredData.length === 0 && jadwalData.length > 0 
                            ? 'Tidak ada jadwal yang sesuai filter' 
                            : 'Tidak ada data jadwal'}
                        </td>
                      </tr>
                    ) : (
                      currentData.map((jadwal) => (
                        <tr key={jadwal.id} className="hover:bg-gray-50">
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="font-medium text-gray-900">{jadwal.jadwalKeberangkatan}</div>
                            <div className="text-gray-500">{jadwal.tanggal}/{jadwal.bulan}/{jadwal.tahun}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="flex items-center">
                              <div className="font-medium text-gray-900">{jadwal.ruteKeberangkatan}</div>
                              <svg className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                              <div className="font-medium text-gray-900">{jadwal.ruteTujuan}</div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="text-gray-900">{jadwal.waktu}</div>
                            <div className="text-gray-500">{formatDuration(jadwal.durasi)}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <span className={`inline-flex px-2 py-0.5 sm:py-1 text-xs font-semibold rounded-full ${
                              jadwal.kategoriArmada === 'Bus' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {jadwal.kategoriArmada}
                            </span>
                            <div className="text-gray-500 mt-1">{jadwal.nomorArmada}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                            <div className="font-medium text-gray-900">{formatCurrency(jadwal.harga)}</div>
                          </td>
                          <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <button 
                                onClick={() => handleDetailClick(jadwal)}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                disabled={loading}
                              >
                                Detail
                              </button>
                              <button 
                                onClick={() => handleEditClick(jadwal)}
                                className="text-indigo-600 hover:text-indigo-900 transition-colors"
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(jadwal)}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                disabled={loading}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-3 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                    Menampilkan {startIndex + 1} sampai {Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
                    <button
                      onClick={() => setCurrentTablePage(prev => Math.max(prev - 1, 1))}
                      disabled={currentTablePage === 1}
                      className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentTablePage(page)}
                        className={`px-2 sm:px-3 py-1 border rounded-md text-xs sm:text-sm transition-colors ${
                          currentTablePage === page 
                            ? 'bg-purple-600 text-white border-purple-600' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentTablePage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentTablePage === totalPages}
                      className="px-2 sm:px-3 py-1 border border-gray-300 rounded-md text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      <DeleteConfirmationModal />
    </div>
  );
};

export default TiketDanJadwal;