import DB from "@/database";

import { message } from "@utils/message";
import { logger, stream } from "@utils/logger";
import DocumentDaos from "@/daos/document.daos";
import {
    NotFoundHttpException,
    HttpException,
    UnauthorizedHttpException
} from "@exceptions/HttpException";
import { ReqData } from "@utils/type"
import { roleEnum, statusEnum } from "@/utils/enum";
import UserDaos from "@/daos/user.daos";
import ApprovalDaos from "@/daos/approval.daos";
import TemplateDaos from "@/daos/template.daos";
import { documentPlantWhereCondition, documentWhereCondition } from "@utils/type";
import { Documents } from "@interfaces/documents.interface";
import { ResponseFormat } from "@exceptions/responseFormat";
import { Op } from "sequelize";
import GoogleService from "./google.service";

class DocumentService {
    public users = DB.User;
    public documentDaos = new DocumentDaos();
    public responseFormat = new ResponseFormat();
    public userDaos = new UserDaos()
    public approvalDaos = new ApprovalDaos()
    public templateDaos = new TemplateDaos()
    public googleService = new GoogleService()


    public uploadDocument = async (reqData): Promise<Documents> => {
        logger.info({
            message: "Starting Document Upload",
            reqData,
            context: "DocumentService",
            method: "uploadDocument",
        });
        try {
            const { referenceId, templateId, typeOfCustomer, reasonForChange, changeInitiationDate, typeOfChange, googlesheetLink, fgSapCode, childSapCode } = reqData.reqBody
            const { id } = reqData.userData
            let version = null;
            const userData = await this.userDaos.findById(id);
            if (!userData) {
                throw new NotFoundHttpException(message.users.notFound);
            }
            if (templateId && id) {
                // Prevent user from making document if they are already present in Approval Hierarchy  
                const check = await this.templateDaos.checkUserInApprovalHierarchy(templateId, id)
                if (check) {
                    throw new UnauthorizedHttpException(message.template.userNotAllowedInTemplate)
                }
            }

            if (referenceId) {
                const checkReference = await this.documentDaos.checkUserReference(referenceId)
                if (checkReference?.userId !== reqData?.userData?.id) {
                    throw new UnauthorizedHttpException(message.document.userNotAllowed)
                }
                const whereCondition = { id: referenceId }
                const checks = await this.documentDaos.checkApprovedVersion(whereCondition)
                for (const check of checks) {
                    const {
                        status,
                        statusText,
                        TemplatesModel: { dataValues: templateData } = {}
                    } = check;
                    const approvalHierarchyCount = check?.TemplatesModel?.dataValues?.approvalHierarchyLevelCount
                    if (status === statusEnum.APPROVED.toUpperCase() && parseInt(statusText.split(' ').pop()!) === approvalHierarchyCount) {
                        const latestVersion = await this.documentDaos.getLatestVersionByReferenceId(referenceId);
                        version = latestVersion ? parseFloat(latestVersion) + 1.0 : 1.0;
                    } else {
                        throw new UnauthorizedHttpException(message.approval.referenceNotAllowedDueToPendingApproval)
                    }
                }
            }

            const upload = {
                ...reqData.reqBody,
                userId: reqData.userData.id,
                fgSapCode: fgSapCode ? parseInt(fgSapCode) : null,
                childSapCode: childSapCode ? parseInt(childSapCode) : null,
                fileUrl: reqData?.fileUrls?.fileUrl,
                productPicture: reqData?.fileUrls?.productPicture,
                typeOfCustomer,
                ...(referenceId && {
                    referenceId,
                    version: version.toFixed(1),
                    reasonForChange,
                    changeInitiationDate,
                    typeOfChange,
                }),
            }
            let link;
            if (version) {
                const driveResp = await this.googleService.uploadFile(userData.email, 'grant', Date.now());
                upload.googlesheetLink = driveResp.link
                link = driveResp?.link
            }
            const uploadData = await this.documentDaos.upload(upload);
            if (!uploadData)
                throw new NotFoundHttpException(message.general.dataNotFound);

            logger.info({
                message: "Document Upload completed",
                context: "DocumentService",
                method: "uploadDocument",
                uploadData,
            });

            const getTemplateId = uploadData?.dataValues?.templateId
            const getTemplateData = await this.templateDaos.getTemplate(getTemplateId)
            const approvalHierarchy = getTemplateData?.dataValues?.approvalHierarchy
            const rowsToInsert = approvalHierarchy.map((item) => {
                return {
                    documentId: uploadData?.dataValues?.id,
                    totalApproverLevel: approvalHierarchy.length,
                    currentApproverLevel: item?.level,
                    approverId: item?.approverUserId,
                }
            });
            const insertInApproval = await this.approvalDaos.insertDataInApprovalTable(rowsToInsert)

            logger.info({
                message: "Insertion of Data in Approval Table completed",
                context: "DocumentService",
                method: "uploadDocument",
                insertInApproval,
            });

            return { ...uploadData?.dataValues, link };
        } catch (error) {
            logger.error({
                error: error?.message || "Error during document upload",
                context: "DocumentService",
                method: "uploadDocument",
            });
            if (error instanceof NotFoundHttpException || error instanceof UnauthorizedHttpException) {
                throw error
            }
            throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };

    public getDocument = async (reqData: ReqData): Promise<any> => {
        logger.info({
            message: "Starting Document Get",
            reqData,
            context: "DocumentService",
            method: "getDocument",
        });
        try {
            //plantIdSearch : If SuperAdmin want status Based on Plant 
            const { documentId, page, limit, status, plantIdSearch, sapNo } = reqData.reqQuery;
            const { id, role, plantId } = reqData.userData;
            const pageNumber = page ? parseInt(page, 10) : 1;
            const pageSize = limit ? parseInt(limit, 10) : 10;
            const offset = (pageNumber - 1) * pageSize;

            let whereCondition: documentWhereCondition = {}
            let plantWhereCondition: documentPlantWhereCondition = {};

            if (sapNo) {
                const where = {
                    [Op.or]: [
                        { fgSapCode: { [Op.like]: `%${sapNo}%` } },
                        { childSapCode: { [Op.like]: `%${sapNo}%` } }
                    ]
                }
                const getDocData = await this.documentDaos.getDocData(where)
                return getDocData
            }

            if (status) {
                let where: any = { status };
                if (role === roleEnum.PLANT_USER) {
                    where.userId = id;
                } else if (role === roleEnum.PLANT_ADMIN) {
                    where.plantId = plantId;
                } else if (role === roleEnum.SUPER_ADMIN) {
                    where.plantId = plantIdSearch;
                }
                const matchingIds = await this.documentDaos.checkApprovedOrDisapprovedStatus(where);
                if (matchingIds.length > 0) {
                    whereCondition.id = { [Op.in]: matchingIds };
                } else {
                    throw new NotFoundHttpException(message.general.dataNotFound)
                }
            }

            if (documentId) {
                whereCondition[Op.or] = [
                    { id: documentId },
                    { referenceId: documentId },
                ];
            }

            const getData = await this.documentDaos.get(whereCondition, plantWhereCondition, pageNumber, pageSize, offset);
            if (!getData) {
                throw new NotFoundHttpException(message.general.dataNotFound);
            }
            logger.info({
                message: "Document get completed",
                context: "DocumentService",
                method: "getDocument",
                getData,
            });
            return getData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error during document get",
                context: "DocumentService",
                method: "getDocument",
            });
            if (error instanceof NotFoundHttpException) {
                throw error;
            }
            throw new HttpException(500, error?.message || message.general.serverError);
        }
    };
}

export default DocumentService