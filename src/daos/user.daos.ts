import { Op, Sequelize } from "sequelize";
import DB from "@/database";
import { isEmpty } from "class-validator";
import { constants } from "@utils/constant";
import { roleEnum } from "@/utils/enum";

/**
 * Data Access Object (DAO) for User operations.
 * This class handles various user-related database operations using Sequelize ORM.
 */
class UserDaos {
  // Database models
  public users = DB.User;
  public userRoleMatrix = DB.UserRoleMatrix;
  public role = DB.Role;
  public plant = DB.Plant
  public document = DB.Document
  public template = DB.Template
  public approval = DB.Approval

  /**
   * Create a new user in the database.
   * @param reqData - Data Transfer Object containing user details to create.
   * @returns Created user data.
   */
  public create = async (reqData: object) => {
    // Validate if reqData is not empty (optional, depending on input handling)
    return await this.users.create(reqData);
  };

  /**
   * Find user details along with roles and permissions.
   * Supports OTP-based login if `otp` is provided.
   * @param username - Username, email, or phone number for lookup.
   * @param otp - Optional OTP for verification.
   * @returns User details including roles and permissions.
   */
  public findOneWithDetails = async (
    username: string,
    otp: number = null
  ): Promise<any> => {
    const where: any = {
      [Op.or]: [
        { email: username },
        { phone_number: username },
        { username: username },
      ],
    };

    // Add condition for OTP-based login if OTP is provided
    if (!isEmpty(otp)) {
      where.otp = otp;
    }

    let userDetails: any = await this.users.findOne({
      where,
      attributes: [
        "id",
        "password_hash",
        "username",
        "email",
        "status",
        "first_name",
        "last_name",
      ],
      include: [
        {
          model: this.userRoleMatrix,
          required: false, // true for INNER JOIN, false for LEFT OUTER JOIN
          attributes: ["id", "role_id", "user_id"],
          include: [
            {
              model: this.role,
              required: false, // true for INNER JOIN, false for LEFT OUTER JOIN
              attributes: ["id", "role_name", "permissions"],
            },
          ],
        },
      ],
    });

    // Ensure userDetails is not null before calling .toJSON()
    if (userDetails) {
      userDetails = userDetails.toJSON();
    } else {
      // If userDetails is null, return an empty response to prevent further errors
      return { userDetails: null, permissionList: [] };
    }

    let permissionList = [];

    // Check and transform roles/permissions if present
    if (userDetails.UserRoleMatrixModels) {
      userDetails.user_roles = [...userDetails.UserRoleMatrixModels];
      delete userDetails.UserRoleMatrixModels;

      for (const i in userDetails.user_roles) {
        permissionList.push(...userDetails.user_roles[i].RoleModel.permissions);
        userDetails.user_roles[i] = {
          id: userDetails.user_roles[i].RoleModel.id,
          role_name: userDetails.user_roles[i].RoleModel.role_name,
          permissions: userDetails.user_roles[i].RoleModel.permissions,
        };
      }
    }

    // Remove duplicates from permission list
    permissionList = [...new Set(permissionList)];

    return { userDetails, permissionList };
  };

  /**
   * Get the list of roles by a specific user ID.
   * @param userId - User's ID.
   * @returns List of roles associated with the user.
   */
  public roleListByUserId = async (userId: number): Promise<any> => {
    const roleData: any = await this.userRoleMatrix.findAll({
      where: {
        user_id: userId,
        status: { [Op.ne]: constants.STATUS.DELETED },
      },
      attributes: ["id"],
      include: [
        {
          model: this.role,
          where: { status: { [Op.ne]: constants.STATUS.DELETED } },
          required: false, // true for INNER JOIN, false for LEFT OUTER JOIN
          attributes: ["id", "role_name", "permissions"],
        },
      ],
    });

    // Transform role data if found
    if (roleData.length) {
      for (const i in roleData) {
        roleData[i] = {
          id: roleData[i].RoleModel.id,
          role_name: roleData[i].RoleModel.role_name,
          permissions: roleData[i].RoleModel.permissions,
        };
      }
    }

    return roleData;
  };

  /**
   * Find roles and permissions for a specific user.
   * @param userId - User's ID.
   * @returns User's role list and permission list.
   */
  public findRoleAndPermission = async (userId: number): Promise<any> => {
    const roleList: any = await this.userRoleMatrix.findAll({
      where: {
        user_id: userId,
        status: constants.STATUS.ACTIVE,
      },
      attributes: ["id", "role_id", "user_id"],
      include: [
        {
          model: this.role,
          required: false, // true for INNER JOIN, false for LEFT OUTER JOIN
          attributes: ["id", "role_name", "permissions"],
        },
      ],
    });

    const roles = [];
    let permissions: any = [];
    if (roleList.length) {
      for (let role of roleList) {
        role = role.toJSON();
        // Set role list
        roles.push({
          id: role.role_id,
          role_name: role.role_name,
          permissions: role.RoleModel.permissions,
        });
        // Set permission list
        permissions.push(...role.RoleModel?.permissions);
      }

      // Remove duplicates from permissions list
      permissions = [...new Set(permissions)];
    }

    return { roles, permissions };
  };

  /**
   * Find a user by ID with an active status.
   * @param userId - User's ID.
   * @returns User data if found.
   */
  public findOneById = async (id: string, role: string) => {
    return await this.users.findOne({
      where: {
        userId: id,
        role
      },
    });
  };

  /**
   * Find a user by email with an active status.
   * @param email - User's email.
   * @returns User data if found.
   */
  public findOneByEmail = async (email: string) => {
    const userData = await this.users.findOne({
      where: {
        email,
      },
    });
    return userData
  };

  public findEmailAndPlantDetails = async (email: string) => {
    const userData = await this.users.findOne({
      where: {
        email,
      },
      include: [{ model: this.plant }],
    });
    return userData
  };

  public findById = async (id: string | string[],) => {
    if (typeof id === 'string') {
      return await this.users.findOne({
        where: { id },
        attributes: { exclude: ['passwordHash'] },
        include: [
          {
            model: this.plant,
            attributes: { exclude: ['facility', 'createdAt', 'updatedAt'] }
          }
        ]
      })

    }
    return await this.users.findAll({
      where: {
        id: {
          [Op.in]: id,  // This works for an array of IDs
        }
      },
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: this.plant,
          attributes: { exclude: ['facility', 'createdAt', 'updatedAt'] }
        }
      ]
    });

  }

  public findOneByEmailAndPlant = async (email: string, plantId: string) => {
    return await this.users.findOne({
      where: {
        email,
        plantId,
      },
    });
  }

  public findOneByPlant = async (plantId: string) => {
    return await this.users.findOne({
      where: {
        plantId,
      },
    });
  }

  /**
   * Get all users in the system.
   * @returns List of all users.
   */
  public findAll = async (data: { [key: string]: any } = {}) => {
    if (Object.keys(data).length) {
      return await this.users.findAll(data);
    }
    return await this.users.findAll();
  };

  /**
   * delete
   * @param id
   * @returns
   */
  public delete = async (id: string) => {
    return await this.users.destroy({
      where: {
        id,
      },
    });
  };

  /**
   * update
   * @param id
   * @param data
   * @returns
   */
  public update = async (data: object, whereCondition: any) => {
    await this.users.update(data, { where: whereCondition });
    return await this.users.findOne({
      where: whereCondition, attributes: { exclude: ['passwordHash'] },
    });
  };

  public getAllUsers = async (whereCondition: any): Promise<any> => {
    const { page, limit, offset, userWhereCondition, plantWhereCondition } = whereCondition;
    // Perform database query
    const getUsers = await this.users.findAndCountAll({
      where: userWhereCondition,
      attributes: { exclude: ['passwordHash'] },
      include: [
        {
          model: this.plant,
          attributes: ["id", "plantName", "acronym"],
          where: Object.keys(plantWhereCondition).length > 0 ? plantWhereCondition : undefined,
        },
        {
          model: this.role,
          attributes: ['id', 'roleName']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });

    // Construct and return paginated result
    const paginatedResult = {
      totalItems: getUsers.count,
      totalPages: Math.ceil(getUsers.count / limit),
      currentPage: page,
      pageSize: limit,
      data: getUsers.rows,
    };

    return paginatedResult;
  };

  public findUserByPlantId = async (plantId: string) => {
    return this.users.findAll({
      where: { plantId },
      attributes: { exclude: ['passwordHash'] },
      include: [{
        model: this.role,
        where: { roleName: "PLANT_USER" }
      }]
    })
  }

  public get = async (reqData) => {
    const value = reqData.reqQuery.level;

    const getApprovalHierarchy = await this.template.findOne({
      where: {
        id: reqData.reqQuery.templateId,
      },
      attributes: {
        include: [
          [
            Sequelize.literal(`
                        JSON_EXTRACT(
                            approval_hierarchy,
                            REPLACE(
                                JSON_UNQUOTE(
                                    JSON_SEARCH(approval_hierarchy, 'one', '${value}', NULL, '$[*].level')
                                ),
                                '.level',
                                ''
                            )
                        )
                    `),
            'filteredHierarchy',
          ],
          [
            Sequelize.literal(`
                        JSON_LENGTH(approval_hierarchy)
                    `),
            'approvalHierarchyCount',
          ],
        ],
      },
      raw: true
    });

    return getApprovalHierarchy;
  };

  public getUser = async (plantId: string): Promise<any> => {
    return await this.users.findOne({
      where: {
        plantId,
      },
      include: [
        {
          model: this.role,
          where: { roleName: roleEnum.PLANT_ADMIN },
        },
      ],
    });

  }

}

export default UserDaos;
