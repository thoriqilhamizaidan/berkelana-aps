'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tabel_detailtransaksi', 'nomor_kursi', {
      type: Sequelize.STRING(10),
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tabel_detailtransaksi', 'nomor_kursi');
  }
};