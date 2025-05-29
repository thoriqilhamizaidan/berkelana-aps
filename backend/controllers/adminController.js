const { tabel_admin } = require('../models');
const bcrypt = require('bcryptjs');

module.exports = {
  getAllAdmins: async (req, res) => {
    try {
      const admins = await tabel_admin.findAll();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ message: 'Error mengambil data admin', error });
    }
  },

  addAdmin: async (req, res) => {
    try {
      const { email_admin, password_admin, status_admin, role_admin } = req.body;

      const hashedPassword = await bcrypt.hash(password_admin, 10);
      const newAdmin = await tabel_admin.create({
        email_admin,
        password_admin: hashedPassword,
        status_admin,
        role_admin: role_admin || 'admin'
      });

      res.status(201).json(newAdmin);
    } catch (error) {
      res.status(500).json({ message: 'Gagal menambahkan admin', error });
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const { email_admin, password_admin, status_admin } = req.body;

      const admin = await tabel_admin.findByPk(id);
      if (!admin) return res.status(404).json({ message: 'Admin tidak ditemukan' });

      admin.email_admin = email_admin || admin.email_admin;
      admin.status_admin = status_admin || admin.status_admin;

      if (password_admin) {
        admin.password_admin = await bcrypt.hash(password_admin, 10);
      }

      await admin.save();
      res.json(admin);
    } catch (error) {
      res.status(500).json({ message: 'Gagal memperbarui admin', error });
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await tabel_admin.findByPk(id);
      if (!admin) return res.status(404).json({ message: 'Admin tidak ditemukan' });

      await admin.destroy();
      res.json({ message: 'Admin berhasil dihapus' });
    } catch (error) {
      res.status(500).json({ message: 'Gagal menghapus admin', error });
    }
  }
};
