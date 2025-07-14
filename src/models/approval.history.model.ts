import { statusEnum } from "@/utils/enum";
import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { ApprovalsHistory } from "@interfaces/approval.history.interface";

export type ApprovalsHistoryCreationAttributes = Optional<
    ApprovalsHistory,
    | "id"
    | "documentId"
    | "senderComment"
    | "senderApproverId"
    | "receiverApproverId"
    | "senderLevel"
    | "receiverLevel"
    | "totalLevel"
    | "senderStatus"
    | "receiverStatus"
    | "referenceId"
>;

export class ApprovalsHistoryModel
    extends Model<ApprovalsHistory, ApprovalsHistoryCreationAttributes>
    implements ApprovalsHistory {
    public id: string
    public documentId: string;
    public senderComment: string;
    public senderApproverId: string;
    public receiverApproverId: string;
    public senderLevel: number;
    public receiverLevel: number
    public totalLevel: number
    public senderStatus: string
    public receiverStatus: string
    public referenceId: string
}

export default function (sequelize: Sequelize): typeof ApprovalsHistoryModel {
    ApprovalsHistoryModel.init(
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
                type: DataTypes.ENUM(...Object.keys(statusEnum)),
            },
            receiverStatus: {
                allowNull: true,
                type: DataTypes.ENUM(...Object.keys(statusEnum)),
            },
            referenceId: {
                allowNull: true,
                type: DataTypes.STRING
            }
        },
        {
            tableName: "approvalsHistory",
            sequelize,
            timestamps: true,
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        }
    );

    return ApprovalsHistoryModel;
}
