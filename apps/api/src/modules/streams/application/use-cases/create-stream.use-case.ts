import { Inject, Injectable } from '@nestjs/common';
import { Stream } from '../../domain/entities/stream.entity.js';
import type { CreateStreamProps } from '../../domain/entities/stream.entity.js';
import type { StreamRepository } from '../ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../ports/stream-repository.token.js';

@Injectable()
export class CreateStreamUseCase {
  constructor(
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: CreateStreamProps): Promise<Stream> {
    const stream = Stream.create(input);

    await this.streamRepository.create(stream);

    return stream;
  }
}
