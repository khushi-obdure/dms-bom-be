import DB from "@/database";

class RoleDaos {
    // Database models
    public role = DB.Role

    public findRoleByName = async (roleName: string) => {
        return await this.role.findOne({
            where: {
                roleName,
            },
        });
    };

    public findRoleById = async (id: string) => {
        return await this.role.findOne({
            where: {
                id,
            },
        });
    }

    public update = async (createData: { permissionJson?: [] }, roleName) => {
        await this.role.update(createData, { where: { roleName } })
        return this.findRoleByName(roleName)
    }
}

export default RoleDaos