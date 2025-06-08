import { useEffect } from 'react';

const PaymentFailed = () => {
  useEffect(() => {
    if (window.opener) {
      window.opener.postMessage({ type: 'PAYMENT_FAILED' }, '*');
    }
    setTimeout(() => {
      window.close();
    }, 3000);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50">
      <div className="text-center">
        <div className="text-red-600 text-4xl mb-2">❌</div>
        <h1 className="text-xl font-bold text-red-600 mb-2">Pembayaran Gagal</h1>
        <p>Menutup halaman dalam 3 detik...</p>
      </div>
    </div>
  );
};

export default PaymentFailed;