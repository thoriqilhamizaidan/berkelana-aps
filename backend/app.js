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
const promoRoutes = require('./routes/promoRoutes');
const transaksiRoutes = require('./routes/transaksiRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const laporanRoutes = require('./routes/laporan');

// Database connection
const db = require('./models');

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3001', 'http://localhost:3000'], // Include Vite default port
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  // Set ngrok-skip-browser-warning header
  res.header('ngrok-skip-browser-warning', 'true');
  next();
});

// Khusus untuk webhook Xendit
app.use('/api/payment/xendit/webhook', (req, res, next) => {
  console.log('🔔 Xendit webhook hit:', req.method, req.url);
  console.log('📋 Headers:', req.headers);
  next();
});

// Serve static files (images)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ========== DASHBOARD API ENDPOINTS - PINDAH KE ATAS ==========
// User count endpoint
app.get('/api/user/count', async (req, res) => {
  try {
    console.log('📊 Fetching user count data...');
    const userCount = await db.User.count();
    const maleCount = await db.User.count({ where: { gender_user: 'Laki-laki' } });
    const femaleCount = await db.User.count({ where: { gender_user: 'Perempuan' } });
    const unknownCount = await db.User.count({ 
      where: { 
        [db.Sequelize.Op.or]: [
          { gender_user: { [db.Sequelize.Op.is]: null } },
          { gender_user: '' },
          { gender_user: { [db.Sequelize.Op.notIn]: ['Laki-laki', 'Perempuan'] } }
        ]
      }
    });
    
    const result = {
      totalUsers: userCount,
      maleUsers: maleCount,
      femaleUsers: femaleCount,
      unknownUsers: unknownCount
    };
    
    console.log('✅ User count result:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error counting users:', error);
    res.status(500).json({
      success: false,
      message: "Error counting users",
      error: error.message
    });
  }
});

// Vehicle count endpoint
app.get('/api/kendaraan/count', async (req, res) => {
  try {
    console.log('📊 Fetching vehicle count data...');
    const vehicleCount = await db.Kendaraan.count();
    const shuttleCount = await db.Kendaraan.count({ where: { tipe_armada: 'Shuttle' } });
    const busCount = await db.Kendaraan.count({ where: { tipe_armada: 'Bus' } });
    
    const result = {
      totalVehicles: vehicleCount,
      shuttle: shuttleCount,
      bus: busCount
    };
    
    console.log('✅ Vehicle count result:', result);
    res.json(result);
  } catch (error) {
    console.error('❌ Error counting vehicles:', error);
    res.status(500).json({
      success: false,
      message: "Error counting vehicles",
      error: error.message
    });
  }
});

// Monthly data endpoint for dashboard
app.get('/api/dashboard/monthly', async (req, res) => {
  try {
    const { year, month } = req.query;
    console.log(`📊 Fetching monthly data for year: ${year}, month: ${month}`);

    let whereClauseUsers = {};
    let whereClauseVehicles = {};

    // Filter by year for users (createdAt)
    if (year) {
      whereClauseUsers.createdAt = {
        [db.Sequelize.Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
      };
    }

    // Filter by year for vehicles (createdAt)
    if (year) {
      whereClauseVehicles.createdAt = {
        [db.Sequelize.Op.between]: [`${year}-01-01 00:00:00`, `${year}-12-31 23:59:59`]
      };
    }

    let monthlyResults = [];

    const monthsToFetch = month && month !== 'all' ? [parseInt(month)] : Array.from({ length: 12 }, (_, i) => i + 1);

    for (const m of monthsToFetch) {
      const startOfMonth = new Date(year, m - 1, 1);
      const endOfMonth = new Date(year, m, 0, 23, 59, 59, 999);

      // User data for the month
      const usersInMonth = await db.User.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });

      const maleUsersInMonth = await db.User.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          },
          gender_user: 'Laki-laki'
        }
      });

      const femaleUsersInMonth = await db.User.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          },
          gender_user: 'Perempuan'
        }
      });

      // Vehicle data for the month
      const vehiclesInMonth = await db.Kendaraan.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          }
        }
      });

      const shuttleInMonth = await db.Kendaraan.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          },
          tipe_armada: 'Shuttle'
        }
      });

      const busInMonth = await db.Kendaraan.count({
        where: {
          createdAt: {
            [db.Sequelize.Op.between]: [startOfMonth, endOfMonth]
          },
          tipe_armada: 'Bus'
        }
      });

      monthlyResults.push({
        month: m,
        users: usersInMonth,
        maleUsers: maleUsersInMonth,
        femaleUsers: femaleUsersInMonth,
        vehicles: vehiclesInMonth,
        shuttle: shuttleInMonth,
        bus: busInMonth
      });
    }

    console.log('✅ Monthly data result:', monthlyResults);
    res.json(monthlyResults);
  } catch (error) {
    console.error('❌ Error fetching monthly data:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching monthly data",
      error: error.message
    });
  }
});


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
      promo: '/api/promo, /api/promos',
      notifications: '/api/notifications',
      transaksi: '/api/headtransaksi, /api/detailtransaksi, /api/payment',
      uploads: '/uploads',
      dashboard: {
        userCount: 'GET /api/user/count',
        vehicleCount: 'GET /api/kendaraan/count',
        monthlyData: 'GET /api/dashboard/monthly' // Menambahkan ini
      }
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
app.use('/api/laporan', laporanRoutes);

// ✅ PROMO ROUTES - Support both endpoints
app.use('/api/promo', promoRoutes);   // For payment validation (/api/promo/validate)
app.use('/api/promos', promoRoutes);  // For admin management (/api/promos)

app.use('/api', transaksiRoutes);     // Payment & transaction routes
app.use('/api/notifications', notificationRoutes);

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
      promo: '/api/promo, /api/promos',
      notifications: '/api/notifications',
      transaksi: '/api/headtransaksi, /api/detailtransaksi, /api/payment',
      dashboard: '/api/user/count, /api/kendaraan/count, /api/dashboard/monthly' // Menambahkan ini
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