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
import ResetPassword from './user/resetpassword'
import ChangePassword from './user/changepassword'
import UserAccount from './user/useraccount'
import NotificationsPage from './user/NotificationsPage'
// TAMBAH import di bagian atas setelah NotificationsPage:
import PaymentClose from './user/PaymentClose';
import PaymentFailed from './user/PaymentFailed';
import LanjutkanPembayaran from './user/LanjutkanPembayaran';

// Import halaman admin
import AdminDashboard from './admin/Dashboard';
import AdminSidebar from './admin/Sidebar';
import DetailKendaraan from './admin/detailkendaraan';
import KelolaArtikel from './admin/kelolaartikel';
import TambahArtikel from './admin/tambahartikel';
import EditArtikel from './admin/editartikel';
import KelolaAdmin from './admin/kelolaadmin';
import TambahAdmin from './admin/tambahadmin';
import EditAdmin from './admin/editadmin';
import LaporanPenjualanTiket from './admin/laporanpenjualantiket';
import ETicketAdmin from './admin/etiketadmin';   
import PromoTable from './admin/promotable';
import TiketDanJadwal from './admin/tiketdanjadwal';
import TambahJadwal from './admin/tambahjadwal';
import EditJadwal from './admin/editjadwal';
import DetailJadwal from './admin/detailjadwal';

const MainLayoutWrapper = () => (
  <MainLayout>
    <Outlet />
  </MainLayout>
);

const AdminLayout = () => {
  const [activeMenu, setActiveMenu] = useState('Dashboard');
  
  // State untuk Artikel
  const [showTambahArtikel, setShowTambahArtikel] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articles, setArticles] = useState([]);

  // State untuk Admin
  const [showTambahAdmin, setShowTambahAdmin] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [admins, setAdmins] = useState([]);

  // Handler untuk Artikel
  const handleTambahArtikelClick = () => {
    setShowTambahArtikel(true);
    setEditingArticle(null);
  };

  const handleEditArtikelClick = (article) => {
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

  // Handler untuk Admin
  const handleTambahAdminClick = () => {
    setShowTambahAdmin(true);
    setEditingAdmin(null);
  };

  const handleEditAdminClick = (admin) => {
    setEditingAdmin(admin);
    setShowTambahAdmin(false);
  };

  const handleSaveAdmin = (newAdmin) => {
    setAdmins(prev => [...prev, { id: Date.now(), ...newAdmin }]);
    setShowTambahAdmin(false);
  };

  const handleUpdateAdmin = (updatedAdmin) => {
    setAdmins(prev =>
      prev.map(admin =>
        admin.id === updatedAdmin.id
          ? { ...admin, ...updatedAdmin }
          : admin
      )
    );
    setEditingAdmin(null);
  };

  const handleDeleteAdmin = (id) => {
    setAdmins(prev => prev.filter(admin => admin.id !== id));
  };

  const renderContent = () => {
    // Handle Artikel Menu
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
          onTambahClick={handleTambahArtikelClick}
          onDeleteArticle={handleDeleteArticle}
          onEditArticle={handleEditArtikelClick}
        />
      );
    }

    // Handle Kelola Admin Menu
    if (activeMenu === 'Kelola Admin') {
      if (editingAdmin) {
        return (
          <EditAdmin
            admin={editingAdmin}
            onBack={() => setEditingAdmin(null)}
            onUpdate={handleUpdateAdmin}
          />
        );
      }

      if (showTambahAdmin) {
        return (
          <TambahAdmin
            onBack={() => setShowTambahAdmin(false)}
            onSave={handleSaveAdmin}
          />
        );
      }

      return (
        <KelolaAdmin
          admins={admins}
          onTambahClick={handleTambahAdminClick}
          onDeleteAdmin={handleDeleteAdmin}
          onEditAdmin={handleEditAdminClick}
        />
      );
    }

    // Handle menu lainnya
    switch (activeMenu) {
      case 'Dashboard':
        return <AdminDashboard />;
      case 'Tiket dan Jadwal':
        return <TiketDanJadwal />;
      case 'Detail Kendaraan':
        return <DetailKendaraan />;
      case 'Promo':
        return <PromoTable />;
      case 'Laporan Penjualan Tiket':
        return <LaporanPenjualanTiket />;
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

// Protected Route Component for regular users
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  if (!isLoggedIn) return <Navigate to="/daftar-masuk" />;

  // Cegah admin/superadmin mengakses halaman user
  if (isAdmin()) return <Navigate to="/admin" />;

  return children;
};


// ENABLE: AdminProtectedRoute untuk membatasi akses
const AdminProtectedRoute = ({ children }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();
  
  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  
  // Jika belum login atau bukan admin, redirect ke login
  if (!isLoggedIn || !isAdmin()) {
    return <Navigate to="/daftar-masuk" />;
  }
  
  return children;
};

const HomeRedirect = () => {
  const { isLoggedIn, isAdmin } = useAuth();

  if (isLoggedIn) {
    return isAdmin() ? <Navigate to="/admin" /> : <Navigate to="/tiket-saya" />;
  }

  return <Homepage />;
};


function AppRoutes() {
  return (
    <Routes>
      <Route path="/daftar-masuk" element={<LoginForm />} />
      <Route path="/daftar" element={<RegisterForm />} />
      <Route path="/lupa-sandi" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ROUTE ADMIN DENGAN PROTEKSI */}
      <Route path="/admin/*" element={
        <AdminProtectedRoute>
          <AdminLayout />
        </AdminProtectedRoute>
      } />
      <Route path="/admin/etiket/:kodePesanan" element={
        <AdminProtectedRoute>
          <ETicketAdmin />
        </AdminProtectedRoute>
      } />

      <Route element={<MainLayoutWrapper />}>
        <Route path="/" element={<Homepage />}  />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket" element={<PesanTiket />} />
        <Route path="/pemesanan-1" element={<Pemesanan1 />} />
        <Route path="/pemesanan-2" element={<Pemesanan2 />} />
        <Route path="/pembayaran" element={<Pembayaran />} />
        {/* NEW: Payment redirect routes */}
        {/* NEW: Payment redirect routes */}
<Route path="/lanjutkan-pembayaran/:headTransaksiId" element={<LanjutkanPembayaran />} />
        <Route path="/payment-close" element={<PaymentClose />} />
        <Route path="/payment-failed" element={<PaymentFailed />} />

        <Route path="/ubah-sandi" element={<ChangePassword />} />
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
        <Route path="/artikel/detail/:id" element={<ArtikelDetail />} />
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