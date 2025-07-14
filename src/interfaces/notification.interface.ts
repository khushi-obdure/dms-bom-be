import { Json } from "sequelize/types/utils";

export interface Notification {
  id: string;
  documentId: string;
  userId: string;
  status: string;
  type: string;
  level: number;
  notificationData: JSON
}
