// Create new migration file: 
// migrations/20250602000000-fix-notification-table.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Cek apakah tabel sudah ada
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
        type: {
          type: Sequelize.STRING(20),
          allowNull: true,
          defaultValue: 'info'
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        content: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        isi_notif: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        footer: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        id_admin: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        id_artikel: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        promo_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'tabel_promo',
            key: 'id_promo'
          }
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        },
        updatedAt: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          allowNull: false
        }
      });
    } else {
      // Jika tabel sudah ada, tambahkan kolom yang missing
      const tableDescription = await queryInterface.describeTable('tabel_notifikasi');
      
      if (!tableDescription.isi_notif) {
        await queryInterface.addColumn('tabel_notifikasi', 'isi_notif', {
          type: Sequelize.TEXT,
          allowNull: true
        });
      }
      
      if (!tableDescription.id_admin) {
        await queryInterface.addColumn('tabel_notifikasi', 'id_admin', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
      }
      
      if (!tableDescription.id_artikel) {
        await queryInterface.addColumn('tabel_notifikasi', 'id_artikel', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
      }
      
      if (!tableDescription.deletedAt) {
        await queryInterface.addColumn('tabel_notifikasi', 'deletedAt', {
          type: Sequelize.DATE,
          allowNull: true
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('tabel_notifikasi');
  }
};