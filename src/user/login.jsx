import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from './context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Gunakan hook useAuth
  const [formData, setFormData] = useState({
    email: 'yosik@example.com',
    password: '1234'
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simple validation
    if (!formData.email || !formData.password) {
      setError('Email dan kata sandi diperlukan');
      setLoading(false);
      return;
    }
    
    // Simulate login - in a real app, this would be an API call
    setTimeout(() => {
      // For demo purposes, accept any valid email format and any password
      if (formData.email.includes('@') && formData.password.length > 0) {
        // Call login function from context
        login({
          name: 'Nasywa Putri Nataliza',
          email: formData.email
        });
        
        // Navigate to account page
        navigate('/info-akun');
      } else {
        setError('Email atau kata sandi tidak valid');
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-500 to-purple-700"
      style={{
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Main container */}
      <div className="flex w-full max-w-screen-xl">
        {/* Left Side: Logo and Tagline */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
              <img
                src="/images/berkelana-logo-white.png"
                alt="Logo Berkelana"
                className="max-w-full h-auto cursor-pointer"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/api/placeholder/300/100";
                }}
              />
            </Link>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-1 items-center justify-end px-8 md:px-32">
          <div className="bg-white py-8 md:py-16 px-8 md:px-12 rounded-lg shadow-lg w-full max-w-lg">
            {/* Logo */}
            <div className="mb-8 md:mb-12 flex justify-center">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
                <img
                  src="/images/berkelana-logo.png"
                  alt="Logo Berkelana"
                  className="h-12 md:h-16 w-auto cursor-pointer"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/api/placeholder/200/80";
                  }}
                />
              </Link>
            </div>
            
            {/* Login Text */}
            <div className="text-start mb-6">
              <h1 className="text-2xl font-bold">Login</h1>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Masukkan Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <div className="text-gray-500 p-2">
                    <i className="fas fa-envelope"></i>
                  </div>
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 outline-none"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="mb-6">
                <label
                  htmlFor="password"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Masukkan Kata Sandi
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <div className="text-gray-500 p-2">
                    <i className="fas fa-lock"></i>
                  </div>
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 outline-none"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-purple-400' : 'bg-purple-500 hover:bg-purple-600'} 
                  text-white font-bold py-2 rounded-lg transition duration-300`}
              >
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <Link to="/daftar" className="text-purple-500 hover:text-purple-700 transition-colors">
                  Daftar aja
                </Link>
              </p>
              <Link to="/lupa-sandi" className="text-purple-500 hover:text-purple-700 transition-colors block mt-2">
                Lupa kata sandi?
              </Link>
              <p className="text-gray-500 text-xs mt-4">
                Dengan login, kamu menyetujui{" "}
                <Link to="/syarat-ketentuan" className="text-purple-500 hover:text-purple-700 transition-colors">
                  Kebijakan Privasi
                </Link>{" "}
                dan{" "}
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