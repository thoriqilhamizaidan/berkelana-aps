import React, { useState } from 'react';

const TambahAdmin = ({ onBack, onSave }) => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    status: '', 
    role: '' 
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusOptions = ['aktif', 'nonaktif'];
  const roleOptions = ['admin', 'superadmin'];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (formData.email && formData.password && formData.status && formData.role) {
      setIsLoading(true);
      
      try {
        // Get the token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          alert('Token autentikasi tidak ditemukan. Silakan login kembali.');
          setIsLoading(false);
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` // Add authorization header
          },
          body: JSON.stringify({
            email_admin: formData.email,
            password_admin: formData.password,
            status_admin: formData.status,
            role_admin: formData.role,
          })
        });

        if (res.ok) {
          alert('Admin berhasil ditambahkan.');
          setFormData({ email: '', password: '', status: '', role: '' });
          if (onSave) onSave();
        } else if (res.status === 401) {
          alert('Token tidak valid atau sudah kedaluwarsa. Silakan login kembali.');
        } else if (res.status === 403) {
          alert('Anda tidak memiliki izin untuk menambahkan admin.');
        } else {
          const errorData = await res.json().catch(() => null);
          const errorMessage = errorData?.message || 'Gagal menambahkan admin.';
          alert(errorMessage);
        }
      } catch (error) {
        console.error('Error adding admin:', error);
        alert('Terjadi kesalahan jaringan. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Mohon lengkapi semua field yang required!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">
            Admin | Tambah Admin
          </h1>
        </div>

        <div className="bg-gray-100 rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Email Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Email Admin <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Masukkan email admin"
              />
            </div>

            {/* Password Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Password Admin <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Masukkan password admin"
              />
            </div>

            {/* Status Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Status Admin <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih status admin</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Admin */}
            <div>
              <label className="block text-sm text-gray-600 mb-3">
                Role Admin <span className="text-red-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full px-4 py-3 border bg-white border-purple-400 rounded-lg focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">Pilih role admin</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Tombol Simpan & Kembali */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                onClick={onBack}
                disabled={isLoading}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-8 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TambahAdmin;