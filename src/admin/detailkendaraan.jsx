// src/admin/detailkendaraan.jsx
import React, { useState, useEffect } from 'react';
import KendaraanForm from './kendaraanform';
import { DeleteModal, DetailModal } from './KendaraanModal';
import kendaraanService from '../services/kendaraanService';

const DetailKendaraan = () => {
  const [currentPage, setCurrentPage] = useState('list');
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [editingKendaraan, setEditingKendaraan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedKendaraan, setSelectedKendaraan] = useState(null);
  
  // Data state
  const [kendaraanData, setKendaraanData] = useState([]);
  
  const itemsPerPage = 5;

  // Load data from API
  useEffect(() => {
    loadKendaraanData();
  }, []);

  const loadKendaraanData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await kendaraanService.getAllKendaraan();
      
      if (response && response.success && response.data) {
        // Transform data from snake_case to camelCase for frontend compatibility
        const transformedData = response.data.map(item => ({
          id: item.id_kendaraan,
          tipeArmada: item.tipe_armada,
          nomorArmada: item.nomor_armada,
          nomorKendaraan: item.nomor_kendaraan,
          formatKursi: item.format_kursi,
          kapasitasKursi: item.kapasitas_kursi,
          namaKondektur: item.nama_kondektur,
          nomorKondektur: item.nomor_kondektur,
          fasilitas: Array.isArray(item.fasilitas) ? item.fasilitas : [],
          gambar: item.gambar,
          gambarPreview: item.gambar ? kendaraanService.getImageUrl(item.gambar) : null,
          createdAt: item.created_at,
          updatedAt: item.updated_at
        }));
        
        setKendaraanData(transformedData);
      } else {
        throw new Error('Format response tidak valid');
      }
    } catch (err) {
      setError(err.message || 'Gagal memuat data kendaraan');
      console.error('Failed to load kendaraan data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(kendaraanData.length / itemsPerPage);
  const startIndex = (currentTablePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = kendaraanData.slice(startIndex, endIndex);

  // Event handlers
  const handleTambahClick = () => {
    setCurrentPage('add');
    setEditingKendaraan(null);
  };

  const handleEditClick = (kendaraan) => {
    setEditingKendaraan(kendaraan);
    setCurrentPage('edit');
  };

  const handleDetailClick = (kendaraan) => {
    setSelectedKendaraan(kendaraan);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      if (editingKendaraan) {
        // Update existing
        const response = await kendaraanService.updateKendaraan(editingKendaraan.id, formData);
        alert(response.message || 'Kendaraan berhasil diperbarui!');
      } else {
        // Create new
        const response = await kendaraanService.createKendaraan(formData);
        alert(response.message || 'Kendaraan berhasil ditambahkan!');
      }
      
      // Reload data and go back to list
      await loadKendaraanData();
      setCurrentPage('list');
    } catch (err) {
      setError(err.message || 'Gagal menyimpan data');
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormCancel = () => {
    setCurrentPage('list');
    setEditingKendaraan(null);
  };

  const confirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await kendaraanService.deleteKendaraan(deleteId);
      
      // Reload data
      await loadKendaraanData();
      
      setShowDeleteModal(false);
      setDeleteId(null);
      alert(response.message || 'Kendaraan berhasil dihapus!');
    } catch (err) {
      setError(err.message || 'Gagal menghapus data');
      alert(`Gagal menghapus data: ${err.message}`);
    } finally {
      setLoading(false);
    }
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

  // Render different pages
  if (currentPage === 'add') {
    return (
      <KendaraanForm 
        mode="add"
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    );
  }

  if (currentPage === 'edit') {
    return (
      <KendaraanForm 
        mode="edit"
        kendaraan={editingKendaraan}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={loading}
      />
    );
  }

  // Main list page
  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Detail Kendaraan</h1>
            <p className="text-gray-600 mt-2">Kelola data kendaraan yang tersedia</p>
          </div>
          <button
            onClick={handleTambahClick}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm w-full sm:w-auto"
          >
            + Tambah Data
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <ErrorMessage 
            message={error} 
            onRetry={loadKendaraanData} 
          />
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-5H8z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kendaraan</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{kendaraanData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kendaraan Aktif</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{kendaraanData.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Kapasitas</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {kendaraanData.reduce((total, k) => total + (k.kapasitasKursi || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Kendaraan</h2>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <div className="overflow-x-hidden sm:overflow-x-auto"> {/* Ubah overflow-x-auto menjadi overflow-x-hidden pada mobile */}
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe Armada
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No Armada
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No Kendaraan
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Kapasitas
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        Kondektur
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-3 sm:px-6 py-8 text-center text-gray-500">
                          {loading ? 'Memuat data...' : 'Tidak ada data kendaraan'}
                        </td>
                      </tr>
                    ) : (
                      currentData.map((kendaraan) => (
                        <tr key={kendaraan.id} className="hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap"> {/* Ubah whitespace-nowrap */}
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {kendaraan.tipeArmada}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap text-sm text-gray-900"> {/* Ubah whitespace-nowrap */}
                            {kendaraan.nomorArmada}
                          </td>
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap text-sm text-gray-900"> {/* Ubah whitespace-nowrap */}
                            {kendaraan.nomorKendaraan}
                          </td>
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                            {kendaraan.kapasitasKursi} kursi ({kendaraan.formatKursi})
                          </td>
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap hidden md:table-cell">
                            <div className="text-sm text-gray-900">{kendaraan.namaKondektur}</div>
                            <div className="text-sm text-gray-500">{kendaraan.nomorKondektur}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 break-words sm:whitespace-nowrap text-sm font-medium"> {/* Ubah whitespace-nowrap */}
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                              <button 
                                onClick={() => handleDetailClick(kendaraan)}
                                className="text-green-600 hover:text-green-900"
                                disabled={loading}
                              >
                                Detail
                              </button>
                              <button 
                                onClick={() => handleEditClick(kendaraan)}
                                className="text-indigo-600 hover:text-indigo-900"
                                disabled={loading}
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteClick(kendaraan.id)}
                                className="text-red-600 hover:text-red-900"
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
                  <div className="text-sm text-gray-700 text-center sm:text-left">
                    Menampilkan {startIndex + 1} sampai {Math.min(endIndex, kendaraanData.length)} dari {kendaraanData.length} data
                  </div>
                  <div className="flex items-center flex-wrap justify-center gap-2">
                    <button
                      onClick={() => setCurrentTablePage(prev => Math.max(prev - 1, 1))}
                      disabled={currentTablePage === 1}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentTablePage(page)}
                        className={`px-3 py-1 border rounded-md text-sm ${
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
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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

      {/* Modals */}
      <DeleteModal 
        show={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
      />
      
      <DetailModal 
        show={showDetailModal}
        kendaraan={selectedKendaraan}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

export default DetailKendaraan;