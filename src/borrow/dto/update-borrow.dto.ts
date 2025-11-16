import { BorrowStatus } from '@prisma/client';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateBorrowDto {
  @IsOptional()
  @IsDateString()
  returnDate?: Date;

  @IsOptional()
  @IsEnum(BorrowStatus)
  status?: BorrowStatus;
}

