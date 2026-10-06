import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module.js';
import { UsersService } from './application/users.service.js';
import { USER_REPOSITORY } from './application/ports/user-repository.token.js';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository.js';
import { UsersController } from './presentation/controllers/users.controller.js';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    UsersService,
  ],
})
export class UsersModule {}
