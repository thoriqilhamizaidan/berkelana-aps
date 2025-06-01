import React, { useState, useEffect } from "react";
import TambahPromo from "./tambahpromo.jsx";
import EditPromo from "./editpromo.jsx";
import DetailPromoModal from "./detailpromo.jsx";

const API_URL = "http://localhost:3000/api/promos";

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

  const loadPromoData = async () => {
    try {
      const data = await apiCall(API_URL);
      const promoArray = Array.isArray(data) ? data : (data.data || []);
      
      const processedPromos = promoArray.map(promo => ({
        ...promo,
        image: promo.image ? (promo.image.startsWith('http') ? promo.image : `http://localhost:3000${promo.image}`) : null,
      }));
      
      setPromos(processedPromos);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load promos');
    }
  };

  useEffect(() => {
    loadPromoData();
  }, []);

  const handleCreatePromo = async (formData) => {
    const form = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'image' && value) form.append("gambar", value);
      else if (key !== 'imagePreview') form.append(key === 'id_admin' ? key : key, value || (key === 'id_admin' ? "1" : ""));
    });

    await apiCall(API_URL, { method: "POST", body: form }, "Promo berhasil ditambahkan!");
    setCurrentPage("list");
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

  const handleDelete = async (promo) => {
    if (!window.confirm(`Yakin ingin menghapus promo "${promo.title}"?`)) return;
    await apiCall(`${API_URL}/${promo.id}`, { method: "DELETE" }, "Promo berhasil dihapus!");
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
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kelola Promo</h1>
            <p className="text-gray-600 mt-2">Kelola data promo dan diskon</p>
          </div>
          <button onClick={() => setCurrentPage("add")} disabled={loading} className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Promo
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-red-800 font-medium">Error Loading Data</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
              <button onClick={loadPromoData} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors" disabled={loading}>
                {loading ? 'Loading...' : 'Retry'}
              </button>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Daftar Promo</h2>
          </div>
          
          <div className="overflow-x-auto">
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
                          <button className="text-red-600 hover:text-red-900" onClick={() => handleDelete(promo)} disabled={loading}>
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
        </div>
      </div>

      <DetailPromoModal show={showDetailModal} promo={selectedPromo} onClose={() => setShowDetailModal(false)} />
    </div>
  );
};

export default PromoTable;