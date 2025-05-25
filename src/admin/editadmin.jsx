import React, { useState, useEffect } from 'react';

export default function EditKelolaAdmin({ admin, onBack, onUpdate }) {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    password: '',
    status: '',
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        nama: admin.nama || '',
        email: admin.email || '',
        password: '', // kosongkan untuk keamanan
        status: admin.status || '',
      });
    }
  }, [admin]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.nama || !formData.email || !formData.status) {
      alert('Mohon lengkapi semua data.');
      return;
    }

    const updatedAdmin = {
      ...admin,
      nama: formData.nama,
      email: formData.email,
      status: formData.status,
      ...(formData.password ? { password: formData.password } : {}),
    };

    onUpdate(updatedAdmin);
    alert('Data admin berhasil diperbarui!');
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-lg font-semibold text-black mb-4">
          Kelola admin | Edit Data admin
        </h1>

        <div className="bg-gray-100 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="text"
              disabled
              value={admin?.email || ''}
              className="w-full px-4 py-3 bg-white border border-purple-400 rounded-md text-gray-700"
            />

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Edit keterangan admin
              </label>
              <input
                type="text"
                name="nama"
                value={formData.nama}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-purple-400 rounded-md text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Edit email admin
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white border border-purple-400 rounded-md text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Edit password admin
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Kosongkan jika tidak ingin diubah"
                className="w-full px-4 py-3 bg-white border border-purple-400 rounded-md text-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Edit status admin
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                placeholder="Aktif / Nonaktif"
                className="w-full px-4 py-3 bg-white border border-purple-400 rounded-md text-gray-700"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-md text-sm font-semibold"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
