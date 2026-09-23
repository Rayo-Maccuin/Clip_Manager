import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module.js';
import { TAG_REPOSITORY } from './application/ports/tag-repository.token.js';
import { CreateTagUseCase } from './application/use-cases/create-tag.use-case.js';
import { ListTagsUseCase } from './application/use-cases/list-tags.use-case.js';
import { PrismaTagRepository } from './infrastructure/repositories/prisma-tag.repository.js';
import { TagsController } from './presentation/controllers/tags.controller.js';

@Module({
  imports: [PrismaModule],
  controllers: [TagsController],
  providers: [
    {
      provide: TAG_REPOSITORY,
      useClass: PrismaTagRepository,
    },
    CreateTagUseCase,
    ListTagsUseCase,
  ],
  exports: [
    CreateTagUseCase,
    ListTagsUseCase,
  ],
})
export class TagsModule {}

