import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // 1. Make 'version' column nullable temporarily
    await queryInterface.changeColumn('bom', 'version', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // 2. Set default value for existing rows
    await queryInterface.sequelize.query("UPDATE bom SET version = '1.0'");

    // 3. Make 'version' column NOT NULL
    await queryInterface.changeColumn('bom', 'version', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // 4. Drop the foreign key constraint on 'parent_Bom_Id'
    // await queryInterface.removeConstraint('bom', 'bom_parent_Bom_Id_foreign_idx');

    // 5. Rename the column
    // await queryInterface.renameColumn('bom', 'parent_Bom_Id', 'parent_bom_id');

    // 6. Ensure correct data type for parent_bom_id (must match bom.id)
    await queryInterface.changeColumn('bom', 'parent_bom_id', {
      type: Sequelize.UUID, // UUID in Sequelize => CHAR(36) in MySQL
      allowNull: true,
    });

    // 7. Clean invalid FK values before adding constraint
    await queryInterface.sequelize.query(`
      UPDATE bom
      SET parent_bom_id = NULL
      WHERE parent_bom_id IS NOT NULL
      AND parent_bom_id NOT IN (SELECT id FROM (SELECT id FROM bom) AS sub);
    `);

    // 8. Add the FK constraint back
    await queryInterface.addConstraint('bom', {
      fields: ['parent_bom_id'],
      type: 'foreign key',
      name: 'fk_bom_parent_bom_id',
      references: {
        table: 'bom',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    await queryInterface.removeColumn('bom', 'version');

    await queryInterface.removeConstraint('bom', 'fk_bom_parent_bom_id');

    await queryInterface.renameColumn('bom', 'parent_bom_id', 'parent_Bom_Id');

    await queryInterface.changeColumn('bom', 'parent_Bom_Id', {
      type: Sequelize.UUID,
      allowNull: true,
    });

    await queryInterface.addConstraint('bom', {
      fields: ['parent_Bom_Id'],
      type: 'foreign key',
      name: 'bom_parent_Bom_Id_foreign_idx',
      references: {
        table: 'bom',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  }
};
