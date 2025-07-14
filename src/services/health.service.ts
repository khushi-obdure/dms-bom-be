import { message } from "@utils/message";
import { logger } from "@utils/logger";
import { HttpException } from "@exceptions/HttpException";

class HealthService {
  /**
   *
   * @returns
   */
  public healthCheck = async (): Promise<boolean> => {
    logger.info({
      message: "Starting health check",
      context: "HealthService",
      method: "healthCheck",
    });
    try {
      logger.info({
        message: "Health check completed",
        context: "HealthService",
        method: "healthCheck",
        cehck: true,
      });
      return true;
    } catch (error) {
      logger.error({
        error: error?.message || "Error during health check",
        context: "HealthService",
        method: "healthCheck",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };
}

export default HealthService;
