import React, { useState, useEffect } from 'react';

const LaporanPenjualanTiket = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTipeArmada, setSelectedTipeArmada] = useState('');
  const [selectedTanggal, setSelectedTanggal] = useState('');
  const [selectedBulan, setSelectedBulan] = useState('');
  const [selectedTahun, setSelectedTahun] = useState('');
  
  // State untuk data dari API
  const [laporanData, setLaporanData] = useState([]);
  const [tipeArmadaOptions, setTipeArmadaOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [statistics, setStatistics] = useState({
    totalTransaksi: 0,
    totalPenumpang: 0,
    totalPendapatan: 0
  });
  
  const itemsPerPage = 10;
  
  // Fix: Handle environment variable safely
  const API_BASE_URL = (typeof window !== 'undefined' && window.REACT_APP_API_URL) || 
                       (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) || 
                       'http://localhost:3000';

  // Helper function untuk handle fetch dengan error checking
  const fetchWithErrorHandling = async (url, options = {}) => {
    try {
      console.log('🔄 Fetching:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers.get('content-type'));

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Non-JSON response:', text.substring(0, 200));
        throw new Error('Server returned non-JSON response');
      }

      const data = await response.json();
      console.log('✅ JSON response received:', data);
      return data;
    } catch (error) {
      console.error('❌ Fetch error:', error);
      throw error;
    }
  };

  // Fetch tipe armada untuk dropdown
  useEffect(() => {
    const fetchTipeArmada = async () => {
      try {
        console.log('🚗 Fetching tipe armada...');
        
        // Test connection first
        const testResult = await fetchWithErrorHandling(`${API_BASE_URL}/api/laporan/test`);
        console.log('✅ Test connection successful:', testResult);

        const result = await fetchWithErrorHandling(`${API_BASE_URL}/api/laporan/tipe-armada`);
        
        if (result.success) {
          setTipeArmadaOptions(result.data);
          console.log('✅ Tipe armada loaded:', result.data);
        } else {
          throw new Error(result.message || 'Failed to fetch tipe armada');
        }
      } catch (error) {
        console.error('❌ Error fetching tipe armada:', error);
        setError(`Gagal memuat tipe armada: ${error.message}`);
      }
    };

    fetchTipeArmada();
  }, [API_BASE_URL]);

  // Fetch data laporan
  const fetchLaporanData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Fetching laporan data...');
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      if (selectedTipeArmada) params.append('tipe_armada', selectedTipeArmada);
      if (selectedTanggal) params.append('tanggal', selectedTanggal);
      if (selectedBulan) params.append('bulan', selectedBulan);
      if (selectedTahun) params.append('tahun', selectedTahun);

      const url = `${API_BASE_URL}/api/laporan/penjualan-tiket?${params}`;
      const result = await fetchWithErrorHandling(url);

      if (result.success) {
        setLaporanData(result.data);
        setPagination(result.pagination);
        setStatistics(result.statistics);
        console.log('✅ Laporan data loaded:', result.data.length, 'items');
      } else {
        throw new Error(result.message || 'Failed to fetch laporan data');
      }
    } catch (error) {
      console.error('❌ Error fetching laporan:', error);
      setError(`Gagal mengambil data laporan: ${error.message}`);
      setLaporanData([]);
      setPagination({});
      setStatistics({
        totalTransaksi: 0,
        totalPenumpang: 0,
        totalPendapatan: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data saat component mount dan filter berubah
  useEffect(() => {
    fetchLaporanData();
  }, [currentPage, selectedTipeArmada, selectedTanggal, selectedBulan, selectedTahun]);

  // Reset ke page 1 ketika filter berubah
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [selectedTipeArmada, selectedTanggal, selectedBulan, selectedTahun]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleETicketClick = (bookingCode) => {
    // Navigate ke halaman e-tiket - buka di tab baru
    window.open(`/admin/etiket/${bookingCode}`, '_blank');
  };

  const handleSimpanPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedTipeArmada) params.append('tipe_armada', selectedTipeArmada);
      if (selectedTanggal) params.append('tanggal', selectedTanggal);
      if (selectedBulan) params.append('bulan', selectedBulan);
      if (selectedTahun) params.append('tahun', selectedTahun);

      const response = await fetch(`${API_BASE_URL}/api/laporan/penjualan-tiket/excel?${params}`);
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `laporan-penjualan-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Gagal mengunduh Excel');
      console.error('Error downloading Excel:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const renderPagination = () => {
    if (!pagination.totalPages || pagination.totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = window.innerWidth < 768 ? 5 : 10; // Kurangi jumlah halaman untuk mobile
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pageNumbers.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          ‹
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-2 sm:px-3 py-1 text-sm rounded ${
            currentPage === i
              ? 'bg-purple-500 text-white'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    // Next button
    if (currentPage < pagination.totalPages) {
      pageNumbers.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
        >
          ›
        </button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-1 mt-6">
        {pageNumbers}
      </div>
    );
  };

  const activeFilters = [
    selectedTipeArmada && { key: 'tipe_armada', label: selectedTipeArmada, clear: () => setSelectedTipeArmada('') },
    selectedTanggal && { key: 'tanggal', label: `Tanggal ${selectedTanggal}`, clear: () => setSelectedTanggal('') },
    selectedBulan && { key: 'bulan', label: ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][parseInt(selectedBulan)], clear: () => setSelectedBulan('') },
    selectedTahun && { key: 'tahun', label: `Tahun ${selectedTahun}`, clear: () => setSelectedTahun('') }
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-white p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Laporan Penjualan Tiket
          </h1>
          
          {/* Statistik Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 bg-purple-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-purple-600">{statistics.totalTransaksi}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Transaksi</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{statistics.totalPenumpang}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Penumpang</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{formatCurrency(statistics.totalPendapatan)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Total Pendapatan</div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <select 
              value={selectedTipeArmada}
              onChange={(e) => setSelectedTipeArmada(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm font-medium w-full"
            >
              <option value="">Semua Tipe Armada</option>
              {tipeArmadaOptions.map(tipe => (
                <option key={tipe} value={tipe}>{tipe}</option>
              ))}
            </select>

            <select 
              value={selectedTanggal}
              onChange={(e) => setSelectedTanggal(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Semua Tanggal</option>
              {[...Array(31)].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>

            <select 
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
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

            <select 
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-full"
            >
              <option value="">Semua Tahun</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Active Filters */}
          {activeFilters.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-purple-700 font-medium text-sm">Filter aktif:</span>
                {activeFilters.map(filter => (
                  <span key={filter.key} className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm">
                    {filter.label}
                    <button 
                      onClick={filter.clear}
                      className="ml-1 sm:ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button 
                  onClick={() => {
                    setSelectedTipeArmada('');
                    setSelectedTanggal('');
                    setSelectedBulan('');
                    setSelectedTahun('');
                  }}
                  className="ml-1 sm:ml-3 text-purple-600 hover:text-purple-800 text-xs sm:text-sm underline"
                >
                  Hapus Semua Filter
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-gray-600">Memuat data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={fetchLaporanData}
              className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Desktop Table */}
        {!loading && !error && (
          <div className="hidden lg:block bg-white border border-gray-300 rounded-b-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Booking Code</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Nama Pemesan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Email Pemesan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Waktu Keberangkatan</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Rute</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tipe Armada</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Penumpang</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {laporanData.length > 0 ? (
                    laporanData.map((item, index) => (
                      <tr key={item.id_headtransaksi} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{item.booking_code}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{item.nama_pemesan}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{item.email_pemesan}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{formatDate(item.waktu_keberangkatan)}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{item.rute}</td>
                        <td className="py-3 px-4 text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {item.tipe_armada}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-center">{item.total_penumpang}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 font-medium">{formatCurrency(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 px-4 text-center text-gray-500">
                        Tidak ada data yang ditemukan untuk filter yang dipilih.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Cards */}
        {!loading && !error && (
          <div className="lg:hidden space-y-4">
            {laporanData.length > 0 ? (
              laporanData.map((item) => (
                <div key={item.id_headtransaksi} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="font-medium text-gray-900 text-sm">{item.booking_code}</div>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {item.tipe_armada}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Pemesan:</span>
                      <div className="text-gray-900">{item.nama_pemesan}</div>
                      <div className="text-gray-600 text-xs">{item.email_pemesan}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Keberangkatan:</span>
                      <div className="text-gray-900">{formatDateShort(item.waktu_keberangkatan)}</div>
                    </div>
                    
                    <div>
                      <span className="font-medium text-gray-700">Rute:</span>
                      <div className="text-gray-900">{item.rute}</div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div>
                        <span className="font-medium text-gray-700">Penumpang:</span>
                        <span className="ml-1 text-gray-900">{item.total_penumpang}</span>
                      </div>
                      <div className="font-medium text-gray-900">{formatCurrency(item.total)}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Tidak ada data yang ditemukan untuk filter yang dipilih.
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && renderPagination()}

        {/* Simpan PDF Button */}
        {!loading && !error && laporanData.length > 0 && (
          <div className="mt-6 sm:mt-8 flex justify-center sm:justify-end">
            <button
              onClick={handleSimpanPDF}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium w-full sm:w-auto"
            >
              Simpan Excel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LaporanPenjualanTiket;