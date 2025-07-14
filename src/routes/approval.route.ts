import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import FileUploadService from '@/s3Bucket/s3Bucket';
import { Routes } from "@interfaces/routes.interface";
import authController from "@middlewares/auth.middleware";
import ApprovalController from "@/controllers/approval.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";
import { ApproveDocumentDto, GetApprovalData } from "@dtos/approval.dto"

class ApprovalRoutes implements Routes {
    public path = "/approval";
    public router = Router();
    public authController = new authController();
    public approvalController = new ApprovalController();
    public roleAuthorization = new RoleAuthorization()
    public fileUploadService = new FileUploadService();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // this.router.use(this.authController.authMiddleware);
        this.router.get(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
            validationMiddleware(GetApprovalData, "query"),
            this.approvalController.getApprovalData
        );

        this.router.post(
            `${this.path}`,
            this.authController.authenticateToken,
            this.roleAuthorization.roleAuthorization([roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.invalidRole),
            validationMiddleware(ApproveDocumentDto, "query"),
            this.approvalController.approveDocument
        );
    }
}

export default ApprovalRoutes;
