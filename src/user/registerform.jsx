import React from "react";
import { Link } from "react-router-dom";

const RegisterForm = () => (
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
        <div className="bg-white py-16 px-12 rounded-3xl shadow-lg w-[800px] max-w-lg ml-auto">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <img
              src="images/berkelana-logo.png"
              alt="Logo"
              className="h-12 w-auto"
            />
          </div>
          {/* Registration Text */}
          <div className="text-start mb-8">
            <h1 className="text-4xl font-bold">Registrasi</h1>
          </div>
            <form>
              {/* Nama Input */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Masukkan nama"
                  className="w-full p-4 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {/* Email Input */}
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Masukkan email"
                  className="w-full p-4 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {/* Nomor HP Input */}
              <div className="mb-6">
                <input
                  type="tel"
                  placeholder="Masukkan nomor HP | ex: 08xxxxx"
                  className="w-full p-4 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {/* Sandi Input */}
              <div className="mb-6">
                <input
                  type="password"
                  placeholder="Masukkan kata sandi"
                  className="w-full p-4 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {/* Konfirmasi Sandi Input */}
              <div className="mb-8">
                <input
                  type="password"
                  placeholder="Konfirmasi kata sandi"
                  className="w-full p-4 text-lg border-2 border-purple-300 rounded-xl bg-white placeholder:text-gray-400 focus:outline-none focus:border-purple-500 transition"
                  required
                />
              </div>
              {/* Register Button */}
              <button
                type="submit"
                className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-xl transition mb-4"
              >
                Registrasi
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
            Dengan login, kamu menyetujui{" "}
            <span className="font-bold text-purple-600">Kebijakan Privasi</span> dan{" "}
            <span className="font-bold text-purple-600">Syarat & Ketentuan Berkelana</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);

export default RegisterForm;