import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module.js';
import { AuthService } from './application/auth.service.js';
import { PasswordService } from './infrastructure/password.service.js';
import { TokenService } from './infrastructure/token.service.js';
import { AuthController } from './presentation/auth.controller.js';
import { AuthGuard } from './presentation/auth.guard.js';
import { RolesGuard } from './presentation/roles.guard.js';

@Module({
  imports: [PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordService, TokenService, AuthGuard, RolesGuard],
  exports: [AuthService, AuthGuard, RolesGuard, PasswordService],
})
export class AuthModule {}
