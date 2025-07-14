import DB from "@/database";
import { Sequelize, Op } from "sequelize";

class TemplateDaos {
    // Database models
    public template = DB.Template
    public plant = DB.Plant
    public user = DB.User

    public createTemplate = async (reqData: object) => {
        return await this.template.create(reqData)
    };

    public checkUserInApprovalHierarchy = async (templateId: string, id: string) => {
        return await this.template.findOne({
            where: {
                id: templateId,
                [Op.and]: [
                    Sequelize.literal(
                        `JSON_CONTAINS(approval_hierarchy, JSON_OBJECT('approverUserId', '${id}'), '$')`
                    )
                ]
            }
        });
    }

    public getTemplate = async (templateId: string) => {
        return await this.template.findOne({ where: { id: templateId } })
    }

    public getTemplateData = async (whereCondition: object) => {
        return await this.template.findAll({
            where: whereCondition,
            attributes: {
                include: [
                    [
                        Sequelize.literal(`JSON_LENGTH(approval_hierarchy)`),
                        'approvalHierarchyLevelCount',
                    ],
                ],
            },
            include: [
                {
                    model: this.plant,
                    attributes: { exclude: ['facility', 'createdAt', 'updatedAt'] },
                },
            ],
        }).then((templates) => {
            return Promise.all(
                templates.map(async (template) => {
                    const approvalHierarchy = template.approvalHierarchy;
                    const updatedHierarchy = await Promise.all(
                        approvalHierarchy.map(async (level) => {
                            const approver = await this.user.findOne({
                                where: { id: level.approverUserId },
                                attributes: ['name', 'email', 'employeeCode', 'department', 'designation', 'plantId'],
                            });
                            const plant = await this.plant.findOne({
                                where: { id: approver.plantId },
                            });
                            return {
                                ...level,
                                name: approver?.name || null,
                                email: approver?.email || null,
                                employeeCode: approver?.employeeCode || null,
                                department: approver?.department || null,
                                designation: approver?.designation || null,
                                approverPlantId: plant?.id || null,
                                approverPlantName: plant?.plantName || null,
                                approverPlantAcronym: plant?.acronym || null
                            };
                        })
                    );
                    return {
                        ...template.toJSON(),
                        approvalHierarchy: updatedHierarchy,
                    };
                })
            );
        });
    };

}

export default TemplateDaos