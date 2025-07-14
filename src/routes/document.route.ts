import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import FileUploadService from '@/s3Bucket/s3Bucket';
import { Routes } from "@interfaces/routes.interface";
import { GetDocumentDto, UploadDocumentDto, UpdateDocumentDto } from "@/dtos/document.dto";
import authController from "@middlewares/auth.middleware";
import DocumentController from "@/controllers/document.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";

class DocumentRoutes implements Routes {
    public path = "/document";
    public router = Router();
    public authController = new authController();
    public documentController = new DocumentController();
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
            this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
            // validationMiddleware(UploadDocumentDto, "body"),
            this.fileUploadService.uploadHandler,
            this.documentController.uploadDocument
        );
        this.router.get(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.plantUser),
            validationMiddleware(GetDocumentDto, "query"),
            this.documentController.getDocument
        );
    }
}

export default DocumentRoutes;
