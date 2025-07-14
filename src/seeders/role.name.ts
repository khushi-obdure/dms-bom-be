import { v4 as uuidv4 } from "uuid";

const roles = [
    {
        id: uuidv4(),
        role_name: "SUPER_ADMIN",
        permission_json: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(),
        role_name: "PLANT_ADMIN",
        permission_json: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(),
        role_name: "PLANT_USER",
        permission_json: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
    },
    {
        id: uuidv4(),
        role_name: "PLANT_MODERATOR",
        permission_json: JSON.stringify([]),
        created_at: new Date(),
        updated_at: new Date()
    },
];

export default roles;