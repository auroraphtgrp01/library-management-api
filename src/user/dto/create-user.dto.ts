import { UserRole } from '@prisma/client';

export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  branchId: string;
}

