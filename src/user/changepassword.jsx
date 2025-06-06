import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import authService from '../services/authService';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Kata sandi baru tidak cocok");
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 8) {
      setError("Kata sandi baru harus minimal 8 karakter");
      return;
    }

    // Check if new password is same as current
    if (formData.currentPassword === formData.newPassword) {
      setError("Kata sandi baru harus berbeda dengan kata sandi lama");
      return;
    }

    setLoading(true);

    try {
      const result = await authService.changePassword(
        formData.currentPassword,
        formData.newPassword
      );

      if (result.success) {
        alert('Password berhasil diubah!');
        navigate("/info-akun");
      } else {
        setError(result.message || 'Gagal mengubah password');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "url('images/directly-shot-christmas-background.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="bg-white py-8 px-4 sm:py-12 sm:px-8 lg:py-20 lg:px-12 rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-xs sm:max-w-md lg:max-w-2xl mx-auto relative">
        {/* Back button */}
        <Link
          to="/info-akun"
          className="absolute top-3 left-3 sm:top-5 sm:left-5 text-xl sm:text-2xl text-gray-700 hover:text-purple-500 transition-colors"
        >
          <span aria-label="Back" role="img">
            &larr;
          </span>
        </Link>
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 lg:mb-10 flex justify-center">
          <img
            src="images/berkelana-logo.png"
            alt="Logo"
            className="h-8 sm:h-10 lg:h-12 w-auto"
          />
        </div>
        
        {/* Title */}
        <div className="mb-3 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-2 sm:mb-4 text-black">
            Ganti Kata Sandi
          </h1>
          <p className="text-gray-700 text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 lg:mb-12 max-w-2xl">
            Pastikan untuk mengingat kata sandi yang akan diganti
          </p>
        </div>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 text-red-500 bg-red-50 rounded-lg border border-red-200 text-sm sm:text-base">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Current Password Input */}
          <div className="mb-6 sm:mb-8">
            <label
              htmlFor="currentPassword"
              className="block text-left font-semibold mb-2 text-black text-sm sm:text-base lg:text-lg"
            >
              Kata sandi lama
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-lg sm:rounded-xl px-3 sm:px-4 focus-within:border-purple-500 transition">
              <input
                type={showCurrentPassword ? "text" : "password"}
                id="currentPassword"
                name="currentPassword"
                placeholder="Masukkan kata sandi lama"
                className="w-full p-3 sm:p-4 text-sm sm:text-base lg:text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
                value={formData.currentPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="focus:outline-none ml-2 p-1"
              >
                <FontAwesomeIcon
                  icon={showCurrentPassword ? faEyeSlash : faEye}
                  className="text-gray-400 text-sm sm:text-base"
                />
              </button>
            </div>
          </div>

          {/* New Password Input */}
          <div className="mb-6 sm:mb-8">
            <label
              htmlFor="newPassword"
              className="block text-left font-semibold mb-2 text-black text-sm sm:text-base lg:text-lg"
            >
              Kata sandi baru
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-lg sm:rounded-xl px-3 sm:px-4 focus-within:border-purple-500 transition">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                placeholder="Masukkan kata sandi baru"
                className="w-full p-3 sm:p-4 text-sm sm:text-base lg:text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
                value={formData.newPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="focus:outline-none ml-2 p-1"
              >
                <FontAwesomeIcon
                  icon={showNewPassword ? faEyeSlash : faEye}
                  className="text-gray-400 text-sm sm:text-base"
                />
              </button>
            </div>
          </div>
          
          {/* Confirm Password Input */}
          <div className="mb-8 sm:mb-10 lg:mb-12">
            <label
              htmlFor="confirmPassword"
              className="block text-left font-semibold mb-2 text-black text-sm sm:text-base lg:text-lg"
            >
              Konfirmasi kata sandi
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-lg sm:rounded-xl px-3 sm:px-4 focus-within:border-purple-500 transition">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Konfirmasi kata sandi"
                className="w-full p-3 sm:p-4 text-sm sm:text-base lg:text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="focus:outline-none ml-2 p-1"
              >
                <FontAwesomeIcon
                  icon={showConfirmPassword ? faEyeSlash : faEye}
                  className="text-gray-400 text-sm sm:text-base"
                />
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`block mx-auto w-full sm:w-auto ${loading ? 'bg-purple-200' : 'bg-purple-300 hover:bg-purple-400'} 
              text-white font-bold py-3 px-8 sm:px-12 lg:px-16 rounded-lg sm:rounded-xl text-sm sm:text-base lg:text-lg transition`}
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;