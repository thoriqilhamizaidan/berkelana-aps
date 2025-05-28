'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_admin', {
      id_admin: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email_admin: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      password_admin: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status_admin: {
        type: Sequelize.STRING(10),
        defaultValue: 'aktif',
      },
      role_admin: {
        type: Sequelize.STRING(10),
        defaultValue: 'admin',
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_admin');
  }
};
