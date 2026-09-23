import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { ClipTagRepository } from '../ports/clip-tag.repository.js';
import { CLIP_TAG_REPOSITORY } from '../ports/clip-tag-repository.token.js';

export interface RemoveTagFromClipInput {
  clipId: string;
  tagId: string;
}

@Injectable()
export class RemoveTagFromClipUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
    @Inject(CLIP_TAG_REPOSITORY)
    private readonly clipTagRepository: ClipTagRepository,
  ) {}

  async execute(input: RemoveTagFromClipInput): Promise<void> {
    const clip = await this.clipRepository.findById(input.clipId);

    if (!clip) {
      throw new NotFoundException('Clip not found');
    }

    const existingTagIds =
      await this.clipTagRepository.findTagIdsByClipId(input.clipId);

    if (!existingTagIds.includes(input.tagId)) {
      throw new NotFoundException('Tag is not assigned to this clip');
    }

    await this.clipTagRepository.removeTag(
      input.clipId,
      input.tagId,
    );
  }
}

