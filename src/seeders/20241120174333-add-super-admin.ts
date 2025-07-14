import { v4 as uuidv4 } from "uuid";

import { roleEnum } from "../utils/enum";
import { hashPassword } from "../utils/util";
import { QueryInterface, DataTypes } from "sequelize";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id FROM role WHERE role_name = '${roleEnum.SUPER_ADMIN}'`
    );

    const superAdminRoleId = roles[0]["id"];

    if (!superAdminRoleId) {
      throw new Error(
        "SUPER_ADMIN role not found. Ensure roles are seeded first."
      );
    }

    return queryInterface.bulkInsert("user", [
      {
        id: uuidv4(),
        name: "Super Admin",
        email: "superadmin09@lumaxmail.com",
        // role: roleEnum.SUPER_ADMIN,
        role_id: superAdminRoleId,
        password_hash: await hashPassword("Superadmin09@123"),
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface: QueryInterface, Sequelize: typeof DataTypes) {
    // Delete the inserted users by email
    return queryInterface.bulkDelete("user", {
      user_id: [],
    });
  },
};
