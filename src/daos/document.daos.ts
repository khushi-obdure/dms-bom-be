import DB from "@/database";
import { message } from "@utils/message";
import { Op, Sequelize } from "sequelize";
import { statusEnum } from "@/utils/enum";
import { documentPlantWhereCondition, documentWhereCondition } from "@utils/type"

class DocumentDaos {
    // Database models
    public document = DB.Document
    public user = DB.User
    public plant = DB.Plant
    public template = DB.Template
    public approval = DB.Approval
    public approvalHistory = DB.ApprovalsHistory

    public upload = async (reqData) => {
        return await this.document.create(reqData)
    }

    public checkUserReference = async (referenceId: string) => {
        return await this.document.findOne({
            where: { id: referenceId }
        })
    }

    async getLatestVersionByReferenceId(referenceId: string): Promise<string | null> {
        const result = await this.document.findOne({
            where: { referenceId },
            order: [['version', 'DESC']] // Get the highest version
        });

        return result ? result.version : null;
    }

    public mapApproverDataToDocuments = (documents: any[], approverDataGrouped: { [key: string]: any[] }) => {
        return documents.map((doc: any) => {
            const { ApprovalsHistoryModels, ...otherData } = doc?.dataValues
            const approvalHistory = ApprovalsHistoryModels || [];

            // Sort approval history if it's an array
            const sortedApprovalHistory = Array.isArray(approvalHistory)
                ? approvalHistory.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
                : [];

            // Return the object with sorted approval history and approver data
            return {
                ...otherData,
                approverData: approverDataGrouped[doc.id] || [],
                approvalHistory: sortedApprovalHistory || []
            };
        });
    };

    public fetchApproverData = async (documentIds: string[]) => {
        const getApproverData = await this.approval.findAll({
            where: { documentId: { [Op.in]: documentIds } },
            include: [
                {
                    model: this.user,
                    attributes: { exclude: ['plantId', 'roleId', 'passwordHash', 'role', 'isLoggedIn', 'createdAt', 'updatedAt'] },
                },
            ],
        });

        return getApproverData.reduce((grouped: { [key: string]: any[] }, approver: { documentId: string;[key: string]: any }) => {
            if (!grouped[approver.documentId]) grouped[approver.documentId] = [];

            const approverUserData = approver?.UserModel;
            grouped[approver.documentId].push({
                approverUserId: approverUserData?.id,
                approverName: approverUserData?.name,
                approverEmail: approverUserData?.email,
                approverEmployeeCode: approverUserData?.employeeCode,
                approverDepartment: approverUserData?.department,
                approverDesignation: approverUserData?.designation,
                status: approver.status,
                comments: approver.comments,
                reminderCount: approver.reminderCount,
                currentApproverLevel: approver.currentApproverLevel,
                totalApproverLevel: approver.totalApproverLevel,
            });

            const sortedGroupedData = Object.keys(grouped).reduce((sorted: { [key: string]: any[] }, documentId) => {
                sorted[documentId] = grouped[documentId].sort((a, b) => a.currentApproverLevel - b.currentApproverLevel);
                return sorted;
            }, {});

            return sortedGroupedData;
        }, {});
    };

    public get = async (
        whereCondition: documentWhereCondition,
        plantWhereCondition: documentPlantWhereCondition,
        pageNumber: number,
        pageSize: number,
        offset: number
    ) => {
        try {
            const excludedUserAttributes = ['roleId', 'passwordHash', 'isLoggedIn', 'createdAt', 'updatedAt'];
            const excludedPlantAttributes = ['facility', 'createdAt', 'updatedAt'];

            const includeUserAndPlant = [
                {
                    model: this.user,
                    where: { ...(Object.keys(plantWhereCondition).length > 0 && { plantId: plantWhereCondition.id }) },
                    attributes: { exclude: excludedUserAttributes },
                    include: [
                        {
                            model: this.plant,
                            attributes: { exclude: excludedPlantAttributes },
                        },
                    ],
                },
            ];

            const includeTemplate = [
                {
                    model: this.template,
                    attributes: [
                        [Sequelize.literal(`JSON_LENGTH(approval_hierarchy)`), 'approvalHierarchyLevelCount'],
                        'templateType',
                    ],
                },
            ];

            const includeApprovalHistory = [
                {
                    model: this.approvalHistory,
                    raw: true
                }
            ]

            // Fetch main data
            const getData = await this.document.findAndCountAll({
                where: whereCondition,
                include: [...includeUserAndPlant, ...includeTemplate, ...includeApprovalHistory],
                // include: [...includeTemplate],
                order: [['createdAt', 'DESC']],
                limit: pageSize,
                offset: offset,
            });

            const getRows = getData?.rows;
            const documentIds = getRows?.map((doc: { id: string }) => doc.id);
            const referenceIds = getRows
                .map((doc: any) => doc.referenceId)
                .filter((refId: string | null) => refId !== null);

            // Fetch approver data
            const approverDataGrouped = await this.fetchApproverData([...documentIds, ...referenceIds]);

            let mergedData = this.mapApproverDataToDocuments(getRows, approverDataGrouped);

            // Fetch reference documents
            if (referenceIds.length > 0) {
                const referenceDocuments = await this.document.findAll({
                    where: { id: { [Op.in]: referenceIds } },
                    include: [...includeUserAndPlant, ...includeTemplate, ...includeApprovalHistory],
                    // include: [...includeTemplate],
                });
                for (const doc of referenceDocuments) {
                    if (doc.referenceId === null) { // Check if it's a parent document
                        const parentId = doc.id;

                        // Count how many documents have this parentId as their referenceId
                        const referenceCount = await this.document.count({
                            where: { referenceId: parentId }
                        });
                        // Add total version count in the parent document
                        doc.dataValues.totalVersionCount = referenceCount;
                    }
                }

                const referenceData = this.mapApproverDataToDocuments(referenceDocuments, approverDataGrouped);
                mergedData = [...referenceData, ...mergedData];
            }

            const totalItems = getRows?.length;

            // Prepare paginated result
            const paginatedResult = {
                totalItems,
                totalPages: Math.ceil(totalItems / pageSize),
                currentPage: pageNumber,
                pageSize: pageSize,
                data: mergedData,
            };

            return paginatedResult;
        } catch (error) {
            console.error(message.document.failedFetchDocumentData, error);
            throw new Error(message.document.failedFetchDocumentData);
        }
    };

    public updateDocumentStatus = async (updateDocumentStatus: object, documentId: string) => {
        return await this.document.update(updateDocumentStatus, { where: { id: documentId } })
    }

    public checkApprovedVersion = async (whereCondition: any) => {
        const { plantId, status, ...restConditions } = whereCondition;
        return await this.document.findAll({
            where: {
                ...restConditions,
                // ...(status && { status })
            },
            //where: whereCondition
            include: [
                {
                    model: this.template,
                    where: plantId ? { plantId } : "",
                    attributes: {
                        include: [
                            [
                                Sequelize.literal(`JSON_LENGTH(approval_hierarchy)`),
                                'approvalHierarchyLevelCount',
                            ],
                        ],
                    },
                },
                {
                    model: this.approvalHistory,
                    raw: true
                }
            ]
        })
    }

    public async checkApprovedOrDisapprovedStatus(where: any): Promise<string[]> {
        const getData = await this.checkApprovedVersion(where);
        const matchingIds: string[] = [];

        getData.forEach((item: any) => {
            // const referenceId = item?.referenceId
            const approvalHierarchyLevelCount = item?.TemplatesModel?.dataValues?.approvalHierarchyLevelCount;
            const approvalHistory = item?.ApprovalsHistoryModels
            const rejectedIds = approvalHistory
                .filter((item) => item.dataValues.senderStatus === 'REJECTED')
                .map((item) => item.dataValues.documentId);
            const statusTextLevel = parseInt(item?.statusText?.split(' ')?.pop() || '0', 10);
            if (where.status === statusEnum.APPROVED.toUpperCase() && statusTextLevel === approvalHierarchyLevelCount && where.status === item.status) {
                matchingIds.push(item.dataValues.id);
            } else if ((where.status === statusEnum.PENDING.toUpperCase() && statusTextLevel !== approvalHierarchyLevelCount)) {
                matchingIds.push(item.dataValues.id);
            } else if (where.status === statusEnum.REJECTED.toUpperCase()) {
                matchingIds.push(...rejectedIds)
            }
        });

        return matchingIds;
    }

    public findById = async (id: string | string[],) => {
        if (typeof id === 'string') {
            return await this.document.findOne({
                where: { id }
            })

        }
        return await this.document.findAll({
            where: {
                id: {
                    [Op.in]: id,
                }
            }
        });

    }

    public async getDocData(where): Promise<Document> {
        return await this.document.findAll({
            where,
            attributes: ['id', 'version', 'fgSapCode', 'childSapCode', 'fgAndChildPart', 'googlesheetLink', 'createdAt'],
            order: [['updatedAt', 'DESC']],
            limit: 1
        })
    }
}

export default DocumentDaos