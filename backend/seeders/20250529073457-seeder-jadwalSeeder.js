'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    await queryInterface.bulkInsert('tabel_jadwal', [
      {
        kota_awal: 'Jakarta',
        kota_tujuan: 'Bandung',
        waktu_keberangkatan: new Date('2025-06-10 08:00:00'),
        waktu_sampai: new Date('2025-06-10 11:00:00'),
        durasi: 180,
        harga: 150000,
        id_kendaraan: 1, // Bus ARM001
        id_promo: null,
        createdAt: now,
        updatedAt: now
      },
      {
        kota_awal: 'Surabaya',
        kota_tujuan: 'Malang',
        waktu_keberangkatan: new Date('2025-06-10 12:00:00'),
        waktu_sampai: new Date('2025-06-10 15:00:00'),
        durasi: 180,
        harga: 120000,
        id_kendaraan: 2, // Shuttle ARM002
        id_promo: null,
        createdAt: now,
        updatedAt: now
      },
      {
        kota_awal: 'Bandung',
        kota_tujuan: 'Jakarta',
        waktu_keberangkatan: new Date('2025-06-11 07:00:00'),
        waktu_sampai: new Date('2025-06-11 10:00:00'),
        durasi: 180,
        harga: 155000,
        id_kendaraan: 3, // Bus ARM003
        id_promo: null,
        createdAt: now,
        updatedAt: now
      },
      {
        kota_awal: 'Yogyakarta',
        kota_tujuan: 'Solo',
        waktu_keberangkatan: new Date('2025-06-11 09:00:00'),
        waktu_sampai: new Date('2025-06-11 10:30:00'),
        durasi: 90,
        harga: 75000,
        id_kendaraan: 4, // Shuttle ARM004
        id_promo: null,
        createdAt: now,
        updatedAt: now
      },
      {
        kota_awal: 'Jakarta',
        kota_tujuan: 'Surabaya',
        waktu_keberangkatan: new Date('2025-06-12 20:00:00'),
        waktu_sampai: new Date('2025-06-13 08:00:00'),
        durasi: 720,
        harga: 350000,
        id_kendaraan: 5, // Bus ARM005
        id_promo: null,
        createdAt: now,
        updatedAt: now
      },
      {
        kota_awal: 'Semarang',
        kota_tujuan: 'Purwokerto',
        waktu_keberangkatan: new Date('2025-06-12 14:00:00'),
        waktu_sampai: new Date('2025-06-12 17:00:00'),
        durasi: 180,
        harga: 95000,
        id_kendaraan: 6, // Shuttle ARM006
        id_promo: null,
        createdAt: now,
        updatedAt: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('tabel_jadwal', null, {});
  }
};