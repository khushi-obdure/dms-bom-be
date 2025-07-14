import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { BomApproval } from "@interfaces/bom-approval.interface";
import { statusEnum } from "@/utils/enum";

export type BomApprovalsCreationAttributes = Optional<
  BomApproval,
  | "id"
  | "bomId"
  | "approverId"
  | "bomHierarchyId"
  | "status"
  | "statusText"
  | "currentApproverLevel"
  | "totalApproverLevel"
>;

export class BomApprovalsModel
  extends Model<BomApproval, BomApprovalsCreationAttributes>
  implements BomApproval {
  public id: string;
  public bomId: string;
  public approverId: string;
  public bomHierarchyId: string;
  public status: string;
  public statusText: string
  public comments: string;
  public currentApproverLevel: number;
  public totalApproverLevel: number;
}

export default function (sequelize: Sequelize): typeof BomApprovalsModel {
  BomApprovalsModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bomId: {
        allowNull: false,
        type: DataTypes.UUID,
        references: {
          model: "bom",
          key: "id",
        },
      },
      approverId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: "user",
          key: "id",
        },
      },
      bomHierarchyId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM(...Object.values(statusEnum)),
        defaultValue: "Pending",
      },
      statusText: {
        allowNull: true,
        type: DataTypes.STRING
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
    },
    {
      tableName: "bomApprovals",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return BomApprovalsModel;
}
