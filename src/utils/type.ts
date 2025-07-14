import { Op } from "sequelize";

export interface ReqData {
    reqQuery: {
        documentId?: string;
        page?: string,
        limit?: string
        status?: string
        plantIdSearch?: string
        sapNo?: string
    };
    userData: {
        id: number;
        role: string
        plantId: string
    };
    [key: string]: any; // Allow additional properties if needed
}


export interface approveDocumentReqData {
    reqQuery: {
        approvalId: string,
        approvalReferenceId?: string
    };
    userId: number;
    reqBody: {
        senderComment?: string,
        documentId?: string,
        senderApproverId?: string,
        receiverApproverId?: string,
        senderLevel?: number,
        receiverLevel?: number,
        totalLevel?: number,
        senderStatus?: string,
        receiverStatus?: string
        referenceId?: string
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

export interface ApprovalRow {
    id: string;
    documentId: string;
    senderLevel: number;
    receiverLevel: number | null;
    totalLevel: number;
    senderStatus: string;
    receiverStatus: string;
    senderApproverId: string
}