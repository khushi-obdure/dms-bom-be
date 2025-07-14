export interface BomApprovalsHistory {
    id: string;
    bomId: string;
    senderComment: string
    senderApproverId: string
    receiverApproverId: string
    senderLevel: number
    receiverLevel: number
    totalLevel: number
    senderStatus: string
    receiverStatus: string
}
