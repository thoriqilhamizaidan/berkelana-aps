'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
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
        createdAt: now,
        updatedAt: now
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
        createdAt: now,
        updatedAt: now
      },
      {
        tipe_armada: 'Bus',
        nomor_armada: 'ARM003',
        nomor_kendaraan: 'B 9012 CD',
        format_kursi: '2-2',
        kapasitas_kursi: 40,
        nama_kondektur: 'Dedi Prasetyo',
        nomor_kondektur: '081234567891',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Toilet', 'TV', 'USB Charger']),
        gambar: null,
        createdAt: now,
        updatedAt: now
      },
      {
        tipe_armada: 'Shuttle',
        nomor_armada: 'ARM004',
        nomor_kendaraan: 'B 3456 EF',
        format_kursi: '2-2',
        kapasitas_kursi: 16,
        nama_kondektur: 'Eko Susanto',
        nomor_kondektur: '081987654322',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Reclining Seat', 'Snack']),
        gambar: null,
        createdAt: now,
        updatedAt: now
      },
      {
        tipe_armada: 'Bus',
        nomor_armada: 'ARM005',
        nomor_kendaraan: 'B 7890 GH',
        format_kursi: '2-3',
        kapasitas_kursi: 50,
        nama_kondektur: 'Fajar Hidayat',
        nomor_kondektur: '081234567892',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Toilet', 'TV', 'Blanket']),
        gambar: null,
        createdAt: now,
        updatedAt: now
      },
      {
        tipe_armada: 'Shuttle',
        nomor_armada: 'ARM006',
        nomor_kendaraan: 'B 2345 IJ',
        format_kursi: '2-1',
        kapasitas_kursi: 9,
        nama_kondektur: 'Gunawan Putra',
        nomor_kondektur: '081987654323',
        fasilitas: JSON.stringify(['AC', 'WiFi', 'Leather Seat', 'Personal TV']),
        gambar: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tabel_kendaraan', null, {});
  }
};