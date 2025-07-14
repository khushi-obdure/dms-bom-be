import { Router } from 'express';

import { Routes } from '@interfaces/routes.interface';
import AuthController from '@controllers/auth.controller';
import validationMiddleware from '@middlewares/validation.middleware';
import { PasswordLoginUserDto, OtpLoginUserDto, SendOtpUserDto } from '@dtos/users.dto';

class AuthRoute implements Routes {
  public path = '/';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}password-login`, validationMiddleware(PasswordLoginUserDto, 'body'), this.authController.passwordLogIn);
    this.router.post(`${this.path}otp-login`, validationMiddleware(OtpLoginUserDto, 'body'), this.authController.otpLogIn);
    this.router.post(`${this.path}send-login-otp`, validationMiddleware(SendOtpUserDto, 'body'), this.authController.sendLoginOtp);
  }
}

export default AuthRoute;
