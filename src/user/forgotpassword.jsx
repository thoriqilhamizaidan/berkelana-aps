import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import OTPModal from "../user/otpmodal";
import authService from '../services/authService';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await authService.forgotPassword(email);
      
      if (result.success) {
        setShowOtpModal(true);
      } else {
        setError(result.message || 'Gagal mengirim OTP');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (otp) => {
    try {
      const result = await authService.verifyOTP(email, otp);
      
      if (result.success) {
        setResetToken(result.resetToken);
        setShowOtpModal(false);
        // Navigate to reset password page with token
        navigate('/reset-password', { 
          state: { email, resetToken: result.resetToken } 
        });
      } else {
        throw new Error(result.message || 'OTP tidak valid');
      }
    } catch (err) {
      throw err; // Let OTPModal handle the error
    }
  };

  const handleResendOTP = async () => {
    try {
      const result = await authService.resendOTP(email);
      
      if (!result.success) {
        throw new Error(result.message || 'Gagal mengirim ulang OTP');
      }
    } catch (err) {
      throw err; // Let OTPModal handle the error
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
      <div className="bg-white py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 lg:px-12 rounded-2xl sm:rounded-3xl shadow-lg w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl mx-auto relative">
        {/* Back button */}
        <Link
          to="/daftar-masuk"
          className="absolute top-3 sm:top-4 md:top-5 left-3 sm:left-4 md:left-5 text-xl sm:text-2xl text-gray-700 hover:text-purple-500 transition-colors"
        >
          <span aria-label="Back" role="img">
            &larr;
          </span>
        </Link>
        
        {/* Logo */}
        <div className="mb-6 sm:mb-8 md:mb-10 flex justify-center">
          <img
            src="images/berkelana-logo.png"
            alt="Logo"
            className="h-8 sm:h-10 md:h-12 w-auto"
          />
        </div>
        
        {/* Title */}
        <div className="mb-6 sm:mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-black leading-tight">
            Lupa kata sandi
          </h1>
          <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 md:mb-12 px-2">
            Jangan khawatir. Tuliskan email untuk membuat kata sandi baru.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-8 sm:mb-10 md:mb-12">
            <label
              htmlFor="email"
              className="block text-left font-semibold mb-2 text-black text-sm sm:text-base md:text-lg"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="w-full p-3 sm:p-4 border-2 border-purple-300 rounded-lg sm:rounded-xl focus:outline-none focus:border-purple-500 transition text-sm sm:text-base md:text-lg placeholder:text-gray-400"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`block mx-auto w-full sm:w-auto ${loading ? 'bg-purple-200' : 'bg-purple-300 hover:bg-purple-400'} 
              text-white font-bold py-3 sm:py-3 px-8 sm:px-12 md:px-16 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg transition`}
          >
            {loading ? 'Mengirim...' : 'Kirim'}
          </button>
        </form>
        
        {/* OTP Modal */}
        <OTPModal
          open={showOtpModal}
          email={email} 
          onClose={() => setShowOtpModal(false)}
          onResend={handleResendOTP}
          onSubmit={handleOTPSubmit}
        />
      </div>
    </div>
  );
};

export default ForgotPassword;