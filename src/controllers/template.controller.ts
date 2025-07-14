import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import TemplateService from "@services/template.service"
import { ResponseFormat } from "@exceptions/responseFormat";
import { BadRequestHttpException, HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";
import FileUploadService from '@/s3Bucket/s3Bucket';

class TemplateController {
  public templateService = new TemplateService();
  public responseFormat = new ResponseFormat();
  public fileUploadService = new FileUploadService();

  /**
 * createTemplate
 * @param req
 * @param res
 * @param next
 * @returns
 */
  public createTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Create template process started",
      context: "TemplateController",
      method: "createTemplate",
    });

    try {
      const reqBody = req.body
      const reqData = req.user
      const reqFiles = req.files
      const fileUrl = Object.values(reqFiles)
        .flat()
        .reduce((acc: any, file: any) => {
          if (!acc[file.fieldname]) {
            acc[file.fieldname] = file.location;
          }
          return acc;
        }, {});
      const data = await this.templateService.createTemplate({ reqBody, reqData, fileUrl });

      logger.info({
        message: "Create template process completed successfully",
        context: "TemplateController",
        method: "createTemplate",
      });

      return this.responseFormat.response(
        res,
        true,
        201,
        data,
        message.template.createTemplate
      );
    } catch (error) {
      logger.error({
        message: "Error during create template process",
        context: "TemplateController",
        method: "createTemplate",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException) {
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
  * getTemplate
  * @param req
  * @param res
  * @param next
  * @returns
  */
  public getTemplate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    logger.info({
      message: "Get template process started",
      context: "TemplateController",
      method: "getTemplate",
    });

    try {
      const reqQuery = req.query
      const reqData = req.user
      const data = await this.templateService.getTemplate({ reqQuery, reqData });

      logger.info({
        message: "Get template process completed successfully",
        context: "TemplateController",
        method: "getTemplate",
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        data,
        message.template.getTemplate
      );
    } catch (error) {
      logger.error({
        message: "Error during get template process",
        context: "TemplateController",
        method: "getTemplate",
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof NotFoundHttpException) {
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
export default TemplateController