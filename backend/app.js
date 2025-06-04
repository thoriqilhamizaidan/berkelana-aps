const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
require('dotenv').config(); // Load environment variables

const app = express();

// Import routes
const kendaraanRoutes = require('./routes/kendaraan');
const jadwalRoutes = require('./routes/jadwal');
const adminRoutes = require('./routes/adminRoutes');
const artikelRoutes = require('./routes/artikelRoutes');
const authRoutes = require('./routes/auth');
const promoRoutes = require('./routes/promoRoutes'); // Merged from main branch
const transaksiRoutes = require('./routes/transaksiRoutes');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'], // Include Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', transaksiRoutes);

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
// Root route untuk testing
app.get('/', (req, res) => {
  res.json({
    message: 'Berkelana APS-5 Backend API',
    version: '1.0.0',
    status: 'Server is running successfully!',
    endpoints: {
      auth: {
        login: 'POST /api/login',
        register: 'POST /api/register',
        forgotPassword: 'POST /api/forgot-password',
        profile: 'GET /api/profile'
      },
      kendaraan: '/api/kendaraan',
      jadwal: '/api/jadwal',
      admin: '/api/admin',
      artikel: '/api/artikel',
      promo: '/api/promos', // Fixed to include promo route from the main branch
      uploads: '/uploads'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', authRoutes); // Semua auth routes
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api', adminRoutes);
app.use('/api', artikelRoutes);
app.use('/api/promos', promoRoutes); // Fixed: Changed from '/api' to '/api/promos'

// Database connection test
const db = require('./models');

// Test koneksi database saat startup
db.sequelize
  .authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    // Log available models
    console.log('📦 Available models:', Object.keys(db).filter(key => key !== 'sequelize' && key !== 'Sequelize'));
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
  });

// 404 handler untuk route yang tidak ditemukan
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: {
      root: '/',
      auth: '/api/login, /api/register, /api/forgot-password',
      kendaraan: '/api/kendaraan',
      jadwal: '/api/jadwal',
      admin: '/api/admin',
      artikel: '/api/artikel',
      promo: '/api/promos' // Fixed: Included promo route in availableEndpoints
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File terlalu besar. Maksimal 5MB.'
      });
    }
  }

  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan server',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access the API at: http://localhost:${PORT}`);
  console.log(`API Documentation available at: http://localhost:${PORT}/`);
});
