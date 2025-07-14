import { Op } from "sequelize";

export interface BomGetApprovalData {
    reqQuery: {
        status?: string
        page?: string
        limit?: string
        bomId?: string
    };
    userData: {
        id: string;
        isLoggedIn?: boolean;
        email?: string;
        role: string;
        roleId?: string;
        plantId?: string;
        plantName?: string;
        expiresIn?: string;
        iat?: number;
        exp?: number;
    };
}
export interface BomDetail {
    bomApprovalTable: {
        id: string;
        status: string;
    };
    bomMadeByUser: {
        id: string;
        name: string;
        email: string;
        employeeCode: string | null;
        department: string | null;
        designation: string | null;
    };
    bomData: {
        id: string;
        bomId: string;
        status: string;
        mergedStatus: string;
        mainPartCode: string;
        mainPartDescription: string;
        bomCreatedAt: string;
        bomFormData: {
            id: string;
            bomId: string;
            sNo: string;
            depth: string;
            partName: string;
            sapCode: string;
            customerPartNo: string;
            lmatPartNo: string;
            commodityDetails: string;
            materialGrade: string;
            weight: string;
            qtyPer: string;
            rmSource: string;
            toolingSupplier: string;
            machineTonnage: string;
            cycleTime: string;
            cav: string;
            remarks: string;
            assyCompComplete: string;
            createdAt: string;
            updatedAt: string;
        }[];
    };
    approverData: {
        approverUserId: string;
        approverEmail: string;
        approverDesignation: string | null;
        approverDepartment: string | null;
        approverName: string;
        approverPlant: string;
        status: string;
        currentApproverLevel: number;
        totalApproverLevel: number;
        createdAt: string;
        updatedAt: string;
    }[];
    bomApprovalHistory: {
        id: string;
        bomId: string;
        senderApproverId: string;
        receiverApproverId: string;
        senderComment: string;
        senderLevel: number;
        receiverLevel: number;
        totalLevel: number;
        senderStatus: string;
        receiverStatus: string;
        createdAt: string;
        updatedAt: string;
    }[];
}

export interface BomDetailsResponse {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    data: BomDetail[]; // The array wrapping all the BomDetail objects
}

export interface BomQueryFilter {
    bomId: {
        [Op.in]: string[];
    };
    approverId: string;
}