'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.tabel_headtransaksi, { 
        foreignKey: 'id_user',
        as: 'HeadTransaksi'
      });
    }
  }

  User.init({
    id_user: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    email_user: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    nama_user: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    pass_user: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    gender_user: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    tanggallahir_user: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    no_hp_user: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    alamat_user: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    profil_user: {
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'user',
    timestamps: true,
    paranoid: true
    // REMOVE hooks to prevent double hashing
  });

  return User;
};