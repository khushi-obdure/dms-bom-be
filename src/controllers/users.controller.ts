import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import { UserFilterDto } from "@/dtos/users.dto";
import { User } from "@interfaces/user.interface";
import userService from "@services/users.service";
import { ResponseFormat } from "@exceptions/responseFormat";
import { BadRequestHttpException, ForbiddenHttpException, HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";
import FileUploadService from '@/s3Bucket/s3Bucket';

class UsersController {
  public userService = new userService();
  public responseFormat = new ResponseFormat();
  public fileUploadService = new FileUploadService();

  /**
 *
 * @param req
 * @param res
 * @param next
 * @returns
 */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    logger.info({
      message: "Login user process started",
      context: "UsersController",
      method: "login",
    });

    try {
      console.log(req, '==req')
      console.log(req.body, '===body')
      // Pass the request body to the service layer
      const data = await this.userService.login(req.body);

      logger.info({
        message: "Login process completed successfully",
        context: "UsersController",
        method: "login",
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.users.login
      );
    } catch (error) {
      logger.error({
        message: "Error during login process",
        context: "UsersController",
        method: "login",
        error: error instanceof Error ? error.message : error,
      });

      // Handle custom exceptions
      if (error instanceof UnauthorizedHttpException || error instanceof NotFoundHttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };


  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public createUsers = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Create user process started",
      context: "UsersController",
      method: "createUsers",
    });
    try {
      const userData = req.user
      const reqBody = req.body
      // Assuming req.body should match CreateUserDto type.
      const data = await this.userService.createUsers(reqBody, userData);
      logger.info({
        message: "Create admin process completed successfully",
        context: "UsersController",
        method: "createUsers",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.users.createUser
      );
    } catch (error) {
      logger.error({
        message: "Error during create user process",
        context: "UsersController",
        method: "createUsers",
        error: error instanceof Error ? error.message : error,
      });

      if (error instanceof BadRequestHttpException || error instanceof UnauthorizedHttpException || error instanceof ForbiddenHttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      return next(error);
    }
  };

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    logger.info({
      message: "Get all users process started",
      context: "UsersController",
      method: "getUsers",
    });
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      logger.info({
        message: "Get all users process started",
        context: "UsersController",
        method: "getUsers",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        findAllUsersData,
        message.users.listFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get all users process",
        context: "UsersController",
        method: "getUsers",
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
  public getUserFilterData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get user filter data process started",
      context: "UsersController",
      method: "getUserFilterData",
    });
    try {
      // const userId = Number(req.params.id);
      const filterDto: UserFilterDto = req.query;
      const findOneUserData: User[] = await this.userService.userFilterData(
        filterDto
      );
      logger.info({
        message: "Get user filter data process completed successfully",
        context: "UsersController",
        method: "getUserFilterData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        findOneUserData,
        message.users.detailsFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get admin  filter data process",
        context: "UsersController",
        method: "getUserFilterData",
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
  public getUserData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get user filter data process started",
      context: "UsersController",
      method: "getUserFilterData",
    });
    try {
      const filterDto = req.user.id;
      const findOneUserData = await this.userService.getUser(filterDto);
      logger.info({
        message: "Get user filter data process completed successfully",
        context: "UsersController",
        method: "getUserFilterData",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        findOneUserData,
        message.users.detailsFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get admin  filter data process",
        context: "UsersController",
        method: "getUserFilterData",
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
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Update user process started",
      context: "UsersController",
      method: "updateUser",
    });
    try {
      const reqBody = req.body
      const reqUserData = req.user
      const reqQuery = req.query
      const updatedUserData: User = await this.userService.updateUser({ reqBody, reqUserData, reqQuery });
      logger.info({
        message: "Update user process completed successfully",
        context: "UsersController",
        method: "updateUser",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        updatedUserData,
        message.users.updated
      );
    } catch (error) {
      logger.error({
        message: "Error during update user process",
        context: "UsersController",
        method: "updateUser",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof BadRequestHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  /**
   * 
   * @param req 
   * @param res 
   * @param next 
   * @returns 
   */
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Delete user process started",
      context: "UsersController",
      method: "deleteUser",
    });
    try {
      const userId = String(req.query.userId);
      const deleteUser: User = await this.userService.deleteUser(userId);
      logger.info({
        message: "Delete user process completed successfully",
        context: "UsersController",
        method: "deleteUser",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        deleteUser,
        message.users.userDeleted
      );
    } catch (error) {
      logger.error({
        message: "Error during delete user process",
        context: "UsersController",
        method: "deleteUser",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof BadRequestHttpException || error instanceof HttpException || error instanceof NotFoundHttpException) {
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

  public approveDocument = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get Approval Hierarchy process started",
      context: "UsersController",
      method: "getApprovalHierarchy",
    });
    try {
      const reqQuery = req.query
      const userData = req.user
      const getData = await this.userService.approveDocument({ reqQuery, userData })
      logger.info({
        message: "Get Approval Hierarchy process completed successfully",
        context: "UsersController",
        method: "getApprovalHierarchy",
      });
      return this.responseFormat.response(
        res,
        true,
        201,
        getData,
        message.users.approveDocument
      );
    } catch (error) {
      logger.error({
        message: "Error during Get Approval Hierarchy process",
        context: "UsersController",
        method: "getApprovalHierarchy",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException || error instanceof HttpException) {
        return this.responseFormat.errorResponse(
          res,
          error.errorCode,
          error.success || false,
          error.message
        );
      }

      // Default error handling for other exceptions
      return next(error);
    }
  };

  /**
  *
  * @param req
  * @param res
  * @param next
  * @returns
  */
  public getUserByPlant = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get user data by plant process started",
      context: "UsersController",
      method: "getUserByPlant",
    });
    try {
      const filterDto = String(req.query.plantId);
      const findUserData = await this.userService.getUserByPlant(filterDto);
      logger.info({
        message: "Get user data by plant process completed successfully",
        context: "UsersController",
        method: "getUserByPlant",
      });
      return this.responseFormat.response(
        res,
        true,
        200,
        findUserData,
        message.users.detailsFetched
      );
    } catch (error) {
      logger.error({
        message: "Error during get user data by plant process",
        context: "UsersController",
        method: "getUserByPlant",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };
}

export default UsersController;
