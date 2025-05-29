import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from './context/AuthContext.jsx'; // pastikan path ini benar

const LoginForm = () => {
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
      const response = await fetch('http://localhost:3000/api/login', {
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

        // ✅ Redirect berdasarkan role
        if (result.role === 'superadmin' || result.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/');
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

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
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
                  />
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end mb-6">
                <Link to="/lupa-sandi" className="text-sm text-purple-400 hover:underline">
                  Lupa kata sandi?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-purple-300' : 'bg-purple-400 hover:bg-purple-500'} 
                  text-white font-bold py-4 rounded-xl text-xl transition mb-4`}
              >
                {loading ? 'Memproses...' : 'Login'}
              </button>
            </form>

            {/* Daftar */}
            <div className="text-center mt-2 mb-2">
              <p className="text-gray-600 text-lg">
                Belum punya akun?{" "}
                <Link to="/daftar" className="text-purple-500 font-bold hover:text-purple-700 transition-colors">
                  Daftar aja
                </Link>
              </p>
            </div>

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
