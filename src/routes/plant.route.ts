import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import { Routes } from "@interfaces/routes.interface";
import authController from "@middlewares/auth.middleware";
import PlantController from "@/controllers/plant.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";

class PlantRoutes implements Routes {
    public path = "/plant";
    public router = Router();
    public authController = new authController();
    public plantController = new PlantController();
    public roleAuthorization = new RoleAuthorization()

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.PLANT_ADMIN, roleEnum.SUPER_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
            this.plantController.getPlant
        );
    }
}

export default PlantRoutes;
