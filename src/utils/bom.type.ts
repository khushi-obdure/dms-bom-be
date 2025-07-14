import { Op } from "sequelize";

export interface approveBomReqData {
    reqQuery: {
        approvalId: string,
        approvalReferenceId?: string
    };
    userId: number;
    reqBody: {
        senderComment?: string,
        bomId?: string,
        senderApproverId?: string,
        receiverApproverId?: string,
        senderLevel?: number,
        receiverLevel?: number,
        totalLevel?: number,
        senderStatus?: string,
        receiverStatus?: string
    }
}

export interface documentWhereCondition {
    userId?: number;
    id?: string | { [Op.in]?: string[] | {};[Op.or]?: string[] | {} } | string[];
    referenceId?: string | { [Op.in]?: string[] | {};[Op.or]?: string[] | {} } | string[];
    status?: string
}

export interface documentPlantWhereCondition {
    id?: string
}