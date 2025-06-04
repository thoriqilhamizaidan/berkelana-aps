'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tabel_headtransaksi extends Model {
    static associate(models) {
      // Relasi dengan User
      tabel_headtransaksi.belongsTo(models.User, { 
        foreignKey: 'id_user',
        as: 'User'
      });
      
      // Relasi dengan Promo
      tabel_headtransaksi.belongsTo(models.Promo, { 
        foreignKey: 'id_promo',
        as: 'Promo'
      });
      
      // Relasi dengan Detail Transaksi (One to Many)
      tabel_headtransaksi.hasMany(models.tabel_detailtransaksi, { 
        foreignKey: 'id_headtransaksi',
        as: 'DetailTransaksi'
      });
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
      defaultValue: 'pending'
    }
  }, {
    sequelize,
    modelName: 'tabel_headtransaksi',
    tableName: 'tabel_headtransaksi',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt'
  });

  return tabel_headtransaksi;
};