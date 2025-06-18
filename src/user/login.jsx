import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from './context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        const userData = {
          email: formData.email,
          role_admin: result.role
        };

        localStorage.setItem('admin', JSON.stringify(userData));
        login(userData);

        // Redirect berdasarkan role
        if (result.role === 'superadmin' || result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/info-akun');
        }

      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (err) {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-700 p-4"
      style={{ backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}
    >
      <div className="flex flex-col lg:flex-row w-full max-w-screen-xl">
        {/* Left Side - Logo */}
        <div className="flex-1 flex items-center justify-center mb-8 lg:mb-0">
          <div className="text-center text-white">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
              <img
                src="/public/images/berkelana-logo-white.png"
                alt="Logo Berkelana"
                className="max-w-full h-auto cursor-pointer max-h-24 sm:max-h-32 lg:max-h-none"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/300/100";
                }}
              />
            </Link>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="flex flex-1 items-center justify-center lg:justify-end px-4 sm:px-8 lg:px-32">
          <div className="bg-white py-6 sm:py-8 lg:py-16 px-6 sm:px-8 lg:px-12 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg">
            {/* Logo for mobile */}
            <div className="mb-6 sm:mb-8 lg:mb-12 flex justify-center lg:block">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
                <img
                  src="/public/images/berkelana-logo.png"
                  alt="Logo Berkelana"
                  className="h-10 sm:h-12 lg:h-16 w-auto cursor-pointer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/200/80";
                  }}
                />
              </Link>
            </div>

            <div className="text-start mb-4 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold">Login</h1>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                  Masukkan Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <div className="text-gray-500 p-2 sm:p-3">
                    <FontAwesomeIcon icon={faEnvelope} className="text-sm sm:text-base" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 sm:p-3 text-sm sm:text-base outline-none"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-4 sm:mb-6">
                <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
                  Masukkan Kata Sandi
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <div className="text-gray-500 p-2 sm:p-3">
                    <FontAwesomeIcon icon={faLock} className="text-sm sm:text-base" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 sm:p-3 text-sm sm:text-base outline-none"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'} 
                  text-white font-bold py-2 sm:py-3 text-sm sm:text-base rounded-lg transition duration-300`}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            <div className="text-center mt-4 space-y-2">
              <p className="text-gray-600 text-sm sm:text-base">
                Belum punya akun?{" "}
                <Link to="/daftar" className="text-purple-500 hover:text-purple-700 transition-colors font-medium">
                  Daftar aja
                </Link>
              </p>
              <Link to="/lupa-sandi" className="text-purple-500 hover:text-purple-700 transition-colors block text-sm sm:text-base">
                Lupa kata sandi?
              </Link>
              <p className="text-gray-500 text-xs sm:text-sm mt-4 leading-relaxed">
                Dengan login, kamu menyetujui{" "}
                <Link to="/syarat-ketentuan" className="text-purple-500 hover:text-purple-700 transition-colors">
                  Kebijakan Privasi
                </Link> dan{" "}
                <Link to="/syarat-ketentuan" className="text-purple-500 hover:text-purple-700 transition-colors">
                  Syarat & Ketentuan Berkelana
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;