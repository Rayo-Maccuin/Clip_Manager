import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ClipsModule } from './modules/clips/clips.module.js';
import { StreamsModule } from './modules/streams/streams.module.js';
import { TagsModule } from './modules/tags/tags.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module.js';
import { HealthModule } from './presentation/health/health.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { AuthGuard } from './modules/auth/presentation/auth.guard.js';
import { RolesGuard } from './modules/auth/presentation/roles.guard.js';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    HealthModule,
    StreamsModule,
    ClipsModule,
    TagsModule,
    UsersModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}

