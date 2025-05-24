// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthProvider, { useAuth } from './user/context/AuthContext.jsx';
import MainLayout from './layouts/mainlayout';

// Import halaman user
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

// Import halaman admin
import AdminDashboard from './admin/Dashboard';
import AdminSidebar from './admin/Sidebar';
import KelolaArtikel from './admin/kelolaartikel';
import TambahArtikel from './admin/tambahartikel';
import EditArtikel from './admin/editartikel';

const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  const [showTambahArtikel, setShowTambahArtikel] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  const handleTambahClick = () => {
    setShowTambahArtikel(true);
    setEditingArticle(null);
  };

  const handleEditClick = (article) => {
    setEditingArticle(article);
    setShowTambahArtikel(false);
  };

  const handleSaveArticle = (newArticle) => {
    setArticles(prev => [...prev, { id: Date.now(), ...newArticle }]);
    setShowTambahArtikel(false);
  };

  const handleUpdateArticle = (updatedArticle) => {
    setArticles(prev =>
      prev.map(article =>
        article.id === updatedArticle.id
          ? { ...article, ...updatedArticle }
          : article
      )
    );
    setEditingArticle(null);
  };

  const handleDeleteArticle = (id) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  };

  const renderContent = () => {
    if (activeMenu === 'Artikel') {
      if (editingArticle) {
        return (
          <EditArtikel
            article={editingArticle}
            onBack={() => setEditingArticle(null)}
            onUpdate={handleUpdateArticle}
          />
        );
      }

      if (showTambahArtikel) {
        return (
          <TambahArtikel
            onBack={() => setShowTambahArtikel(false)}
            onSave={handleSaveArticle}
          />
        );
      }

      return (
        <KelolaArtikel
          articles={articles}
          onTambahClick={handleTambahClick}
          onDeleteArticle={handleDeleteArticle}
          onEditArticle={handleEditClick}
        />
      );
    }

    switch (activeMenu) {
      case 'Dashboard':
        return <AdminDashboard />;
      case 'Tiket dan Jadwal':
        return <div className="p-8"><h1 className="text-2xl font-bold">Halaman Tiket dan Jadwal</h1></div>;
      case 'Promo':
        return <div className="p-8"><h1 className="text-2xl font-bold">Halaman Promo</h1></div>;
      case 'Laporan Penjualan Tiket':
        return <div className="p-8"><h1 className="text-2xl font-bold">Halaman Laporan Penjualan Tiket</h1></div>;
      case 'Kelola Admin':
        return <div className="p-8"><h1 className="text-2xl font-bold">Halaman Kelola Admin</h1></div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className="flex-1">{renderContent()}</div>
    </div>
  );
};

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  if (!isLoggedIn) return <Navigate to="/daftar-masuk" />;

  return children;
};

// DISABLED: AdminProtectedRoute -> langsung tampilkan halaman admin
// const AdminProtectedRoute = ({ children }) => {
//   const { isLoggedIn, isAdmin, loading } = useAuth();
//   if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
//   if (!isLoggedIn || !isAdmin) return <Navigate to="/daftar-masuk" />;
//   return children;
// };

function AppRoutes() {
  return (
    <Routes>
      <Route path="/daftar-masuk" element={<LoginForm />} />
      <Route path="/daftar" element={<RegisterForm />} />
      <Route path="/lupa-sandi" element={<ForgotPassword />} />

      {/* ROUTE ADMIN TANPA LOGIN */}
      <Route path="/admin/*" element={<AdminLayout />} />

      <Route element={<MainLayoutWrapper />}>
        <Route path="/" element={<Homepage />} />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket" element={<PesanTiket />} />
        <Route path="/pemesanan-1" element={<Pemesanan1 />} />
        <Route path="/pemesanan-2" element={<Pemesanan2 />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        <Route path="/ubah-sandi" element={<ChangePassword />} />
        <Route path="/notifikasi" element={<NotificationsPage />} />

        <Route path="/info-akun" element={
          <ProtectedRoute><UserAccount /></ProtectedRoute>
        } />
        <Route path="/tiket-saya" element={
          <ProtectedRoute><TiketSaya /></ProtectedRoute>
        } />
        <Route path="/e-ticket/:bookingCode" element={
          <ProtectedRoute><ETicket /></ProtectedRoute>
        } />

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
