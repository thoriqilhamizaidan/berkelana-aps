// File: backend/migrations/[timestamp]-add-nomor-kursi-to-detailtransaksi.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('tabel_detailtransaksi');
      
      if (!tableDescription.nomor_kursi) {
        console.log('Adding nomor_kursi column to tabel_detailtransaksi...');
        await queryInterface.addColumn('tabel_detailtransaksi', 'nomor_kursi', {
          type: Sequelize.STRING(10),
          allowNull: true,
          comment: 'Nomor kursi yang dipilih penumpang (contoh: 1A, 2B, dst)'
        });

        // Add index for nomor_kursi
        console.log('Adding index for nomor_kursi...');
        await queryInterface.addIndex('tabel_detailtransaksi', ['nomor_kursi'], {
          name: 'idx_detailtransaksi_nomor_kursi'
        });

        // Add composite index for jadwal + kursi untuk cek duplikasi
        await queryInterface.addIndex('tabel_detailtransaksi', ['id_jadwal', 'nomor_kursi'], {
          name: 'idx_detailtransaksi_jadwal_kursi'
        });

        console.log('✅ nomor_kursi column and indexes added successfully');
      } else {
        console.log('ℹ️ nomor_kursi column already exists, skipping...');
      }
    } catch (error) {
      console.error('❌ Error adding nomor_kursi column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('tabel_detailtransaksi');
      
      if (tableDescription.nomor_kursi) {
        console.log('Removing nomor_kursi column...');
        await queryInterface.removeColumn('tabel_detailtransaksi', 'nomor_kursi');
        console.log('✅ nomor_kursi column removed successfully');
      }
    } catch (error) {
      console.error('❌ Error removing nomor_kursi column:', error);
      throw error;
    }
  }
};