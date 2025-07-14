import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Roles } from "@interfaces/roles.interface";

export type RolesCreationAttributes = Optional<
    Roles,
    "id" | "roleName" | "permissionJson"
>;

export class RolesModel
    extends Model<Roles, RolesCreationAttributes>
    implements Roles {
    public id: string;
    public roleName: string;
    public permissionJson: string[];
}

export default function (sequelize: Sequelize): typeof RolesModel {
    RolesModel.init(
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            roleName: {
                allowNull: false,
                type: DataTypes.STRING,
            },
            permissionJson: {
                allowNull: true,
                type: DataTypes.JSON,
                defaultValue: null,
            }
        },
        {
            tableName: "role",
            sequelize,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return RolesModel;
}
