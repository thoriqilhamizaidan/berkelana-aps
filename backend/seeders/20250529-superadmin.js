'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('1234', 10); // ← password superadmin

    await queryInterface.bulkInsert('tabel_admin', [{
      email_admin: 'superadmin@gmail.com',
      password_admin: hashedPassword, // ✅ PAKAI hash di sini!
      role_admin: 'superadmin',
      status_admin: 'aktif',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tabel_admin', { email_admin: 'superadmin@gmail.com' }, {});
  }
};
