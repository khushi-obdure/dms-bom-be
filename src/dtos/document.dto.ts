import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, isString, IsDate, ValidateNested } from "class-validator";
import { Type } from 'class-transformer';

class FileDto {
    @IsString()
    originalname: string;

    @IsString()
    mimetype: string;
}

export class UploadDocumentDto {
    @IsString()
    @IsNotEmpty()
    documentTitle?: string;

    // @IsArray()
    // @IsNotEmpty()
    // fileUrl?: JSON;

    @IsString()
    @IsOptional()
    templateId?: string;

    @IsString()
    @IsOptional()
    projectCode?: string

    @IsString()
    @IsOptional()
    typeOfCustomer?: string

    @IsString()
    @IsOptional()
    projectFamily?: string

    @IsString()
    @IsOptional()
    assemblyDrawingNumber?: string

    @IsNumber()
    @IsOptional()
    fgSapCode?: number

    @IsNumber()
    @IsOptional()
    childSapCode?: number

    @IsString()
    @IsOptional()
    fgAndChildPart?: string

    @IsString()
    @IsOptional()
    reasonForChange?: string

    @IsDate()
    @IsOptional()
    changeInitiationDate?: Date

    @IsString()
    @IsOptional()
    typeOfChange?: string

    @IsArray()
    @IsOptional()
    googlesheetLink?: JSON;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => FileDto)
    fileUrl?: FileDto;
}

export class GetDocumentDto {
    @IsString()
    @IsOptional()
    documentId?: string

    @IsString()
    @IsOptional()
    page?: string

    @IsString()
    @IsOptional()
    limit?: string

    @IsString()
    @IsOptional()
    referenceId?: string

    @IsString()
    @IsOptional()
    status?: string

    @IsString()
    @IsOptional()
    plantIdSearch?: string

    @IsString()
    @IsOptional()
    sapNo?: string
}

export class UpdateDocumentDto {
    @IsString()
    @IsNotEmpty()
    documentTitle?: string;

    @IsArray()
    @IsNotEmpty()
    fileUrl?: JSON;

    @IsString()
    @IsOptional()
    templateId?: string;

    @IsString()
    @IsOptional()
    refereneceId: string

    @IsNumber()
    @IsOptional()
    version: number
}
