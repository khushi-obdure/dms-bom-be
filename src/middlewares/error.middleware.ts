import { NextFunction, Request, Response } from 'express';

import { logger } from '@utils/logger';
import { message } from '@utils/message';
import { HttpException } from '@exceptions/HttpException';

const errorMiddleware = (error: HttpException, req: Request, res: Response, next: NextFunction) => {
  try {
    const errorCode: number = error.errorCode || 500;
    const msg: string = error.message || message.general.serverError;

    logger.info(`[${req.method}] ${req.path} >> StatusCode:: ${errorCode}, Message:: ${msg}`);
    res.status(errorCode).json({
      errorCode: errorCode,
      message: msg,
      success: false,
      data: null,
    });
  } catch (error) {
    logger.info('Error: ', error);
    next(error);
  }
};

export default errorMiddleware;
