export interface BomApproval {
  id: string;
  bomId: string;
  approverId: string;
  bomHierarchyId: string;
  status: string;
  statusText: string
  currentApproverLevel: number;
  totalApproverLevel: number;
}
