import Sequelize from "sequelize";

import { logger } from "@utils/logger";
import UserModel from "@models/user.model";
import PlantModel from "@models/plant.model";
import RolesModel from "@/models/roles.model";
import BomDataModal from '@/models/bom.model';
import BomFormDataModal from "@/models/bom.formdata.model";
import TemplateModel from "@/models/template.model";
import ApprovalsModel from "@/models/approval.model";
import DocumentsModel from "@/models/documents.model";
import BomHierarchyModel from "@/models/bom.hierarchy.model";
import NotificationModel from "@/models/notification.model";
import ApprovalsHistoryModel from "@/models/approval.history.model";
import {
  NODE_ENV,
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
} from "@config";
import { applyRelations } from "@/relation/relation";
import BomApprovalsModel from "@/models/bom-approvals.model";
import BomApprovalsHistoryModel from "@/models/bom.approval.history.model"

const sequelize = new Sequelize.Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
  dialect: "mysql",
  host: DB_HOST,
  port: parseInt(DB_PORT),
  timezone: "+05:30",
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_general_ci",
    underscored: true,
    freezeTableName: true,
  },
  pool: {
    min: 0,
    max: 5,
  },
  logQueryParameters: NODE_ENV === "development",
  logging: (query, time) => {
    logger.info(time + "ms" + " " + query);
  },
  benchmark: true,
});

sequelize
  .authenticate()
  .then(() => {
    logger.info("Database connected.");
  })
  .catch((err) => {
    logger.error("Error in database connection: ", err);
  });

let DB: any = {};

try {
  DB = {
    // don't move the sequence

    Plant: PlantModel(sequelize),
    Role: RolesModel(sequelize),
    User: UserModel(sequelize),
    Template: TemplateModel(sequelize),
    Document: DocumentsModel(sequelize),
    Approval: ApprovalsModel(sequelize),
    ApprovalsHistory: ApprovalsHistoryModel(sequelize),
    BomDataModal: BomDataModal(sequelize),
    BomHierarchyModel: BomHierarchyModel(sequelize),
    BomApprovalsModel: BomApprovalsModel(sequelize),
    Notification: NotificationModel(sequelize),
    BomFormDataModal: BomFormDataModal(sequelize),
    BomApprovalHistory: BomApprovalsHistoryModel(sequelize),
    sequelize, // connection instance (RAW queries)
    Sequelize, // library
  };
  applyRelations(DB);

  // sequelize.sync({ force: true }); // force: true will drop the table if it already exists
  sequelize
    .sync({ alter: false })
    .then(async () => {
      logger.info("Database synchronized.");
    })
    .catch((error) => {
      logger.error("Database synchronization failed:", error);
    });
} catch (error) {
  logger.error("Error in model initalization:", error);
}

export default DB;
