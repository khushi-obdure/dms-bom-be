import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';

import { SECRET_KEY } from '@config';
import { message } from '@utils/message';
import { constants } from '@utils/constant';
import authService from '@services/auth.service';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { HttpException, NotFoundHttpException, UnauthorizedHttpException, PermissionHttpException } from '@exceptions/HttpException';
import jwt from 'jsonwebtoken';

class AuthController {
  public authService = new authService();

  public authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const Authorization = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

      if (Authorization) {
        const secretKey: string = SECRET_KEY;
        const findUser = verify(Authorization, secretKey) as DataStoredInToken;

        if (findUser) {
          if (findUser.status == constants.STATUS.ACTIVE) {
            next();
          } else {
            next(new UnauthorizedHttpException(message.users.restrictedUser));
          }
        } else {
          next(new UnauthorizedHttpException(message.users.invalidAuthToken));
        }
      } else {
        next(new NotFoundHttpException(message.users.authTokenNotFound));
      }
    } catch (error) {
      next(new HttpException(401, message.users.invalidAuthToken));
    }
  };

  public authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const token = authHeader.split(' ')[1];

      jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
          next(new UnauthorizedHttpException(message.users.invalidAuthToken));
        } else if (user) {
          req.user = user;
          next();
        } else {
          next(new UnauthorizedHttpException(message.users.restrictedUser));
        }
      });
    } else {
      next(new UnauthorizedHttpException(message.users.restrictedUser));
    }
  };

}

export default AuthController;
