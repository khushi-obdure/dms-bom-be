import DB from "@/database";
import bcrypt from "bcrypt";

import ejs from "ejs";
import UserDaos from "@daos/user.daos";
import { roleEnum } from "@/utils/enum";
import plantDaos from "@daos/plant.daos";
import { message } from "@utils/message";
import EmailService from "@/utils/email";
import { logger, stream } from "@utils/logger";
import AuthService from "@services/auth.service";
import { User } from "@interfaces/user.interface";
import { hashPassword, isEmpty } from "@utils/util";
import { ResponseFormat } from "@exceptions/responseFormat"
import { CreateUserDto, UserFilterDto } from "@/dtos/users.dto";
import {
  BadRequestHttpException,
  NotFoundHttpException,
  HttpException,
  ForbiddenHttpException,
  UnauthorizedHttpException
} from "@exceptions/HttpException";
import { constants } from "@/utils/constant";
import RoleDaos from "@daos/role.daos"
import ApprovalDaos from "@/daos/approval.daos";
import { NotificationSubject } from "@/utils/notification.subject";

class UserService {
  public users = DB.User;
  public userDaos = new UserDaos();
  public plantDaos = new plantDaos();
  public authService = new AuthService();
  public approvalDaos = new ApprovalDaos()
  public roleDaos = new RoleDaos()
  public emailService = new EmailService();
  public responseFormat = new ResponseFormat();

  /**
  * Retrieve all users
  * @returns {Promise<User[]>}
  */

  public login = async (reqData): Promise<any> => {
    logger.info({
      message: "Attempting user login",
      context: "UserService",
      method: "login",
    });

    try {
      let isPasswordValid
      const user: User | null = await this.userDaos.findEmailAndPlantDetails(reqData.email);
      if (!user) {
        logger.warn({
          message: "User not found",
          context: "UserService",
          method: "login",
        });
        throw new NotFoundHttpException(message.users.dataNotFound);
      }

      // Validate password
      isPasswordValid = await bcrypt.compare(reqData.password, user.passwordHash);
      if (!isPasswordValid) {
        logger.warn({
          message: "Incorrect password",
          context: "UserService",
          method: "login",
        });
        throw new UnauthorizedHttpException(message.auth.invalidCredentials);
      }
      await this.users.update({ isLoggedIn: true }, { where: { email: reqData.email } })
      user.isLoggedIn = true;
      const token = await this.authService.createUserToken({ reqData, user });

      logger.info({
        message: "Login successful",
        context: "UserService",
        method: "login",
        user: { id: user.id, email: user.email },
      });

      return token;
    } catch (error) {
      logger.error({
        message: error?.message || "Error during user login",
        context: "UserService",
        method: "login",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Create a user
   * @param reqData
   * @returns {Promise<User[]>}
   */

  public createUsers = async (reqData, tokenData): Promise<any> => {
    logger.info({
      message: "Starting user creation",
      reqData,
      context: "UserService",
      method: "createUsers",
    });

    try {
      const password = await hashPassword(reqData.password);

      // Check if the email already exists globally
      const existingUser = await this.userDaos.findOneByEmail(reqData.email);
      if (existingUser) {
        // Determine the role of the existing user (Plant Admin or Plant User)
        const existingRole = await this.roleDaos.findRoleById(existingUser.roleId);
        const roleName = existingRole?.roleName || "Unknown Role";

        throw new BadRequestHttpException(
          `${message.users.emailExists} Registered as: ${roleName}`
        );
      }

      const adminMail = await this.userDaos.findOneByEmail(tokenData.email)
      // SuperAdmin Logic: Ensure only one email is assigned as Plant Admin for a plant
      if (adminMail.email.includes(tokenData.email) && tokenData.role === roleEnum.SUPER_ADMIN) {
        let plantExists = await this.plantDaos.findOneById(reqData.plantId);
        if (!plantExists) {
          throw new NotFoundHttpException(message.plant.noDataFound);
        }

        const existingPlantAdmin = await this.userDaos.findOneByPlant(reqData.plantId);
        if (existingPlantAdmin) {
          throw new BadRequestHttpException(
            `${message.users.differentEmailAssignedToPlant}. Current Admin: ${existingPlantAdmin.email}`
          );
        }

        const userRole = await this.roleDaos.findRoleByName(roleEnum.PLANT_ADMIN);
        const createAdmin = {
          email: reqData.email,
          name: reqData.name,
          passwordHash: password,
          plantId: reqData.plantId,
          roleId: userRole.id,
        };

        const createPlantAdmin = await this.userDaos.create(createAdmin);
        const templatePath = `${process.cwd()}/src/template/create.user.ejs`
        const emailData = {
          userEmail: createPlantAdmin.email,
          userPassword: reqData.password,
          userName: createPlantAdmin.name
        }

        await this.emailService.sendMail({
          emailTo: createPlantAdmin.email,
          subject: NotificationSubject.NEW_USER,
          html: await ejs.renderFile(templatePath, emailData),
        });

        return createPlantAdmin;
      }

      // Plant Admin Logic: Ensure unique user emails within the same plant
      if (tokenData.role === roleEnum.PLANT_ADMIN) {
        const plantExists = await this.plantDaos.findOneById(tokenData.plantId);
        if (!plantExists) {
          throw new NotFoundHttpException(message.plant.noDataFound);
        }

        const emailInPlant = await this.userDaos.findOneByEmailAndPlant(reqData.email, tokenData.plantId);
        if (emailInPlant) {
          throw new BadRequestHttpException(
            `${message.users.emailAlreadyAssignedToPlant}. Assigned as: Plant User`
          );
        }

        const userRole = await this.roleDaos.findRoleByName(reqData.roleName);
        const createUser = {
          email: reqData.email,
          name: reqData.name,
          passwordHash: password,
          plantId: tokenData.plantId,
          roleId: userRole.id,
        };

        const createPlantUser = await this.userDaos.create(createUser);
        const templatePath = `${process.cwd()}/src/template/create.user.ejs`
        const emailData = {
          userEmail: createPlantUser.email,
          userPassword: reqData.password,
          userName: createPlantUser.name
        }

        await this.emailService.sendMail({
          emailTo: createPlantUser.email,
          subject: NotificationSubject.NEW_USER,
          html: await ejs.renderFile(templatePath, emailData),
        });
        return createPlantUser;
      }

      throw new ForbiddenHttpException(message.users.roleNotAllowed);
    } catch (error) {
      logger.error({
        message: error?.message || "Error during user creation",
        context: "UserService",
        method: "createUsers",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Retrieve all users
   * @returns {Promise<User[]>}
   */
  public findAllUser = async (): Promise<User[]> => {
    logger.info({
      message: "Fetching all users",
      context: "UserService",
      method: "findAllUser",
    });
    try {
      const allUsers: User[] = await this.userDaos.findAll();
      if (!allUsers.length) {
        logger.warn("No users found");
        throw new NotFoundHttpException(message.users.dataNotFound);
      }
      logger.info({
        message: "Successfully fetched all users",
        context: "UserService",
        method: "findAllUser",
        allUsers,
      });
      return allUsers;
    } catch (error) {
      logger.error({
        error: error?.message || "Error fetching all users",
        context: "UserService",
        method: "findAllUser",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Find user by ID
   * @param userId
   * @returns {Promise<User>}
   */
  public findUserById = async (userId: string): Promise<User> => {
    logger.info({
      message: "Starting user search by ID",
      userId,
      context: "UserService",
      method: "findUserById",
    });
    try {
      if (isEmpty(userId)) {
        logger.warn("User ID is required for search");
        throw new BadRequestHttpException(message.users.userIdRequired);
      }

      const findUser: User = await this.userDaos.findOneById(userId, roleEnum.PLANT_USER);
      if (!findUser) {
        logger.warn("User not found with given ID", { userId });
        throw new NotFoundHttpException(message.users.notFound);
      }
      logger.info({
        message: "User found by ID",
        findUser,
        context: "UserService",
        method: "findUserById",
      });
      return findUser;
    } catch (error) {
      logger.error({
        error: error?.message || "Error finding user by ID",
        context: "UserService",
        method: "findUserById",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Filter users
   * @param data {UserFilterDto}
   * @returns {Promise<User>}
   */
  public userFilterData = async (data: UserFilterDto): Promise<User[]> => {
    logger.info({
      message: "Starting user filter",
      data,
      context: "UserService",
      method: "userFilterData",
    });

    try {
      const { sortBy, order, limit, page, userId } = data;
      const options: any = {
        where: {},
      };

      // Ensure sorting is provided
      if (!isEmpty(sortBy) && !isEmpty(order)) {
        options.order = [[sortBy, order]];
      }

      // Apply userId filter if provided
      if (!isEmpty(userId)) {
        options.where.userId = userId;
      }

      // Parse limit and page as integers, defaulting to 10 and 1 respectively
      options.limit = isEmpty(limit) ? 10 : parseInt(limit.toString(), 10);
      options.offset = (isEmpty(page) ? 0 : parseInt(page.toString(), 10) - 1) * options.limit;

      // Apply role filter for PLANT_USER
      options.where.role = roleEnum.PLANT_USER;


      // Fetch filtered users from the database
      const filteredUsers = await this.userDaos.findAll(options);

      // Log successful completion
      logger.info({
        message: "User filter completed",
        filteredUsers,
        context: "UserService",
        method: "userFilterData",
      });

      return filteredUsers; // Returning the filtered users

    } catch (error) {
      // Error logging with details
      logger.error({
        error: error?.message || "Error filtering users",
        context: "UserService",
        method: "userFilterData",
      });

      // Throwing a custom HTTP exception
      throw new HttpException(
        500,
        error?.message || "Server error"
      );
    }
  };

  /**
 *
 * @param userId
 * @returns
 */
  public getUser = async (userId: string): Promise<User> => {
    logger.info({
      message: "Starting delete user",
      userId,
      context: "UserService",
      method: "deleteAdmin",
    });
    try {
      if (isEmpty(userId)) {
        logger.warn("User id is required for fetching user details");
        throw new BadRequestHttpException(message.users.userId);
      }

      const checkUser = await this.userDaos.findById(userId);
      if (!checkUser) {
        logger.warn("User not found with given ID", { userId });
        throw new NotFoundHttpException(message.users.notFound);
      }
      logger.info({
        message: "Get user is completed",
        context: "UserService",
        method: "getUser",
        checkUser,
      });
      return checkUser;
    } catch (error) {
      logger.error({
        error: error?.message || "Error get user",
        context: "UserService",
        method: "getUser",
      });
      if (error instanceof BadRequestHttpException || error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * updateUser
   * @param reqData
   * @returns
   */

  public updateUser = async (reqData: any): Promise<any> => {
    logger.info({
      message: "Starting update user",
      reqData,
      context: "UserService",
      method: "updateUser",
    });

    try {
      const { userId } = reqData.reqQuery;
      const { id, role, plantId } = reqData.reqUserData;
      const { name, employeeCode, department, designation, password } = reqData.reqBody;
      const passwordHash = password ? await hashPassword(password) : ""

      if (!id) {
        logger.warn("User ID is required for updating the admin");
        throw new BadRequestHttpException(message.admin.adminIdRequired);
      }

      const updateFields = {
        ...(name && { name }),
        ...(employeeCode && { employeeCode }),
        ...(department && { department }),
        ...(designation && { designation }),
        ...(password && { passwordHash }),
      };

      if (!Object.keys(updateFields).length) {
        throw new BadRequestHttpException(message.admin.noFieldsToUpdate);
      }

      let whereCondition: any = { id: userId };
      let targetUser: any;

      // if (role === roleEnum.SUPER_ADMIN) {
      //   if (userId !== id) {
      //     targetUser = await this.userDaos.findById(userId);
      //     const plantAdminRole = await this.roleDaos.findRoleByName(roleEnum.PLANT_ADMIN);

      //     if (targetUser?.roleId !== plantAdminRole?.id) {
      //       throw new BadRequestHttpException(message.admin.updation);
      //     }

      //     whereCondition.roleId = plantAdminRole.id;
      //   }
      // } else if (role === roleEnum.PLANT_ADMIN) {
      //   targetUser = await this.userDaos.findById(userId);

      //   if (targetUser?.plantId !== plantId) {
      //     throw new BadRequestHttpException(message.admin.plantAdmin);
      //   }

      //   whereCondition.plantId = plantId;
      // } else {
      //   throw new BadRequestHttpException(message.role.invalidRole);
      // }

      // Update user and return result
      const updatedData = await this.userDaos.update(updateFields, whereCondition);
      logger.info({
        message: "Update user is completed",
        context: "UserService",
        method: "updateUser",
      });

      return updatedData;
    } catch (error) {
      logger.error({
        error: error?.message || "Error updating user",
        context: "UserService",
        method: "updateUser",
      });

      if (error instanceof BadRequestHttpException) {
        throw error;
      }

      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   *
   * @param userId
   * @returns
   */
  public deleteUser = async (userId: string): Promise<User> => {
    logger.info({
      message: "Starting delete user",
      userId,
      context: "UserService",
      method: "deleteAdmin",
    });
    try {
      if (isEmpty(userId)) {
        logger.warn("User id is required for deleting the admin");
        throw new BadRequestHttpException(message.admin.adminIdRequired);
      }

      const checkUser = await this.userDaos.findById(userId);
      if (!checkUser) {
        logger.warn("User not found with given ID", { userId });
        throw new NotFoundHttpException(message.users.notFound);
      }
      const deleteAdmin = await this.userDaos.delete(userId);
      logger.info({
        message: "Delete user is completed",
        context: "UserService",
        method: "deleteUser",
        deleteAdmin,
      });
      return deleteAdmin;
    } catch (error) {
      logger.error({
        error: error?.message || "Error delete user",
        context: "UserService",
        method: "deleteUser",
      });
      if (error instanceof BadRequestHttpException || error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  public approveDocument = async (reqData): Promise<any> => {
    logger.info({
      message: "Starting Approve Document",
      reqData,
      context: "UserService",
      method: "approveDocument",
    });
    try {
      const getData = await this.userDaos.get(reqData);
      if (!getData)
        throw new NotFoundHttpException(message.general.dataNotFound);

      const saveData = {
        documentId: reqData.reqQuery.documentId,
        approverId: getData.filteredHierarchy.approverUserId,
        currentApproverLevel: getData.filteredHierarchy.level,
        totalApproverLevel: getData.approvalHierarchyCount
      }
      const approvalData = await this.approvalDaos.assignApproval(saveData)
      logger.info({
        message: "Approve Document completed",
        context: "UserService",
        method: "approveDocument",
        getData,
      });
      return approvalData;
    } catch (error) {
      logger.error({
        error: error?.message || "Error during getData",
        context: "UserService",
        method: "approveDocument",
      });
      if (error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
 * Find User by Plant ID
 * @param userId
 * @returns {Promise<User>}
 */
  public getUserByPlant = async (plantId: string): Promise<User> => {
    logger.info({
      message: "Starting user search by Plant ID",
      plantId,
      context: "UserService",
      method: "getUserByPlant",
    });
    try {
      if (isEmpty(plantId)) {
        logger.warn("Plant ID is required for search");
        throw new BadRequestHttpException(message.plant.plantIdRequired);
      }

      const findUser: User = await this.userDaos.findUserByPlantId(plantId);
      if (!findUser) {
        logger.warn("User not found with given ID", { plantId });
        throw new NotFoundHttpException(message.users.notFound);
      }
      logger.info({
        message: "User found by ID",
        findUser,
        context: "UserService",
        method: "getUserByPlant",
      });
      return findUser;
    } catch (error) {
      logger.error({
        error: error?.message || "Error finding user by ID",
        context: "UserService",
        method: "getUserByPlant",
      });
      if (error instanceof BadRequestHttpException || error instanceof NotFoundHttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

}

export default UserService;
