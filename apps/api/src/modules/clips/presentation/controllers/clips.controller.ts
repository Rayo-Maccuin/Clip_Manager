import {
Body,
Controller,
Delete,
Get,
NotFoundException,
Param,
ParseUUIDPipe,
Patch,
Post,
} from '@nestjs/common';
import { AddTagToClipUseCase } from '../../application/use-cases/add-tag-to-clip.use-case.js';
import { CreateClipUseCase } from '../../application/use-cases/create-clip.use-case.js';
import { GetClipSuggestionsUseCase } from '../../application/use-cases/get-clip-suggestions.use-case.js';
import { GetClipTagsUseCase } from '../../application/use-cases/get-clip-tags.use-case.js';
import { GetClipUseCase } from '../../application/use-cases/get-clip.use-case.js';
import { ListClipsByStreamUseCase } from '../../application/use-cases/list-clips-by-stream.use-case.js';
import { RemoveTagFromClipUseCase } from '../../application/use-cases/remove-tag-from-clip.use-case.js';
import { UpdateClipStatusUseCase } from '../../application/use-cases/update-clip-status.use-case.js';
import { CreateClipDto } from '../dto/create-clip.dto.js';
import { UpdateClipStatusDto } from '../dto/update-clip-status.dto.js';

@Controller()
export class ClipsController {
constructor(
private readonly createClipUseCase: CreateClipUseCase,
private readonly getClipUseCase: GetClipUseCase,
private readonly listClipsByStreamUseCase: ListClipsByStreamUseCase,
private readonly updateClipStatusUseCase: UpdateClipStatusUseCase,
private readonly addTagToClipUseCase: AddTagToClipUseCase,
private readonly removeTagFromClipUseCase: RemoveTagFromClipUseCase,
private readonly getClipSuggestionsUseCase: GetClipSuggestionsUseCase,
private readonly getClipTagsUseCase: GetClipTagsUseCase,
) {}

@Post('streams/:streamId/clips')
async create(
@Param('streamId', new ParseUUIDPipe()) streamId: string,
@Body() dto: CreateClipDto,
) {
const clip = await this.createClipUseCase.execute({
streamId,
title: dto.title,
description: dto.description,
timestamp: dto.timestamp,
duration: dto.duration,
});

if (!clip) {
  throw new NotFoundException('Stream not found');
}

return this.toResponse(clip);

}

@Get('streams/:streamId/clips')
async findByStream(
@Param('streamId', new ParseUUIDPipe()) streamId: string,
) {
const clips = await this.listClipsByStreamUseCase.execute(streamId);

return clips.map((clip) => this.toResponse(clip));

}

@Get('clips/:id/suggestions')
async getSuggestions(
@Param('id', new ParseUUIDPipe()) id: string,
) {
const suggestions =
await this.getClipSuggestionsUseCase.execute(id);

if (!suggestions) {
  throw new NotFoundException('Clip not found');
}

return suggestions;

}

@Get('clips/:id/tags')
async getTags(
@Param('id', new ParseUUIDPipe()) id: string,
) {
const tags = await this.getClipTagsUseCase.execute(id);

return tags.map((tag) => ({
  id: tag.id,
  name: tag.name,
  createdAt: tag.createdAt,
}));

}

@Get('clips/:id')
async findById(@Param('id', new ParseUUIDPipe()) id: string) {
const clip = await this.getClipUseCase.execute(id);

if (!clip) {
  throw new NotFoundException('Clip not found');
}

return this.toResponse(clip);

}

@Patch('clips/:id/status')
async updateStatus(
@Param('id', new ParseUUIDPipe()) id: string,
@Body() dto: UpdateClipStatusDto,
) {
const clip = await this.updateClipStatusUseCase.execute({
id,
status: dto.status,
});

if (!clip) {
  throw new NotFoundException('Clip not found');
}

return this.toResponse(clip);

}

@Post('clips/:clipId/tags/:tagId')
async addTag(
@Param('clipId', new ParseUUIDPipe()) clipId: string,
@Param('tagId', new ParseUUIDPipe()) tagId: string,
) {
await this.addTagToClipUseCase.execute({
clipId,
tagId,
});

return {
  message: 'Tag added to clip',
};

}

@Delete('clips/:clipId/tags/:tagId')
async removeTag(
@Param('clipId', new ParseUUIDPipe()) clipId: string,
@Param('tagId', new ParseUUIDPipe()) tagId: string,
) {
await this.removeTagFromClipUseCase.execute({
clipId,
tagId,
});

return {
  message: 'Tag removed from clip',
};

}

private toResponse(clip: {
id: string;
streamId: string;
title: string;
description: string | null;
timestamp: number;
duration: number;
status: string;
createdAt: Date;
updatedAt: Date;
}) {
return {
id: clip.id,
streamId: clip.streamId,
title: clip.title,
description: clip.description,
timestamp: clip.timestamp,
duration: clip.duration,
status: clip.status,
createdAt: clip.createdAt,
updatedAt: clip.updatedAt,
};
}
}
