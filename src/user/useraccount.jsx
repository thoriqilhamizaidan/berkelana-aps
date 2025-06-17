import React, { useState, useEffect } from 'react';
import { Lock, Ticket, LogOut, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import authService from '../services/authService';

const UserAccount = () => {
  const navigate = useNavigate();
  const { logout, user, setUser } = useAuth();
  
  const [userData, setUserData] = useState({
    nama: '',
    alamat: '',
    email: '',
    no_hp: '',
    tanggal_lahir: '',
    gender: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Photo upload states - simplified
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  // Fetch user data on mount
  useEffect(() => {
    fetchUserProfile();
    console.log('Current user from context:', user);
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const result = await authService.getProfile();
      if (result.success) {
        const profile = result.user;
        const mappedData = {
          nama: profile.nama_user || profile.nama_admin || '',
          alamat: profile.alamat_user || '',
          email: profile.email_user || profile.email_admin || '',
          no_hp: profile.no_hp_user || '',
          tanggal_lahir: profile.tanggallahir_user || '',
          gender: profile.gender_user || ''
        };
        setUserData(mappedData);
        setFormData(mappedData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle file selection for photo upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload photo function
  const uploadPhoto = async () => {
  if (!selectedFile) return true; // No photo to upload

  const photoFormData = new FormData();
  photoFormData.append('avatar', selectedFile);

  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5052/api/upload-avatar', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: photoFormData,
    });

    const data = await response.json();
    
    if (data.success) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        profil_user: data.avatar
      };

      // ✅ Simpan di localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // ✅ Trigger update user context agar navbar ikut berubah
     setUser((prev) => ({
  ...prev,
  profil_user: data.avatar
}));

      return true;
    } else {
      throw new Error(data.message || 'Gagal mengupload foto');
    }
  } catch (err) {
    console.error('Upload error:', err);
    throw err;
  }
};

  
  // Combined submit function for profile data and photo
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // First update profile data
      const result = await authService.updateProfile(formData);
      
      if (result.success) {
        // Then upload photo if selected
        if (selectedFile) {
          await uploadPhoto();
        }
        
        // Update local state and exit editing mode
        setUserData({...formData});
        setIsEditing(false);
        
        // Clear photo upload states
        setSelectedFile(null);
        setPreviewUrl('');
        
        // Refresh profile data
        await fetchUserProfile();
        
        alert('Profil berhasil diperbarui!');
      } else {
        setError(result.message || 'Gagal mengupdate profile');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({...userData});
    setIsEditing(false);
    setError('');
    // Clear photo upload states
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/daftar-masuk');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Banner */}
      <div className="relative h-96 bg-gradient-to-r from-purple-500/30 to-blue-500/20">
        <div className="absolute inset-0 overflow-hidden">
          <img 
            src="/images/Pusat akun.jpg" 
            alt="Banner background" 
            className="w-full h-full object-cover opacity-80"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/api/placeholder/1024/280";
            }}
          />
        </div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute bottom-10 left-10 text-white z-10">
          <h1 className="text-4xl font-bold mb-1">Pusat Akun</h1>
          <p className="text-lg">Selamat datang kembali {userData.nama}!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row">
            {/* User Profile Info */}
            <div className="md:w-2/3 pr-6">
              <h2 className="text-2xl font-bold mb-6">{userData.nama}</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Nama:
                    </label>
                    <input
                      type="text"
                      name="nama"
                      value={formData.nama}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Alamat:
                    </label>
                    <input
                      type="text"
                      name="alamat"
                      value={formData.alamat}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Email:
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      No Telepon:
                    </label>
                    <input
                      type="tel"
                      name="no_hp"
                      value={formData.no_hp}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Tanggal Lahir:
                    </label>
                    <input
                      type="text"
                      name="tanggal_lahir"
                      value={formData.tanggal_lahir}
                      onChange={handleInputChange}
                      placeholder="DD/MM/YYYY"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Jenis Kelamin:
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className={`${loading ? 'bg-purple-300' : 'bg-purple-500 hover:bg-purple-600'} 
                        text-white font-bold py-2 px-6 rounded-lg transition duration-200`}
                    >
                      {loading ? 'Menyimpan...' : 'Simpan'}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-lg transition duration-200"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-600 text-sm">Alamat:</div>
                      <div className="font-medium">{userData.alamat || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Email:</div>
                      <div className="font-medium">{userData.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">No Telepon:</div>
                      <div className="font-medium">{userData.no_hp || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Tanggal Lahir:</div>
                      <div className="font-medium">{userData.tanggal_lahir || '-'}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Jenis Kelamin:</div>
                      <div className="font-medium">{userData.gender || '-'}</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                  >
                    Edit Profile
                  </button>
                </div>
              )}
            </div>
            
            {/* User Avatar */}
            <div className="md:w-1/3 flex flex-col items-center mt-6 md:mt-0">
              <div className="relative">
                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition duration-150 hover:border-purple-500">
                  {previewUrl ? (
                    // Show preview when file is selected
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user?.profil_user ? (
                    // Show current profile image
                    <img
                      src={user.profil_user.startsWith('http') ? user.profil_user : `http://localhost:5052${user.profil_user}`}
                      alt="User Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.log('Image failed to load:', user.profil_user);
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback avatar */}
                  <div 
                    className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100"
                    style={{ display: user?.profil_user && !previewUrl ? 'none' : 'flex' }}
                  >
                    <div className="text-6xl text-gray-400">
                      👤
                    </div>
                  </div>
                </div>
              </div>

              {/* Upload Photo Section - Only show when editing */}
              {isEditing && (
                <div className="mt-4 w-full max-w-xs text-center">
                  <label className="inline-flex items-center justify-center w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg cursor-pointer transition duration-200 border-2 border-dashed border-purple-300">
                    <Camera size={18} className="mr-2" />
                    <span className="text-sm font-medium">
                      {selectedFile ? 'Ganti Foto' : 'Upload Foto'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>
                  
                  {selectedFile && (
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 truncate">
                        {selectedFile.name}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        Foto akan disimpan saat menekan tombol "Simpan"
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-xs text-gray-500">
                    Max 5MB • JPG, PNG, GIF
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Settings Links */}
        <h3 className="text-xl font-bold mb-4">Pengaturan</h3>
        <div className="space-y-3">
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
            <div 
              onClick={() => navigate('/ubah-sandi')}
              className="flex items-center p-4 cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10">
                <Lock size={24} className="text-gray-600" />
              </div>
              <span className="ml-3 font-medium">Ganti Kata Sandi</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-200">
            <div 
              onClick={() => navigate('/tiket-saya')}
              className="flex items-center p-4 cursor-pointer"
            >
              <div className="flex items-center justify-center w-10 h-10">
                <Ticket size={24} className="text-gray-600" />
              </div>
              <span className="ml-3 font-medium">Tiket Saya</span>
            </div>
          </div>
        </div>
        
        {/* Logout Button */}
        <div className="mt-8">
          <div 
            onClick={handleLogout}
            className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition duration-200 cursor-pointer"
          >
            <LogOut size={18} className="mr-2" />
            <span>Keluar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserAccount;