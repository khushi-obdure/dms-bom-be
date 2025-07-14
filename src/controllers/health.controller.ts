import { NextFunction, Request, Response } from "express";

import { logger } from "@/utils/logger";
import { message } from "@utils/message";
import { ResponseFormat } from "@exceptions/responseFormat";
import HealthService from "@/services/health.service";
class HealthController {
  public responseFormat = new ResponseFormat();
  public healthService = new HealthService();

  /**
   *
   * @param req
   * @param res
   * @param next
   * @returns
   */
  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    logger.info({
      message: "Health check process started",
      context: "HealthController",
      method: "healthCheck",
    });

    try {
      // Assuming req.body should match createAdminDto type
      const data = await this.healthService.healthCheck();

      logger.info({
        message: "Create admin process completed successfully",
        context: "HealthController",
        method: "healthCheck",
      });

      return this.responseFormat.response(
        res,
        true,
        200,
        {},
        message.general.serviceRuning
      );
    } catch (error) {
      logger.error({
        message: "Error during health check process",
        context: "HealthController",
        method: "healthCheck",
        error: error instanceof Error ? error.message : error,
      });
      next(error);
    }
  };
}

export default HealthController;
