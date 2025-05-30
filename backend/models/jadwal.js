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
          model: 'kendaraan',
          key: 'id_kendaraan'
        }
      }
    }, {
      tableName: 'tabel_jadwal',
      timestamps: true,
      paranoid: true
    });
  
    // Menyertakan hubungan dengan model Kendaraan
    Jadwal.associate = (models) => {
      Jadwal.belongsTo(models.Kendaraan, { foreignKey: 'id_kendaraan' });
    };
  
    return Jadwal;
  };
  