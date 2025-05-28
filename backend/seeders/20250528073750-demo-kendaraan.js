// backend/seeders/YYYYMMDDHHMMSS-demo-kendaraan.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('tabel_kendaraan', [
      {
        tipe_armada: 'Bus',
        nomor_armada: 'ARM001',
        nomor_kendaraan: 'B 1234 XY',
        format_kursi: '2-2',
        kapasitas_kursi: 30,
        nama_kondektur: 'Ahmad Surya',
        nomor_kondektur: '081234567890',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Toilet', 'TV']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tipe_armada: 'Shuttle',
        nomor_armada: 'ARM002',
        nomor_kendaraan: 'B 5678 AB',
        format_kursi: '3-1',
        kapasitas_kursi: 12,
        nama_kondektur: 'Budi Santoso',
        nomor_kondektur: '081987654321',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Reclining Seat']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tipe_armada: 'Bus',
        nomor_armada: 'ARM003',
        nomor_kendaraan: 'B 9012 CD',
        format_kursi: '2-2',
        kapasitas_kursi: 40,
        nama_kondektur: 'Citra Dewi',
        nomor_kondektur: '081122334455',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Charging Port']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tipe_armada: 'Shuttle',
        nomor_armada: 'ARM004',
        nomor_kendaraan: 'B 3456 EF',
        format_kursi: '3-1',
        kapasitas_kursi: 8,
        nama_kondektur: 'Dedi Pratama',
        nomor_kondektur: '081998877665',
        fasilitas: JSON.stringify(['AC', 'WiFi']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tipe_armada: 'Bus',
        nomor_armada: 'ARM005',
        nomor_kendaraan: 'B 7890 GH',
        format_kursi: '2-2',
        kapasitas_kursi: 35,
        nama_kondektur: 'Eka Saputri',
        nomor_kondektur: '081555666777',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'TV', 'Toilet']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        tipe_armada: 'Shuttle',
        nomor_armada: 'ARM006',
        nomor_kendaraan: 'B 1357 IJ',
        format_kursi: '3-1',
        kapasitas_kursi: 10,
        nama_kondektur: 'Farid Hakim',
        nomor_kondektur: '081444333222',
        fasilitas: JSON.stringify(['AC', 'Charging Port']),
        gambar: null,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tabel_kendaraan', null, {});
  }
};