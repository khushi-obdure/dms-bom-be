import { message } from "@utils/message";
import { logger } from "@utils/logger";
import RoleDaos from "@/daos/role.daos";
import { Roles } from "@interfaces/roles.interface"
import {
    NotFoundHttpException,
    HttpException,
} from "@exceptions/HttpException";

class RoleService {
    public roleDaos = new RoleDaos()


    /**
    * Get Plant
    * @param reqData
    * @returns {Promise<Roles>}
    */
    public savePermission = async (reqBody: { permissionJson: [] },roleName): Promise<Roles> => {
        logger.info({
            message: "Starting create permission for Private route",
            context: "RoleService",
            method: "createPermission",
        });
        try {
            const saveData = await this.roleDaos.update(reqBody,roleName);
            if (!saveData)
                throw new NotFoundHttpException(message.role.dataNotCreated);

            logger.info({
                message: "Permission Json created for Private Route",
                context: "RoleService",
                method: "createPermission",
            });
            return saveData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during creating permission json for private route",
                context: "RoleService",
                method: "createPermission",
            });
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };

    /**
    * Get Role
    * @param reqData
    * @returns {Promise<Roles[]>}
    */
    public getRoleData = async (roleName): Promise<Roles> => {
        logger.info({
            message: "Starting Get Role Data",
            context: "RoleService",
            method: "getRoleData",
        });
        try {
            const getData = await this.roleDaos.findRoleByName(roleName);
            if (!getData)
                throw new NotFoundHttpException(message.general.dataNotFound);

            logger.info({
                message: "Get Role Data completed",
                context: "RoleService",
                method: "getRoleData",
            });
            return getData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during get role data",
                context: "RoleService",
                method: "getRoleData",
            });
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };
}

export default RoleService