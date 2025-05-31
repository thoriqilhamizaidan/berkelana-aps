'use strict';

const db = require('../models');
const Promo = db.Promo;

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
    is_active: promoData.deletedAt === null, // Active if not soft deleted
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
    potongan: frontendData.potongan,
    berlakuhingga: frontendData.berlakuHingga,
    id_admin: frontendData.id_admin
  };
};

// Get all promos
exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.findAll();
    const mappedPromos = promos.map(mapPromoToFrontend);
    res.json(mappedPromos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get promo by ID
exports.getPromoById = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    const mappedPromo = mapPromoToFrontend(promo);
    res.json(mappedPromo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new promo
exports.createPromo = async (req, res) => {
  try {
    const dbData = mapFrontendToDatabase(req.body);
    
    // If file uploaded, set gambar to the filename
    if (req.file) {
      dbData.gambar = req.file.filename;
    }
    
    const promo = await Promo.create(dbData);
    const mappedPromo = mapPromoToFrontend(promo);
    res.status(201).json(mappedPromo);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update promo by ID
exports.updatePromo = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    
    const dbData = mapFrontendToDatabase(req.body);
    
    // If file uploaded, set gambar to the filename
    if (req.file) {
      dbData.gambar = req.file.filename;
    }
    
    await promo.update(dbData);
    const updatedPromo = await Promo.findByPk(req.params.id);
    const mappedPromo = mapPromoToFrontend(updatedPromo);
    res.json(mappedPromo);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete promo by ID (HARD DELETE: always remove from DB)
exports.deletePromo = async (req, res) => {
  try {
    const promo = await Promo.findByPk(req.params.id, { paranoid: false });
    if (!promo) {
      return res.status(404).json({ message: 'Promo not found' });
    }
    await promo.destroy({ force: true }); // <-- HARD DELETE
    res.json({ message: 'Promo deleted permanently' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};