import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { UserRole, BorrowStatus } from '@prisma/client';

@Injectable()
export class BorrowService {
  constructor(private prisma: PrismaService) {}

  async create(createBorrowDto: CreateBorrowDto) {
    return this.prisma.borrow.create({
      data: createBorrowDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        book: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll(
    pagination: PaginationDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    const where: any = {};
    
    // Manager và Staff chỉ xem được lượt mượn trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    const [data, total] = await Promise.all([
      this.prisma.borrow.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          book: true,
          branch: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.borrow.count({ where }),
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
    
    // Manager và Staff chỉ xem được lượt mượn trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.borrow.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        book: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(
    id: string,
    updateBorrowDto: UpdateBorrowDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    const where: any = { id };
    
    // Manager và Staff chỉ update được lượt mượn trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    // Nếu trả sách, tự động set returnDate và status
    if (updateBorrowDto.status === BorrowStatus.RETURNED && !updateBorrowDto.returnDate) {
      updateBorrowDto.returnDate = new Date();
    }

    return this.prisma.borrow.update({
      where,
      data: updateBorrowDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        book: true,
        branch: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(id: string, branchId?: string, currentUserRole?: UserRole) {
    const where: any = { id };
    
    // Manager và Staff chỉ xóa được lượt mượn trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.borrow.delete({
      where,
    });
  }
}

