import { Sequelize, DataTypes, Model, Optional } from "sequelize";
import { Notification } from "@interfaces/notification.interface";
import { EmailNotificationStatus, NotificationType, statusEnum } from "@/utils/enum";
import { Json } from "sequelize/types/utils";

export type NotificationAttributes = Optional<
  Notification,
  "id" | "documentId" | "userId" | "status" | "level" | "notificationData"
>;

export class NotificationModel
  extends Model<Notification, NotificationAttributes>
  implements Notification
{
  public id: string;
  public documentId: string;
  public userId: string;
  public status: string;
  public type: string;
  public level: number;
  public notificationData: JSON
}

export default function (sequelize: Sequelize): typeof NotificationModel {
  NotificationModel.init(
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
          model: "documents",
          key: "id",
        },
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
      status: {
        allowNull: false,
        type: DataTypes.ENUM(...Object.values(EmailNotificationStatus)),
        defaultValue: "Pending",
      },

      type: {
        allowNull: false,
        type: DataTypes.ENUM(...Object.values(NotificationType)),
      },

      level: {
        allowNull: true,
        type: DataTypes.INTEGER,
      },
      notificationData: {
        allowNull: false,
        type: DataTypes.JSON,
        defaultValue: null,
      },
    },
    {
      tableName: "notification",
      sequelize,
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    }
  );

  return NotificationModel;
}
