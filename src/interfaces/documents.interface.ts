export interface Documents {
  id: string;
  documentTitle: string;
  fileUrl: string[];
  status: string;
  statusText: string
  userId: string;
  templateId: string;
  referenceId: string
  version: string
  projectCode: string
  typeOfCustomer: string
  projectFamily: string
  assemblyDrawingNumber: string
  fgSapCode: number
  childSapCode: number
  productPicture: string[]
  fgAndChildPart: string
  reasonForChange: string
  changeInitiationDate: Date
  typeOfChange: string
  googlesheetLink: string
}
