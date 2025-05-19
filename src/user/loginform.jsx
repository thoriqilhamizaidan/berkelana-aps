import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const LoginForm = () => (
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
      {/* Right Side: Login Form */}
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
          {/* Login Text */}
          <div className="text-start mb-8">
            <h1 className="text-4xl font-bold">Login</h1>
          </div>
          <form>
            {/* Email Input */}
            <div className="mb-6">
              <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-gray-400 mr-3"
                />
                <input
                  id="email"
                  type="email"
                  className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                  placeholder="Masukkan email"
                  required
                />
              </div>
            </div>
            {/* Password Input */}
            <div className="mb-6">
              <div className="flex items-center border-2 border-purple-300 rounded-xl px-4 focus-within:border-purple-500 transition">
                <FontAwesomeIcon
                  icon={faLock}
                  className="text-gray-400 mr-3"
                />
                <input
                  id="passwor"
                  type="password"
                  className="w-full p-4 text-lg border-none bg-transparent placeholder:text-gray-400 focus:outline-none"
                  placeholder="Masukkan kata sandi"
                  required
                />
              </div>
            </div>
            {/* Forgot Password Link */}
            <div className="flex justify-end mb-6">
              <Link
                to="/lupa-sandi"
                className="text-sm text-purple-400 hover:underline"
              >
                Lupa kata sandi?
              </Link>
            </div>
            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-purple-400 hover:bg-purple-500 text-white font-bold py-4 rounded-xl text-xl transition mb-4"
            >
              Login
            </button>
          </form>
          {/* Links */}
          <div className="text-center mt-2 mb-2">
            <p className="text-gray-600 text-lg">
              Belum punya akun?{" "}
              <Link to="/daftar" className="text-purple-500 font-bold">
                Daftar aja
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

export default LoginForm;