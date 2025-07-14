import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import FileUploadService from '@/s3Bucket/s3Bucket';
import { Routes } from "@interfaces/routes.interface";
import { CreateTemplateDto } from "@/dtos/template.dto";
import authController from "@middlewares/auth.middleware";
import TemplateController from "@/controllers/template.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";

class TemplateRoutes implements Routes {
    public path = "/template";
    public router = Router();
    public authController = new authController();
    public templateController = new TemplateController();
    public roleAuthorization = new RoleAuthorization()
    public fileUploadService = new FileUploadService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // this.router.use(this.authController.authMiddleware);
        this.router.post(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
            // validationMiddleware(CreateTemplateDto, "body"),
            this.fileUploadService.uploadHandler,
            this.templateController.createTemplate
        );
        this.router.get(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
            // validationMiddleware(CreateTemplateDto, "body"),
            this.templateController.getTemplate
        );
    }
}

export default TemplateRoutes;
