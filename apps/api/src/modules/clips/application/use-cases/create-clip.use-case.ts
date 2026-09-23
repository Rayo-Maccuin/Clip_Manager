import { Inject, Injectable } from '@nestjs/common';
import { Clip } from '../../domain/entities/clip.entity.js';
import type { CreateClipProps } from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { StreamRepository } from '../../../streams/application/ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../../../streams/application/ports/stream-repository.token.js';

@Injectable()
export class CreateClipUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: CreateClipProps): Promise<Clip | null> {
    const stream = await this.streamRepository.findById(input.streamId);

    if (!stream) {
      return null;
    }

    const clip = Clip.create(input);

    await this.clipRepository.create(clip);

    return clip;
  }
}

