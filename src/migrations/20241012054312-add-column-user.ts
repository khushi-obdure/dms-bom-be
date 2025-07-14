import { QueryInterface, DataTypes } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface: QueryInterface, Sequelize:typeof DataTypes) {
    // Add 'coi' and 'un' columns to the table (assuming the table is 'users')
    await queryInterface.addColumn('user', 'address', {
      type: Sequelize.STRING,
      allowNull: false, // adjust this based on your requirements
    });

  },

  async down (queryInterface: QueryInterface, Sequelize:typeof DataTypes) {
    // Remove 'coi' and 'un' columns from the table
    await queryInterface.removeColumn('user', 'address');
  }
};
