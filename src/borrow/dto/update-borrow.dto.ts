import { BorrowStatus } from '@prisma/client';

export class UpdateBorrowDto {
  returnDate?: Date;
  status?: BorrowStatus;
}

