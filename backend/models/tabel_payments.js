// models/tabel_payments.js
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tabel_payments extends Model {
    static associate(models) {
      // belongsTo association with tabel_headtransaksi
      this.belongsTo(models.tabel_headtransaksi, {
        foreignKey: 'id_headtransaksi',
        as: 'HeadTransaksi'
      });
    }
  }
  tabel_payments.init({
    id_payment: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_headtransaksi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tabel_headtransaksi',
        key: 'id_headtransaksi'
      }
    },
    order_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    gross_amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    payment_gateway: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'doku'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    transaction_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    transaction_status: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'pending'
    },
    fraud_status: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    snap_token: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    snap_redirect_url: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    virtual_account_number: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    how_to_pay_page: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settlement_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expiry_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    raw_response: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue('raw_response');
        return value ? JSON.parse(value) : null;
      },
      set(value) {
        this.setDataValue('raw_response', JSON.stringify(value));
      }
    }
  }, {
    sequelize,
    modelName: 'tabel_payments',
    tableName: 'tabel_payments',
    paranoid: true, // Enables soft deletes
    timestamps: true,
    indexes: [
      {
        fields: ['order_id']
      },
      {
        fields: ['id_headtransaksi']
      },
      {
        fields: ['transaction_status']
      },
      {
        fields: ['payment_gateway']
      }
    ]
  });

  return tabel_payments;
};