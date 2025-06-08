'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if column already exists
      const tableDescription = await queryInterface.describeTable('tabel_headtransaksi');
      
      if (!tableDescription.booking_code) {
        console.log('Adding booking_code column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'booking_code', {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: true
        });

        // Add index for booking_code
        console.log('Adding index for booking_code...');
        await queryInterface.addIndex('tabel_headtransaksi', ['booking_code'], {
          name: 'idx_headtransaksi_booking_code'
        });

        console.log('✅ Booking code column and index added successfully');
      } else {
        console.log('ℹ️ Booking code column already exists, skipping...');
      }
    } catch (error) {
      console.error('❌ Error adding booking code column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('tabel_headtransaksi');
      
      if (tableDescription.booking_code) {
        console.log('Removing booking_code column...');
        await queryInterface.removeColumn('tabel_headtransaksi', 'booking_code');
        console.log('✅ Booking code column removed successfully');
      }
    } catch (error) {
      console.error('❌ Error removing booking code column:', error);
      throw error;
    }
  }
};