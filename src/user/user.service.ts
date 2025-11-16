import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto, currentUserRole: UserRole) {
    // Staff chỉ được tạo user với role READER
    if (currentUserRole === UserRole.STAFF) {
      createUserDto.role = UserRole.READER;
    }

    return this.prisma.user.create({
      data: createUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findAll(
    pagination: PaginationDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    // Manager và Staff chỉ xem được user trong branch của mình
    const where: any = {};
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          branchId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return new PaginatedResponse(
      data,
      total,
      pagination.page,
      pagination.limit,
    );
  }

  async findOne(id: string, branchId?: string, currentUserRole?: UserRole) {
    const where: any = { id };
    
    // Manager và Staff chỉ xem được user trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    const where: any = { id };
    
    // Manager và Staff chỉ update được user trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    // Staff không được thay đổi role
    if (currentUserRole === UserRole.STAFF && updateUserDto.role) {
      delete updateUserDto.role;
    }

    return this.prisma.user.update({
      where,
      data: updateUserDto,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        branchId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async remove(id: string, branchId?: string, currentUserRole?: UserRole) {
    const where: any = { id };
    
    // Manager và Staff chỉ xóa được user trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.user.delete({
      where,
    });
  }
}

