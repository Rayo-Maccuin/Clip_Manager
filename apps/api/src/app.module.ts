import { Module } from '@nestjs/common';
import { ClipsModule } from './modules/clips/clips.module.js';
import { StreamsModule } from './modules/streams/streams.module.js';
import { TagsModule } from './modules/tags/tags.module.js';
import { PrismaModule } from './infrastructure/persistence/prisma/prisma.module.js';
import { HealthModule } from './presentation/health/health.module.js';

@Module({
  imports: [
    PrismaModule,
    HealthModule,
    StreamsModule,
    ClipsModule,
    TagsModule,
  ],
})
export class AppModule {}

