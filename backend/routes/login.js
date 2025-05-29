const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const { tabel_admin } = require('../models');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await tabel_admin.findOne({ where: { email_admin: email } });
    if (!admin) return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });

    const match = await bcrypt.compare(password, admin.password_admin);
    if (!match) return res.status(401).json({ success: false, message: 'Password salah' });

    return res.json({ success: true, role: admin.role_admin });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
