import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module.js';
import { STREAM_REPOSITORY } from './application/ports/stream-repository.token.js';
import { CreateStreamUseCase } from './application/use-cases/create-stream.use-case.js';
import { EndStreamUseCase } from './application/use-cases/end-stream.use-case.js';
import { GetStreamUseCase } from './application/use-cases/get-stream.use-case.js';
import { ListStreamsUseCase } from './application/use-cases/list-streams.use-case.js';
import { PrismaStreamRepository } from './infrastructure/repositories/prisma-stream.repository.js';
import { StreamsController } from './presentation/controllers/streams.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [StreamsController],
  providers: [
    {
      provide: STREAM_REPOSITORY,
      useClass: PrismaStreamRepository,
    },
    CreateStreamUseCase,
    EndStreamUseCase,
    GetStreamUseCase,
    ListStreamsUseCase,
  ],
  exports: [
    CreateStreamUseCase,
    EndStreamUseCase,
    GetStreamUseCase,
    ListStreamsUseCase,
  ],
})
export class StreamsModule {}
