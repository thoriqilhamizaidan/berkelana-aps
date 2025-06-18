import React, { useState, useEffect } from "react";
import TambahPromo from "./tambahpromo.jsx";
import EditPromo from "./editpromo.jsx";
import DetailPromoModal from "./detailpromo.jsx";

const API_URL = `${import.meta.env.VITE_API_BASE_URL || '/api'}/promos`;

// Shared form input component
const FormInput = ({ label, type = "text", required, className = "", ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && "*"}
    </label>
    {type === "textarea" ? (
      <textarea
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
        rows={4}
        required={required}
        {...props}
      />
    ) : (
      <input
        type={type}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
        required={required}
        {...props}
      />
    )}
  </div>
);

// Main PromoTable Component
const PromoTable = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState("list");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  
  // Add states for delete confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);

  // Unified API handler
  const apiCall = async (url, options = {}, successMsg = "") => {
    setLoading(true);
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      
      const data = await response.json();
      if (successMsg) {
        alert(successMsg);
        await loadPromoData();
      }
      return data;
    } catch (err) {
      console.error('API Error:', err);
      alert(err.message || "Terjadi kesalahan");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Perbaikan loadPromoData untuk menghindari multiple calls
  const loadPromoData = async () => {
    // Hindari multiple simultaneous calls
    if (loading) return;
    
    try {
      setLoading(true);
      
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json();
      const promoArray = Array.isArray(data) ? data : (data.data || []);
      
      const processedPromos = promoArray.map(promo => ({
        ...promo,
        image: promo.image ? 
          (promo.image.startsWith('http') ? promo.image : `${import.meta.env.VITE_API_BASE_URL}${promo.image}`) 
          : null,
      }));
      
      setPromos(processedPromos);
      setError(null);
      
    } catch (err) {
      console.error('Load promo error:', err);
      setError(err.message || 'Failed to load promos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoData();
  }, []);

  // Di bagian handleCreatePromo dalam PromoTable component, ganti dengan ini:

const handleCreatePromo = async (formData) => {
  // Pencegahan double submission yang lebih ketat
  if (loading) {
    console.log('Already processing request, ignoring...');
    return;
  }

  try {
    setLoading(true);
    console.log('Creating promo with data:', formData);
    
    const form = new FormData();
    
    // Pastikan data yang dikirim bersih dan valid
    const cleanFormData = {
      title: formData.title?.trim() || '',
      details: formData.details?.trim() || '', 
      code: formData.code?.trim().toUpperCase() || '',
      potongan: formData.potongan || '0',
      berlakuHingga: formData.berlakuHingga || '',
      id_admin: '1'
    };

    // Append data ke FormData
    Object.entries(cleanFormData).forEach(([key, value]) => {
      form.append(key, value);
    });

    // Handle image upload
    if (formData.image && formData.image instanceof File) {
      form.append("gambar", formData.image);
    }

    console.log('Sending create request to API...');
    
    const response = await fetch(API_URL, {
      method: "POST",
      body: form
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('API Response:', result);
    
    if (result.success !== false) {
      // Tampilkan pesan sukses
      alert("Promo berhasil ditambahkan!");
      
      // Reload data untuk memastikan sinkronisasi
      await loadPromoData();
      
      // Kembali ke halaman list
      setCurrentPage("list");
    } else {
      throw new Error(result.message || 'Gagal membuat promo');
    }
    
  } catch (error) {
    console.error('Error creating promo:', error);
    alert(error.message || "Terjadi kesalahan saat menambah promo");
  } finally {
    setLoading(false);
  }
};

  const handleEditPromo = async (formData) => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value) {
        form.append("gambar", value);
      } else if (key !== 'imagePreview') {
        form.append(key, value || (key === 'id_admin' ? "1" : ""));
      }
    });

    await apiCall(`${API_URL}/${formData.id}`, { method: "PUT", body: form }, "Promo berhasil diperbarui!");
    setCurrentPage("list");
    setEditingPromo(null);
  };

  const handleToggleActive = async (promo) => {
    if (loading) return;
    
    // Optimistic update - update UI immediately
    const updatedPromos = promos.map(p => 
      p.id === promo.id ? { ...p, is_active: !p.is_active } : p
    );
    setPromos(updatedPromos);
    
    try {
      await fetch(`${API_URL}/${promo.id}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !promo.is_active }),
      });
      
      // Optional: Show success feedback
      const statusText = !promo.is_active ? "diaktifkan" : "dinonaktifkan";
      
      // Create a temporary toast notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-all duration-300';
      toast.textContent = `Promo berhasil ${statusText}`;
      document.body.appendChild(toast);
      
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => document.body.removeChild(toast), 300);
      }, 2000);
      
    } catch (err) {
      // Revert optimistic update on error
      setPromos(promos);
      console.error('Error toggling promo status:', err);
      alert(err.message || "Gagal mengubah status promo");
    }
  };

  // Updated delete handler to show confirmation modal
  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo);
    setShowConfirmModal(true);
  };

  // Confirm delete handler
  const handleConfirmDelete = async () => {
    if (promoToDelete) {
      try {
        await apiCall(`${API_URL}/${promoToDelete.id}`, { method: "DELETE" }, "Promo berhasil dihapus!");
        setShowConfirmModal(false);
        setPromoToDelete(null);
      } catch (err) {
        setShowConfirmModal(false);
        setPromoToDelete(null);
      }
    }
  };

  const handleEditClick = (promo) => {
    setEditingPromo(promo);
    setCurrentPage("edit");
  };

  const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleDateString('id-ID') : 'Tidak ada batas';

  if (currentPage === "add") {
    return <TambahPromo onSubmit={handleCreatePromo} onCancel={() => setCurrentPage("list")} loading={loading} />;
  }

  if (currentPage === "edit" && editingPromo) {
    return (
      <EditPromo 
        promo={editingPromo} 
        onSubmit={handleEditPromo} 
        onCancel={() => {
          setCurrentPage("list");
          setEditingPromo(null);
        }} 
        loading={loading} 
      />
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Delete Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm bg-opacity-20 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <button 
              onClick={() => setShowConfirmModal(false)} 
              className="absolute top-3 right-3 text-black text-xl font-bold hover:text-gray-600"
            >
              ×
            </button>
            <h2 className="text-lg font-bold text-center mb-4">Apakah anda yakin?</h2>
            <p className="text-sm text-gray-600 text-center mb-6">
              Promo "{promoToDelete?.title}" akan dihapus secara permanen.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold order-2 sm:order-1"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 lg:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Kelola Promo</h1>
            <p className="text-gray-600 mt-2">Kelola data promo dan diskon</p>
          </div>
          <button 
            onClick={() => setCurrentPage("add")} 
            disabled={loading} 
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Tambah Promo</span>
            <span className="sm:hidden">Tambah</span>
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button 
                onClick={loadPromoData} 
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors w-full sm:w-auto" 
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Retry'}
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Promo</h2>
          </div>
          
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  {["Promo", "Detail", "Kode & Potongan", "Berlaku Hingga", "Status", "Aksi"].map(header => (
                    <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {promos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      {loading ? "Memuat data..." : (error ? "Gagal memuat data" : "Belum ada promo")}
                    </td>
                  </tr>
                ) : (
                  promos.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-16">
                            {promo.image ? (
                              <img src={promo.image} alt="Promo" className="h-12 w-16 object-cover rounded border" />
                            ) : (
                              <div className="h-12 w-16 bg-gray-300 rounded flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{promo.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 max-w-xs truncate">{promo.details}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{promo.code}</div>
                        <div className="text-sm text-gray-500">{promo.potongan}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(promo.berlakuHingga)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <label className="flex items-center cursor-pointer group">
                          <input 
                            type="checkbox" 
                            className="sr-only" 
                            checked={promo.is_active} 
                            onChange={() => handleToggleActive(promo)} 
                            disabled={loading} 
                          />
                          <div className={`w-12 h-6 rounded-full shadow-inner transition-all duration-300 ease-in-out relative ${
                            promo.is_active ? "bg-green-500" : "bg-gray-300"
                          } ${loading ? "opacity-50" : "group-hover:shadow-md"}`}>
                            <div className={`w-5 h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ease-in-out ${
                              promo.is_active ? "translate-x-6" : "translate-x-0.5"
                            } ${loading ? "" : "group-hover:scale-110"}`}>
                            </div>
                          </div>
                          <span className={`ml-3 text-sm font-medium transition-colors duration-200 ${
                            promo.is_active ? "text-green-700" : "text-gray-500"
                          }`}>
                            {promo.is_active ? "Aktif" : "Nonaktif"}
                          </span>
                        </label>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button className="text-blue-600 hover:text-blue-900" onClick={() => { setSelectedPromo(promo); setShowDetailModal(true); }} disabled={loading}>
                            Detail
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900" 
                            onClick={() => handleEditClick(promo)} 
                            disabled={loading}
                          >
                            Edit
                          </button>
                          {/* Tombol Hapus dihapus karena tidak berfungsi dengan baik */}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden">
            {promos.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                {loading ? "Memuat data..." : (error ? "Gagal memuat data" : "Belum ada promo")}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {promos.map((promo) => (
                  <div key={promo.id} className="p-4 sm:p-6 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        {promo.image ? (
                          <img src={promo.image} alt="Promo" className="h-16 w-20 sm:h-20 sm:w-24 object-cover rounded border" />
                        ) : (
                          <div className="h-16 w-20 sm:h-20 sm:w-24 bg-gray-300 rounded flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2">
                          <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate">{promo.title}</h3>
                          <div className="mt-1 sm:mt-0 sm:ml-4 flex-shrink-0">
                            <label className="flex items-center cursor-pointer group">
                              <input 
                                type="checkbox" 
                                className="sr-only" 
                                checked={promo.is_active} 
                                onChange={() => handleToggleActive(promo)} 
                                disabled={loading} 
                              />
                              <div className={`w-10 h-5 sm:w-12 sm:h-6 rounded-full shadow-inner transition-all duration-300 ease-in-out relative ${
                                promo.is_active ? "bg-green-500" : "bg-gray-300"
                              } ${loading ? "opacity-50" : "group-hover:shadow-md"}`}>
                                <div className={`w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full shadow-md absolute top-0.5 transition-all duration-300 ease-in-out ${
                                  promo.is_active ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5"
                                } ${loading ? "" : "group-hover:scale-110"}`}>
                                </div>
                              </div>
                              <span className={`ml-2 text-xs sm:text-sm font-medium transition-colors duration-200 ${
                                promo.is_active ? "text-green-700" : "text-gray-500"
                              }`}>
                                {promo.is_active ? "Aktif" : "Nonaktif"}
                              </span>
                            </label>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promo.details}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                          <div>
                            <span className="text-gray-500">Kode:</span>
                            <span className="ml-1 font-medium text-gray-900">{promo.code}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Potongan:</span>
                            <span className="ml-1 font-medium text-gray-900">{promo.potongan}%</span>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-gray-500">Berlaku hingga:</span>
                            <span className="ml-1 text-gray-900">{formatDate(promo.berlakuHingga)}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button 
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium px-3 py-1 rounded border border-blue-200 hover:bg-blue-50" 
                            onClick={() => { setSelectedPromo(promo); setShowDetailModal(true); }} 
                            disabled={loading}
                          >
                            Detail
                          </button>
                          <button 
                            className="text-green-600 hover:text-green-900 text-sm font-medium px-3 py-1 rounded border border-green-200 hover:bg-green-50" 
                            onClick={() => handleEditClick(promo)} 
                            disabled={loading}
                          >
                            Edit
                          </button>
                          {/* Tombol Hapus dihapus karena tidak berfungsi dengan baik */}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <DetailPromoModal show={showDetailModal} promo={selectedPromo} onClose={() => setShowDetailModal(false)} />
    </div>
  );
};

export default PromoTable;