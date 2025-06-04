'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class tabel_detailtransaksi extends Model {
    static associate(models) {
      // Relasi dengan Head Transaksi
      tabel_detailtransaksi.belongsTo(models.tabel_headtransaksi, { 
        foreignKey: 'id_headtransaksi',
        as: 'HeadTransaksi'
      });
      
      // Relasi dengan Jadwal
      tabel_detailtransaksi.belongsTo(models.Jadwal, { 
        foreignKey: 'id_jadwal',
        as: 'Jadwal'
      });
    }
  }

  tabel_detailtransaksi.init({
    id_detailtransaksi: {
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
    id_jadwal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tabel_jadwal',
        key: 'id_jadwal'
      }
    },
    harga_kursi: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    gender: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    nama_penumpang: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    nomor_kursi: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'tabel_detailtransaksi',
    tableName: 'tabel_detailtransaksi',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt'
  });

  return tabel_detailtransaksi;
};