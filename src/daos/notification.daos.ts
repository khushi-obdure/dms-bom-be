import DB from "@/database";

class NotificationDaos {
  public notification = DB.Notification;

  public createNotification = async (reqData: object) => {
    return await this.notification.create(reqData);
  };
}

export default NotificationDaos;
