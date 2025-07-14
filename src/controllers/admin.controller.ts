import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import { UserFilterDto } from "@/dtos/users.dto";
import { User } from "@interfaces/user.interface";
import { AdminFilterDto } from "@/dtos/admin.dto";
import AdminService from "@/services/admin.service";
import { ResponseFormat } from "@exceptions/responseFormat";
import { BadRequestHttpException, HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";

class AdminController {
  public adminService = new AdminService();
  public responseFormat = new ResponseFormat();

  /**
   * createAdmin
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public createAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Create admin process started",
      context: "AdminController",
      method: "createAdmin",
    });

    try {
      // Assuming req.body should match createAdminDto type
      const data: User[] = await this.adminService.createAdmin(req.body);

      logger.info({
        message: "Create admin process completed successfully",
        context: "AdminController",
        method: "createAdmin",
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.admin.createAdmin
      );
    } catch (error) {
      logger.error({
        message: "Error during create admin process",
        context: "AdminController",
        method: "createAdmin",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
   * getAdmin
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public getAdmin = async (req: Request, res: Response, next: NextFunction) => {
    logger.info({
      message: "Get admin process started",
      context: "AdminController",
      method: "getAdmin",
    });
    try {
      const adminData: User[] = await this.adminService.findAllAdmin();

      logger.info({
        message: "Get admin process completed successfully",
        context: "AdminController",
        method: "getAdmin",
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        adminData,
        message.users.listFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get admin process",
        context: "AdminController",
        method: "getAdmin",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
   * getAdminFilterData
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public getAdminFilterData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get admin filter data process started",
      context: "AdminController",
      method: "getAdminFilterData",
    });
    try {
      // const userId = Number(req.params.id);
      const filterDto: AdminFilterDto = req.query;
      const adminData: User[] = await this.adminService.adminFilterData(
        filterDto
      );
      logger.info({
        message: "Get admin filter data process completed successfully",
        context: "AdminController",
        method: "getAdminFilterData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        adminData,
        message.users.detailsFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get admin  filter data process",
        context: "AdminController",
        method: "getAdminFilterData",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
   * deleteAdmimn
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public deleteAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Delete admin process started",
      context: "AdminController",
      method: "deleteAdmin",
    });
    try {
      const adminId = String(req.query.adminId);
      const deleteAdmin: User = await this.adminService.deleteAdmin(adminId);
      logger.info({
        message: "Delete admin process completed successfully",
        context: "AdminController",
        method: "deleteAdmin",
        deleteAdmin, // Log created user IDs if needed
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        deleteAdmin,
        message.admin.deleteAdmin
      );
    } catch (error) {
      logger.error({
        message: "Error during delete admin process",
        context: "AdminController",
        method: "deleteAdmin",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public updateAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      logger.info({
        message: "Update admin process started",
        context: "AdminController",
        method: "updateAdmin",
      });
      const updateAdminData: User = await this.adminService.updateAdmin(
        req.body
      );

      logger.info({
        message: "Update admin process completed successfully",
        context: "AdminController",
        method: "updateAdmin",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        updateAdminData,
        message.admin.updated
      );
    } catch (error) {
      logger.error({
        message: "Error during update admin process",
        context: "AdminController",
        method: "updateAdmin",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };

  /**
  * getAllUsers
  * @param req
  * @param res
  * @param next
  * @returns
  */
  public getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get All Users",
      context: "AdminController",
      method: "getAllUsers",
    });
    try {
      // const userId = Number(req.params.id);
      const reqQueryData = req.query;
      const userData = req.user
      const adminData: User = await this.adminService.getAllUsers({ reqQueryData, userData });
      logger.info({
        message: "Get all user data process completed successfully",
        context: "AdminController",
        method: "getAllUsers",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        adminData,
        message.users.detailsFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get user data process",
        context: "AdminController",
        method: "getAllUsers",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      } else {
        // Default error handling for other exceptions
        return next(error);
      }
    }
  };
}

export default AdminController;
