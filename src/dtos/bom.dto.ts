import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsPositive,
  ValidateNested,
  IsArray,
} from "class-validator";
import { Type } from "class-transformer";

export class BomFormDataDTO {
  @IsString()
  @IsOptional()
  sNo: string;

  @IsString()
  @IsOptional()
  childPartNo!: string;

  @IsString()
  @IsOptional()
  childPartName!: string;

  @IsString()
  @IsOptional()
  dwgNo!: string;

  @IsString()
  @IsOptional()
  version!: string;

  @IsString()
  @IsOptional()
  sapNo!: string;

  @IsString()
  @IsOptional()
  material!: string;

  @IsString()
  @IsOptional()
  weight!: string;

  @IsString()
  @IsOptional()
  quantity!: string;

  @IsString()
  @IsOptional()
  netWeight!: string;

  @IsString()
  @IsOptional()
  ecnEcrNo!: string;

  @IsString()
  @IsOptional()
  surfaceFinish: string;

  @IsString()
  @IsOptional()
  remarks: string;

  @IsString()
  @IsOptional()
  childImage: string;

  @IsString()
  @IsOptional()
  toolingSupplier: string;

  @IsString()
  @IsOptional()
  partSupplier: string
}

export class BomDtailsDTO {
  @IsString()
  @IsOptional()
  enggDataBase!: string

  @IsString()
  @IsOptional()
  projectNo!: string

  @IsString()
  @IsOptional()
  productNo!: string

  @IsString()
  @IsOptional()
  productName!: string;

  @IsString()
  @IsOptional()
  dwgNo!: string

  @IsString()
  @IsOptional()
  sapNo!: string

  @IsString()
  @IsOptional()
  productGroup!: string

  @IsString()
  @IsOptional()
  image!: string;

  @IsString()
  @IsOptional()
  version!: string
}

export class BomData {
  @ValidateNested({ each: true })
  @Type(() => BomDtailsDTO)
  bomDetails!: BomDtailsDTO;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomFormDataDTO)
  bomForm!: BomFormDataDTO[];
}
export class GetBomFormDataDTO {
  @IsString()
  bomId: string;
}

export class BomHierarchyDTO {
  @IsString()
  @IsNotEmpty()
  userId!: string;

  @IsString()
  @IsNotEmpty()
  plantId!: string;

  @IsNumber()
  @IsNotEmpty()
  level!: number;
}
export class BomHierarchyArrayDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BomHierarchyDTO)
  data!: BomHierarchyDTO[];
}
export class BomHierarchyUpdateDTO {
  @IsNumber()
  @IsNotEmpty()
  level!: number;
}

export class ApproveBomDto {
  @IsString()
  @IsNotEmpty()
  status!: string;

  @IsString()
  @IsNotEmpty()
  bomId!: string;

  @IsString()
  @IsOptional()
  comments!: string;
}

export class BomFilterDto {
  @IsString()
  @IsOptional()
  status!: string;

  @IsString()
  @IsOptional()
  page!: string;

  @IsString()
  @IsOptional()
  pageSize!: string;

  @IsString()
  @IsOptional()
  sortBy!: string;

  @IsString()
  @IsOptional()
  sortOrder!: string;
}

export class GetApprovalData {
  @IsString()
  @IsOptional()
  page?: string

  @IsString()
  @IsOptional()
  limit?: string

  @IsString()
  @IsOptional()
  status?: string

  @IsString()
  @IsOptional()
  bomId?: string
}

export class BomApproveDto {
  @IsString()
  @IsNotEmpty()
  approvalId: string
}

export class GetBomDto {
  @IsString()
  @IsOptional()
  bomId?: string

  @IsString()
  @IsOptional()
  page?: string

  @IsString()
  @IsOptional()
  limit?: string

  @IsString()
  @IsOptional()
  status?: string

  @IsString()
  @IsOptional()
  plantIdSearch?: string

  @IsString()
  @IsOptional()
  submissionStatus?: string
}

export class BomHierarchyTemplateDTO {
  @IsString()
  plantId: string;
}