import React, { useState } from "react";
import { Link } from "react-router-dom";
import OTPModal from "../user/otpmodal";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowOtpModal(true);      
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
          to="/daftar-masuk"
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
          <h1 className="text-5xl font-bold mb-4 text-black">Lupa kata sandi</h1>
          <p className="text-gray-700 text-lg mb-12 max-w-2xl">
            Jangan khawatir. Tuliskan email untuk membuat kata sandi baru.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-12">
            <label
              htmlFor="email"
              className="block text-left font-semibold mb-2 text-black text-lg"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Masukkan email"
              className="w-full p-4 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 transition text-lg placeholder:text-gray-400"
              required
            />
          </div>
          <button
            type="submit"
            className="block mx-auto bg-purple-300 hover:bg-purple-400 text-white font-bold py-3 px-16 rounded-xl text-lg transition"
          >
            Kirim
          </button>
        </form>
        {/* OTP Modal */}
        <OTPModal
          open={showOtpModal}
          email={email} 
          onClose={() => setShowOtpModal(false)}
          onResend={() => {/* handle resend logic if needed */}}
          onSubmit={(otp) => {/* handle OTP submit if needed */}}
        />
      </div>
    </div>
  );
};

export default ForgotPassword;