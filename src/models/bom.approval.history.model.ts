import { statusEnum } from "@/utils/enum";
import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { BomApprovalsHistory } from "@interfaces/bom.approval.history.interface";

export type BomApprovalsHistoryModelCreationAttributes = Optional<
    BomApprovalsHistory,
    | "id"
    | "bomId"
    | "senderComment"
    | "senderApproverId"
    | "receiverApproverId"
    | "senderLevel"
    | "receiverLevel"
    | "totalLevel"
    | "senderStatus"
    | "receiverStatus"
>;

export class BomApprovalsHistoryModel
    extends Model<BomApprovalsHistory, BomApprovalsHistoryModelCreationAttributes>
    implements BomApprovalsHistory {
    public id: string
    public bomId: string;
    public senderComment: string;
    public senderApproverId: string;
    public receiverApproverId: string;
    public senderLevel: number;
    public receiverLevel: number
    public totalLevel: number
    public senderStatus: string
    public receiverStatus: string
}

export default function (sequelize: Sequelize): typeof BomApprovalsHistoryModel {
    BomApprovalsHistoryModel.init(
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
                    model: 'bom',
                    key: 'id',
                },
            },
            senderApproverId: {
                allowNull: true,
                type: DataTypes.UUID,
                defaultValue: null,
                references: {
                    model: 'user',
                    key: 'id',
                },
            },
            receiverApproverId: {
                allowNull: true,
                type: DataTypes.UUID,
                defaultValue: null,
                references: {
                    model: 'user',
                    key: 'id',
                },
            },
            senderComment: {
                allowNull: true,
                type: DataTypes.TEXT
            },
            senderLevel: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            receiverLevel: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            totalLevel: {
                allowNull: true,
                type: DataTypes.INTEGER
            },
            senderStatus: {
                allowNull: true,
                type: DataTypes.ENUM(...Object.values(statusEnum)),
            },
            receiverStatus: {
                allowNull: true,
                type: DataTypes.ENUM(...Object.values(statusEnum)),
            },
        },
        {
            tableName: "bomApprovalsHistory",
            sequelize,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return BomApprovalsHistoryModel;
}
