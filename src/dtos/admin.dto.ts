import { IsString, IsEmail, IsNotEmpty, IsOptional, IsNumber, IsJSON, IsArray, ValidateNested } from "class-validator";

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  public password: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public plantId: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  role: string;
}

export class AdminFilterDto {
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
  adminId?: string;
}

export class DeleteAdminDto {
  @IsString()
  @IsNotEmpty()
  adminId?: string;
}

export class GetAllUserDto {
  @IsString()
  @IsOptional()
  plantName?: string

  @IsString()
  @IsOptional()
  page?: number

  @IsString()
  @IsOptional()
  limit?: number

  @IsString()
  @IsOptional()
  id?: string
}
