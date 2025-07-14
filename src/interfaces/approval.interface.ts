export interface Approvals {
  id: string;
  documentId: string;
  approverId: string;
  status: string;
  comments: string;
  reminderCount: number
  currentApproverLevel: number
  totalApproverLevel: number
  sendBackLevel: number
  emailCount: number
}
