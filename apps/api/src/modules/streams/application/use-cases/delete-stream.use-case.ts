import { Inject, Injectable } from '@nestjs/common';
import type { StreamRepository } from '../ports/stream.repository.js';
import { STREAM_REPOSITORY } from '../ports/stream-repository.token.js';

export interface DeleteStreamInput {
  id: string;
}

@Injectable()
export class DeleteStreamUseCase {
  constructor(
    @Inject(STREAM_REPOSITORY)
    private readonly streamRepository: StreamRepository,
  ) {}

  async execute(input: DeleteStreamInput): Promise<boolean> {
    const stream = await this.streamRepository.findById(input.id);

    if (!stream) {
      return false;
    }

    await this.streamRepository.delete(input.id);
    return true;
  }
}
