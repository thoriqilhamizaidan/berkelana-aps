import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from './context/AuthContext.jsx';
import authService from '../services/authService'; // Import langsung authService

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check if coming from register or other page with success message
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state to prevent it showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Auto hide success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage(''); // Clear success message on new login attempt
    setLoading(true);

    try {
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        const userData = {
          id: result.user.id,
          email: result.user.email,
          nama: result.user.nama,
          role: result.role,
          ...result.user
        };

        login(userData);

        // Redirect based on role
        if (result.role === 'superadmin' || result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
        }

      } else {
        setError(result.message || 'Login gagal');
      }
    } catch (err) {
      setError(err.message || 'Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: "url('images/directly-shot-christmas-decorations-blue-background 1.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="flex w-full max-w-screen-xl">
        {/* Logo Side */}
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-white">
            <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
              <img
                src="/images/berkelana-logo-white.png"
                alt="Logo Berkelana"
                className="max-w-full h-auto cursor-pointer"
              />
            </Link>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex flex-1 items-center justify-end px-32">
          <div className="bg-white py-16 px-12 rounded-3xl shadow-lg w-[800px] max-w-lg ml-auto">
            <div className="mb-6 flex justify-center">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity duration-300">
                <img
                  src="images/berkelana-logo.png"
                  alt="Logo Berkelana"
                  className="h-12 w-auto cursor-pointer"
                />
              </Link>
            </div>

            <div className="text-start mb-8">
              <h1 className="text-4xl font-bold">Login</h1>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-lg flex items-center justify-between">
                <span>{successMessage}</span>
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="ml-4 text-green-700 hover:text-green-900 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg flex items-center justify-between">
                <span>{error}</span>
                <button 
                  onClick={() => setError('')}
                  className="ml-4 text-red-700 hover:text-red-900 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="mb-6">
                <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-3" />
                  <input
                    id="email"
                    type="email"
                    className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                    placeholder="Masukkan email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="mb-6">
                <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
                  <FontAwesomeIcon icon={faLock} className="text-gray-400 mr-3" />
                  <input
                    id="password"
                    type="password"
                    className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                    placeholder="Masukkan kata sandi"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mb-6">
                <Link to="/lupa-sandi" className="text-sm text-purple-400 hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-purple-300 cursor-not-allowed' : 'bg-purple-400 hover:bg-purple-500'} 
                  text-white font-bold py-4 rounded-xl text-xl transition mb-4`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memproses...
                  </span>
                ) : 'Login'}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-2 mb-2">
              <p className="text-gray-600 text-lg">
                Belum punya akun?{" "}
                <Link to="/daftar" className="text-purple-500 font-bold hover:text-purple-700 transition-colors">
                  Daftar aja
                </Link>
              </p>
            </div>

            {/* Terms and Privacy */}
            <p className="text-center text-xs text-black mt-2">
              Dengan login, kamu menyetujui{" "}
              <Link to="/syarat-ketentuan" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">
                Kebijakan Privasi
              </Link> dan{" "}
              <Link to="/syarat-ketentuan" className="font-bold text-purple-600 hover:text-purple-800 transition-colors">
                Syarat & Ketentuan Berkelana
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;