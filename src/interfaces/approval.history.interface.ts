export interface ApprovalsHistory {
    id: string;
    documentId: string;
    senderComment: string
    senderApproverId: string
    receiverApproverId: string
    senderLevel: number
    receiverLevel: number
    totalLevel: number
    senderStatus: string
    receiverStatus: string
    referenceId: string
}
