import { IsString, IsNotEmpty, IsArray, IsOptional } from "class-validator";

export class ApproveDocumentDto {
    @IsString()
    @IsNotEmpty()
    approvalId: string
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
}