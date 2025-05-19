import React, { useEffect, useRef, useState } from "react";

const OTPModal = ({
  open,
  onClose,
  email,
  onResend,
  onSubmit,
}) => {
  const inputsRef = useRef([]);
  const [animate, setAnimate] = useState(false);

  // Animate the modal when open changes to true
  useEffect(() => {
    if (open) {
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
    }
  }, [open]);

  const handleInputChange = (e, idx) => {
    const value = e.target.value;
    if (/^[0-9a-zA-Z]$/.test(value) && idx < 5) {
      if (inputsRef.current[idx + 1]) {
        inputsRef.current[idx + 1].focus();
      }
    }
    if (value.length > 1) {
      // handle paste
      const chars = value.split("");
      chars.forEach((char, i) => {
        if (inputsRef.current[idx + i]) {
          inputsRef.current[idx + i].value = char;
        }
      });
      if (inputsRef.current[idx + chars.length]) {
        inputsRef.current[idx + chars.length].focus();
      }
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !e.target.value && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otp = inputsRef.current.map((input) => input.value).join("");
    if (onSubmit) onSubmit(otp);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-black/30 transition-all">
      <div
        className={`relative bg-white rounded-2xl py-12 px-4 sm:px-12 w-full max-w-2xl mx-auto shadow-2xl
        transition-transform duration-300 ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-3xl text-black hover:text-purple-400 focus:outline-none"
          aria-label="Tutup"
        >
          &times;
        </button>
        {/* Title */}
        <h1 className="text-5xl font-bold text-center mb-6 text-black">
          Masukkan kode OTP
        </h1>
        <p className="text-center text-xl mb-1 text-black">
          Masukkan kode yang dikirim via email ke:
        </p>
        <p className="text-center font-bold text-2xl mb-10 text-black break-all">
          {email}
        </p>
        {/* OTP Inputs */}
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center mb-8 gap-4">
            {[0, 1, 2, 3, 4, 5].map((idx) => (
              <input
                key={idx}
                ref={(el) => (inputsRef.current[idx] = el)}
                maxLength={1}
                className="w-16 h-16 text-center text-3xl border-2 border-purple-300 rounded-xl shadow-[0_4px_8px_0_rgba(128,90,213,0.12)] focus:outline-none focus:border-purple-500 transition"
                onChange={(e) => handleInputChange(e, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                style={{ fontFamily: "inherit" }}
                autoFocus={idx === 0}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            ))}
          </div>
          <button
            type="submit"
            className="hidden"
          >
            Submit
          </button>
        </form>
        {/* Resend */}
        <p
          className="text-center mt-2 cursor-pointer text-black hover:text-purple-500"
          style={{ fontSize: "15px" }}
          onClick={onResend}
        >
          Kirim Ulang Kode
        </p>
      </div>
    </div>
  );
};

export default OTPModal;