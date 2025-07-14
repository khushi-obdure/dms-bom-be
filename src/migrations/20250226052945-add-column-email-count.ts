import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Add 'coi' and 'un' columns to the table (assuming the table is 'users')
    await queryInterface.addColumn("approvals", "email_count", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Remove 'coi' and 'un' columns from the table
    await queryInterface.removeColumn("approvals", "email_count");
  },
};
