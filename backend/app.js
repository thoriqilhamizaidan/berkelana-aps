// backend/app.js atau backend/index.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const app = express();

// Import routes
const kendaraanRoutes = require('./routes/kendaraan');
const jadwalRoutes = require('./routes/jadwal');
const loginRoutes = require('./routes/login');
const adminRoutes = require('./routes/adminRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
// Root route untuk testing
app.get('/', (req, res) => {
  res.json({
    message: 'Berkelana APS-6 Backend API',
    version: '1.0.0',
    status: 'Server is running successfully!',
    endpoints: {
      kendaraan: '/api/kendaraan',
      jadwal: '/api/jadwal',
      login: '/api/login',
      admin: '/api/admin',
      uploads: '/uploads'
    },
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/kendaraan', kendaraanRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api', loginRoutes); 
app.use('/api', adminRoutes);

// 404 handler untuk route yang tidak ditemukan
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    availableEndpoints: {
      root: '/',
      kendaraan: '/api/kendaraan',
      jadwal: '/api/jadwal',
      login: '/api/login',
      admin: '/api/admin'
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