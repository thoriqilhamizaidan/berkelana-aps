'use strict';

const db = require('../models');
const Promo = db.Promo;

// Get all promos
exports.getPromos = async (req, res) => {
  try {
    const promos = await Promo.findAll();
    res.json(promos);
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
    res.json(promo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new promo
exports.createPromo = async (req, res) => {
  try {
    const body = req.body;
    // If file uploaded, set gambar to the filename (relative to /uploads)
    if (req.file) {
      body.gambar = req.file.filename;
    }
    const promo = await Promo.create(body);
    res.status(201).json(promo);
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
    // Update fields
    const body = req.body;
    if (req.file) {
      body.gambar = req.file.filename;
    }
    await promo.update(body);
    res.json(promo);
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