import { Injectable, ForbiddenException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto, PaginatedResponse } from '../common/dto/pagination.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger = new Logger(UserService.name);

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    await this.createDefaultSuperAdmin();
  }

  async createDefaultSuperAdmin() {
    try {
      // Kiểm tra xem đã có admin chưa
      const existingAdmin = await this.prisma.user.findFirst({
        where: {
          role: UserRole.ADMIN,
        },
      });

      if (existingAdmin) {
        this.logger.log('Super admin đã tồn tại, bỏ qua việc tạo mới');
        return;
      }

      // Tạo branch mặc định nếu chưa có
      let defaultBranch = await this.prisma.branch.findFirst({
        where: {
          name: 'Chi nhánh Trung tâm',
        },
      });

      if (!defaultBranch) {
        defaultBranch = await this.prisma.branch.create({
          data: {
            name: 'Chi nhánh Trung tâm',
          },
        });
        this.logger.log(`Đã tạo branch mặc định: ${defaultBranch.id}`);
      }

      // Hash password mặc định
      const hashedPassword = await bcrypt.hash('admin123', 10);

      // Tạo super admin
      const superAdmin = await this.prisma.user.create({
        data: {
          username: 'admin',
          email: 'admin@library.com',
          password: hashedPassword,
          role: UserRole.ADMIN,
          branchId: defaultBranch.id,
        },
      });

      this.logger.log(`✅ Đã tạo super admin account:`);
      this.logger.log(`   Username: admin`);
      this.logger.log(`   Email: admin@library.com`);
      this.logger.log(`   Password: admin123`);
      this.logger.log(`   Branch ID: ${defaultBranch.id}`);
      this.logger.warn(`⚠️  VUI LÒNG ĐỔI MẬT KHẨU SAU KHI ĐĂNG NHẬP!`);
    } catch (error) {
      this.logger.error('Lỗi khi tạo super admin:', error);
    }
  }

  async create(createUserDto: CreateUserDto, currentUserRole: UserRole) {
    // Staff chỉ được tạo user với role READER
    if (currentUserRole === UserRole.STAFF) {
      createUserDto.role = UserRole.READER;
    }

    // Hash password trước khi lưu
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
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

    // Hash password nếu có cập nhật password
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where,
      data: updateData,
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

