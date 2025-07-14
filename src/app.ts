global.__basedir = __dirname;
import hpp from 'hpp';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import express from 'express';
import { resolve } from "path";
import compression from 'compression';
import swaggerJSDoc from 'swagger-jsdoc';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import { logger, stream } from '@utils/logger';
import { CronManager } from '@crons/cron.managers';
import { Routes } from '@interfaces/routes.interface';
import { DailyTwiceJob } from '@crons/daily.twice.job';
import errorMiddleware from '@middlewares/error.middleware';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from '@config';
import 'reflect-metadata';

class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public cronJobs;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;

    this.connectToDatabase();
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
    this.initializeCrons();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private connectToDatabase() {
    // DB.sequelize.sync({ force: false });
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/api/v1', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'BOM server',
          version: '1.0.0',
          description: 'Node JS server APIs',
        },
      },
      apis: ['./src/routes/*.ts', resolve(__dirname, "./src/schemas/**/*.ts")]
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  private initializeCrons() {
  const cronManager = new CronManager();
  cronManager.register(new DailyTwiceJob());
  cronManager.start();
  }
}

export default App;
