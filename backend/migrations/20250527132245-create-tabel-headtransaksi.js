'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_headtransaksi', {
      id_headtransaksi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_user: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user',
          key: 'id_user',
        },
      },
      nama_pemesan: {
        type: Sequelize.STRING(100),
      },
      no_hp_pemesan: {
        type: Sequelize.STRING(100),
      },
      email_pemesan: {
        type: Sequelize.STRING(100),
      },
      id_promo: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_promo',
          key: 'id_promo',
        },
      },
      potongan: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      gambar_bukti: {
        type: Sequelize.STRING(255),
      },
      status: {
        type: Sequelize.STRING(50),
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_headtransaksi');
  },
};
