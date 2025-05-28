'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_detailtransaksi', {
      id_detailtransaksi: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_headtransaksi: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_headtransaksi',
          key: 'id_headtransaksi',
        },
      },
      id_jadwal: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_jadwal',
          key: 'id_jadwal',
        },
      },
      harga_kursi: {
        type: Sequelize.INTEGER,
      },
      gender: {
        type: Sequelize.STRING(10),
      },
      nama_penumpang: {
        type: Sequelize.STRING(100),
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
    await queryInterface.dropTable('tabel_detailtransaksi');
  },
};
