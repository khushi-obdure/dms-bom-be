import { BomDataInterface } from "@/interfaces/bom.interface";
import { BomFormDataInterface } from "@/interfaces/bom.fromData.interface";

export interface MixedBomFormDataInterface {
  userId: string;
  plantId: string;
  image: string;
  googleSheetLink: string;
  bomDetails: BomDataInterface;
  bomForm: BomFormDataInterface[];
  id: string
  createNewVersion: string
  drawing: string
}
