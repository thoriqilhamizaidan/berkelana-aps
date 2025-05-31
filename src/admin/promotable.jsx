import React, { useState, useEffect } from "react";
import TambahPromo from "./TambahPromo";
import EditPromo from "./EditPromo";
import DetailPromoModal from "./detailpromo";

const API_URL = "http://localhost:3000/api/promos";
const UPLOADS_URL = "http://localhost:3000/uploads/";

const PromoTable = () => {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Page state
  const [currentPage, setCurrentPage] = useState("list");
  const [editingPromo, setEditingPromo] = useState(null);

  // Pagination
  const itemsPerPage = 5;
  const [currentTablePage, setCurrentTablePage] = useState(1);

  // Detail Modal State
  const [showDetailPromo, setShowDetailPromo] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState(null);

  // Load promo data from API & map backend fields to frontend
  const loadPromoData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error("Gagal memuat data promo");
      const data = await res.json();
      const mappedData = Array.isArray(data)
        ? data.map((item) => ({
            id: item.id_promo,
            title: item.judul,
            details: item.detail,
            code: item.kode_promo,
            image: item.gambar ? UPLOADS_URL + item.gambar : "",
            potongan: item.potongan,
            berlakuHingga: item.berlakuhingga,
            id_admin: item.id_admin,
            is_active: item.is_active, // Make sure your backend sends this!
          }))
        : [];
      setPromos(mappedData);
    } catch (err) {
      setError(err.message || "Gagal memuat promo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPromoData();
  }, []);

  function handleViewDetail(promo) {
    setSelectedPromo(promo);
    setShowDetailPromo(true);
  }

  // Tambah Promo (Create)
  const handleFormTambah = async (formData) => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append('judul', formData.title);
      form.append('detail', formData.details);
      form.append('kode_promo', formData.code);
      form.append('potongan', formData.potongan);
      form.append('berlakuhingga', formData.berlakuHingga);
      form.append('id_admin', formData.id_admin);
      if (formData.image) form.append('gambar', formData.image);

      const res = await fetch(API_URL, {
        method: "POST",
        body: form,
        // DO NOT set headers for Content-Type!
      });
      if (!res.ok) throw new Error("Gagal menambah promo");
      await loadPromoData();
      setCurrentPage("list");
      alert("Promo berhasil ditambahkan!");
    } catch (err) {
      alert(err.message || "Gagal menambah promo");
    } finally {
      setLoading(false);
    }
  };

  const handleFormEdit = async (formData) => {
    if (!editingPromo || !editingPromo.id) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("judul", formData.title);
      data.append("detail", formData.details);
      data.append("kode_promo", formData.code);
      data.append("potongan", formData.potongan);
      data.append("berlakuhingga", formData.berlakuHingga);
      data.append("id_admin", formData.id_admin);

      // Only append image if a new one is selected
      if (formData.image) {
        data.append("gambar", formData.image);
      }

      const res = await fetch(`${API_URL}/${editingPromo.id}`, {
        method: "PUT", // or "POST" if your backend expects it
        body: data,
        // DO NOT set Content-Type! The browser will set it for FormData.
      });

      if (!res.ok) throw new Error("Gagal mengedit promo");
      await loadPromoData();
      setCurrentPage("list");
      setEditingPromo(null);
      alert("Promo berhasil diupdate!");
    } catch (err) {
      alert(err.message || "Gagal mengedit promo");
    } finally {
      setLoading(false);
    }
  };

  // Hapus Promo (Delete)
  const handleDelete = async (promo) => {
    if (!window.confirm("Yakin hapus promo ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${promo.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus promo");
      await loadPromoData();
      alert("Promo berhasil dihapus!");
    } catch (err) {
      alert(err.message || "Gagal menghapus promo");
    } finally {
      setLoading(false);
    }
  };

  // Toggle Aktif/Nonaktif
  const handleToggleActive = async (promo) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${promo.id}/toggle-active`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !promo.is_active }),
      });
      if (!res.ok) throw new Error("Gagal mengubah status aktif promo");
      await loadPromoData();
    } catch (e) {
      alert("Gagal mengubah status aktif promo");
    }
    setLoading(false);
  };

  // Pagination logic
  const totalPages = Math.ceil(promos.length / itemsPerPage);
  const startIndex = (currentTablePage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = promos.slice(startIndex, endIndex);

  // Render add/edit form
  if (currentPage === "add") {
    return (
      <TambahPromo
        onSubmit={handleFormTambah}
        onCancel={() => {
          setCurrentPage("list");
        }}
        loading={loading}
      />
    );
  }
  if (currentPage === "edit") {
    return (
      <EditPromo
        promo={editingPromo}
        onSubmit={handleFormEdit}
        onCancel={() => {
          setCurrentPage("list");
          setEditingPromo(null);
        }}
        loading={loading}
      />
    );
  }

  // Main list page
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promo</h1>
            <p className="text-gray-600 mt-2">Kelola data promo dan diskon</p>
          </div>
          <button
            onClick={() => setCurrentPage("add")}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Promo
          </button>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-800">
            {error}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail Promo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode Promo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar Promo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {loading ? 'Memuat data...' : 'Belum ada promo'}
                    </td>
                  </tr>
                ) : (
                  currentData.map((promo) => (
                    <tr key={promo.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap min-w-[160px] text-gray-900 font-semibold">
                        {promo.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap min-w-[320px] text-gray-600">
                        <ul className="list-disc ml-6 text-sm">
                          {(Array.isArray(promo.details)
                            ? promo.details
                            : String(promo.details || "").split("\n")
                          ).map((d, idx) => (
                            <li key={idx}>{d}</li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap min-w-[120px] text-gray-600 text-sm">
                        {promo.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {promo.image ? (
                          <img
                            src={promo.image}
                            alt="Promo"
                            className="w-24 h-16 object-cover rounded border border-gray-200"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-300 rounded flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2 flex-wrap items-center">
                          <label className="flex items-center cursor-pointer ml-2">
                            <span className="mr-2 text-xs text-gray-700">{promo.is_active ? "Aktif" : "Nonaktif"}</span>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={promo.is_active}
                              onChange={() => handleToggleActive(promo)}
                              disabled={loading}
                            />
                            <div className={`w-10 h-5 bg-gray-300 rounded-full shadow-inner transition-colors duration-200 relative ${promo.is_active ? "bg-green-500" : ""}`}>
                              <div
                                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0 left-0 transition-transform duration-200 ${promo.is_active ? "translate-x-5" : "translate-x-0"}`}
                              ></div>
                            </div>
                          </label>
                          <button
                            className="text-blue-600 hover:text-blue-900 mr-2"
                            onClick={() => handleViewDetail(promo)}
                            disabled={loading}
                          >
                            Detail
                          </button>
                          <button
                            className="text-green-600 hover:text-green-900 mr-2"
                            onClick={() => {
                              setEditingPromo(promo);
                              setCurrentPage("edit");
                            }}
                            disabled={loading}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(promo)}
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
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Menampilkan {startIndex + 1} sampai {Math.min(endIndex, promos.length)} dari {promos.length} data
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentTablePage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentTablePage(page)}
                    className={`px-3 py-1 border rounded-md text-sm ${
                      currentTablePage === page
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentTablePage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentTablePage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Place modal here inside the main JSX */}
      <DetailPromoModal
        show={showDetailPromo}
        promo={selectedPromo}
        onClose={() => setShowDetailPromo(false)}
      />
    </div>
  );
};

export default PromoTable;