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



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket"  element={<PesanTiket />} />
        {/* Add these routes to prevent navigation errors */}
        <Route path="/promo"  />
        <Route path="/artikel"  element={<Artikel />} />
        <Route path="/artikel/detail" element={<ArtikelDetail />} />
        <Route path="/tiket-saya" element={<TiketSaya />} />
        <Route path="/e-ticket/:bookingCode" element={<ETicket />} />  {/* Add this route */}
        <Route path="/tentang-kami" element={<TentangKami />} />
        <Route path="/daftar-masuk"  />
        <Route path="/syarat-ketentuan" element={<TermsAndConditions />} />
      </Routes>
    </Router>
  )
}

export default App