import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { ClipTagRepository } from '../ports/clip-tag.repository.js';
import { CLIP_TAG_REPOSITORY } from '../ports/clip-tag-repository.token.js';
import type { TagRepository } from '../../../tags/application/ports/tag.repository.js';
import { TAG_REPOSITORY } from '../../../tags/application/ports/tag-repository.token.js';

export interface AddTagToClipInput {
  clipId: string;
  tagId: string;
}

@Injectable()
export class AddTagToClipUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
    @Inject(CLIP_TAG_REPOSITORY)
    private readonly clipTagRepository: ClipTagRepository,
  ) {}

  async execute(input: AddTagToClipInput): Promise<void> {
    const clip = await this.clipRepository.findById(input.clipId);

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    const tag = await this.tagRepository.findById(input.tagId);

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    const existingTagIds =
      await this.clipTagRepository.findTagIdsByClipId(input.clipId);

    if (existingTagIds.includes(input.tagId)) {
      throw new ConflictException('Tag is already assigned to this clip');
    }

    await this.clipTagRepository.addTag(
      input.clipId,
      input.tagId,
    );
  }
}

