import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { UpdateBorrowDto } from './dto/update-borrow.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('borrows')
@UseGuards(AuthGuard, RolesGuard)
export class BorrowController {
  constructor(private readonly borrowService: BorrowService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  create(@Body() createBorrowDto: CreateBorrowDto) {
    return this.borrowService.create(createBorrowDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.READER)
  findAll(@Query() pagination: PaginationDto, @Request() req: any) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.borrowService.findAll(pagination, branchId, currentUserRole);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF, UserRole.READER)
  findOne(@Param('id') id: string, @Request() req: any) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.borrowService.findOne(id, branchId, currentUserRole);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  update(
    @Param('id') id: string,
    @Body() updateBorrowDto: UpdateBorrowDto,
    @Request() req: any,
  ) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.borrowService.update(id, updateBorrowDto, branchId, currentUserRole);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string, @Request() req: any) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.borrowService.remove(id, branchId, currentUserRole);
  }
}

