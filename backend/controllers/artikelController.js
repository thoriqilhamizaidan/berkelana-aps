const { tabel_artikel } = require('../models');
const path = require('path');
const fs = require('fs');

// In-memory cache to track recent view increments (prevent rapid duplicate calls)
const viewIncrementCache = new Map();
const CACHE_DURATION = 5000; // 5 seconds

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
  },

  // Enhanced method to increment view count with race condition protection
  async incrementViews(req, res) {
    try {
      const { id } = req.params;
      const userIP = req.ip || req.connection.remoteAddress || 'unknown';
      const cacheKey = `${id}-${userIP}`;
      const now = Date.now();

      // Check if this user recently incremented views for this article
      if (viewIncrementCache.has(cacheKey)) {
        const lastIncrement = viewIncrementCache.get(cacheKey);
        if (now - lastIncrement < CACHE_DURATION) {
          // Return success but don't increment again
          const artikel = await tabel_artikel.findByPk(id);
          return res.json({
            success: true,
            message: 'View count already updated recently',
            data: {
              id_artikel: artikel.id_artikel,
              judul: artikel.judul,
              jumlah_pembaca: artikel.jumlah_pembaca
            }
          });
        }
      }

      // Find the article by ID
      const artikel = await tabel_artikel.findByPk(id);
      
      if (!artikel) {
        return res.status(404).json({ 
          success: false, 
          message: 'Artikel tidak ditemukan' 
        });
      }

      // Use atomic increment to prevent race conditions
      await tabel_artikel.increment('jumlah_pembaca', {
        by: 1,
        where: { id_artikel: id }
      });

      // Cache this increment to prevent rapid duplicates
      viewIncrementCache.set(cacheKey, now);

      // Clean up old cache entries periodically
      if (viewIncrementCache.size > 1000) {
        for (const [key, timestamp] of viewIncrementCache.entries()) {
          if (now - timestamp > CACHE_DURATION) {
            viewIncrementCache.delete(key);
          }
        }
      }

      // Get the updated article data
      const updatedArtikel = await tabel_artikel.findByPk(id);

      // Return the updated article data
      res.json({
        success: true,
        message: 'View count berhasil diperbarui',
        data: {
          id_artikel: updatedArtikel.id_artikel,
          judul: updatedArtikel.judul,
          jumlah_pembaca: updatedArtikel.jumlah_pembaca
        }
      });
      
    } catch (err) {
      console.error('Error incrementing views:', err);
      res.status(500).json({ 
        success: false,
        message: 'Gagal memperbarui view count',
        error: err.message 
      });
    }
  }
};