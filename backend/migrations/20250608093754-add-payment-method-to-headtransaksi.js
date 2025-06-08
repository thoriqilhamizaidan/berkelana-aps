// 🔧 FIX 4: Create new migration file
// File: backend/migrations/YYYYMMDD-add-payment-method-to-headtransaksi.js

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Check if columns already exist
      const tableDescription = await queryInterface.describeTable('tabel_headtransaksi');
      
      if (!tableDescription.payment_method) {
        console.log('Adding payment_method column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'payment_method', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Payment method used (xendit_invoice, credit_card, virtual_account, etc)'
        });
      }

      if (!tableDescription.paid_at) {
        console.log('Adding paid_at column...');
        await queryInterface.addColumn('tabel_headtransaksi', 'paid_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'When payment was completed'
        });
      }

      // Add indexes for better performance
      try {
        await queryInterface.addIndex('tabel_headtransaksi', ['payment_method'], {
          name: 'idx_headtransaksi_payment_method'
        });
        console.log('✅ Payment method column and index added successfully');
      } catch (indexError) {
        console.log('ℹ️ Index might already exist, skipping...');
      }

    } catch (error) {
      console.error('❌ Error adding payment method column:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDescription = await queryInterface.describeTable('tabel_headtransaksi');
      
      if (tableDescription.payment_method) {
        console.log('Removing payment_method column...');
        await queryInterface.removeColumn('tabel_headtransaksi', 'payment_method');
      }
      
      if (tableDescription.paid_at) {
        console.log('Removing paid_at column...');
        await queryInterface.removeColumn('tabel_headtransaksi', 'paid_at');
      }
      
      console.log('✅ Payment method columns removed successfully');
    } catch (error) {
      console.error('❌ Error removing payment method columns:', error);
      throw error;
    }
  }
};