import {
Inject,
Injectable,
NotFoundException,
} from '@nestjs/common';
import type { Tag } from '../../../tags/domain/entities/tag.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { ClipTagRepository } from '../ports/clip-tag.repository.js';
import { CLIP_TAG_REPOSITORY } from '../ports/clip-tag-repository.token.js';

@Injectable()
export class GetClipTagsUseCase {
constructor(
@Inject(CLIP_REPOSITORY)
private readonly clipRepository: ClipRepository,
@Inject(CLIP_TAG_REPOSITORY)
private readonly clipTagRepository: ClipTagRepository,
) {}

async execute(clipId: string): Promise<Tag[]> {
const clip = await this.clipRepository.findById(clipId);


if (!clip) {
  throw new NotFoundException('Clip not found');
}

return this.clipTagRepository.findTagsByClipId(clipId);

}
}
