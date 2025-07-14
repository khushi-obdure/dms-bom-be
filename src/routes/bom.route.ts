import { Router } from "express";
import { Routes } from "@/interfaces/routes.interface";

import {
  BomData,
  GetBomDto,
  BomFilterDto,
  BomApproveDto,
  ApproveBomDto,
  BomFormDataDTO,
  GetApprovalData,
  BomHierarchyDTO,
  GetBomFormDataDTO,
  BomHierarchyArrayDTO,
  BomHierarchyTemplateDTO
} from "@dtos/bom.dto";
import { roleEnum } from "@/utils/enum";
import { message } from "@/utils/message";
import FileUploadService from '@/s3Bucket/s3Bucket';
import BomController from "@controllers/bom.controller";
import authController from "@/middlewares/auth.middleware";
import validationMiddleware from "@middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";



class BomRoutes implements Routes {
  public path = "/bom";
  public router = Router();

  public bomController = new BomController();
  public authController = new authController();
  public roleAuthorization = new RoleAuthorization();
  public fileUploadService = new FileUploadService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      // validationMiddleware(BomData, "body"),
      this.fileUploadService.uploadHandler,
      this.bomController.insertFormData
    );

    this.router.get(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(GetBomFormDataDTO, "query"),
      this.bomController.getById
    );

    this.router.patch(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(GetBomFormDataDTO, "query"),
      validationMiddleware(BomFormDataDTO, "body"),
      this.fileUploadService.uploadHandler,
      this.bomController.updateFormData
    );

    this.router.delete(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(GetBomFormDataDTO, "query"),
      this.bomController.deleteBom
    );

    this.router.get(
      `${this.path}s`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(BomFilterDto, "query"),
      this.bomController.findAll
    );

    this.router.put(
      `${this.path}-approve`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(GetBomFormDataDTO, "query"),
      validationMiddleware(ApproveBomDto, "body"),
      this.bomController.approveBom
    );

    this.router.get(
      `${this.path}-review`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(BomFilterDto, "query"),
      this.bomController.reviewBom
    );

    //------ bom hierarchy

    this.router.post(
      `${this.path}-hierarchy`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      validationMiddleware(BomHierarchyArrayDTO, "body"),
      this.bomController.createBomHierarchy
    );

    this.router.patch(
      `${this.path}-hierarchy`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      validationMiddleware(BomHierarchyTemplateDTO, "query"),
      validationMiddleware(BomHierarchyArrayDTO, "body"),
      this.bomController.updateBomHierarchy
    );

    this.router.get(
      `${this.path}-hierarchy`,
      this.authController.authenticateToken,
      validationMiddleware(GetBomFormDataDTO, "query"),
      this.bomController.getBomHierarchyById
    );

    this.router.get(
      `${this.path}-hierarchy-by-plantId`,
      this.authController.authenticateToken,
      this.bomController.getBomHierarchyByPlantId
    );

    this.router.patch(
      `${this.path}-hierarchy`,
      this.authController.authenticateToken,
      validationMiddleware(GetBomFormDataDTO, "query"),
      validationMiddleware(BomHierarchyDTO, "body"),
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      this.bomController.updateBomHierarchyById
    );

    this.router.delete(
      `${this.path}-hierarchy`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      validationMiddleware(GetBomFormDataDTO, "query"),
      this.bomController.deleteBomHierarchyById
    );

    this.router.get(
      `${this.path}-approval-data`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
      validationMiddleware(GetApprovalData, "query"),
      this.bomController.getApprovalData
    );

    this.router.get(
      `${this.path}-all-approval-data`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
      validationMiddleware(GetApprovalData, "query"),
      this.bomController.getApprovals
    );

    this.router.post(
      `${this.path}-approve-disapprove-bom`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.invalidRole),
      validationMiddleware(BomApproveDto, "query"),
      this.bomController.approveBomData
    );

    this.router.get(
      `${this.path}-form-formdata`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER, roleEnum.PLANT_MODERATOR], message.role.plantUser),
      validationMiddleware(GetBomDto, "query"),
      this.bomController.getBomAndBomFormData
    );

    this.router.get(
      `${this.path}-get-bom-pdf`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.plantUser),
      validationMiddleware(GetBomDto, "query"),
      this.bomController.getBomPdf
    );

    this.router.get(
      `${this.path}-all-formdata`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER, roleEnum.PLANT_MODERATOR], message.role.invalidRole),
      validationMiddleware(GetBomDto, "query"),
      this.bomController.getBomData
    );

    this.router.get(
      `${this.path}-activity`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER, roleEnum.PLANT_MODERATOR], message.role.invalidRole),
      validationMiddleware(GetBomDto, "query"),
      this.bomController.getBomActivity
    );

    this.router.delete(
      `${this.path}-template`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      validationMiddleware(BomHierarchyTemplateDTO, "query"),
      this.bomController.deleteBomHierarchyTemplate
    );
  }
}

export default BomRoutes;
