import React, { useState, useMemo } from 'react';

const KelolaAdmin = ({ admins, onTambahClick, onDeleteAdmin, onEditAdmin }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return admins.slice(startIndex, endIndex);
  }, [admins, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(admins.length / itemsPerPage);

  const handleDeleteClick = (id) => {
    setAdminToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      onDeleteAdmin(adminToDelete);
      setShowConfirmModal(false);
      setAdminToDelete(null);

      const remainingItems = admins.length - 1;
      const maxPage = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-8 h-8 text-sm flex items-center justify-center ${
            currentPage === i
              ? 'bg-purple-100 text-black rounded'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="flex items-center gap-0 mt-6">
        {pageNumbers}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white p-6 pt-18">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Admin</h1>
          <button 
            onClick={onTambahClick}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tambah Data +
          </button>
        </div>

        {/* Tabel Admin */}
        <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Keterangan Admin</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Email</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((admin) => (
                <tr key={admin.id} className="bg-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium align-top">{admin.nama}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 align-top">{admin.email}</td>
                  <td className="py-4 px-6 text-sm text-gray-600 align-top">{admin.status}</td>
                  <td className="py-4 px-6 align-top">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditAdmin(admin)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(admin.id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modal Konfirmasi */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button onClick={() => setShowConfirmModal(false)} className="absolute top-3 right-3 text-black text-xl font-bold">
              ×
            </button>
            <h2 className="text-lg font-bold text-center mb-6">Apakah anda yakin?</h2>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-green-400 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Tidak
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaAdmin;
