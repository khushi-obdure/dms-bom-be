import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import { ResponseFormat } from "@exceptions/responseFormat";
import PlantService from "@/services/plant.service";
import { BadRequestHttpException, HttpException, NotFoundHttpException, UnauthorizedHttpException } from "@exceptions/HttpException";

class PlantController {
    public responseFormat = new ResponseFormat();
    public plantService = new PlantService()

    /**
   * createTemplate
   * @param req
   * @param res
   * @param next
   * @returns
   */
    public getPlant = async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        logger.info({
            message: "Get Plant process started",
            context: "PlantController",
            method: "getPlant",
        });

        try {
            const data = await this.plantService.getPlant();

            logger.info({
                message: "Get Plant process completed successfully",
                context: "PlantController",
                method: "getPlant",
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
                message: "Error during get plant data process",
                context: "PlantController",
                method: "getPlant",
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
export default PlantController