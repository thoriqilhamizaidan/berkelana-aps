// migrations/20250607030000-create-tabel-payments.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_payments', {
      id_payment: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      id_headtransaksi: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'tabel_headtransaksi',
          key: 'id_headtransaksi',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      order_id: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'Unique order ID from payment gateway'
      },
      gross_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Total amount in IDR'
      },
      payment_gateway: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'doku',
        comment: 'doku, midtrans, etc'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'virtual_account, credit_card, etc'
      },
      transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Transaction ID from payment gateway'
      },
      transaction_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'pending, paid, cancelled, expired, failed'
      },
      fraud_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'accept, challenge, deny'
      },
      snap_token: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Snap token for Midtrans'
      },
      snap_redirect_url: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Redirect URL for payment'
      },
      virtual_account_number: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Virtual Account number for bank transfer'
      },
      how_to_pay_page: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'URL to payment instructions'
      },
      transaction_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When payment was made'
      },
      settlement_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When payment was settled'
      },
      expiry_time: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'When payment expires'
      },
      raw_response: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Full JSON response from payment gateway'
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
    });

    // Add indexes for better performance
    await queryInterface.addIndex('tabel_payments', ['order_id'], {
      name: 'idx_payments_order_id'
    });
    await queryInterface.addIndex('tabel_payments', ['id_headtransaksi'], {
      name: 'idx_payments_head_transaksi'
    });
    await queryInterface.addIndex('tabel_payments', ['transaction_status'], {
      name: 'idx_payments_status'
    });
    await queryInterface.addIndex('tabel_payments', ['payment_gateway'], {
      name: 'idx_payments_gateway'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_payments');
  }
};