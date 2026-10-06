import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { Clip } from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';
import type { StreamRepository } from '../../../streams/application/ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../../../streams/application/ports/stream-repository.token.js';

export interface UpdateClipInput {
  id: string;
  title?: string;
  description?: string | null;
  timestamp?: number;
  duration?: number;
}

@Injectable()
export class UpdateClipUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: UpdateClipInput): Promise<Clip | null> {
    const clip = await this.clipRepository.findById(input.id);

    if (!clip) {
      return null;
    }

    if (input.timestamp !== undefined) {
      const stream = await this.streamRepository.findById(clip.streamId);
      if (!stream) return null;

      const streamEnd = stream.endedAt ?? new Date();
      const maxTimestamp = Math.max(0, Math.floor((streamEnd.getTime() - stream.startedAt.getTime()) / 1000));
      if (input.timestamp > maxTimestamp) {
        throw new BadRequestException('El timestamp no puede superar la duración del stream');
      }
    }

    if (input.title !== undefined) {
      clip.updateTitle(input.title);
    }

    if (input.description !== undefined) {
      clip.updateDescription(input.description);
    }

    if (input.timestamp !== undefined) {
      clip.updateTimestamp(input.timestamp);
    }

    if (input.duration !== undefined) {
      clip.updateDuration(input.duration);
    }

    await this.clipRepository.update(clip);

    return clip;
  }
}
