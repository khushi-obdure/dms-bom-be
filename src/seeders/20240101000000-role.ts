import { QueryInterface, DataTypes } from "sequelize";
import roles from "./role.name";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    return queryInterface.bulkInsert('role', roles);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.bulkDelete("role", {
      id: [],
    });
  }
};
