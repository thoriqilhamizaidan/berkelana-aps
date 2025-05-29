'use strict';

module.exports = (sequelize, DataTypes) => {
  const tabel_admin = sequelize.define('tabel_admin', {
    id_admin: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email_admin: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_admin: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status_admin: {
      type: DataTypes.STRING(10),
      defaultValue: 'aktif'
    },
    role_admin: {
      type: DataTypes.STRING(10),
      defaultValue: 'admin'
    }
  }, {
    tableName: 'tabel_admin',
    timestamps: true,
    paranoid: true
  });

  return tabel_admin;
};
