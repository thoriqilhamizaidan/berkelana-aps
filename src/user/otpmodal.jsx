import React, { useState, useRef, useEffect } from 'react';

const OTPModal = ({ open, email, onClose, onResend, onSubmit }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [animate, setAnimate] = useState(false);
  const inputRefs = useRef([]);

  // Animate the modal when open changes
  useEffect(() => {
    if (open) {
      setCountdown(60); // Start 60 seconds countdown
      setTimeout(() => setAnimate(true), 10);
    } else {
      setAnimate(false);
      // Reset state when modal closes
      setOtp(['', '', '', '', '', '']);
      setError('');
    }
  }, [open]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    
    // Handle single digit input
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Move to next input
      if (index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
    
    // Handle paste
    if (value.length > 1) {
      const chars = value.split('').slice(0, 6);
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (i < 6 && /^[0-9]$/.test(char)) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus on the next empty input or the last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex].focus();
      } else {
        inputRefs.current[5].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // Move to previous input if current is empty
        inputRefs.current[index - 1].focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      } else {
        // Clear current input
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Masukkan 6 digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(otpString);
      // Clear OTP on success
      setOtp(['', '', '', '', '', '']);
    } catch (err) {
      setError(err.message || 'OTP tidak valid');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    setError('');

    try {
      await onResend();
      setCountdown(60); // Reset countdown
      setOtp(['', '', '', '', '', '']);
      // Success message is handled by parent component
    } catch (err) {
      setError(err.message || 'Gagal mengirim ulang OTP');
    } finally {
      setResendLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[3px] bg-black/30 transition-all p-4">
      <div
        className={`relative bg-white rounded-xl sm:rounded-2xl py-6 sm:py-8 md:py-10 lg:py-12 px-4 sm:px-6 md:px-8 lg:px-12 w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl mx-auto shadow-2xl
        transition-transform duration-300 ${animate ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        style={{ willChange: "transform, opacity" }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 sm:top-5 md:top-6 right-4 sm:right-5 md:right-6 text-2xl sm:text-3xl text-black hover:text-purple-400 focus:outline-none transition-colors"
          aria-label="Tutup"
        >
          &times;
        </button>
        
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 sm:mb-5 md:mb-6 text-black leading-tight">
          Masukkan kode OTP
        </h1>
        
        <p className="text-center text-sm sm:text-base md:text-lg lg:text-xl mb-1 text-black px-2">
          Masukkan kode yang dikirim via email ke:
        </p>
        <p className="text-center font-bold text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-black break-all px-2">
          {email}
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-center text-sm sm:text-base">
            {error}
          </div>
        )}

        {/* OTP Inputs */}
        <div className="flex justify-center mb-6 sm:mb-8 gap-2 sm:gap-3 md:gap-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={el => inputRefs.current[index] = el}
              type="text"
              maxLength="6"
              value={digit}
              onChange={e => handleChange(e, index)}
              onKeyDown={e => handleKeyDown(e, index)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 text-center text-lg sm:text-xl md:text-2xl lg:text-3xl border-2 border-purple-300 rounded-lg sm:rounded-xl shadow-[0_4px_8px_0_rgba(128,90,213,0.12)] focus:outline-none focus:border-purple-500 transition"
              disabled={loading}
              autoFocus={index === 0}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>

        {/* Verify button - visible for manual submit */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <button
            onClick={handleSubmit}
            disabled={loading || otp.join('').length !== 6}
            className={`w-full sm:w-auto px-6 sm:px-8 py-3 rounded-lg sm:rounded-xl font-bold transition text-sm sm:text-base
              ${loading || otp.join('').length !== 6
                ? 'bg-purple-200 text-white cursor-not-allowed' 
                : 'bg-purple-400 hover:bg-purple-500 text-white'
              }`}
          >
            {loading ? 'Memverifikasi...' : 'Verifikasi'}
          </button>
        </div>

        {/* Resend */}
        <div className="text-center">
          <p
            className={`cursor-pointer transition text-xs sm:text-sm md:text-base ${
              countdown > 0 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-black hover:text-purple-500'
            }`}
            onClick={countdown > 0 ? undefined : handleResend}
          >
            {resendLoading 
              ? 'Mengirim...' 
              : countdown > 0 
                ? `Kirim ulang kode dalam ${countdown}s` 
                : 'Kirim Ulang Kode'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;