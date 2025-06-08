'use strict';

const db = require('../models');
const Promo = db.Promo;
const notificationController = require('./NotificationController');

// Helper function to map database fields to frontend expected fields
const mapPromoToFrontend = (promo) => {
  if (!promo) return null;
  const promoData = promo.toJSON ? promo.toJSON() : promo;
  return {
    id: promoData.id_promo,
    title: promoData.judul,
    details: promoData.detail,
    code: promoData.kode_promo,
    potongan: promoData.potongan,
    image: promoData.gambar ? `/uploads/${promoData.gambar}` : null,
    berlakuHingga: promoData.berlakuhingga,
    id_admin: promoData.id_admin,
    is_active: !promoData.deletedAt, // Active if not soft-deleted
    createdAt: promoData.createdAt,
    updatedAt: promoData.updatedAt
  };
};

// Helper function to map frontend fields to database fields
const mapFrontendToDatabase = (frontendData) => {
  return {
    judul: frontendData.title,
    detail: frontendData.details,
    kode_promo: frontendData.code,
    potongan: parseInt(frontendData.potongan) || 0,
    berlakuhingga: frontendData.berlakuHingga ? new Date(frontendData.berlakuHingga) : null,
    id_admin: parseInt(frontendData.id_admin) || null
  };
};

// Get all promos (including soft deleted for status management)
exports.getPromos = async (req, res) => {
  try {
    console.log('Getting all promos...');
    
    // Get all promos including soft deleted
    const promos = await Promo.findAll({
      paranoid: false, // Include soft deleted records
      order: [['createdAt', 'DESC']]
    });
    
    console.log(`Found ${promos.length} promos in database`);
    
    const mappedPromos = promos.map(promo => mapPromoToFrontend(promo));
    
    console.log(`Mapped ${mappedPromos.length} promos for frontend`);
    
    res.json(mappedPromos);
  } catch (error) {
    console.error('Error getting promos:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch promos',
      error: error.message 
    });
  }
};

// Get promo by ID
exports.getPromoById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Getting promo by ID: ${id}`);
    
    const promo = await Promo.findByPk(id, {
      paranoid: false // Include soft deleted
    });
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: 'Promo not found' 
      });
    }
    
    const mappedPromo = mapPromoToFrontend(promo);
    res.json(mappedPromo);
  } catch (error) {
    console.error('Error getting promo by ID:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch promo',
      error: error.message 
    });
  }
};

// Create new promo
exports.createPromo = async (req, res) => {
  try {
    console.log('Creating new promo with data:', req.body);
    console.log('Uploaded file:', req.file);
    
    // Map frontend data to database format
    const dbData = mapFrontendToDatabase(req.body);
    
    // Add image filename if uploaded
    if (req.file) {
      dbData.gambar = req.file.filename;
    }
    
    console.log('Database data to insert:', dbData);
    
    const promo = await Promo.create(dbData);
    console.log('Created promo:', promo.toJSON());
    
    const mappedPromo = mapPromoToFrontend(promo);
    
    // Create notification for new promo
    try {
      await notificationController.createPromoNotification(mappedPromo);
      console.log('Notification created for new promo');
    } catch (notifError) {
      console.error('Error creating promo notification:', notifError);
      // Don't fail the promo creation if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Promo created successfully',
      data: mappedPromo
    });
  } catch (error) {
    console.error('Error creating promo:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to create promo',
      error: error.message 
    });
  }
};

// Update promo by ID
exports.updatePromo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Updating promo ID: ${id} with data:`, req.body);
    
    const promo = await Promo.findByPk(id, {
      paranoid: false // Can update soft deleted promos
    });
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: 'Promo not found' 
      });
    }
    
    // Map frontend data to database format
    const dbData = mapFrontendToDatabase(req.body);
    
    // Add image filename if uploaded
    if (req.file) {
      dbData.gambar = req.file.filename;
    }
    
    console.log('Database data to update:', dbData);
    
    await promo.update(dbData);
    
    // Fetch updated promo
    const updatedPromo = await Promo.findByPk(id, {
      paranoid: false
    });
    
    const mappedPromo = mapPromoToFrontend(updatedPromo);
    
    res.json({
      success: true,
      message: 'Promo updated successfully',
      data: mappedPromo
    });
  } catch (error) {
    console.error('Error updating promo:', error);
    res.status(400).json({ 
      success: false,
      message: 'Failed to update promo',
      error: error.message 
    });
  }
};

// Toggle active status (soft delete/restore)
exports.toggleActivePromo = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    console.log(`Toggling promo ID: ${id} to active: ${is_active}`);
    
    const promo = await Promo.findByPk(id, {
      paranoid: false // Find including soft deleted
    });
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: 'Promo not found' 
      });
    }
    
    if (is_active) {
      // Activate: restore from soft delete
      await promo.restore();
      console.log(`Promo ID: ${id} activated (restored)`);
    } else {
      // Deactivate: soft delete
      await promo.destroy();
      console.log(`Promo ID: ${id} deactivated (soft deleted)`);
    }
    
    // Fetch updated promo
    const updatedPromo = await Promo.findByPk(id, {
      paranoid: false
    });
    
    const mappedPromo = mapPromoToFrontend(updatedPromo);
    
    res.json({
      success: true,
      message: `Promo ${is_active ? 'activated' : 'deactivated'} successfully`,
      data: mappedPromo
    });
  } catch (error) {
    console.error('Error toggling promo active status:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to toggle promo status',
      error: error.message 
    });
  }
};

// Delete promo by ID (HARD DELETE)
exports.deletePromo = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`Hard deleting promo ID: ${id}`);
    
    const promo = await Promo.findByPk(id, { 
      paranoid: false 
    });
    
    if (!promo) {
      return res.status(404).json({ 
        success: false,
        message: 'Promo not found' 
      });
    }
    
    // Hard delete (permanent removal)
    await promo.destroy({ force: true });
    
    console.log(`Promo ID: ${id} permanently deleted`);
    
    res.json({ 
      success: true,
      message: 'Promo deleted permanently' 
    });
  } catch (error) {
    console.error('Error deleting promo:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete promo',
      error: error.message 
    });
  }
};
// ADD THIS TO promoController.js

// Validate promo code for payment

// Validate promo code for payment  
exports.validatePromoCode = async (req, res) => {
  try {
    const { kode_promo, total_amount } = req.body;  // ✅ Match frontend
    
    console.log(`Validating promo code: ${kode_promo} for amount: ${total_amount}`);
    
    if (!kode_promo || !total_amount) {
      return res.status(400).json({
        success: false,
        message: 'Kode promo dan total amount harus diisi'
      });
    }
    
    // Find active promo by code
    const promo = await Promo.findOne({
      where: { 
        kode_promo: kode_promo.toUpperCase().trim(),
        deletedAt: null // Only active promos
      }
    });

    if (!promo) {
      return res.status(404).json({
        success: false,
        message: 'Kode promo tidak valid atau tidak ditemukan'
      });
    }

    // Check if promo is still valid (not expired)
    if (promo.berlakuhingga && new Date() > new Date(promo.berlakuhingga)) {
      return res.status(400).json({
        success: false,
        message: 'Kode promo sudah kedaluwarsa'
      });
    }

    // Calculate discount based on jenis_promo
    let discountAmount = 0;
let jenis_promo = 'nominal';

// If potongan <= 100, assume it's percentage
if (promo.potongan <= 100) {
  jenis_promo = 'persen';
  discountAmount = Math.floor((total_amount * promo.potongan) / 100);
} else {
  // If potongan > 100, assume it's nominal
  jenis_promo = 'nominal';
  discountAmount = promo.potongan;
}
    
    // Ensure discount doesn't exceed total
    discountAmount = Math.min(discountAmount, total_amount);
    const finalAmount = Math.max(total_amount - discountAmount, 0);

    console.log(`Promo valid! Discount: ${discountAmount}, Final: ${finalAmount}`);

    res.json({
      success: true,
      message: 'Kode promo berhasil diterapkan!',
      data: {
        id_promo: promo.id_promo,
        kode_promo: promo.kode_promo,
        nama_promo: promo.judul,        // ✅ Match frontend expectation
        jenis_promo: jenis_promo, // ✅ Add this for calculation
        potongan: promo.potongan,       // ✅ Add this for calculation
        original_amount: total_amount,
        discount_amount: discountAmount,
        final_amount: finalAmount,
        berlakuhingga: promo.berlakuhingga
      }
    });

  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memvalidasi kode promo',
      error: error.message
    });
  }
};