// migrations/YYYYMMDD-add-payment-status-columns.js - FIXED VERSION

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('tabel_headtransaksi');
      
      // Add payment_status column if not exists
      if (!tableDescription.payment_status) {
        console.log('Adding payment_status column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'payment_status', {
          type: Sequelize.STRING(50),
          allowNull: false,  // ✅ FIXED: Removed extra 'b' character
          defaultValue: 'pending',
          comment: 'Payment status synced from payments table'
        });
      }

      // Add last_payment_id column for tracking
      if (!tableDescription.last_payment_id) {
        console.log('Adding last_payment_id column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'last_payment_id', {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tabel_payments',
            key: 'id_payment'
          },
          comment: 'Reference to the latest payment record'
        });
      }

      // Add invoice_id for easy lookup
      if (!tableDescription.invoice_id) {
        console.log('Adding invoice_id column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'invoice_id', {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'Current active invoice ID from payment gateway'
        });
      }

      console.log('✅ Payment status columns added successfully');
    } catch (error) {
      console.error('❌ Error adding payment status columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn('tabel_headtransaksi', 'payment_status');
      await queryInterface.removeColumn('tabel_headtransaksi', 'last_payment_id');
      await queryInterface.removeColumn('tabel_headtransaksi', 'invoice_id');
      console.log('✅ Payment status columns removed successfully');
    } catch (error) {
      console.error('❌ Error removing payment status columns:', error);
      throw error;
    }
  }
};