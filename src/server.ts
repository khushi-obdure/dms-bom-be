import App from "@/app";
import { logger } from "@utils/logger";
import BomRoutes from "./routes/bom.route";
import AuthRoute from "@routes/auth.route";
import validateEnv from "@utils/validateEnv";
import UsersRoute from "@routes/users.route";
import AdminRoutes from "@routes/admin.route";
import HealthRoute from "@routes/health.route";
import TemplateRoutes from "@routes/template.route"
import DocumentRoutes from "@routes/document.route";
import ApprovalRoutes from "@routes/approval.route";
import PlantRoutes from "@routes/plant.route";
import RoleRoutes from "@routes/roles.route"
validateEnv();

const app = new App([
  // do not change the sequence
  new HealthRoute(),
  new AuthRoute(),
  new UsersRoute(),
  new AdminRoutes(),
  new TemplateRoutes(),
  new DocumentRoutes(),
  new ApprovalRoutes(),
  new PlantRoutes(),
  new BomRoutes(),
  new RoleRoutes()
]);

try {
  app.listen();
} catch (error) {
  logger.error("Error in server file: ", error);
}
