'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Promo extends Model {
    static associate(models) {
    }
  }

  Promo.init({
    id_promo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    judul: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    detail: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kode_promo: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    potongan: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    gambar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    berlakuhingga: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    id_admin: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Promo',
    tableName: 'tabel_promo',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    paranoid: true,
    deletedAt: 'deletedAt',
  });

  return Promo;
};