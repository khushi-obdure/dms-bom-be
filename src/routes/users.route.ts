import { Router } from "express";

import { roleEnum } from "@utils/enum"
import { message } from "@utils/message"
import FileUploadService from '@/s3Bucket/s3Bucket';
import { Routes } from "@interfaces/routes.interface";
import authController from "@middlewares/auth.middleware";
import UsersController from "@controllers/users.controller";
import validationMiddleware from "@/middlewares/validation.middleware";
import RoleAuthorization from "@/middlewares/roleAuthorization.middleware";
import { CreateUserDto, CreateLoginDto, DeleteUserDto, UserFilterDto, UpdateUserDto } from "@/dtos/users.dto";

class UsersRoute implements Routes {
  public path = "/users";
  public router = Router();
  public authController = new authController();
  public usersController = new UsersController();
  public roleAuthorization = new RoleAuthorization()
  public fileUploadService = new FileUploadService();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.use(this.authController.authMiddleware);
    this.router.post(
      `${this.path}/login`,
      validationMiddleware(CreateLoginDto, "body"),
      this.usersController.login
    );
    this.router.post(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN], message.role.superadminPlant),
      validationMiddleware(CreateUserDto, "body"),
      this.usersController.createUsers
    );
    this.router.patch(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN, roleEnum.PLANT_USER, roleEnum.PLANT_MODERATOR], message.role.otherUser),
      validationMiddleware(UpdateUserDto, "body"),
      this.usersController.updateUser
    );
    this.router.delete(
      `${this.path}`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN, roleEnum.PLANT_ADMIN], message.role.otherUser),
      validationMiddleware(DeleteUserDto, "query"),
      this.usersController.deleteUser
    );
    this.router.get(
      `${this.path}`,
      validationMiddleware(UserFilterDto, "query"),
      this.usersController.getUserFilterData
    );

    this.router.get(
      `${this.path}/user-data`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER, roleEnum.PLANT_ADMIN, roleEnum.SUPER_ADMIN, roleEnum.PLANT_MODERATOR], message.role.plantUser),
      validationMiddleware(UserFilterDto, "query"),
      this.usersController.getUserData
    );

    this.router.post(
      `${this.path}/approve-document`,
      this.authController.authenticateToken,
      this.roleAuthorization.roleAuthorization([roleEnum.PLANT_USER], message.role.plantUser),
      // validationMiddleware(UploadDocumentDto, "body"),
      this.usersController.approveDocument
    );
    this.router.get(
      `${this.path}/get-users-by-plant`,
      this.authController.authenticateToken,
      // validationMiddleware(UserFilterDto, "query"),
      this.roleAuthorization.roleAuthorization([roleEnum.SUPER_ADMIN], message.role.superAdmin),
      this.usersController.getUserByPlant
    );
  }
}

export default UsersRoute;
