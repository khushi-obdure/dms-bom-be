import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { BomDataInterface } from "@/interfaces/bom.interface";

import { statusEnum, submissionStatusEnum } from "@/utils/enum";

export type BomDataAttributes = Optional<
  BomDataInterface,
  | "id"
  | "userId"
  | "plantId"
  | "status"
  | "statusText"
  | "enggDataBase"
  | "projectNo"
  | "productNo"
  | "productName"
  | "dwgNo"
  | "sapNo"
  | "productGroup"
  | "image"
  | "revNo"
  | "googleSheetLink"
  | "ecnEcrNo"
  | "model"
  | "customerName"
  | "customerNo"
  | "submissionStatus"
  | "bomType"
  | "version"
  | "parentBomId"
  | "drawing"
>;

export class BomDataModal
  extends Model<BomDataInterface, BomDataAttributes>
  implements BomDataInterface {
  public id!: string;
  public userId: string;
  public plantId: string;
  public bomId: string;
  public status: string;
  public statusText!: string;
  public enggDataBase: string;
  public projectNo: string;
  public productNo: string;
  public productName: string;
  public dwgNo: string;
  public sapNo: string;
  public productGroup: string;
  public image: string;
  public revNo: string;
  public googleSheetLink: string;
  public ecnEcrNo: string;
  public model: string;
  public customerName: string;
  public customerNo: string;
  public submissionStatus: string;
  public bomType: string;
  public version: string;
  public parentBomId: string
  public drawing: string
}

export default function (sequelize: Sequelize): typeof BomDataModal {
  BomDataModal.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: "user",
          key: "id",
        },
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
      bomId: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM(...Object.values(statusEnum)),
        defaultValue: "Pending",
      },
      statusText: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      enggDataBase: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      projectNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      productNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      productName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      dwgNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      sapNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      productGroup: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      image: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      revNo: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: '00'
      },
      googleSheetLink: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      ecnEcrNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      model: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      customerName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      customerNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      bomType: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      submissionStatus: {
        allowNull: false,
        type: DataTypes.ENUM(...Object.values(submissionStatusEnum)),
        defaultValue: "Completed"
      },
      version: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: '1.0'
      },
      parentBomId: {
        allowNull: true,
        type: DataTypes.UUID,
        references: {
          model: 'bom',
          key: 'id',
        },
      },
      drawing: {
        allowNull: true,
        type: DataTypes.STRING
      }
    },
    {
      tableName: "bom",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return BomDataModal;
}
