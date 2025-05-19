// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import PesanTiket from './user/pesantiket'
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket" element={<PesanTiket />} />
        <Route path="/daftar-masuk" element={<LoginForm />} />
        <Route path="/daftar" element={<RegisterForm />} />
        <Route path="/lupa-sandi" element={<ForgotPassword />} />
        <Route path="/ubah-sandi" element={<ChangePassword />} />
        {/* Add these routes to prevent navigation errors */}
        <Route path="/promo" element={<PromoPage />} />
        <Route path="/artikel" element={<Artikel />} />
        <Route path="/artikel/detail" element={<ArtikelDetail />} />
        <Route path="/tiket-saya" element={<TiketSaya />} />
        <Route path="/e-ticket/:bookingCode" element={<ETicket />} />  {/* Add this route */}
        <Route path="/tentang-kami" element={<TentangKami />} />
        <Route path="/syarat-ketentuan" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  )
}

export default App
