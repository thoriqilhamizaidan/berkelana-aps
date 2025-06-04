// models/jadwal.js
module.exports = (sequelize, DataTypes) => {
  const Jadwal = sequelize.define('Jadwal', {
    id_jadwal: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    kota_awal: DataTypes.STRING,
    kota_tujuan: DataTypes.STRING,
    waktu_keberangkatan: DataTypes.DATE,
    waktu_sampai: DataTypes.DATE,
    durasi: DataTypes.INTEGER,
    harga: DataTypes.INTEGER,
    id_promo: DataTypes.INTEGER,
    id_kendaraan: {
      type: DataTypes.INTEGER,
      references: {
        model: 'tabel_kendaraan',
        key: 'id_kendaraan'
      }
    }
  }, {
    tableName: 'tabel_jadwal',
    timestamps: true,
    paranoid: true
  });

  // Associations
  Jadwal.associate = (models) => {
    // Relasi dengan Kendaraan
    Jadwal.belongsTo(models.Kendaraan, { 
      foreignKey: 'id_kendaraan',
      as: 'Kendaraan'  // ← ALIAS INI
      });
    
    // Relasi dengan Promo
    Jadwal.belongsTo(models.Promo, { 
      foreignKey: 'id_promo',
      as: 'Promo'
    });
    
    // Relasi dengan Detail Transaksi
    Jadwal.hasMany(models.tabel_detailtransaksi, { 
      foreignKey: 'id_jadwal',
      as: 'DetailTransaksi'
    });
  };

  return Jadwal;
};