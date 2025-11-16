import { UserRole } from '@prisma/client';
import { IsNotEmpty, IsString, IsEmail, MinLength, IsOptional, IsEnum, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}

