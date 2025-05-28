'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_artikel', {
      id_artikel: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      judul: {
        type: Sequelize.STRING(255),
      },
      isi: {
        type: Sequelize.TEXT,
      },
      kategori: {
        type: Sequelize.STRING(100),
        defaultValue: 'destinasi',
      },
      nama_penulis: {
        type: Sequelize.STRING(100),
      },
      foto_penulis: {
        type: Sequelize.STRING(255),
      },
      gambar_artikel: {
        type: Sequelize.STRING(225),
      },
      jumlah_pembaca: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      id_admin: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_admin',
          key: 'id_admin',
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
    await queryInterface.dropTable('tabel_artikel');
  },
};
