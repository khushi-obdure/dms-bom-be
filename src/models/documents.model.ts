import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Documents } from "@interfaces/documents.interface";
import { statusEnum } from "@/utils/enum";

export type DocumentsCreationAttributes = Optional<
  Documents,
  | "id"
  | "documentTitle"
  | "fileUrl"
  | "status"
  | "statusText"
  | "templateId"
  | "userId"
  | "referenceId"
  | "version"
  | "projectCode"
  | "typeOfCustomer"
  | "projectFamily"
  | "assemblyDrawingNumber"
  | "fgSapCode"
  | "childSapCode"
  | "productPicture"
  | "fgAndChildPart"
  | "reasonForChange"
  | "changeInitiationDate"
  | "typeOfChange"
  | "googlesheetLink"
>;

export class DocumentsModel
  extends Model<Documents, DocumentsCreationAttributes>
  implements Documents {
  public id: string;
  public documentTitle: string;
  public fileUrl: string[];
  public status: string;
  public statusText: string;
  public templateId: string;
  public userId: string;
  public referenceId: string;
  public version: string;
  public projectCode: string
  public typeOfCustomer: string;
  public projectFamily: string;
  public assemblyDrawingNumber: string;
  public fgSapCode: number;
  public childSapCode: number
  public productPicture: string[];
  public fgAndChildPart: string;
  public reasonForChange: string;
  public changeInitiationDate: Date;
  public typeOfChange: string;
  public googlesheetLink: string;
}

export default function (sequelize: Sequelize): typeof DocumentsModel {
  DocumentsModel.init(
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
          model: 'user',
          key: 'id',
        },
      },
      templateId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: 'template',
          key: 'id',
        },
      },
      documentTitle: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      fileUrl: {
        allowNull: true,
        type: DataTypes.JSON,
        defaultValue: null,
      },
      status: {
        allowNull: true,
        type: DataTypes.ENUM(...Object.keys(statusEnum)),
        defaultValue: 'Pending',
      },
      statusText: {
        allowNull: true,
        type: DataTypes.STRING
      },
      referenceId: {
        allowNull: true,
        type: DataTypes.STRING
      },
      version: {
        allowNull: true,
        type: DataTypes.STRING,
        defaultValue: "0.0"
      },
      projectCode: {
        allowNull: true,
        type: DataTypes.STRING
      },
      typeOfCustomer: {
        allowNull: true,
        type: DataTypes.STRING
      },
      projectFamily: {
        allowNull: true,
        type: DataTypes.STRING
      },
      assemblyDrawingNumber: {
        allowNull: true,
        type: DataTypes.STRING
      },
      fgSapCode: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      childSapCode: {
        allowNull: true,
        type: DataTypes.INTEGER
      },
      productPicture: {
        allowNull: true,
        type: DataTypes.JSON
      },
      fgAndChildPart: {
        allowNull: true,
        type: DataTypes.STRING
      },
      reasonForChange: {
        allowNull: true,
        type: DataTypes.STRING
      },
      changeInitiationDate: {
        allowNull: true,
        type: DataTypes.DATE
      },
      typeOfChange: {
        allowNull: true,
        type: DataTypes.TEXT
      },
      googlesheetLink: {
        allowNull: true,
        type: DataTypes.JSON
      }
    },
    {
      tableName: "documents",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return DocumentsModel;
}
