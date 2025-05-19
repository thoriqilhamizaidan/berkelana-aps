import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
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
            <img
              src="/images/berkelana-logo-white.png"
              alt="Logo"
              className="max-w-full h-auto"
              />
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="flex flex-1 items-center justify-end px-32">
          <div className="bg-white py-16 px-12 rounded-lg shadow-lg w-[800px] max-w-lg ml-auto">
            {/* Logo */}
            <div className="mb-12 flex justify-center">
              <img
                src="images/berkelana-logo.png"
                alt="Logo"
                className="h-16 w-auto"
              />
            </div>
            {/* Login Text */}
            <div className="text-start mb-6">
              <h1 className="text-2xl font-bold">Login</h1>
            </div>
            <form>
              {/* Email Input */}
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Masukkan Email
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    className="text-gray-500 p-2"
                  />
                  <input
                    id="email"
                    type="email"
                    className="w-full p-2 outline-none"
                    placeholder="Email"
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
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-gray-500 p-2"
                  />
                  <input
                    id="password"
                    type="password"
                    className="w-full p-2 outline-none"
                    placeholder="Password"
                    required
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-purple-500 text-white font-bold py-2 rounded-lg hover:bg-purple-600 transition duration-300"
              >
                Masuk
              </button>
            </form>

            {/* Links */}
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Belum punya akun?{" "}
                <Link to="/register" className="text-purple-500">
                  Daftar aja
                </Link>
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Dengan login, kamu menyetujui{" "}
                <Link to="/privacy-policy" className="text-purple-500">
                  Kebijakan Privasi
                </Link>{" "}
                dan{" "}
                <Link to="/terms" className="text-purple-500">
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