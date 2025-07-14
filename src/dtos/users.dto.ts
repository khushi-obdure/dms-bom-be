import {
  IsString,
  IsEmail,
  IsNumber,
  IsArray,
  ArrayMinSize,
  IsNotEmpty,
  IsOptional,
  IS_EMPTY,
  IsEmpty,
  Matches,
} from "class-validator";
import { statusEnum } from "@utils/enum"
export class PasswordLoginUserDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;
}

export class OtpLoginUserDto {
  @IsEmail()
  public email: string;

  @IsNumber()
  public otp: number;
}
export class SendOtpUserDto {
  @IsEmail()
  public email: string;
}
export class AssignRole {
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayMinSize(1)
  public roleIds: number[];
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsOptional()
  public plantId: string;

  @IsString()
  @IsOptional()
  public roleName: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  public password: string;

  @IsString()
  @IsOptional()
  @IsEmail()
  public email: string;

  @IsString()
  @IsOptional()
  public name: string

  @IsString()
  @IsOptional()
  public employeeCode: string

  @IsString()
  @IsOptional()
  public department: string

  @IsString()
  @IsOptional()
  public designation: string
}

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;
}

export class CreateLoginDto {
  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}

export class UserFilterDto {
  @IsString()
  @IsOptional()
  sortBy?: string;

  @IsString()
  @IsOptional()
  order?: string;

  @IsString()
  @IsOptional()
  limit?: number;

  @IsString()
  @IsOptional()
  page?: number;

  @IsString()
  @IsOptional()
  userId?: string;
}

export class UploadDocumentDto {
  @IsString()
  @IsNotEmpty()
  documentTitle?: string;

  @IsArray()
  @IsNotEmpty()
  fileUrl?: JSON;

  @IsString()
  @IsOptional()
  templateId?: string;
}
