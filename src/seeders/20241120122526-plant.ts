import { QueryInterface, DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import plantNames from "./plant.name";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    return queryInterface.bulkInsert("plant", plantNames);
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Delete the inserted users by email
    return queryInterface.bulkDelete("plant", {
      plant_id: [],
    });
  },
};
