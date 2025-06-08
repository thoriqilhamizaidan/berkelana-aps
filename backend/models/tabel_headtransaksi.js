// 🔧 UPDATED tabel_headtransaksi.js model with payment sync
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tabel_headtransaksi extends Model {
    static associate(models) {
      // Existing associations
      tabel_headtransaksi.belongsTo(models.User, { 
        foreignKey: 'id_user',
        as: 'User'
      });
      
      tabel_headtransaksi.belongsTo(models.Promo, { 
        foreignKey: 'id_promo',
        as: 'Promo'
      });
      
      tabel_headtransaksi.hasMany(models.tabel_detailtransaksi, { 
        foreignKey: 'id_headtransaksi',
        as: 'DetailTransaksi'
      });

      // Payment associations
      tabel_headtransaksi.hasMany(models.tabel_payments, {
        foreignKey: 'id_headtransaksi',
        as: 'Payments'
      });

      // Current payment association
      tabel_headtransaksi.belongsTo(models.tabel_payments, {
        foreignKey: 'last_payment_id',
        as: 'CurrentPayment'
      });
    }

    // ✅ NEW: Sync payment status from payments table
    async syncPaymentStatus() {
      const latestPayment = await this.getPayments({
        order: [['createdAt', 'DESC']],
        limit: 1
      });

      if (latestPayment.length > 0) {
        const payment = latestPayment[0];
        const shouldUpdate = 
          this.payment_status !== payment.transaction_status ||
          this.last_payment_id !== payment.id_payment ||
          this.invoice_id !== payment.order_id;

        if (shouldUpdate) {
          await this.update({
            payment_status: payment.transaction_status,
            last_payment_id: payment.id_payment,
            invoice_id: payment.order_id,
            // Also update main status if payment is complete
            status: ['paid', 'settlement', 'capture'].includes(payment.transaction_status) 
              ? 'paid' 
              : this.status
          });
          
          console.log(`✅ Synced payment status for head_transaksi ${this.id_headtransaksi}: ${payment.transaction_status}`);
        }
      }
      
      return this;
    }

    // Helper methods
    async getActivePayment() {
      return await this.getPayments({
        where: {
          transaction_status: ['pending', 'paid', 'settlement']
        },
        order: [['createdAt', 'DESC']],
        limit: 1
      }).then(payments => payments[0] || null);
    }

    isPaymentComplete() {
      return ['paid', 'settlement', 'capture'].includes(this.payment_status || this.status);
    }

    async getPaymentSummary() {
      const payment = await this.getActivePayment();
      return {
        booking_id: this.id_headtransaksi,
        booking_code: this.booking_code,
        booking_status: this.status,
        payment_status: this.payment_status || payment?.transaction_status || 'no_payment',
        invoice_id: this.invoice_id || payment?.order_id,
        virtual_account: payment?.virtual_account_number || null,
        amount: this.total,
        gateway: payment?.payment_gateway || null,
        expires_at: payment?.expiry_time || null
      };
    }

    getBookingCode() {
      return this.booking_code || `BKL${this.id_headtransaksi}${Date.now().toString().slice(-4)}`;
    }
  }

  tabel_headtransaksi.init({
    id_headtransaksi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'user',
        key: 'id_user'
      }
    },
    nama_pemesan: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    no_hp_pemesan: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email_pemesan: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    id_promo: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tabel_promo',
        key: 'id_promo'
      }
    },
    potongan: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    gambar_bukti: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      validate: {
        isIn: [['pending', 'paid', 'cancelled', 'expired', 'failed']]
      }
    },
    // NEW: Payment-related fields
    payment_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Payment status synced from payments table'
    },
    last_payment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tabel_payments',
        key: 'id_payment'
      }
    },
    invoice_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Current active invoice ID'
    },
    booking_code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'tabel_headtransaksi',
    tableName: 'tabel_headtransaksi',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt',
    
    hooks: {
      afterCreate: async (instance, options) => {
        if (!instance.booking_code) {
          const bookingCode = instance.getBookingCode();
          await instance.update({ booking_code: bookingCode }, { 
            transaction: options.transaction 
          });
        }
      }
    },

    scopes: {
      withPayments: {
        include: [{
          model: sequelize.models.tabel_payments,
          as: 'Payments'
        }]
      },
      withCurrentPayment: {
        include: [{
          model: sequelize.models.tabel_payments,
          as: 'CurrentPayment'
        }]
      },
      complete: {
        include: [
          {
            model: sequelize.models.tabel_detailtransaksi,
            as: 'DetailTransaksi'
          },
          {
            model: sequelize.models.tabel_payments,
            as: 'Payments'
          },
          {
            model: sequelize.models.User,
            as: 'User'
          },
          {
            model: sequelize.models.Promo,
            as: 'Promo'
          }
        ]
      }
    }
  });

  return tabel_headtransaksi;
};