const express = require('express');
const router = express.Router();
const artikelController = require('../controllers/artikelController');
const multer = require('multer');
const path = require('path');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Setup upload
const storage = multer.diskStorage({
  destination: './public/uploads/artikel',
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Use .fields to handle multiple file inputs
const uploadFields = upload.fields([
  { name: 'gambar_artikel', maxCount: 1 },
  { name: 'foto_penulis', maxCount: 1 }
]);

// Public routes - anyone can view
router.get('/artikel', artikelController.getAll);
router.get('/artikel/:id', artikelController.getById);

// Admin only routes - need authentication and admin role
router.post('/artikel', authenticate, authorizeAdmin, uploadFields, artikelController.create);
router.put('/artikel/:id', authenticate, authorizeAdmin, uploadFields, artikelController.update);
router.delete('/artikel/:id', authenticate, authorizeAdmin, artikelController.delete);

module.exports = router;