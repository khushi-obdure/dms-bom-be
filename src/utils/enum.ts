export const statusEnum = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SENDBACK: "SendBack",
};

export const roleEnum = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PLANT_ADMIN: "PLANT_ADMIN",
  PLANT_USER: "PLANT_USER",
  PLANT_MODERATOR: "PLANT_MODERATOR"
};

export enum EmailNotificationStatus {
  Pending = "Pending",
  Delivered = "Delivered",
  Undelivered = "Undelivered",
}

export enum NotificationType {
  Reminder = "Reminder",
  Escalation = "Escalation"
}

export enum submissionStatusEnum {
  Completed = "Completed",
  Draft = "Draft"
}
