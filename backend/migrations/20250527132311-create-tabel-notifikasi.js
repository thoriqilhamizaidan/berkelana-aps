'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cek apakah tabel sudah ada terlebih dahulu
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('tabel_notifikasi')) {
      // Buat tabel jika belum ada
      await queryInterface.createTable('tabel_notifikasi', {
        id_notifikasi: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });
    }

    // Cek apakah kolom sudah ada sebelum menambahkannya
    const tableDescription = await queryInterface.describeTable('tabel_notifikasi');
    
    // Tambah kolom type jika belum ada
    if (!tableDescription.type) {
      await queryInterface.addColumn('tabel_notifikasi', 'type', {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'info'
      });
    }
    
    // Tambah kolom title jika belum ada
    if (!tableDescription.title) {
      await queryInterface.addColumn('tabel_notifikasi', 'title', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
    
    // Tambah kolom content jika belum ada
    if (!tableDescription.content) {
      await queryInterface.addColumn('tabel_notifikasi', 'content', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
    
    // Tambah kolom footer jika belum ada
    if (!tableDescription.footer) {
      await queryInterface.addColumn('tabel_notifikasi', 'footer', {
        type: Sequelize.TEXT,
        allowNull: true
      });
    }
    
    // Tambah kolom is_read jika belum ada
    if (!tableDescription.is_read) {
      await queryInterface.addColumn('tabel_notifikasi', 'is_read', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
    }
    
    // Tambah kolom promo_id jika belum ada
    if (!tableDescription.promo_id) {
      await queryInterface.addColumn('tabel_notifikasi', 'promo_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'tabel_promo',
          key: 'id_promo'
        }
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Cek apakah tabel ada sebelum mencoba mendeskripsikannya
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('tabel_notifikasi')) {
      return; // Tabel tidak ada, tidak ada yang perlu di-undo
    }

    // Dapatkan deskripsi tabel SEBELUM menghapus apapun
    const tableDescription = await queryInterface.describeTable('tabel_notifikasi');
    
    // Hapus kolom foreign key terlebih dahulu untuk menghindari masalah constraint
    if (tableDescription.promo_id) {
      await queryInterface.removeColumn('tabel_notifikasi', 'promo_id');
    }
    
    if (tableDescription.is_read) {
      await queryInterface.removeColumn('tabel_notifikasi', 'is_read');
    }
    
    if (tableDescription.footer) {
      await queryInterface.removeColumn('tabel_notifikasi', 'footer');
    }
    
    if (tableDescription.content) {
      await queryInterface.removeColumn('tabel_notifikasi', 'content');
    }
    
    if (tableDescription.title) {
      await queryInterface.removeColumn('tabel_notifikasi', 'title');
    }
    
    if (tableDescription.type) {
      await queryInterface.removeColumn('tabel_notifikasi', 'type');
    }
    
    // Hapus tabel terakhir
    await queryInterface.dropTable('tabel_notifikasi');
  }
};