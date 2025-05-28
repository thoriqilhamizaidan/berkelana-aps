'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_kendaraan', {
      id_kendaraan: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      tipe_armada: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      nomor_armada: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      nomor_kendaraan: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true,
      },
      format_kursi: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      kapasitas_kursi: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      nama_kondektur: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      nomor_kondektur: {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      fasilitas: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '[]',
      },
      gambar: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('tabel_kendaraan', ['tipe_armada']);
    await queryInterface.addIndex('tabel_kendaraan', ['nomor_armada']);
    await queryInterface.addIndex('tabel_kendaraan', ['nomor_kendaraan']);
    await queryInterface.addIndex('tabel_kendaraan', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_kendaraan');
  },
};