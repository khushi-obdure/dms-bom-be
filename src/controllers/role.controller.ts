import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import { ResponseFormat } from "@exceptions/responseFormat";
import RoleService from "@/services/role.service";
import { HttpException, NotFoundHttpException } from "@exceptions/HttpException";

class RoleController {
    public responseFormat = new ResponseFormat();
    public roleService = new RoleService()

    /**
  *
  * @param req
  * @param res
  * @param next
  * @returns
  */
    public savePermission = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        try {
            logger.info({
                message: "Create Permission for Privte Route",
                context: "RoleController",
                method: "POST",
            });
            const reqBody = req.body
            const roleName = req.user.role
            const data = await this.roleService.savePermission(reqBody, roleName);

            return this.responseFormat.response(
                res,
                true,
                200,
                data,
                message.role.savePermissionJson
            );
        } catch (err) {
            logger.error({
                message: "Error during Creating Permission for Privte Route",
                context: "RoleController",
                method: "POST",
                error: err instanceof Error ? err.message : err,
            });
            next(err);
        }
    };
    /**
   * getTemplate
   * @param req
   * @param res
   * @param next
   * @returns
   */
    public getRoleData = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Get Role Data process started",
            context: "RoleController",
            method: "getRoleData",
        });

        try {
            const roleName = req.user.role
            const data = await this.roleService.getRoleData(roleName);

            logger.info({
                message: "Get Role Data process completed successfully",
                context: "RoleController",
                method: "getRoleData",
            });

            return this.responseFormat.response(
                res,
                true,
                200,
                data,
                message.plant.getPlant
            );
        } catch (error) {
            logger.error({
                message: "Error during get role data process",
                context: "RoleController",
                method: "getRoleData",
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
}
export default RoleController;