import React, { useState, useEffect, useMemo } from 'react';
import EditKelolaAdmin from './editadmin';
import TambahAdmin from './tambahadmin';

const KelolaAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState('list'); // 'list', 'edit', 'add'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = () => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:3000/api/admin', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(async res => {
        if (res.status === 401) {
          alert('Sesi kamu sudah habis. Silakan login ulang.');
          setAdmins([]);
          return;
        }

        const data = await res.json();
        if (Array.isArray(data)) {
          setAdmins(data);
        } else {
          console.error('Data admin bukan array:', data);
          setAdmins([]);
        }
      })
      .catch(err => {
        console.error('Gagal ambil data admin:', err);
        setAdmins([]);
      });
  };

  const handleDeleteAdmin = (id) => {
    const token = localStorage.getItem('token');

    fetch(`http://localhost:3000/api/admin/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then(res => {
      if (res.ok) {
        setAdmins(prev => prev.filter(admin => admin.id_admin !== id));
        alert('Admin berhasil dihapus.');
      }
    });
  };

  const paginatedData = useMemo(() => {
    if (!Array.isArray(admins)) return [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    return admins.slice(startIndex, startIndex + itemsPerPage);
  }, [admins, currentPage]);

  const totalPages = Math.ceil(admins.length / itemsPerPage);

  const handleDeleteClick = (id) => {
    setAdminToDelete(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    if (adminToDelete) {
      handleDeleteAdmin(adminToDelete);
      setShowConfirmModal(false);

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

  const handleEditClick = (admin) => {
    setSelectedAdmin(admin);
    setCurrentView('edit');
  };

  const handleTambahClick = () => {
    setCurrentView('add');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedAdmin(null);
  };

  const handleUpdate = () => {
    fetchAdmins();
    setCurrentView('list');
    setSelectedAdmin(null);
  };

  const handleSave = () => {
    fetchAdmins();
    setCurrentView('list');
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

    pageNumbers.push(
      <span key="selanjutnya" className="ml-4 text-sm text-gray-600">
        Selanjutnya
      </span>
    );

    return (
      <div className="flex items-center gap-0 mt-6">
        {pageNumbers}
      </div>
    );
  };

  if (currentView === 'edit' && selectedAdmin) {
    return (
      <EditKelolaAdmin
        admin={selectedAdmin}
        onBack={handleBack}
        onUpdate={handleUpdate}
      />
    );
  }

  if (currentView === 'add') {
    return (
      <TambahAdmin
        onBack={handleBack}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white p-6 pt-18">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Kelola Admin</h1>
          <button
            onClick={handleTambahClick}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Tambah Data +
          </button>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr className="border-b border-gray-300">
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Email</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Role</th>
                <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((admin) => (
                <tr key={admin.id_admin} className="bg-gray-100">
                  <td className="py-4 px-6 text-sm text-gray-900 font-medium align-top">
                    {admin.email_admin}
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.status_admin === 'aktif' ? 'bg-green-100 text-green-800' :
                      admin.status_admin === 'nonaktif' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.status_admin}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 align-top">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      admin.role_admin === 'superadmin' ? 'bg-purple-100 text-purple-800' :
                      admin.role_admin === 'admin' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {admin.role_admin}
                    </span>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(admin)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(admin.id_admin)}
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

        {renderPagination()}
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 relative">
            <button
              onClick={() => setShowConfirmModal(false)}
              className="absolute top-3 right-3 text-black text-xl font-bold"
            >
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
