import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';

const TambahAdmin = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    status: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const { nama, email, password, status } = formData;

    if (!nama || !email || !password || !status) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    const newAdmin = {
      id: Date.now(),
      nama,
      email,
      password,
      status,
    };

    onSave(newAdmin);
    alert('Admin berhasil ditambahkan!');

    setFormData({
      nama: '',
      email: '',
      password: '',
      status: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Kelola Admin | Tambah Data Admin
          </h1>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Nama Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah keterangan admin
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Email Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah email admin
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Password Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah password admin
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Status Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Tambah status admin
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Aktif / Nonaktif"
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>

            {/* Tombol Simpan & Kembali */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={onBack}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahAdmin;
