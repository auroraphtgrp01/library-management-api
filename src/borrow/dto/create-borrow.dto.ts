import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateBorrowDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
  bookId: string;

  @IsNotEmpty()
  @IsUUID()
  branchId: string;
}

