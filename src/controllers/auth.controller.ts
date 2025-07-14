import { NextFunction, Request, Response } from 'express';

import { message } from '@utils/message';
import AuthService from '@services/auth.service';
import { ResponseFormat } from '@exceptions/responseFormat';
import { OtpLoginUserDto, SendOtpUserDto, PasswordLoginUserDto } from '@dtos/users.dto';

class AuthController {
  public authService = new AuthService();
  public responseFormat = new ResponseFormat();

  public passwordLogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: PasswordLoginUserDto = req.body;
      const { tokenData, userDetails } = await this.authService.passwordLogin(userData);


      const resUserData: any = {
        ...userDetails,
        tokenData: tokenData,
      };

      return this.responseFormat.response(res, true, 200, resUserData, message.users.login);
    } catch (error) {
      next(error);
    }
  };

  public otpLogIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: OtpLoginUserDto = req.body;
      const { tokenData, userDetails } = await this.authService.otpLogin(userData);


      const resUserData: any = {
        ...userDetails,
        tokenData: tokenData,
      };

      return this.responseFormat.response(res, true, 200, resUserData, message.users.login);
    } catch (error) {
      next(error);
    }
  };

  public sendLoginOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SendOtpUserDto = req.body;
      const data = await this.authService.sendLoginOtp(userData);

      if (data) {
        return this.responseFormat.response(res, true, 200, null, message.users.otpSent);
      } else {
        return this.responseFormat.response(res, true, 200, null, message.users.otpNotSent);
      }
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
