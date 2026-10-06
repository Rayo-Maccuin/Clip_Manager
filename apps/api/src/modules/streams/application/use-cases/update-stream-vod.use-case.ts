import { Inject, Injectable } from '@nestjs/common';
import type { Stream } from '../../domain/entities/stream.entity.js';
import type { StreamRepository } from '../ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../ports/stream-repository.token.js';

@Injectable()
export class UpdateStreamVodUseCase {
  constructor(
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: { id: string; vodUrl: string }): Promise<Stream | null> {
    const stream = await this.streamRepository.findById(input.id);
    if (!stream) return null;

    stream.updateVodUrl(input.vodUrl);
    await this.streamRepository.update(stream);
    return stream;
  }
}