import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from '../services/authService';

const RegisterForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    no_hp: '',
    password: '',
    confirmPassword: '',
    gender: '',
    tanggal_lahir: '',
    alamat: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak sama');
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    // Validate phone number format
    if (!/^08\d{9,12}$/.test(formData.no_hp)) {
      setError('Nomor HP harus diawali 08 dan memiliki 11-14 digit');
      return;
    }

    setLoading(true);

    try {
      const result = await authService.register(formData);

      if (result.success) {
        setSuccessMessage('Registrasi berhasil! Silakan login dengan akun Anda.');
        
        // Clear localStorage jika ada data login sebelumnya
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        
        // Redirect ke login dengan pesan sukses
        setTimeout(() => {
          navigate('/daftar-masuk', { 
            state: { message: 'Registrasi berhasil! Silakan login dengan akun Anda.' } 
          });
        }, 2000);
      } else {
        setError(result.message || 'Registrasi gagal');
      }
    } catch (err) {
      // Handle specific error codes
      if (err.message.includes('409') || err.message.includes('sudah terdaftar')) {
        setError('Email sudah terdaftar. Silakan gunakan email lain atau login.');
      } else if (err.message.includes('Network')) {
        setError('Gagal terhubung ke server. Pastikan server berjalan.');
      } else {
        setError(err.message || 'Terjadi kesalahan saat registrasi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          "url('images/directly-shot-christmas-decorations-blue-background 1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex w-full max-w-screen-xl">
        {/* Left Side: Logo and Tagline */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <img
              src="/images/berkelana-logo-white.png"
              alt="Logo"
              className="max-w-full h-auto"
            />
          </div>
        </div>
        
        {/* Right Side: Register Form */}
        <div className="flex flex-1 items-center justify-end px-32">
          <div className="bg-white py-12 px-12 rounded-3xl shadow-lg w-[800px] max-w-lg ml-auto max-h-[90vh] overflow-y-auto">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <img
                src="images/berkelana-logo.png"
                alt="Logo"
                className="h-12 w-auto"
              />
            </div>
            
            {/* Registration Text */}
            <div className="text-start mb-6">
              <h1 className="text-3xl font-bold">Registrasi</h1>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Nama Input */}
              <div className="mb-4">
                <input
                  type="text"
                  name="nama"
                  placeholder="Masukkan nama lengkap"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.nama}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Email Input */}
              <div className="mb-4">
                <input
                  type="email"
                  name="email"
                  placeholder="Masukkan email"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Nomor HP Input */}
              <div className="mb-4">
                <input
                  type="tel"
                  name="no_hp"
                  placeholder="Masukkan nomor HP | ex: 08xxxxx"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.no_hp}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Gender Input */}
              <div className="mb-4">
                <select
                  name="gender"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </div>

              {/* Tanggal Lahir Input */}
              <div className="mb-4">
                <input
                  type="date"
                  name="tanggal_lahir"
                  placeholder="Tanggal Lahir"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.tanggal_lahir}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Alamat Input */}
              <div className="mb-4">
                <textarea
                  name="alamat"
                  placeholder="Masukkan alamat lengkap"
                  rows="2"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition resize-none"
                  value={formData.alamat}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Sandi Input */}
              <div className="mb-4">
                <input
                  type="password"
                  name="password"
                  placeholder="Masukkan kata sandi (min. 6 karakter)"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Konfirmasi Sandi Input */}
              <div className="mb-6">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Konfirmasi kata sandi"
                  className="w-full p-3 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              {/* Register Button */}
              <button
                type="submit"
                disabled={loading || successMessage}
                className={`w-full ${loading || successMessage ? 'bg-purple-300' : 'bg-purple-400 hover:bg-purple-500'} 
                  text-white font-bold py-3 rounded-xl text-xl transition mb-4`}
              >
                {loading ? 'Memproses...' : successMessage ? 'Redirecting...' : 'Registrasi'}
              </button>
            </form>
            
            {/* Links */}
            <div className="text-center mt-2 mb-2">
              <p className="text-gray-600 text-lg">
                Sudah punya akun?{" "}
                <Link to="/daftar-masuk" className="text-purple-500 font-bold">
                  Login aja
                </Link>
              </p>
            </div>
            
            <p className="text-center text-xs text-black mt-2">
              Dengan registrasi, kamu menyetujui{" "}
              <Link to="/syarat-ketentuan" className="font-bold text-purple-600">Kebijakan Privasi</Link> dan{" "}
              <Link to="/syarat-ketentuan" className="font-bold text-purple-600">Syarat & Ketentuan Berkelana</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;