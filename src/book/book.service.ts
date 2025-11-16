import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class BookService {
  constructor(private prisma: PrismaService) {}

  async create(createBookDto: CreateBookDto) {
    return this.prisma.book.create({
      data: createBookDto,
    });
  }

  async findAll(
    pagination: PaginationDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    const where: any = {};
    
    // Manager và Staff chỉ xem được sách trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.book.count({ where }),
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
    
    // Manager và Staff chỉ xem được sách trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.book.findFirst({
      where,
    });
  }

  async update(
    id: string,
    updateBookDto: UpdateBookDto,
    branchId?: string,
    currentUserRole?: UserRole,
  ) {
    const where: any = { id };
    
    // Manager và Staff chỉ update được sách trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.book.update({
      where,
      data: updateBookDto,
    });
  }

  async remove(id: string, branchId?: string, currentUserRole?: UserRole) {
    const where: any = { id };
    
    // Manager và Staff chỉ xóa được sách trong branch của mình
    if (branchId && currentUserRole !== UserRole.ADMIN) {
      where.branchId = branchId;
    }

    return this.prisma.book.delete({
      where,
    });
  }
}

