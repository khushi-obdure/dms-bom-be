import  ejs from 'ejs';
import { Op } from "sequelize";
import { EmailNotificationStatus, NotificationType, roleEnum, statusEnum } from "@/utils/enum";
import { message } from "@utils/message";
import { logger, stream } from "@utils/logger";
import {
    BadRequestHttpException,
    ConflictHttpException,
    NotFoundHttpException,
    HttpException,
    UnauthorizedHttpException
} from "@exceptions/HttpException";
import ApprovalDaos from "@/daos/approval.daos";
import { approveDocumentReqData } from "@utils/type"
import { Approvals } from "@interfaces/approval.interface"
import { ResponseFormat } from "@exceptions/responseFormat";
import DocumentDaos from "@daos/document.daos"
import UserDaos from "@/daos/user.daos";
import { DateTime } from "@/utils/date";
import EmailService from '@/utils/email';
import NotificatonDaos from "@/daos/notification.daos";
import { NotificationSubject } from '../utils/notification.subject';
import { constants }  from '@utils/constant'
class ApprovalService {
    public responseFormat = new ResponseFormat();
    public approvalDaos = new ApprovalDaos()
    public documentDaos = new DocumentDaos()
    public userDaos = new UserDaos()
    public dateTime = new DateTime()
    public notificatonDaos = new NotificatonDaos()

    public emailService = new EmailService()
    public getApprovalData = async (reqData): Promise<any> => {
        logger.info({
            message: "Starting Get Approval Data",
            context: "ApprovalService",
            method: "getApprovalData",
        });
        try {
            const { status, page, limit } = reqData.reqQuery
            const { role, id } = reqData.userData

            const pageNumber = page ? parseInt(page, 10) : 1;
            const pageSize = limit ? parseInt(limit, 10) : 10;

            let whereCondition: any = {}
            let rejectedorApprovedStatus: any

            if (role === roleEnum.PLANT_ADMIN || role === roleEnum.PLANT_USER) {
                // It will get all the document IDs to be approved by that particular approver
                const getDocumentIds = await this.approvalDaos.getDocumentIdByApproverId(id);

                if (!getDocumentIds || getDocumentIds.length === 0) {
                    throw new NotFoundHttpException(message.document.noDocumentApproval);
                }

                // Extract all document IDs and add to the whereCondition
                const documentIds = getDocumentIds.map((doc: { documentId: string }) => doc.documentId);
                whereCondition.documentId = { [Op.in]: documentIds };

                if (status) {
                    const checkApproveOrDisapprove = await this.approvalDaos.checkApprovalOrRejectedData(status, documentIds, id);
                    // If document status is rejected or approved get rejectedorApprovedStatus data for the loggedin user
                    rejectedorApprovedStatus = checkApproveOrDisapprove[1]

                    if (!checkApproveOrDisapprove || checkApproveOrDisapprove.length === 0) {
                        throw new NotFoundHttpException(message.general.dataNotFound);
                    }

                    // for rejected status if documentId is empty
                    if (!checkApproveOrDisapprove.documentId[Symbol.for('in')]?.length) {
                        throw new NotFoundHttpException(message.general.dataNotFound);
                    }

                    if (status === statusEnum.APPROVED.toUpperCase() || status === statusEnum.REJECTED.toUpperCase()) {
                        rejectedorApprovedStatus = checkApproveOrDisapprove
                    }
                    // If checkApproveOrDisapprove returns a single document, use it directly
                    else if (Object.keys(checkApproveOrDisapprove).length === 3 && checkApproveOrDisapprove.status === statusEnum.PENDING.toUpperCase()) {
                        whereCondition = checkApproveOrDisapprove
                    }
                }
            }

            const getData = await this.approvalDaos.getData(whereCondition, id, pageNumber, pageSize, rejectedorApprovedStatus);
            logger.info({
                message: "Get Approval Data is completed",
                context: "ApprovalService",
                method: "getApprovalData",
                getData,
            });
            return getData;
        } catch (error) {
            logger.error({
                error: error?.message || "Error getting approval data",
                context: "ApprovalService",
                method: "getApprovalData",
            });
            if (error instanceof NotFoundHttpException) {
                throw error;
            } throw new HttpException(
                500,
                error?.message || message.general.serverError
            );
        }
    };

    public approveDocument = async (reqData: approveDocumentReqData): Promise<any> => {
        logger.info({
            message: "Starting Document Approval",
            context: "ApprovalService",
            method: "approveDocument",
        });
        try {
            const { senderComment, documentId, senderApproverId, receiverApproverId, senderLevel, receiverLevel, totalLevel, senderStatus, receiverStatus, referenceId } = reqData.reqBody;
            const { approvalId } = reqData.reqQuery;
            const { userId } = reqData;

            const createData: { [key: string]: any } = {
                documentId,
                totalLevel,
                senderLevel,
                senderStatus,
                senderComment,
                receiverLevel,
                receiverStatus,
                senderApproverId,
                receiverApproverId,
                referenceId
            };
            const updateDocument: { [key: string]: any } = {
                status: senderStatus,
                statusText: `level ${senderLevel}`,
            };
            let checkApprovalReferenceStatus: any

            // Fetch approval status
            const getStatus = await this.approvalDaos.getApprovalData(approvalId);
            const getApproverId = getStatus?.approverId;

            if (userId !== getApproverId) {
                throw new UnauthorizedHttpException(message.approval.userNotAllowed);
            }

            // Restrict Level 1 users from sending back documents
            if (senderLevel === 1 && senderStatus.toLowerCase() === statusEnum.SENDBACK.toLowerCase()) {
                throw new UnauthorizedHttpException(message.approval.sendBackNotAllowed);
            }

            // Fetch the latest approval data for this document and level
            const latestApproval = await this.approvalDaos.getApprovalByDocumentIdAndLevel(documentId, senderLevel);

            // Get the receiver status and check if its Pending to create new entry
            if (referenceId) {
                checkApprovalReferenceStatus = await this.approvalDaos.getReferenceIdStatus(referenceId)
            }

            if (latestApproval) {
                if (senderStatus.toLowerCase() === statusEnum.APPROVED.toLowerCase()) {
                    // If it's a reply to a sendback and the receiver's status is pending, create a new entry
                    // Avoiding documentApprovalAtLevel1
                    if (checkApprovalReferenceStatus?.receiverStatus === statusEnum.PENDING) {
                        const handleData = await this.approvalDaos.handleApprovalDocument(createData);
                        await this.documentDaos.updateDocumentStatus(updateDocument, documentId);

                        logger.info({
                            message: "New entry created for sendback reply.",
                            context: "ApprovalService",
                            method: "approveDocument",
                            handleData,
                        });
                        return handleData;
                    }

                    // If the document is already approved and not sent back, prevent duplicate approvals
                    if (latestApproval?.senderStatus === statusEnum.APPROVED && latestApproval?.receiverStatus !== statusEnum.SENDBACK) {
                        throw new ConflictHttpException(message.approval.documentApprovalAtLevel1);
                    }
                }
            }

            // Handle initial approvals or new approvals for higher levels
            if (approvalId) {
                const handleData = await this.approvalDaos.handleApprovalDocument(createData);
                await this.documentDaos.updateDocumentStatus(updateDocument, documentId);

                logger.info({
                    message: "Document Approval is completed",
                    context: "ApprovalService",
                    method: "approveDocument",
                    handleData,
                });
                let userData, approverData; 
                const documentData = await this.documentDaos.findById(documentId);
                const data = await this.userDaos.findById([documentData?.userId, userId]);
                data.forEach((ele)=>{
                    if(ele.id === userId ){
                        approverData = ele;
                    }else{
                        userData = ele;
                    }
                })
                const templatePath = `${process.cwd()}/src/template/user.approve.ejs`;
                const emailRes = await this.emailService.sendMail({
                emailTo: userData?.email,
                subject: NotificationSubject.ESCALATION,
                html: await ejs.renderFile(templatePath, {
                    userName: userData.name,
                    documentName: documentData.documentTitle,
                    approverName: approverData.name,
                    approvalDate: new Date()

                  })
                });
                return handleData;
            }

            throw new ConflictHttpException(message.approval.invalidApprovalState);
        } catch (error) {
            logger.error({
                error: error?.message || "Error approving Document",
                context: "ApprovalService",
                method: "approveDocument",
            });
            if (error instanceof BadRequestHttpException || error instanceof UnauthorizedHttpException || error instanceof ConflictHttpException) {
                throw error;
            }

            throw new HttpException(500, error?.message || message.general.serverError);
        }
    };

    public sendEmailForPendingApproval  = async()=>{
        logger.info(
            "Send email for pending approval",
        );
        try {
            const pendingApprovalData = await this.approvalDaos.getPendingApprovalData();
            const getCurrentApproval  = await this.getCurrentApprovalLevels(pendingApprovalData)
            for(let i=0; i< getCurrentApproval.length; i++){  
                const { id, emailCount, documentId, aprroverId, createdAt, updatedAt, currentApprovalLevel, documentData: { userId, documentFileUrl, id: documentID, documentTitle, createdAt: documentDataCreatedAt } } = getCurrentApproval[i];
                const checkDayDiff = await this.dateTime.isDifferenceTwoDays(updatedAt,  2);
                logger.info({
                    dayDifference: checkDayDiff,
                    id
                })
                let userData;
                let approverData;
                const findUsers = await this.userDaos.findById([aprroverId,userId]);
                
                    findUsers.forEach((elem)=>{
                        if(elem?.id === userId){
                            userData = elem;
                        }else{
                            approverData = elem;
                        }
                    });
                if( checkDayDiff && emailCount < constants.EMAIL_COUNT ){ 
                    
                    if(!userData && !approverData){
         
                        const emailData = {
                            approverName : approverData?.name,
                            documentName: documentTitle,
                            documentDate: documentDataCreatedAt,
                            submittedBy: userData?.name,
                        }
                        const templatePath = `${process.cwd()}/src/template/approval.reminder.ejs`
                
                        const emailResp = await this.emailService.sendMail({
                        emailTo: approverData.email,
                        subject: NotificationSubject.APPROVAL_REMINDER,
                        html: await ejs.renderFile(templatePath, emailData)
                        });
                        if(emailResp){
                            await this.approvalDaos.approveDocument({ emailCount: emailCount + 1 }, { id })
                            await this.notificatonDaos.createNotification({
                                documentId,
                                userId: aprroverId,
                                status: EmailNotificationStatus.Delivered,
                                type: NotificationType.Reminder,
                                notificationData: emailData,
                                level: currentApprovalLevel
                            })
                        }
                    }
                }else{
                    const templatePath = `${process.cwd()}/src/template/escalationEmail.ejs`;
                    const getPlantId = await this.userDaos.findById(approverData.id);
                    const plantId = getPlantId.plantId;
                    const adminData = await this.userDaos.getUser(plantId);
                    const emailData = {
                        approverName: approverData.name,
                        adminName: adminData.name,
                        documentId,
                        documentName: documentTitle,
                        submissionDate: documentDataCreatedAt,
                        impactDetails: 'delayed project execution',
                        responseDeadline: new Date()

                      }
                    const adminEmailRes = await this.emailService.sendMail({
                    emailTo: approverData.email,
                    cc: adminData.dataValues.email,
                    subject: NotificationSubject.ESCALATION,
                    html: await ejs.renderFile(templatePath, emailData)
                    });
                    if(adminEmailRes){
                        await this.notificatonDaos.createNotification({
                            documentId,
                            userId: aprroverId,
                            status: EmailNotificationStatus.Delivered,
                            type: NotificationType.Escalation,
                            notificationData: emailData,
                            level: currentApprovalLevel
                        })
                    }
                }
            }
        } catch (error) {
            logger.error({
                error: error?.message || "Error Send mail for pending approval",
                context: "ApprovalService",
                method: "sendEmailForPendingApproval",
            });
            throw new HttpException(500, error?.message || message.general.serverError);
        }
    }

   
    private getCurrentApprovalLevels = (approvals)=>{
        const result = [];
        approvals.forEach(item => {
                if (item.currentApproverLevel < item.totalApproverLevel) {
                let exists = false;
                const data =     {
                    id: item.id,
                    documentId: item.documentId,
                    status : item.status,
                    currentApprovalLevel: item.currentApproverLevel,
                    aprroverId : item.approverId,
                    createdAt: item.createdAt,
                    documentData: item.DocumentsModel.dataValues,
                    emailCount : item.emailCount,
                };
                for (let i = 0; i < result.length; i++) {
                   
                    if (result[i].documentId === item.documentId || result[i].currentApprovalLevel > item.currentApprovalLevel) {
                    result.splice(i, 1); 
                    result.push(data)
                    exists = true;
                    break;
                    };
                }
                if (!exists) {
                    result.push(data);
                }
                }
            });

            return result;
    }  

  
      
}

export default ApprovalService

