import React, { useState, useEffect } from 'react';

const EditKelolaAdmin = ({ admin, onBack, onUpdate }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    status: '', 
    role: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = ['aktif', 'nonaktif'];
  const roleOptions = ['admin', 'superadmin'];

  useEffect(() => {
    console.log('Admin data received:', admin); // Debug log
    if (admin) {
      setFormData({
        email: admin.email_admin || '',
        password: '',
        status: admin.status_admin || '',
        role: admin.role_admin || '',
      });
    }
  }, [admin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!admin || !admin.id_admin) {
      alert('Data admin tidak valid.');
      return;
    }

    if (!formData.email || !formData.status || !formData.role) {
      alert('Mohon lengkapi semua bidang yang wajib diisi.');
      return;
    }

    setIsLoading(true);

    const body = {
      email_admin: formData.email,
      status_admin: formData.status,
      role_admin: formData.role,
    };
    
    // Hanya tambahkan password jika diisi
    if (formData.password && formData.password.trim() !== '') {
      body.password_admin = formData.password;
    }

    try {
      console.log('Updating admin with ID:', admin.id_admin); // Debug log
      console.log('Request body:', body); // Debug log

      const res = await fetch(`http://localhost:3000/api/admin/${admin.id_admin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        alert('Admin berhasil diperbarui.');
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate();
        }
      } else {
        const errorData = await res.json();
        console.error('Update failed:', errorData);
        alert(`Gagal memperbarui admin: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating admin:', error);
      alert('Terjadi kesalahan saat memperbarui admin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBack && typeof onBack === 'function') {
      onBack();
    }
  };

  // Validasi props
  if (!admin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h1 className="text-xl font-semibold text-gray-800 mb-4">Error</h1>
            <p className="text-red-600">Data admin tidak ditemukan.</p>
            <button
              onClick={handleBackClick}
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-gray-800">
              Admin | Edit Admin
            </h1>
            <p className="text-sm text-gray-600 mt-2">
              Mengedit admin: {admin.email_admin}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Form Input Atas - Background Terpisah */}
              <div className="bg-gray-100 p-6 rounded-lg border border-gray-200">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border font-bold border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                  placeholder="Email Admin"
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Edit Admin Section - Satu Background */}
              <div className="bg-gray-100 p-6 rounded-lg border border-gray-200 space-y-8">
                
                {/* Edit Email Admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Edit email admin
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                    required
                    disabled={isLoading}
                  />
                </div>

                {/* Edit Password Admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Edit password admin (kosongkan jika tidak ingin mengubah)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-purple-400 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-400 text-gray-700 bg-white"
                    placeholder="Password baru (opsional)"
                    disabled={isLoading}
                  />
                </div>

                {/* Edit Status Admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Edit status admin
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 bg-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Pilih status</option>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Edit Role Admin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Edit role admin
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-purple-400 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 bg-white"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Pilih role</option>
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tombol Kembali dan Simpan */}
                <div className="flex justify-end gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleBackClick}
                    className="px-12 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="px-12 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditKelolaAdmin;