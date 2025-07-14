// import { Response } from 'express';
import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';

import DB from '@/database';
import { SECRET_KEY } from '@config';
import UserDaos from '@daos/user.daos';
import RoleDaos from "@daos/role.daos"
import { logger } from '@/utils/logger';
import { message } from '@utils/message';
import { sendEmail } from '@utils/email';
import { constants } from '@utils/constant';
import { User } from '@interfaces/user.interface';
import { isEmpty, generateOTP } from '@utils/util';
import { ResponseFormat } from '@exceptions/responseFormat';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import { SendOtpUserDto, OtpLoginUserDto, PasswordLoginUserDto } from '@dtos/users.dto';
import { UnauthorizedHttpException, BadRequestHttpException } from '@exceptions/HttpException';

class AuthService {
  public users = DB.User;
  public deviceDetails = DB.DeviceDetails;
  public responseFormat = new ResponseFormat();
  public userDaos = new UserDaos();
  public roleDaos = new RoleDaos()

  /**
   * @method passwordLogin
   * @param PasswordLoginUserDto PasswordLoginUserDto
   * @returns TokenData
   * @returns User
   * @description get user details with token
   */
  public passwordLogin = async (userData: PasswordLoginUserDto): Promise<{ tokenData: TokenData; userDetails: any }> => {
    if (isEmpty(userData)) throw new BadRequestHttpException(message.users.dataNotFound);

    // get user data with permissions
    const { userDetails, permissionList } = await this.userDaos.findOneWithDetails(userData.username);
    if (!userDetails) throw new UnauthorizedHttpException(message.users.invalidCreds);

    // added for comparing php password
    userDetails.password_hash = userDetails.password_hash.replace(/^\$2y(.+)$/i, '$2a$1');

    const isPasswordMatching: boolean = await compare(userData.password, userDetails.password_hash);
    if (!isPasswordMatching) throw new UnauthorizedHttpException(message.users.invalidCreds);

    // delete password_hash from response
    delete userDetails.password_hash;

    const tokenData = this.createToken(userDetails);

    return { tokenData, userDetails };
  }

  public otpLogin = async (userData: OtpLoginUserDto): Promise<{ tokenData: TokenData; userDetails: any }> => {
    if (isEmpty(userData)) throw new BadRequestHttpException(message.users.dataNotFound);

    const { userDetails, permissionList } = await this.userDaos.findOneWithDetails(userData.email, userData.otp);
    if (!userDetails) throw new UnauthorizedHttpException(message.users.invalidEmail);

    if (userData.otp !== userDetails.otp) throw new UnauthorizedHttpException(message.users.invalidOTP);

    const currentTimeStamp = Math.floor(+new Date() / 1000);

    if (currentTimeStamp > userDetails.otp_valid_till) throw new UnauthorizedHttpException(message.users.otpExpired);

    const tokenData = this.createToken(userDetails);

    return { tokenData, userDetails };
  }

  public sendLoginOtp = async (userData: SendOtpUserDto): Promise<boolean> => {
    if (isEmpty(userData)) throw new BadRequestHttpException(message.users.dataNotFound);
    const findUser: User = await this.userDaos.findOneByEmail(userData.email)
    if (!findUser) throw new UnauthorizedHttpException(message.users.invalidEmail);

    const otp: string = generateOTP();

    if (isEmpty(otp)) {
      return false;
    }

    const data = sendEmail({
      emailTo: userData.email,
      subject: 'Hospals: OTP for Login',
      cc: null,
      body: null,
      html: `<h4>Your hospals login OTP is <b>${otp}</b></h4>`,
      attachments: null,
    });

    if (!data) {
      return false;
    }

    const otp_valid_till = Math.floor((+new Date() + constants.OTP_VALID_TIME * 60000) / 1000);

    await this.users.update({ otp: +otp, otp_valid_till: otp_valid_till }, { where: { id: findUser.id } });

    return data;
  }

  public createToken = (user: any): TokenData => {
    const dataStoredInToken: DataStoredInToken = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      phone_extension: user.phone_extension,
      user_type: user.user_type,
      status: user.status,
    };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 60 * 60 * 60 * 60;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }


  public createUserToken = async (reqData: any) => {
    const plant_name = reqData?.user?.PlantModel ? reqData.user.PlantModel.dataValues?.plantName : null;
    const acronym = reqData?.user?.PlantModel ? reqData.user.PlantModel.dataValues?.acronym : null;
    const roleName = await this.roleDaos.findRoleById(reqData.user.roleId);

    const JWT_ACCESS_EXPIRATION_MINUTES: number = parseInt(process.env.JWT_ACCESS_EXPIRATION_MINUTES);
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = JWT_ACCESS_EXPIRATION_MINUTES;

    // Current time in milliseconds since Unix epoch
    const currentTime = Date.now();
    // Expiration time in milliseconds since Unix epoch
    const expirationTime = currentTime + expiresIn * 60 * 1000;
    // Convert to ISO string
    const expirationTimeISO = new Date(expirationTime).toISOString();
    const plantId = reqData?.user?.PlantModel ? reqData.user.PlantModel.dataValues?.id : null;

    const token = {
      id: reqData.user.id,
      isLoggedIn: reqData.user.isLoggedIn,
      email: reqData.user.email,
      role: roleName.roleName,
      roleId: reqData.user.roleId,
      plantId,
      plantName: plant_name ? `${plant_name} (${acronym})`.trim() : null,
      expiresIn: expirationTimeISO,
    };
    return {
      user: reqData.reqData.email,
      role: roleName.roleName,
      roleId: reqData.user.roleId,
      plantName: plant_name ? `${plant_name} (${acronym})`.trim() : null,
      expiresIn: expirationTimeISO, // This will be the expiration timestamp in ISO format
      token: sign(token, secretKey, { expiresIn: `${expiresIn}m` }),
    };
  }

}

export default AuthService;
