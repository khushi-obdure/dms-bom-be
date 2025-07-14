import { QueryInterface } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

module.exports = {
  async up(queryInterface: QueryInterface): Promise<void> {
    const [existing] = await queryInterface.sequelize.query(
      `SELECT * FROM role WHERE role_Name = 'PLANT_MODERATOR'`
    );

    if ((existing as any[]).length === 0) {
      await queryInterface.bulkInsert('role', [
        {
          id: uuidv4(),
          role_name: 'PLANT_MODERATOR',
          permission_json: JSON.stringify([]),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ]);
    }
  },

  async down(queryInterface: QueryInterface): Promise<void> {
    await queryInterface.bulkDelete('role', { role_name: 'PLANT_MODERATOR' });
  },
};
