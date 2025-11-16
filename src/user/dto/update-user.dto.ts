import { UserRole } from '@prisma/client';

export class UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  branchId?: string;
}

