// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthProvider, { useAuth } from './user/context/AuthContext.jsx';
import MainLayout from './layouts/mainlayout';


// Impor semua komponen halaman
import Homepage from './Homepage'
import PesanTiket from './user/pesantiket'
import Pemesanan1 from './user/pemesanan-1';
import Pemesanan2 from './user/pemesanan-2';
import Pembayaran from './user/pembayaran'; 
import Artikel from './user/artikel'
import ArtikelDetail from './user/artikeldetail'
import TiketSaya from './user/tiketsaya';
import ETicket from './user/etiket'; 
import TentangKami from './user/tentangkami';
import TermsAndConditions from './user/tc';
import PromoPage from './user/promopage';
import LoginForm from './user/loginform'
import RegisterForm from './user/registerform'
import ForgotPassword from './user/forgotpassword'
import ChangePassword from './user/changepassword'
import UserAccount from './user/useraccount'
import NotificationsPage from './user/notificationspage'

// Komponen layout dengan Outlet
const MainLayoutWrapper = () => {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/daftar-masuk" />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Login dan Register di luar layout karena mereka punya design sendiri */}
      <Route path="/daftar-masuk" element={<LoginForm />} />
      <Route path="/daftar" element={<RegisterForm />} />
      <Route path="/lupa-sandi" element={<ForgotPassword />} />
      
      {/* Semua route lain menggunakan layout */}
      <Route element={<MainLayoutWrapper />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket" element={<PesanTiket />} />
        <Route path="/pemesanan-1" element={<Pemesanan1 />} />
        <Route path="/pemesanan-2" element={<Pemesanan2 />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        <Route path="/ubah-sandi" element={<ChangePassword />} />
        <Route path="/notifikasi" element={<NotificationsPage />} />
        
        {/* Protected Routes */}
        <Route path="/info-akun" element={
          <ProtectedRoute>
            <UserAccount />
          </ProtectedRoute>
        } />
        
        <Route path="/tiket-saya" element={
          <ProtectedRoute>
            <TiketSaya />
          </ProtectedRoute>
        } />
        
        <Route path="/e-ticket/:bookingCode" element={
          <ProtectedRoute>
            <ETicket />
          </ProtectedRoute>
        } />
        
        {/* Public Routes */}
        <Route path="/promo" element={<PromoPage />} />
        <Route path="/artikel" element={<Artikel />} />
        <Route path="/artikel/detail" element={<ArtikelDetail />} />
        <Route path="/tentang-kami" element={<TentangKami />} />
        <Route path="/syarat-ketentuan" element={<TermsAndConditions />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;