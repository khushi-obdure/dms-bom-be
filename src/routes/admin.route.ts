import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import { Routes } from "@interfaces/routes.interface";
import authController from "@middlewares/auth.middleware";
import AdminController from "@/controllers/admin.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";
import { AdminFilterDto, CreateAdminDto, DeleteAdminDto, GetAllUserDto } from "@/dtos/admin.dto";

class AdminRoutes implements Routes {
  public path = "/admin";
  public router = Router();
  public authController = new authController();
  public adminController = new AdminController();
  public roleAuthorization = new RoleAuthorization()

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.use(this.authController.authMiddleware);
    this.router.post(
      `${this.path}`,
      validationMiddleware(CreateAdminDto, "body"),
      this.adminController.createAdmin
    );
    this.router.patch(
      `${this.path}`,
      validationMiddleware(CreateAdminDto, "body"),
      this.adminController.updateAdmin
    );

    this.router.delete(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN], message.role.otherUser),
      validationMiddleware(DeleteAdminDto, "query"),
      this.adminController.deleteAdmin
    );

    this.router.get(
      `${this.path}`,
      validationMiddleware(AdminFilterDto, "query"),
      this.adminController.getAdminFilterData
    );

    this.router.get(
      `${this.path}/get-all-users`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER], message.role.otherUser),
      validationMiddleware(GetAllUserDto, "query"),
      this.adminController.getAllUsers
    );
  }
}

export default AdminRoutes;
