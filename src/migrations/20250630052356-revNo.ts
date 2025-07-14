import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Step 1: Temporarily allow nulls (if needed)
    await queryInterface.changeColumn('bom', 'rev_no', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Step 2: Set default value for existing rows
    // await queryInterface.sequelize.query(`
    //   UPDATE bom
    //   SET rev_no = '00'
    //   WHERE rev_no IS NULL OR rev_no = ''
    // `);

    // Step 3: Make column NOT NULL and add default value for future inserts
    await queryInterface.changeColumn('bom', 'rev_no', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '00',
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Revert rev_no to nullable and remove default value
    await queryInterface.changeColumn('bom', 'rev_no', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });
  },
};
