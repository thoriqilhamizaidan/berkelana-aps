'use strict';
module.exports = (sequelize, DataTypes) => {
  const Artikel = sequelize.define('tabel_artikel', {
    id_artikel: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    judul: DataTypes.STRING,
    isi: DataTypes.TEXT,
    kategori: {
      type: DataTypes.STRING,
      defaultValue: 'destinasi'
    },
    nama_penulis: DataTypes.STRING,
    foto_penulis: DataTypes.STRING,
    gambar_artikel: DataTypes.STRING,
    jumlah_pembaca: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    id_admin: DataTypes.INTEGER
  }, {
    tableName: 'tabel_artikel',
    timestamps: true,
    paranoid: true
  });

  Artikel.associate = function(models) {
    Artikel.belongsTo(models.tabel_admin, { foreignKey: 'id_admin' });
  };

  return Artikel;
};
