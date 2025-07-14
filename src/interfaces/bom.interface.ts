import { stringifiedJson } from "aws-sdk/clients/customerprofiles";

export interface BomDataInterface {
  id: string;
  userId: string;
  plantId: string;
  bomId: string;
  status: string;
  statusText: string;
  enggDataBase: string;
  projectNo: string;
  productNo: string;
  productName: string;
  dwgNo: string;
  sapNo: string;
  productGroup: string;
  image: string;
  revNo: string;
  googleSheetLink: string;
  ecnEcrNo: string;
  model: string;
  customerName: string;
  customerNo: string;
  submissionStatus: string;
  bomType: string;
  version: string
  parentBomId: string
  drawing: string
}
