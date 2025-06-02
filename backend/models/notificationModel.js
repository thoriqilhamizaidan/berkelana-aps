// models/Notification.js - Create this file
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      // Define associations here if needed
      // Notification.belongsTo(models.Admin, { foreignKey: 'id_admin' });
      // Notification.belongsTo(models.Artikel, { foreignKey: 'id_artikel' });
      // Notification.belongsTo(models.Promo, { foreignKey: 'promo_id' });
    }
  }
  
  Notification.init({
    id_notifikasi: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: 'info'
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    content: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    isi_notif: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    footer: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    id_admin: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    id_artikel: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    promo_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Notification',
    tableName: 'tabel_notifikasi',
    paranoid: true, // Enable soft deletes
    timestamps: true
  });
  
  return Notification;
};