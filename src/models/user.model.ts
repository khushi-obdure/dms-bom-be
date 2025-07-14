import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { User } from "@interfaces/user.interface";
import { roleEnum } from "@/utils/enum";

export type UserCreationAttributes = Optional<
  User,
  "id" | "name" | "email" | "passwordHash" | "plantId" | "employeeCode" | "department" | "designation" | "isLoggedIn" | "roleId"
>;

export class UserModel
  extends Model<User, UserCreationAttributes>
  implements User {
  public id!: string;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public plantId!: string;
  public employeeCode!: string;
  public department!: string;
  public designation!: string;
  public isLoggedIn!: boolean
  public roleId!: string
}

export default function (sequelize: Sequelize): typeof UserModel {
  UserModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      plantId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: "plant",
          key: "id",
        },
      },
      roleId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: "role",
          key: "id",
        },
      },
      name: {
        allowNull: true,
        type: DataTypes.STRING(255),
      },
      email: {
        allowNull: true,
        type: DataTypes.STRING(255),
        defaultValue: null,
      },
      passwordHash: {
        allowNull: true,
        type: DataTypes.STRING(255),
        defaultValue: null,
      },

      employeeCode: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: null,
      },
      department: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: null,
      },
      designation: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: null,
      },
      isLoggedIn: {
        allowNull: false,
        defaultValue: false,
        type: DataTypes.BOOLEAN
      },
    },
    {
      tableName: "user",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return UserModel;
}
