'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('tabel_promo', {
      id_promo: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      judul: {
        type: Sequelize.STRING(50),
      },
      detail: {
        type: Sequelize.TEXT,
      },
      kode_promo: {
        type: Sequelize.STRING(20),
      },
      potongan: {
        type: Sequelize.INTEGER,
      },
      gambar: {
        type: Sequelize.STRING(255),
      },
      berlakuhingga: {
        type: Sequelize.DATE,
      },
      id_admin: {
        type: Sequelize.INTEGER,
        references: {
          model: 'tabel_admin',
          key: 'id_admin',
        },
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,  // Use Sequelize.NOW for current timestamp
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
    });

    // Check if is_active column exists, if not add it
    const tableDescription = await queryInterface.describeTable('tabel_promo');
    
    if (!tableDescription.is_active) {
      await queryInterface.addColumn('tabel_promo', 'is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false
      });
    }
  },
  down: async (queryInterface, Sequelize) => {
  const tableDescription = await queryInterface.describeTable('tabel_promo');

  if (tableDescription.is_active) {
    await queryInterface.removeColumn('tabel_promo', 'is_active');
  }

  await queryInterface.dropTable('tabel_promo');
}
};