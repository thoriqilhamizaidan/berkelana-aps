// src/App.jsx
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Homepage from './Homepage'
import PesanTiket from './user/pesantiket'
import Pemesanan1 from './user/pemesanan-1';
import Pemesanan2 from './user/pemesanan-2';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/pesan-tiket" element={<PesanTiket />} />
        <Route path="/cari-tiket"  element={<PesanTiket />} />
        <Route path="/pemesanan-1" element={<Pemesanan1 />} />
        <Route path="/pemesanan-2" element={<Pemesanan2 />} />
        {/* Add these routes to prevent navigation errors */}
        <Route path="/promo"  />
        <Route path="/artikel"  />
        <Route path="/tiket-saya"  />
        <Route path="/tentang-kami"  />
        <Route path="/daftar-masuk"  />
      </Routes>
    </Router>
  )
}

export default App