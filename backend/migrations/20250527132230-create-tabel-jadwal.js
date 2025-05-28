'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_jadwal', {
      id_jadwal: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      kota_awal: {
        type: Sequelize.STRING(100),
      },
      kota_tujuan: {
        type: Sequelize.STRING(100),
      },
      waktu_keberangkatan: {
        type: Sequelize.DATE,
      },
      waktu_sampai: {
        type: Sequelize.DATE,
      },
      durasi: {
        type: Sequelize.INTEGER,
      },
      harga: {
        type: Sequelize.INTEGER,
      },
      id_promo: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_promo',
          key: 'id_promo',
        },
      },
      id_kendaraan: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_kendaraan',
          key: 'id_kendaraan',
        },
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_jadwal');
  },
};
