// Import models dengan benar
const db = require('../models');
// Debug: lihat apa saja yang ada di db
console.log('Available models:', Object.keys(db));

const User = db.User || db.user; // Coba ambil dengan kedua kemungkinan
const Admin = db.tabel_admin || db.Admin;

// Validasi models
if (!User) {
  console.error('ERROR: User model not found in db');
  console.log('Available models:', Object.keys(db));
}
if (!Admin) {
  console.error('ERROR: Admin model not found in db');
}

const bcrypt = require('bcryptjs'); // Gunakan bcryptjs untuk konsistensi
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { Op } = require('sequelize');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Generate JWT Token
const generateToken = (user, role) => {
  return jwt.sign(
    { 
      id: user.id_user || user.id_admin, 
      email: user.email_user || user.email_admin,
      role: role 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs temporarily (in production, use Redis or database)
const otpStore = new Map();

// Login Controller
exports.login = async (req, res) => {
  console.log('Login endpoint hit'); // Debug log
  console.log('Request body:', req.body); // Debug log
  
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email dan password harus diisi'
      });
    }

    // Check in User table first
    let user = await User.findOne({
      where: { email_user: email }
    });

    if (user) {
      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.pass_user);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Generate token
      const token = generateToken(user, 'user');

        return res.json({
  success: true,
  message: 'Login berhasil',
  role: 'user',
  token,
  user: {
    id: user.id_user,
    email: user.email_user,
    nama: user.nama_user,
    no_hp: user.no_hp_user,
    alamat: user.alamat_user,
    gender: user.gender_user,
    tanggal_lahir: user.tanggallahir_user,
    avatar: user.profil_user,
    profil_user: user.profil_user // ✅ Tambahkan baris ini!
  }
});
    }

    // Check in Admin table
    let admin = await Admin.findOne({
      where: { 
        email_admin: email,
        status_admin: 'aktif' // Only active admins can login
      }
    });

    if (admin) {
      // Check password
      const isPasswordValid = await bcrypt.compare(password, admin.password_admin);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Generate token
      const token = generateToken(admin, admin.role_admin);

      return res.json({
        success: true,
        message: 'Login berhasil',
        role: admin.role_admin,
        token,
        user: {
          id: admin.id_admin,
          email: admin.email_admin,
          role: admin.role_admin
        }
      });
    }

    // User not found
    return res.status(404).json({
      success: false,
      message: 'User tidak ditemukan'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Register Controller - Updated
exports.register = async (req, res) => {
  try {
    const { 
      nama, 
      email, 
      no_hp, 
      password, 
      confirmPassword,
      gender,
      tanggal_lahir,
      alamat 
    } = req.body;

    // Validate input
    if (!nama || !email || !no_hp || !password) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password dan konfirmasi password tidak sama'
      });
    }

    // Check if email already exists in both tables
    const existingUser = await User.findOne({
      where: { email_user: email }
    });

    const existingAdmin = await Admin.findOne({
      where: { email_admin: email }
    });

    if (existingUser || existingAdmin) {
      return res.status(409).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Hash password - JANGAN gunakan hook beforeCreate
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Format tanggal lahir jika ada
    let formattedTanggalLahir = tanggal_lahir;
    if (tanggal_lahir) {
      // Convert dari format YYYY-MM-DD ke DD/MM/YYYY
      const date = new Date(tanggal_lahir);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      formattedTanggalLahir = `${day}/${month}/${year}`;
    }

    // Create new user dengan hooks: false untuk bypass automatic hashing
    const newUser = await User.create({
      nama_user: nama,
      email_user: email,
      no_hp_user: no_hp,
      pass_user: hashedPassword, // Sudah di-hash manual
      gender_user: gender || null,
      tanggallahir_user: formattedTanggalLahir || null,
      alamat_user: alamat || null
    }, {
      hooks: false // PENTING: Disable hooks untuk prevent double hashing
    });

    // Generate token
    const token = generateToken(newUser, 'user');

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      token,
      user: {
        id: newUser.id_user,
        email: newUser.email_user,
        nama: newUser.nama_user,
        no_hp: newUser.no_hp_user,
        gender: newUser.gender_user,
        tanggal_lahir: newUser.tanggallahir_user,
        alamat: newUser.alamat_user,
        avatar: newUser.profil_user
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server',
      error: error.message
    });
  }
};

// Forgot Password - Send OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Check if email exists in User or Admin table
    const user = await User.findOne({ where: { email_user: email } });
    const admin = await Admin.findOne({ where: { email_admin: email } });

    if (!user && !admin) {
      return res.status(404).json({
        success: false,
        message: 'Email tidak terdaftar'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP
    otpStore.set(email, {
      otp,
      expiry: otpExpiry,
      type: user ? 'user' : 'admin',
      id: user ? user.id_user : admin.id_admin
    });

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password - Berkelana',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Reset Password</h2>
          <p>Anda telah meminta untuk mereset password Anda.</p>
          <p>Kode OTP Anda adalah:</p>
          <h1 style="color: #6B46C1; font-size: 32px;">${otp}</h1>
          <p>Kode ini akan kadaluarsa dalam 10 menit.</p>
          <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: 'OTP telah dikirim ke email Anda'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim OTP',
      error: error.message
    });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email dan OTP harus diisi'
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'OTP tidak valid atau telah kadaluarsa'
      });
    }

    if (storedData.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'OTP tidak valid'
      });
    }

    if (new Date() > storedData.expiry) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP telah kadaluarsa'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    // Update stored data with reset token
    otpStore.set(email, {
      ...storedData,
      resetToken,
      resetExpiry
    });

    return res.json({
      success: true,
      message: 'OTP valid',
      resetToken
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal verifikasi OTP',
      error: error.message
    });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi'
      });
    }

    const storedData = otpStore.get(email);

    if (!storedData || storedData.resetToken !== resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Token reset tidak valid'
      });
    }

    if (new Date() > storedData.resetExpiry) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Token reset telah kadaluarsa'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password based on user type
    if (storedData.type === 'user') {
      await User.update(
        { pass_user: hashedPassword },
        { where: { id_user: storedData.id } }
      );
    } else {
      await Admin.update(
        { password_admin: hashedPassword },
        { where: { id_admin: storedData.id } }
      );
    }

    // Clear stored data
    otpStore.delete(email);

    return res.json({
      success: true,
      message: 'Password berhasil direset'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal reset password',
      error: error.message
    });
  }
};

// Change Password (for logged-in users)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Password lama dan baru harus diisi'
      });
    }

    let userData;
    let passwordField;

    if (userRole === 'user') {
      userData = await User.findByPk(userId);
      passwordField = 'pass_user';
    } else {
      userData = await Admin.findByPk(userId);
      passwordField = 'password_admin';
    }

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, userData[passwordField]);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Password lama tidak sesuai'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    userData[passwordField] = hashedPassword;
    await userData.save();

    return res.json({
      success: true,
      message: 'Password berhasil diubah'
    });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengubah password',
      error: error.message
    });
  }
};

// Resend OTP
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email harus diisi'
      });
    }

    // Check if there's an existing OTP request
    const existingData = otpStore.get(email);
    
    if (existingData && new Date() < existingData.expiry) {
      const timeLeft = Math.ceil((existingData.expiry - new Date()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Tunggu ${timeLeft} detik sebelum mengirim ulang OTP`
      });
    }

    // Forward to forgotPassword to generate new OTP
    return exports.forgotPassword(req, res);

  } catch (error) {
    console.error('Resend OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mengirim ulang OTP',
      error: error.message
    });
  }
};

// Get Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'user') {
      const user = await User.findByPk(userId, {
        attributes: { exclude: ['pass_user'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      return res.json({
        success: true,
        user
      });
    } else {
      const admin = await Admin.findByPk(userId, {
        attributes: { exclude: ['password_admin'] }
      });

      if (!admin) {
        return res.status(404).json({
          success: false,
          message: 'Admin tidak ditemukan'
        });
      }

      return res.json({
        success: true,
        user: admin
      });
    }

  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal mendapatkan profil',
      error: error.message
    });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { nama, alamat, no_hp, tanggal_lahir, gender } = req.body;

    if (userRole === 'user') {
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      // Update dengan data yang dikirim dari frontend
      if (nama !== undefined) user.nama_user = nama;
      if (no_hp !== undefined) user.no_hp_user = no_hp;
      if (alamat !== undefined) user.alamat_user = alamat;
      if (gender !== undefined) user.gender_user = gender;
      if (tanggal_lahir !== undefined) user.tanggallahir_user = tanggal_lahir;

      await user.save();

      return res.json({
        success: true,
        message: 'Profil berhasil diperbarui',
       user: {
  id: user.id_user,
  email: user.email_user,
  nama: user.nama_user,
  no_hp: user.no_hp_user,
  alamat: user.alamat_user,
  gender: user.gender_user,
  tanggal_lahir: user.tanggallahir_user,
  avatar: user.profil_user,
  profil_user: user.profil_user // ✅ Tambahkan ini!
}
      });
    } else {
      return res.status(403).json({
        success: false,
        message: 'Admin tidak dapat mengubah profil melalui endpoint ini'
      });
    }

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal memperbarui profil',
      error: error.message
    });
  }
};

// Upload Avatar
exports.uploadAvatar = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || req.user.role !== 'user') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User login required'
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    const userId = req.user.id;
    const filePath = `/uploads/${req.file.filename}`;

    // Update user profile picture
    await User.update(
      { profil_user: filePath },
      { where: { id_user: userId } }
    );

    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['pass_user'] }
    });

    return res.json({
      success: true,
      message: 'Foto profil berhasil diperbarui',
      avatar: filePath,
      user: updatedUser
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    return res.status(500).json({
      success: false,
      message: 'Gagal upload foto profil',
      error: error.message
    });
  }
};