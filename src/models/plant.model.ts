import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Plant } from "@interfaces/plant.interface";

export type PlantCreationAttributes = Optional<
  Plant,
  "id" | "plantName" | "acronym" | "facility"
>;

export class PlantModel
  extends Model<Plant, PlantCreationAttributes>
  implements Plant {
  public id: string;
  public plantName: string;
  public acronym: string;
  public facility: { [key: string]: any };
}

export default function (sequelize: Sequelize): typeof PlantModel {
  PlantModel.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      plantName: {
        allowNull: false,
        type: DataTypes.STRING(255),
      },
      acronym: {
        allowNull: true,
        type: DataTypes.STRING(30),
        defaultValue: null,
      },
      facility: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    },
    {
      tableName: "plant",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return PlantModel;
}
