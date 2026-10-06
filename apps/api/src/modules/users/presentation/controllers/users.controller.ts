import { Body, Controller, Get, Post, Patch, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Roles } from '../../../auth/presentation/roles.decorator.js';
import { RolesGuard } from '../../../auth/presentation/roles.guard.js';
import { UsersService } from '../../application/users.service.js';
import { CreateUserDto } from '../dto/create-user.dto.js';
import { UpdateUserDto } from '../dto/update-user.dto.js';

@Controller('usuarios')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    const users = await this.usersService.list();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    }));
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      role: dto.role,
      status: dto.status,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  @Patch(':id')
  @Roles('ADMIN')
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.update({
      id,
      name: dto.name,
      email: dto.email,
      role: dto.role,
      status: dto.status,
      password: dto.password,
    });

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  async deactivate(@Param('id', new ParseUUIDPipe()) id: string) {
    const deactivated = await this.usersService.deactivate({ id });

    if (!deactivated) {
      return { message: 'Usuario no encontrado' };
    }

    return { message: 'Usuario desactivado' };
  }
}
