'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_notifikasi', {
      id_notifikasi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isi_notif: {
        type: Sequelize.TEXT,
      },
      id_admin: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_admin',
          key: 'id_admin',
        },
      },
      id_artikel: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_artikel',
          key: 'id_artikel',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_notifikasi');
  },
};
