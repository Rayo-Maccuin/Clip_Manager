import { Inject, Injectable } from '@nestjs/common';
import { ClipStatus } from '../../domain/entities/clip.entity.js';
import type { Clip } from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';

export interface UpdateClipStatusInput {
  id: string;
  status: ClipStatus;
}

@Injectable()
export class UpdateClipStatusUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
  ) {}

  async execute(input: UpdateClipStatusInput): Promise<Clip | null> {
    const clip = await this.clipRepository.findById(input.id);

    if (!clip) {
      return null;
    }

    clip.moveTo(input.status);

    await this.clipRepository.update(clip);

    return clip;
  }
}

