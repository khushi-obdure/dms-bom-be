import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { BomFormDataInterface } from "@interfaces/bom.fromData.interface";

// Define attributes with optional fields
export type BomFormDataAttributes = Optional<
  BomFormDataInterface,
  | "id"
  | "bomId"
  | "sNo"
  | "childPartNo"
  | "childPartName"
  | "dwgNo"
  | "version"
  | "sapNo"
  | "material"
  | "weight"
  | "toolingSupplier"
  | "partSupplier"
  | "quantity"
  | "netWeight"
  | "ecnEcrNo"
  | "remarks"
  | "childImage"
  | "surfaceFinish"
  | "materialGrid"
  | "childPdf"
>;

export class BomFormDataModal
  extends Model<BomFormDataInterface, BomFormDataAttributes>
  implements BomFormDataInterface {
  public childImage: string;
  public id!: string;
  public bomId!: string;
  public sNo: string;
  public childPartNo: string;
  public childPartName: string;
  public dwgNo: string;
  public version: string;
  public sapNo: string;
  public material: string;
  public weight: string;
  public quantity: string;
  public netWeight: string;
  public ecnEcrNo: string;
  public surfaceFinish: string;
  public remarks: string;
  public toolingSupplier: string;
  public partSupplier: string;
  public materialGrid: string;
  public childPdf: string
  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

export default function (sequelize: Sequelize): typeof BomFormDataModal {
  BomFormDataModal.init(
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
      sNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      childPartNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      childPartName: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      dwgNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      version: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      sapNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      material: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      materialGrid: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      weight: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      quantity: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      netWeight: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      ecnEcrNo: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      surfaceFinish: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      remarks: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      childImage: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      toolingSupplier: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      partSupplier: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      childPdf: {
        allowNull: true,
        type: DataTypes.STRING
      }
    },
    {
      tableName: "bomFormData",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return BomFormDataModal;
}
