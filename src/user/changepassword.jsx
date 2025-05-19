import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

const ChangePassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <h1 className="text-5xl font-bold mb-4 text-black">Ganti Kata Sandi</h1>
          <p className="text-gray-700 text-lg mb-12 max-w-2xl">
            Pastikan untuk mengingat kata sandi yang akan diganti
          </p>
        </div>
        <form>
          {/* New Password Input */}
          <div className="mb-8">
            <label
              htmlFor="password"
              className="block text-left font-semibold mb-2 text-black text-lg"
            >
              Masukkan kata sandi baru
            </label>
            <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Masukkan kata sandi baru"
                className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                required
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
            className="block mx-auto bg-purple-300 hover:bg-purple-400 text-white font-bold py-3 px-16 rounded-xl text-lg transition"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;