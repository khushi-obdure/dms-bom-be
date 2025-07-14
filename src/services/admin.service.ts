import DB from "@/database";
import { hashPassword, isEmpty } from "@utils/util";
import UserDaos from "@daos/user.daos";
import { message } from "@utils/message";
import {
  BadRequestHttpException,
  NotFoundHttpException,
  HttpException,
} from "@exceptions/HttpException";
import { roleEnum } from "@/utils/enum";
import RoleDaos from "@/daos/role.daos";
import PlantDaos from "@/daos/plant.daos";
import { logger, stream } from "@utils/logger";
import AuthService from "@services/auth.service";
import { User } from "@interfaces/user.interface";
import { AdminFilterDto, CreateAdminDto } from "@/dtos/admin.dto";
import { Op } from "sequelize";

class AdminService {
  public users = DB.User;
  public plant = DB.Plant
  public roleDaos = new RoleDaos()
  public userDaos = new UserDaos();
  public plantDaos = new PlantDaos();
  public authService = new AuthService();

  /**
   * Create a admin
   * @param reqData
   * @returns {Promise<User[]>}
   */
  public createAdmin = async (reqData: CreateAdminDto): Promise<User[]> => {
    logger.info({
      message: "Starting admin creation",
      context: "AdminService",
      method: "createAdmin",
    });
    try {
      const checkPlantData = await this.plantDaos.findOneById(reqData.plantId);
      if (!checkPlantData)
        throw new NotFoundHttpException(message.plant.noDataFound);

      const checkEmailData = await this.userDaos.findOneByEmail(reqData.email);
      if (checkEmailData && Object.keys(checkEmailData).length)
        throw new BadRequestHttpException(message.users.emailExists);

      const passwordHash = await hashPassword(reqData.password);
      const objData = {
        ...reqData,
        role: roleEnum.PLANT_ADMIN,
        passwordHash,
      };
      const data = await this.userDaos.create(objData);
      logger.info({
        message: "Admin creation completed",
        context: "AdminService",
        method: "createAdmin",
      });
      return data;
    } catch (error) {
      logger.error({
        error: error?.message || "Error during user creation",
        context: "AdminService",
        method: "createAdmin",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Retrieve all admin
   * @returns {Promise<User[]>}
   */
  public findAllAdmin = async (): Promise<User[]> => {
    logger.info({
      message: "Fetching all admin",
      context: "AdminService",
      method: "findAllAdmin",
    });
    try {
      const allAdmin: User[] = await this.userDaos.findAll({
        role: roleEnum.PLANT_ADMIN,
      });
      if (!allAdmin.length) {
        logger.warn("No users found");
        throw new NotFoundHttpException(message.admin.adminDataNotFound);
      }
      logger.info({
        message: "Successfully fetched all admin",
        context: "AdminService",
        method: "findAllAdmin",
      });
      return allAdmin;
    } catch (error) {
      logger.error({
        error: error?.message || "Error fetching all admin",
        context: "AdminService",
        method: "findAllAdmin",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Find admin by ID
   * @param adminId
   * @returns {Promise<User>}
   */
  public findAdminById = async (adminId: string): Promise<User> => {
    logger.info({
      message: "Starting admin search by ID",
      adminId,
      context: "AdminService",
      method: "findAdminById",
    });
    try {
      if (isEmpty(adminId)) {
        logger.warn("Admin ID is required for search");
        throw new BadRequestHttpException(message.users.userIdRequired);
      }

      const findAdmin: User = await this.userDaos.findOneById(adminId, roleEnum.PLANT_ADMIN);
      if (!findAdmin) {
        logger.warn("Admin not found with given ID", { adminId });
        throw new NotFoundHttpException(message.users.notFound);
      }
      logger.info({
        message: "Admin found by ID",
        adminId,
        context: "AdminService",
        method: "findAdminById",
      });
      return findAdmin;
    } catch (error) {
      logger.error({
        error: error?.message || "Error finding admin by ID",
        context: "AdminService",
        method: "findAdminById",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * Filter admin
   * @param data {AdminFilterDto}
   * @returns {Promise<User>}
   */
  public adminFilterData = async (data: AdminFilterDto): Promise<User[]> => {
    logger.info({
      message: "Starting admin filter",
      context: "AdminService",
      method: "adminFilterData",
      filterData: data,
    });

    try {
      const { sortBy, order, limit, page, adminId } = data;
      const options: any = {
        where: {},
      };

      if (!isEmpty(sortBy) && !isEmpty(order)) {
        options.order = [[sortBy, order]];
      }

      if (!isEmpty(adminId)) {
        options.where.userId = adminId;
      }

      options.limit = isEmpty(limit) ? 10 : parseInt(limit.toString(), 10);
      options.offset =
        (isEmpty(page) ? 0 : parseInt(page.toString(), 10) - 1) * options.limit;

      options.where.role = roleEnum.PLANT_ADMIN;

      const filterdAdminData = await this.userDaos.findAll(options);

      logger.info({
        message: "Admin filter completed",
        context: "AdminService",
        method: "adminFilterData",
        filterdAdminData, // Log filtered admin data
      });

      return filterdAdminData; // Return the filtered admin data
    } catch (error) {
      logger.error({
        error: error?.message || "Error filtering admin",
        context: "AdminService",
        method: "adminFilterData",
      });

      throw new HttpException(500, error?.message || "Server error");
    }
  };

  /**
   * deleteAdmin
   * @param adminId {string}
   * @returns {Promise<User>}
   */
  public deleteAdmin = async (adminId: string): Promise<User> => {
    logger.info({
      message: "Starting delete admin",
      adminId,
      context: "AdminService",
      method: "deleteAdmin",
    });
    try {
      if (isEmpty(adminId)) {
        logger.warn("Admin ID is required for deleting the admin");
        throw new BadRequestHttpException(message.admin.adminIdRequired);
      }

      const checkAdmin = await this.userDaos.findOneById(adminId, roleEnum.PLANT_ADMIN);

      if (!checkAdmin) {
        logger.warn("User not found with given ID", { adminId });
        throw new NotFoundHttpException(message.admin.adminDataNotFound);
      }
      const deleteAdmin = await this.userDaos.delete(adminId);
      logger.info({
        message: "Delete admin is completed",
        context: "AdminService",
        method: "deleteAdmin",
        deleteAdmin,
      });
      return deleteAdmin;
    } catch (error) {
      logger.error({
        error: error?.message || "Error delete admin",
        context: "AdminService",
        method: "deleteAdmin",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
   * updateAdmin
   * @param reqData
   * @returns
   */
  public updateAdmin = async (reqData: any): Promise<User> => {
    logger.info({
      message: "Starting update admin",
      reqData,
      context: "AdminService",
      method: "updateAdmin",
    });
    try {
      const { adminId } = reqData;
      if (isEmpty(adminId)) {
        logger.warn("Admin ID is required for updating the admin");
        throw new BadRequestHttpException(message.admin.adminIdRequired);
      }
      const deleteAdmin = await this.userDaos.update(adminId, reqData);
      logger.info({
        message: "Update admin is completed",
        context: "AdminService",
        method: "updateAdmin",
        deleteAdmin,
      });
      return deleteAdmin;
    } catch (error) {
      logger.error({
        error: error?.message || "Error update admin",
        context: "AdminService",
        method: "updateAdmin",
      });
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

  /**
  * getAllUsers
  * @param adminId {string}
  * @returns {Promise<User>}
  */
  public getAllUsers = async (reqData): Promise<any> => {
    logger.info({
      message: "Starting Getting All the Users",
      reqData,
      context: "AdminService",
      method: "getAllUsers",
    });

    try {
      const { roleId, plantId } = reqData.userData;
      const { plantName, page, limit, id } = reqData.reqQueryData;

      // Prepare whereCondition for DAO
      const whereCondition: any = {
        userWhereCondition: {},
        plantWhereCondition: {},
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 10,
      };

      // If `id` is provided, fetch data for the specific user
      if (id) {
        whereCondition.userWhereCondition.id = id;
      } else if (plantName) {
        // Add plantName condition if provided
        whereCondition.plantWhereCondition.plantName = {
          [Op.like]: `%${plantName}%`,
        }
      }

      const superAdminRole = await this.roleDaos.findRoleByName(roleEnum.SUPER_ADMIN);
      const plantAdminRole = await this.roleDaos.findRoleByName(roleEnum.PLANT_ADMIN);
      const plantUserRole = await this.roleDaos.findRoleByName(roleEnum.PLANT_USER);
      const moderatorRole = await this.roleDaos.findRoleByName(roleEnum.PLANT_MODERATOR);

      if (roleId === superAdminRole.id) {
        // SuperAdmin: Fetch only PlantUser data
        whereCondition.userWhereCondition.roleId = plantAdminRole.id;
      } else if (roleId === plantAdminRole.id) {
        // PlantAdmin: Fetch PlantUsers and moderator under the same plant
        whereCondition.userWhereCondition.roleId = {
          [Op.in]: [moderatorRole.id, plantUserRole.id],
        };
        whereCondition.userWhereCondition.plantId = plantId; // Scope to the PlantAdmin's plant
      } else if (roleId === plantUserRole.id) {
        // PlantUser: Fetch only their data
        whereCondition.userWhereCondition.id = reqData.userData.id; // Restrict to their user ID
      } else {
        throw new HttpException(403, "Unauthorized access");
      }

      // Calculate offset for pagination
      whereCondition.offset = (whereCondition.page - 1) * whereCondition.limit;

      const getUsers = await this.userDaos.getAllUsers(whereCondition);

      logger.info({
        message: "Get All User is completed",
        context: "AdminService",
        method: "getAllUsers",
        getUsers,
      });

      return getUsers;
    } catch (error) {
      logger.error({
        error: error?.message || "Error getting users",
        context: "AdminService",
        method: "getAllUsers",
      });
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        500,
        error?.message || message.general.serverError
      );
    }
  };

}

export default AdminService;
