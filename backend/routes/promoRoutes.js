'use strict';

const express = require('express');
const router = express.Router();
const promoController = require('../controllers/promoController');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: function (req, file, cb) {
    // Save with original name or customize as needed
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/validate', promoController.validatePromoCode);
// Get all promos
router.get('/', promoController.getPromos);



// Get promo by ID
router.get('/:id', promoController.getPromoById);

// Create new promo (with image upload)
router.post('/', upload.single('gambar'), promoController.createPromo);

// Update promo by ID (with image upload)
router.put('/:id', upload.single('gambar'), promoController.updatePromo);

// Toggle active status promo (NEW ROUTE)
router.post('/:id/toggle-active', promoController.toggleActivePromo);

// Delete promo by ID
router.delete('/:id', promoController.deletePromo);

module.exports = router;