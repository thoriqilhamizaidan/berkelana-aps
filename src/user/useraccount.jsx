// src/user/useraccount.jsx
import React, { useState, useEffect } from 'react';
import { Lock, Ticket, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

const UserAccount = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  
  const [userData, setUserData] = useState({
    name: 'Freyanashifa Jayawardana ',
    address: 'Jalan Jamrud I No 1 PPS Gresik',
    email: 'Freyanashifa Jayawardana@gmail.com',
    phone: '081249401599',
    birthdate: '13 Februari 2006',
    gender: 'Perempuan'
  });

  // Update userData if user from context changes
  useEffect(() => {
    if (user) {
      setUserData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({...userData});
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = () => {
    setUserData({...formData});
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/daftar-masuk');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* HAPUS NAVBAR dari sini karena sudah ada di MainLayout */}
      {/* <Navbar isLoggedIn={true} /> */}
      
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
          <p className="text-lg">Selamat datang kembali {userData.name}!</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row">
            {/* User Profile Info */}
            <div className="md:w-2/3 pr-6">
              <h2 className="text-2xl font-bold mb-6">{userData.name}</h2>
              
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Alamat:
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
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
                    />
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      No Telepon:
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
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
                      name="birthdate"
                      value={formData.birthdate}
                      onChange={handleInputChange}
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
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  
                  <div className="flex space-x-4">
                    <button
                      onClick={handleSubmit}
                      className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg transition duration-200"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => {
                        setFormData({...userData});
                        setIsEditing(false);
                      }}
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
                      <div className="font-medium">{userData.address}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Email:</div>
                      <div className="font-medium">{userData.email}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">No Telepon:</div>
                      <div className="font-medium">{userData.phone}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Tanggal Lahir:</div>
                      <div className="font-medium">{userData.birthdate}</div>
                    </div>
                    
                    <div>
                      <div className="text-gray-600 text-sm">Jenis Kelamin:</div>
                      <div className="font-medium">{userData.gender}</div>
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
            <div className="md:w-1/3 flex justify-center mt-6 md:mt-0">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-lg hover:scale-105 transition duration-150 hover:border-emerald1">
                <img 
                  src="images/freya.jpeg" 
                  alt="Profile" 
                  className="w-full h-50 object-cover "
                />
              </div>
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