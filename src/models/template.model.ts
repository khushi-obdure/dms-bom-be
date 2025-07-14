import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Templates } from "@interfaces/templates.interface";

export type TemplatesCreationAttributes = Optional<
  Templates,
  "id" | "templateType" | "approvalHierarchy" | "templateImage" | "userId" | "plantId"
>;

export class TemplatesModel
  extends Model<Templates, TemplatesCreationAttributes>
  implements Templates {
  public id: string;
  public templateType: string;
  public approvalHierarchy: string[];
  public userId: string
  public plantId!: string;
  public templateImage!: string
}

export default function (sequelize: Sequelize): typeof TemplatesModel {
  TemplatesModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      templateType: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      templateImage: {
        allowNull: true,
        type: DataTypes.STRING
      },
      approvalHierarchy: {
        allowNull: true,
        type: DataTypes.JSON,
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
      plantId: {
        allowNull: true,
        type: DataTypes.UUID,
        defaultValue: null,
        references: {
          model: 'plant',
          key: 'id',
        },
      },
    },
    {
      tableName: "template",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return TemplatesModel;
}
