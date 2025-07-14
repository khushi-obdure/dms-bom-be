import DB from "@/database";
import { statusEnum } from "@/utils/enum";
import { message } from "@/utils/message";
import { Op, fn, col } from 'sequelize';

class ApprovalDaos {
    public user = DB.User
    public role = DB.Role
    public plant = DB.Plant
    public approval = DB.Approval
    public document = DB.Document
    public template = DB.Template
    public approvalHistory = DB.ApprovalsHistory

    public assignApproval = async (saveData: object) => {
        return await this.approval.create(saveData)
    }

    public insertDataInApprovalTable = async (rowsToInsert: object) => {
        return await this.approval.bulkCreate(rowsToInsert)
    };

    public getDocumentIdByApproverId = async (id: string) => {
        return await this.approval.findAll({ where: { approverId: id }, raw: true })
    }

    public checkApprovalOrRejectedData = async (status: string, documentIds: string[], id: string): Promise<any> => {
        const getApproversDocumentIds = await this.getDocumentIdByApproverId(id);
        const approverDocumentIds = getApproversDocumentIds.map(doc => doc.documentId);

        if (status === statusEnum.PENDING.toUpperCase()) {
            // Fetch the latest status and entries
            const latestEntriess = await this.approvalHistory.findAll({
                attributes: [
                    'documentId',
                    [fn("DATE_FORMAT", fn("MAX", col("created_at")), "%Y-%m-%d %H:%i:%s"), "latestCreatedAt"],
                ],
                where: {
                    documentId: { [Op.in]: approverDocumentIds }
                },
                group: ['documentId'],
                raw: true
            });

            // Map the subquery result to use in the main query
            const conditions = latestEntriess.map(entry => ({
                documentId: entry.documentId,
                created_at: entry.latestCreatedAt
            }));

            const latestEntries = await this.approvalHistory.findAll({
                where: { [Op.or]: conditions },
                attributes: [
                    "id", "documentId", "senderApproverId", "receiverApproverId", "senderComment", "senderLevel",
                    "receiverLevel", "totalLevel", "senderStatus", [fn("DATE_FORMAT", col("created_at"), "%Y-%m-%d %H:%i:%s"), "createdAt"]
                ],
                raw: true
            });

            const latestDocumentIds = latestEntries.map(entry => entry.documentId);

            //based on logged-in user
            const latestStatus = await this.approvalHistory.findAll({
                attributes: [
                    'documentId',
                    [fn("DATE_FORMAT", fn("MAX", col("created_at")), "%Y-%m-%d %H:%i:%s"), "latestCreatedAt"],
                ],
                where: {
                    documentId: { [Op.in]: latestDocumentIds },
                    senderApproverId: id
                },
                group: ['documentId'],
                raw: true
            });

            const conditionss = latestStatus.map(entry => ({
                documentId: entry.documentId,
                createdAt: entry.latestCreatedAt
            }));

            const latestStatuses = await this.approvalHistory.findAll({
                where: { [Op.or]: conditionss },
                attributes: [
                    "id", "documentId", "senderApproverId", "receiverApproverId", "senderComment", "senderLevel",
                    "receiverLevel", "totalLevel", "senderStatus", [fn("DATE_FORMAT", col("created_at"), "%Y-%m-%d %H:%i:%s"), "createdAt"]
                ],
                order: [['createdAt', 'DESC']],
                raw: true
            });

            const missingDocumentIds = getApproversDocumentIds.filter(docId => !latestDocumentIds.includes(docId.documentId));
            const pendingDocuments = missingDocumentIds.map(docId => ({
                id: docId.id,
                documentId: docId.documentId,
                senderStatus: docId.status,
                senderApproverId: id,
                senderLevel: docId.currentApproverLevel,
                totalLevel: docId.totalApproverLevel
            }));

            const allEntries = [...latestEntries, ...pendingDocuments];

            // Filter out the documents based on conditions
            const excludedDocumentIds = latestStatuses.filter(statusEntry => {
                const correspondingEntry = allEntries.find(entry => entry.documentId === statusEntry.documentId);

                // Exclude based on the conditions
                return (correspondingEntry && (statusEntry.documentId === correspondingEntry.documentId) &&
                    ((statusEntry.senderLevel < correspondingEntry.senderLevel && statusEntry.senderStatus === 'APPROVED') ||
                        (statusEntry.senderLevel === correspondingEntry.senderLevel && statusEntry.senderStatus === 'APPROVED')) &&
                    !(statusEntry.senderStatus === 'APPROVED' &&
                        correspondingEntry.receiverApproverId === id &&
                        correspondingEntry.senderStatus === 'SENDBACK')
                )
            }).map(statusEntry => statusEntry.documentId);

            // Filter out the excluded documentIds and Rejected status documentid from the latest entries
            const filteredLatestEntries = allEntries.filter(entry =>
                !excludedDocumentIds.includes(entry.documentId) &&
                !(entry.senderStatus === 'REJECTED' && entry.senderApproverId === id)
            );

            // Prepare the final result
            const approverData = {
                approverId: id,
                documentId: {
                    [Op.in]: filteredLatestEntries.map(doc => doc.documentId)
                },
                status: status
            };

            return approverData;

        }

        if (status === statusEnum.APPROVED.toUpperCase() || status === statusEnum.REJECTED.toUpperCase()) {
            const approvals = await this.approvalHistory.findAll({
                where: {
                    documentId: { [Op.in]: approverDocumentIds },
                    senderApproverId: id,
                    ...(status && { senderStatus: status }),
                },
                attributes: [
                    "documentId",
                    [fn("DATE_FORMAT", fn("MAX", col("created_at")), "%Y-%m-%d %H:%i:%s"), "latestCreatedAt"],
                ],
                group: ["documentId"],
                raw: true,
            });

            // Fetch the latest entries using the results of the above query
            const latestApprovals = await this.approvalHistory.findAll({
                where: {
                    [Op.or]: approvals.map(({ documentId, latestCreatedAt }) => ({
                        documentId,
                        createdAt: latestCreatedAt,
                    })),
                },
                attributes: ["id", "documentId", "senderLevel", "receiverLevel", "totalLevel", "senderStatus", "receiverStatus", "senderApproverId",
                    [fn("DATE_FORMAT", col("created_at"), "%Y-%m-%d %H:%i:%s"), "createdAt"]

                ],
                raw: true,
                order: [["createdAt", "DESC"]],
            });
            const documentIds = latestApprovals.length ? latestApprovals.map(({ documentId }) => documentId) : [];
            const createdAtDates = latestApprovals.map(({ createdAt }) => createdAt);
            const approverId = latestApprovals[0]?.senderApproverId;
            const senderStatus = latestApprovals[0]?.senderStatus;

            const approverData = {
                documentId: {
                    [Op.in]: documentIds,
                },
                approverId,
                status: senderStatus,
                createdAt: {
                    [Op.in]: createdAtDates,
                },
            };

            return approverData;
        }
    }

    public getData = async (whereCondition: any, id: string, pageNumber: number, pageSize: number, rejectedorApprovedStatus: any) => {
        try {
            let approvalHistoryWhere: object

            if (rejectedorApprovedStatus && (rejectedorApprovedStatus.status === 'APPROVED' || rejectedorApprovedStatus.status === 'REJECTED')) {
                whereCondition = {
                    approverId: rejectedorApprovedStatus.approverId,
                    documentId: rejectedorApprovedStatus.documentId
                }
                const documentIds = rejectedorApprovedStatus.documentId[Op.in];
                const createdAtDates = rejectedorApprovedStatus.createdAt[Op.in];
                approvalHistoryWhere = {
                    [Op.or]: [
                        // Specific condition for APPROVED or REJECTED status
                        ...documentIds.map((documentId, index) => ({
                            documentId,
                            createdAt: createdAtDates[index],
                            senderApproverId: rejectedorApprovedStatus.approverId,
                            senderStatus: rejectedorApprovedStatus.status,
                        })),
                        // condition to show all history for the document
                        { documentId: rejectedorApprovedStatus.documentId },
                    ],
                };
            }

            else if (whereCondition.status === 'PENDING') {
                whereCondition.status = whereCondition.status
            }
            // Fetch raw data with limit and offset
            const { rows: approvalData, count: totalItems } = await this.approval.findAndCountAll({
                where: whereCondition ? whereCondition : null,
                include: [
                    {
                        model: this.user,
                        required: true,
                        include: [
                            {
                                model: this.plant,
                            },
                        ],
                    },
                    {
                        model: this.document,
                        required: true,
                        include: [
                            {
                                model: this.user,
                            },
                            {
                                model: this.template,
                            },
                            {
                                model: this.approvalHistory,
                                where: approvalHistoryWhere
                            }
                        ],
                    },
                ],
                order: [['updatedAt', 'DESC']],
                limit: pageSize, // Fetch all records to allow complete grouping
                offset: 0, // Ignore initial offset, as we'll apply pagination later
            });

            const groupedData: any[] = [];
            const documentMap: { [key: string]: any } = {};

            for (const approval of approvalData) {
                const document = approval?.DocumentsModel;
                const template = document?.TemplatesModel;
                const documentMadeByUser = document?.UserModel;
                const user = approval?.UserModel;
                const plant = user?.PlantModel;
                const approvalHistory = approval?.DocumentsModel?.ApprovalsHistoryModels;

                const sortedApprovalHistory = Array.isArray(approvalHistory)
                    ? approvalHistory.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
                    : [];

                const getApprovalData = await this.approval.findOne({
                    where: { approverId: id, documentId: document.id },
                });

                // Grouping logic
                if (!documentMap[document.id]) {
                    documentMap[document.id] = {
                        approvalTable: {
                            id: getApprovalData?.id,
                            status: getApprovalData?.status
                        },
                        documentMadeByUser: {
                            id: documentMadeByUser.id,
                            name: documentMadeByUser.name,
                            email: documentMadeByUser.email,
                            employeeCode: documentMadeByUser.employeeCode,
                            department: documentMadeByUser.department,
                            designation: documentMadeByUser.designation,
                        },
                        documentData: {
                            documentId: document?.id,
                            documentTitle: document?.documentTitle,
                            status: document?.status,
                            mergedStatus: (document?.status === (statusEnum.PENDING).toUpperCase())
                                ? document?.status
                                : `${document?.status} at ${document?.statusText}`,
                            documentFileUrl: Array.isArray(document?.fileUrl)
                                ? document?.fileUrl
                                : [document?.fileUrl],
                            version: document?.version,
                            projectCode: document?.projectCode,
                            fgSapCode: document?.fgSapCode,
                            projectFamily: document?.projectFamily,
                            assemblyDrawingNumber: document?.assemblyDrawingNumber,
                            typeOfCustomer: document?.typeOfCustomer,
                            fgAndChildPart: document?.fgAndChildPart,
                            childSapCode: document?.childSapCode,
                            typeOfChange: document?.typeOfChange,
                            reasonForChange: document?.reasonForChange,
                            changeInitiationDate: document?.changeInitiationDate,
                            googlesheetLink: document?.googlesheetLink,
                            fileUrl: document?.fileUrl,
                            productPicture: document?.productPicture,
                            createdAt: document?.createdAt
                        },
                        templateData: template
                            ? {
                                templateId: template?.id,
                                templateType: template?.templateType,
                            }
                            : null,
                        approverData: [],
                        approvalHistory: sortedApprovalHistory
                    };
                    groupedData.push(documentMap[document.id]);
                }

                for (const approver of template?.approvalHierarchy || []) {
                    const user = await this.user.findOne({
                        where: { id: approver.approverUserId },
                        include: [
                            {
                                model: this.plant
                            },
                            {
                                model: this.role
                            }
                        ]
                    });

                    if (user) {
                        const approverPlantDetails = user?.PlantModel
                        documentMap[document.id].approverData.push({
                            approverUserId: user?.id,
                            approverEmail: user?.email,
                            approverRole: user?.RolesModel?.roleName,
                            approverDesignation: user?.designation,
                            approverDepartment: user?.department,
                            approverName: user?.name,
                            approverPlant: `${approverPlantDetails?.plantName} (${approverPlantDetails?.acronym})`,
                            status: approval?.status,
                            // currentApproverLevel: approval?.currentApproverLevel,
                            currentApproverLevel: parseInt(approver?.level),
                            totalApproverLevel: approval?.totalApproverLevel,
                            reminderCount: approval?.reminderCount,
                            createdAt: approval?.createdAt,
                            updatedAt: approval?.updatedAt
                        });
                    }
                }
            }

            for (const key in documentMap) {
                if (documentMap[key]?.approverData) {
                    documentMap[key].approverData.sort((a: any, b: any) => {
                        return a.currentApproverLevel - b.currentApproverLevel;
                    });
                }
            }

            // Calculate total pages based on grouped data
            const totalGroupedItems = groupedData.length;
            const totalPages = Math.ceil(totalGroupedItems / pageSize);

            // Slice grouped data for the current page
            const paginatedGroupedData = groupedData.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);

            return {
                totalItems: totalGroupedItems,
                totalPages,
                currentPage: pageNumber,
                pageSize,
                data: paginatedGroupedData,
            };
        } catch (error) {
            console.error(message.approval.errorFetchingApprovalData, error);
            throw new Error(message.approval.errorFetchingApprovalData);
        }
    };

    public approveDocument = async (updateData: object, whereCondition: object) => {
        await this.approval.update(updateData, { where: whereCondition, })
        return this.approval.findOne({ where: whereCondition })
    };

    public handleApprovalDocument = async (createData: object) => {
        return await this.approvalHistory.create(createData)
    }

    public getApprovalData = async (id: string) => {
        return await this.approval.findOne({ where: { id } })
    }

    public getApprovalByDocumentIdAndLevel = async (documentId: string, senderLevel: number) => {
        return await this.approvalHistory.findOne({
            where: { documentId, senderLevel },
            order: [["createdAt", "DESC"]],
        })
    }

    public getReferenceIdStatus = async (referenceId: string) => {
        return await this.approvalHistory.findOne({ where: { id: referenceId } })
    }

    public getPendingApprovalData = async () => {
        return await this.approval.findAll({
            where: { status: statusEnum.PENDING },
            include: [
                {
                    model: this.document,
                    required: true,
                }
            ]
        });
    };
    

}

export default ApprovalDaos