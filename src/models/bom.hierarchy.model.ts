import { Sequelize, DataTypes, Model, Optional } from "sequelize";

import { BomHierarchyInterface } from "@/interfaces/bom.hierarchy.interface";

export type HierarchyCreationAttributes = Optional<BomHierarchyInterface, "id">;

export class BomHierarchyModel
  extends Model<BomHierarchyInterface, HierarchyCreationAttributes>
  implements BomHierarchyInterface
{
  public id!: string;
  public userId!: string;
  public plantId!: string;
  public level!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BomHierarchyModel {
  BomHierarchyModel.init(
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
      level: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "bomHierarchy",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return BomHierarchyModel;
}
