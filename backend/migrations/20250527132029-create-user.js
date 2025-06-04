'use strict';


module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('user', {
      id_user: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      email_user: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      nama_user: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      pass_user: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      gender_user: {
        type: Sequelize.STRING(20),
      },
      tanggallahir_user: {
        type: Sequelize.STRING(100),
      },
      no_hp_user: {
        type: Sequelize.STRING(100),
      },
      alamat_user: {
        type: Sequelize.STRING(100),
      },
      profil_user: {
        type: Sequelize.STRING(100),
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
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user');
  },
};
