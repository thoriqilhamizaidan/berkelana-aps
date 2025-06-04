// backend/routes/transaksiRoutes.js
const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');

// Head Transaksi Routes
router.post('/headtransaksi', transaksiController.createHeadTransaksi);
router.put('/headtransaksi/:id', transaksiController.updateHeadTransaksi);
router.get('/headtransaksi/:id', transaksiController.getHeadTransaksiById);

// Detail Transaksi Routes
router.post('/detailtransaksi', transaksiController.createDetailTransaksi);

module.exports = router;