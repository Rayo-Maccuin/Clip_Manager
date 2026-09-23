import { Module } from '@nestjs/common';
import { PrismaModule } from '../../infrastructure/persistence/prisma/prisma.module.js';
import { STREAM_REPOSITORY } from '../streams/application/ports/stream-repository.token.js';
import { PrismaStreamRepository } from '../streams/infrastructure/repositories/prisma-stream.repository.js';
import { TAG_REPOSITORY } from '../tags/application/ports/tag-repository.token.js';
import { PrismaTagRepository } from '../tags/infrastructure/repositories/prisma-tag.repository.js';
import { CLIP_REPOSITORY } from './application/ports/clip-repository.token.js';
import { CLIP_TAG_REPOSITORY } from './application/ports/clip-tag-repository.token.js';
import { AddTagToClipUseCase } from './application/use-cases/add-tag-to-clip.use-case.js';
import { CreateClipUseCase } from './application/use-cases/create-clip.use-case.js';
import { GetClipSuggestionsUseCase } from './application/use-cases/get-clip-suggestions.use-case.js';
import { GetClipTagsUseCase } from './application/use-cases/get-clip-tags.use-case.js';
import { GetClipUseCase } from './application/use-cases/get-clip.use-case.js';
import { ListClipsByStreamUseCase } from './application/use-cases/list-clips-by-stream.use-case.js';
import { RemoveTagFromClipUseCase } from './application/use-cases/remove-tag-from-clip.use-case.js';
import { UpdateClipStatusUseCase } from './application/use-cases/update-clip-status.use-case.js';
import { ContentSuggestionService } from './application/services/content-suggestion.service.js';
import { PrismaClipRepository } from './infrastructure/repositories/prisma-clip.repository.js';
import { PrismaClipTagRepository } from './infrastructure/repositories/prisma-clip-tag.repository.js';
import { ClipsController } from './presentation/controllers/clips.controller.js';

@Module({
imports: [PrismaModule],
controllers: [ClipsController],
providers: [
{
provide: CLIP_REPOSITORY,
useClass: PrismaClipRepository,
},
{
provide: CLIP_TAG_REPOSITORY,
useClass: PrismaClipTagRepository,
},
{
provide: STREAM_REPOSITORY,
useClass: PrismaStreamRepository,
},
{
provide: TAG_REPOSITORY,
useClass: PrismaTagRepository,
},
CreateClipUseCase,
GetClipUseCase,
ListClipsByStreamUseCase,
UpdateClipStatusUseCase,
AddTagToClipUseCase,
RemoveTagFromClipUseCase,
ContentSuggestionService,
GetClipSuggestionsUseCase,
GetClipTagsUseCase,
],
exports: [
CreateClipUseCase,
GetClipUseCase,
ListClipsByStreamUseCase,
UpdateClipStatusUseCase,
AddTagToClipUseCase,
RemoveTagFromClipUseCase,
ContentSuggestionService,
GetClipSuggestionsUseCase,
GetClipTagsUseCase,
],
})
export class ClipsModule {}
