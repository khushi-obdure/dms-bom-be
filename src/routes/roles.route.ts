import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import { Routes } from "@interfaces/routes.interface";
import authController from "@middlewares/auth.middleware";
import RoleController from "@/controllers/role.controller";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";

class RoleRoutes implements Routes {
    public path = "/role";
    public router = Router();
    public authController = new authController();
    public roleController = new RoleController();
    public roleAuthorization = new RoleAuthorization()

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.put(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
            this.roleController.savePermission
        );

        this.router.get(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.PLANT_ADMIN, roleEnum.SUPER_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
            this.roleController.getRoleData
        );
    }
}

export default RoleRoutes;
