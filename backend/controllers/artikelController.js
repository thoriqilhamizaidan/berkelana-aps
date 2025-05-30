const { tabel_artikel } = require('../models');
const path = require('path');
const fs = require('fs');

module.exports = {
  async getAll(req, res) {
    try {
      const artikel = await tabel_artikel.findAll();
      res.json(artikel);
    } catch (err) {
      res.status(500).json({ error: 'Gagal mengambil data artikel' });
    }
  },

  async getById(req, res) {
    try {
      const artikel = await tabel_artikel.findByPk(req.params.id);
      if (!artikel) return res.status(404).json({ error: 'Artikel tidak ditemukan' });
      res.json(artikel);
    } catch (err) {
      res.status(500).json({ error: 'Gagal mengambil artikel' });
    }
  },

  async create(req, res) {
    try {
      const { judul, isi, kategori, nama_penulis, id_admin } = req.body;
      const gambar_artikel = req.files?.gambar_artikel?.[0]?.filename || null;
      const foto_penulis = req.files?.foto_penulis?.[0]?.filename || null;

      const newArtikel = await tabel_artikel.create({
        judul,
        isi,
        kategori,
        nama_penulis,
        id_admin,
        gambar_artikel,
        foto_penulis
      });

      res.status(201).json(newArtikel);
    } catch (err) {
      res.status(500).json({ error: 'Gagal menambahkan artikel' });
    }
  },

  async update(req, res) {
    try {
      const artikel = await tabel_artikel.findByPk(req.params.id);
      if (!artikel) return res.status(404).json({ error: 'Artikel tidak ditemukan' });

      const { judul, isi, kategori, nama_penulis } = req.body;
      const gambar_artikel = req.files?.gambar_artikel?.[0]?.filename || artikel.gambar_artikel;
      const foto_penulis = req.files?.foto_penulis?.[0]?.filename || artikel.foto_penulis;

      await artikel.update({
        judul,
        isi,
        kategori,
        nama_penulis,
        gambar_artikel,
        foto_penulis
      });

      res.json(artikel);
    } catch (err) {
      res.status(500).json({ error: 'Gagal memperbarui artikel' });
    }
  },

  async delete(req, res) {
    try {
      const artikel = await tabel_artikel.findByPk(req.params.id);
      if (!artikel) return res.status(404).json({ error: 'Artikel tidak ditemukan' });

      await artikel.destroy();
      res.json({ message: 'Artikel berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ error: 'Gagal menghapus artikel' });
    }
  }
};
