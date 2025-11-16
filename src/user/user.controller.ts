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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { RolesGuard } from '../common/guards/roles.guard';
import { AuthGuard } from '../common/guards/auth.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('users')
@UseGuards(AuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  create(@Body() createUserDto: CreateUserDto, @Request() req: any) {
    const currentUserRole = req.user?.role;
    return this.userService.create(createUserDto, currentUserRole);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findAll(
    @Query() pagination: PaginationDto,
    @Request() req: any,
  ) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.userService.findAll(pagination, branchId, currentUserRole);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  findOne(@Param('id') id: string, @Request() req: any) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.userService.findOne(id, branchId, currentUserRole);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.STAFF)
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.userService.update(id, updateUserDto, branchId, currentUserRole);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  remove(@Param('id') id: string, @Request() req: any) {
    const branchId = req.user?.branchId;
    const currentUserRole = req.user?.role;
    return this.userService.remove(id, branchId, currentUserRole);
  }
}

