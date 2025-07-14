import { IsString, IsNotEmpty, IsArray, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class ApprovalHierarchy {
    @IsString()
    @IsNotEmpty()
    level: string;

    @IsString()
    @IsNotEmpty()
    approverUserId: string;
}

export class CreateTemplateDto {
    @IsString()
    @IsNotEmpty()
    templateType: string;

    @IsString()
    @IsNotEmpty()
    templateImage: string;

    @IsArray()
    @ValidateNested({ each: true }) // Validate each object in the array
    @Type(() => ApprovalHierarchy) // Specify the type for transformation
    approvalHierarchy: ApprovalHierarchy[];
}