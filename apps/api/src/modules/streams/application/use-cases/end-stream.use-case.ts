import { Inject, Injectable } from '@nestjs/common';
import type { Stream } from '../../domain/entities/stream.entity.js';
import type { StreamRepository } from '../ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../ports/stream-repository.token.js';

export interface EndStreamInput {
  id: string;
  endedAt: Date;
}

@Injectable()
export class EndStreamUseCase {
  constructor(
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: EndStreamInput): Promise<Stream | null> {
    const stream = await this.streamRepository.findById(input.id);

    if (!stream) {
      return null;
    }

    stream.end(input.endedAt);

    await this.streamRepository.update(stream);

    return stream;
  }
}
