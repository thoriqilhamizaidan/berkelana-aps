'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Kendaraan extends Model {
    static associate(models) {
      // Define associations here if needed
      Kendaraan.hasMany(models.Jadwal, { 
        foreignKey: 'id_kendaraan',
        as: 'Jadwal'
      });
    }
  }
  
  Kendaraan.init({
    id_kendaraan: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    tipe_armada: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nomor_armada: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    nomor_kendaraan: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    format_kursi: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    kapasitas_kursi: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    nama_kondektur: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    nomor_kondektur: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    fasilitas: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: '[]',
      get() {
        const rawValue = this.getDataValue('fasilitas');
        return rawValue ? JSON.parse(rawValue) : [];
      },
      set(value) {
        this.setDataValue('fasilitas', JSON.stringify(value || []));
      }
    },
    gambar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Kendaraan',
    tableName: 'tabel_kendaraan',
    timestamps: true,
    createdAt: 'createdAt',  // Sesuaikan dengan nama kolom di database (camelCase)
    updatedAt: 'updatedAt',  // Sesuaikan dengan nama kolom di database (camelCase)
    paranoid: true,
    deletedAt: 'deletedAt',
  });
  
  return Kendaraan;
};