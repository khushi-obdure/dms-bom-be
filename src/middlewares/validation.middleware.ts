import { RequestHandler } from 'express';
import { plainToClass } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { ResponseFormat } from '@exceptions/responseFormat';

const validationMiddleware = (
  type: any,
  value: string | 'body' | 'query' | 'params' = 'body',
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  const responseFormat = new ResponseFormat();
  return (req, res, next) => {
    validate(plainToClass(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        const message = errors
          .map((error: ValidationError) =>
            error.constraints ? Object.values(error.constraints).join(', ') : 'Validation error occurred'
          )
          .join('; ');
        return responseFormat.response(res, false, 400, null, message);
      }
      else {
        next();
      }
    });
  };
};

export default validationMiddleware;
