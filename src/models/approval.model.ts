import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Approvals } from "@interfaces/approval.interface";
import { statusEnum } from "@/utils/enum";

export type ApprovalsCreationAttributes = Optional<
  Approvals,
  | "id"
  | "documentId"
  | "approverId"
  | "status"
  | "comments"
  | "reminderCount"
  | "currentApproverLevel"
  | "totalApproverLevel"
  | "sendBackLevel"
  | "emailCount"
>;

export class ApprovalsModel
  extends Model<Approvals, ApprovalsCreationAttributes>
  implements Approvals {
  public id: string
  public documentId: string;
  public approverId: string;
  public status: string;
  public comments: string;
  public reminderCount: number;
  public currentApproverLevel: number
  public totalApproverLevel: number
  public sendBackLevel: number
  public emailCount: number
}

export default function (sequelize: Sequelize): typeof ApprovalsModel {
  ApprovalsModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      documentId: {
        allowNull: false,
        type: DataTypes.UUID,
        references: {
          model: 'documents',
          key: 'id',
        },
      },
      approverId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: 'user',
          key: 'id',
        },
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM(...Object.keys(statusEnum)),
        defaultValue: 'Pending',
      },
      comments: {
        allowNull: true,
        type: DataTypes.TEXT,
        defaultValue: null,
      },
      reminderCount: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      currentApproverLevel: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      totalApproverLevel: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: null,
      },
      sendBackLevel: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: null
      },
      emailCount: {
        allowNull: true,
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
    },
    {
      tableName: "approvals",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return ApprovalsModel;
}
