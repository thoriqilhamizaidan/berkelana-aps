const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const db = require('../models');

// 📁 Konfigurasi penyimpanan avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './public/uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `user_${req.user.id}_${Date.now()}${extension}`;
    cb(null, filename);
  }
});

// ✅ Filter file agar hanya gambar yang diterima
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File harus berupa gambar (JPEG, PNG, GIF, WebP)'), false);
  }
};

// ✅ Setup multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maks 5MB
    files: 1
  }
});

// 📌 Public endpoints
router.post('/login', authController.login);
router.post('/register', authController.register);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOTP);
router.post('/reset-password', authController.resetPassword);
router.post('/resend-otp', authController.resendOTP);

// 📌 Protected endpoints
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/change-password', authenticate, authController.changePassword);

// 📤 Upload avatar endpoint (revisi fix)
router.post('/upload-avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    console.log('🔐 User payload:', req.user);

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Tidak ada file yang diupload' });
    }

    const userId = req.user.id;
    const userRole = req.user.role;
    const isUser = userRole === 'user';
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    let userRecord;
    let oldAvatarPath = null;

    if (isUser) {
      userRecord = await db.User.findByPk(userId);
      if (!userRecord) throw new Error('User tidak ditemukan');
      oldAvatarPath = userRecord.profil_user;

      await userRecord.update({
        profil_user: avatarPath,
        updatedAt: new Date()
      });

    } else {
      userRecord = await db.tabel_admin.findByPk(userId);
      if (!userRecord) throw new Error('Admin tidak ditemukan');
      oldAvatarPath = userRecord.profil_admin;

      await userRecord.update({
        profil_admin: avatarPath,
        updatedAt: new Date()
      });
    }

    // 🧹 Hapus avatar lama jika ada
    if (oldAvatarPath && oldAvatarPath !== avatarPath) {
      const oldPath = path.join(__dirname, '..', 'public', oldAvatarPath);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    res.json({
      success: true,
      message: 'Avatar berhasil diupload',
      avatar: avatarPath,
      user: {
        id: userId,
        role: userRole,
        nama: isUser ? userRecord.nama_user : userRecord.nama_admin
      }
    });

  } catch (error) {
    console.error('❌ Upload avatar error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
