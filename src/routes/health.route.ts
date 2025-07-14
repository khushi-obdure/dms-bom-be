import { Router } from "express";

import { logger } from "@utils/logger";
import { Routes } from "@interfaces/routes.interface";
import HealthController from "@controllers/health.controller";

class HealthRoute implements Routes {
  public path = "/health";
  public router = Router();
  public healthController = new HealthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    logger.info("Health route initialize");
    this.router.get(`${this.path}`, this.healthController.healthCheck);
  }
}

export default HealthRoute;
