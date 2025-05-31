import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import authService from '../services/authService';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  useEffect(() => {
    // Redirect if no email or token
    if (!email || !resetToken) {
      navigate('/lupa-sandi');
    }
  }, [email, resetToken, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Kata sandi tidak cocok");
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Kata sandi harus minimal 8 karakter");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.resetPassword(email, resetToken, password);

      if (result.success) {
        alert('Password berhasil direset! Silakan login dengan password baru.');
        navigate('/daftar-masuk');
      } else {
        setError(result.message || 'Gagal reset password');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage:
          "url('images/directly-shot-christmas-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white py-20 px-6 sm:px-12 rounded-3xl shadow-lg w-full max-w-2xl mx-auto relative">
        {/* Back button */}
        <Link
          to="/lupa-sandi"
          className="absolute top-5 left-5 text-2xl text-gray-700 hover:text-purple-500"
        >
          <span aria-label="Back" role="img">
            &larr;
          </span>
        </Link>
        
        {/* Logo */}
        <div className="mb-10 flex justify-center">
          <img
            src="images/berkelana-logo.png"
            alt="Logo"
            className="h-12 w-auto"
          />
        </div>
        
        {/* Title */}
        <div className="mb-3">
          <h1 className="text-5xl font-bold mb-4 text-black">Reset Kata Sandi</h1>
          <p className="text-gray-700 text-lg mb-12 max-w-2xl">
            Masukkan kata sandi baru untuk akun Anda
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 text-red-500 bg-red-50 rounded-lg border border-red-200">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* New Password Input */}
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-left font-semibold mb-2 text-black text-lg"
            >
              Kata sandi baru
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan kata sandi baru"
                className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={showPassword ? faEyeSlash : faEye}
                  className="text-gray-400 ml-2"
                />
              </button>
            </div>
          </div>
          
          {/* Confirm Password Input */}
          <div className="mb-12">
            <label
              htmlFor="confirmPassword"
              className="block text-left font-semibold mb-2 text-black text-lg"
            >
              Konfirmasi kata sandi
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Konfirmasi kata sandi"
                className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  className="text-gray-400 ml-2"
                />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`block mx-auto ${loading ? 'bg-purple-200' : 'bg-purple-300 hover:bg-purple-400'} 
              text-white font-bold py-3 px-16 rounded-xl text-lg transition`}
          >
            {loading ? 'Menyimpan...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;