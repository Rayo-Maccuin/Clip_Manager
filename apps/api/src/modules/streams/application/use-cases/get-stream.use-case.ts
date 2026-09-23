import { Inject, Injectable } from '@nestjs/common';
import type { Stream } from '../../domain/entities/stream.entity.js';
import type { StreamRepository } from '../ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../ports/stream-repository.token.js';

@Injectable()
export class GetStreamUseCase {
  constructor(
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(id: string): Promise<Stream | null> {
    return this.streamRepository.findById(id);
  }
}
