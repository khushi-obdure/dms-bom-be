import { NextFunction, Response, Request } from 'express';

import DB from 'database';
import { UnauthorizedHttpException } from '@/exceptions/HttpException';

class RoleAuthorization {
  public role = DB.Role;

  public roleAuthorization = (requiredRole: string[], message: string): ((req: Request, res: Response, next: NextFunction) => Promise<void>) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (req?.user && req?.user?.roleId) {
          const role = await this.role.findOne({
            where: {
              id: req.user.roleId,
            },
          });
          if (requiredRole.includes(role?.roleName)) {
            return next();
          } else {
            return next(new UnauthorizedHttpException(message));
          }
        } else {
          return next(new UnauthorizedHttpException(message));
        }
      } catch (error) {
        return next(error);
      }
    };
  };
}

export default RoleAuthorization;
