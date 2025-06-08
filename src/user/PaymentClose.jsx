import { useEffect } from 'react';

const PaymentClose = () => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: 'PAYMENT_SUCCESS' }, '*');
    }
    setTimeout(() => {
      window.close();
    }, 1000);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-green-600 text-4xl mb-2">✅</div>
        <p>Pembayaran berhasil! Menutup halaman...</p>
      </div>
    </div>
  );
};

export default PaymentClose;