import { message } from "@utils/message";
import { logger, stream } from "@utils/logger";
import TemplateDaos from "@/daos/template.daos"
import { Templates } from "@interfaces/templates.interface"
import {
    BadRequestHttpException,
    NotFoundHttpException,
    HttpException,
} from "@exceptions/HttpException";
import { roleEnum } from "@/utils/enum";

class TemplateService {
    public templateDaos = new TemplateDaos()


    /**
    * Create a Template
    * @param reqData
    * @returns {Promise<Templates[]>}
    */
    public createTemplate = async (reqData): Promise<Templates> => {
        logger.info({
            message: "Starting Template creation",
            context: "TemplateService",
            method: "createTemplate",
        });
        try {
            const create = {
                ...reqData.reqBody,
                approvalHierarchy: Array.isArray(reqData.reqBody.approvalHierarchy)
                    ? reqData.reqBody.approvalHierarchy
                    : JSON.parse(reqData.reqBody.approvalHierarchy || "[]"),
                userId: reqData.reqData.id,
                plantId: reqData.reqBody.plantId,
                templateImage: reqData.fileUrl.templateImage
            }
            const createTemplateData = await this.templateDaos.createTemplate(create);
            if (!createTemplateData)
                throw new NotFoundHttpException(message.general.dataNotFound);

            logger.info({
                message: "Template creation completed",
                context: "TemplateService",
                method: "createTemplate",
            });
            return createTemplateData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during template creation",
                context: "TemplateService",
                method: "createTemplate",
            });
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };

    /**
    * Create a Template
    * @param reqData
    * @returns {Promise<Templates[]>}
    */
    public getTemplate = async (reqData): Promise<Templates> => {
        logger.info({
            message: "Starting get Template",
            context: "TemplateService",
            method: "getTemplate",
        });
        try {
            const { plantId } = reqData.reqData
            let whereCondition: any = {}
            whereCondition.plantId = plantId
            if (reqData.reqData.role === roleEnum.SUPER_ADMIN) {
                whereCondition = {};
            }
            if (reqData.reqData.role === roleEnum.PLANT_ADMIN || reqData.reqData.role === roleEnum.PLANT_USER) {
                whereCondition.plantId = plantId
            }

            const getData = await this.templateDaos.getTemplateData(whereCondition);
            if (!getData)
                throw new NotFoundHttpException(message.general.dataNotFound);

            logger.info({
                message: "Template get completed",
                context: "TemplateService",
                method: "getTemplate",
            });
            return getData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during template get",
                context: "TemplateService",
                method: "getTemplate",
            });
            if (error instanceof NotFoundHttpException) {
                throw error;
            }
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };
}

export default TemplateService