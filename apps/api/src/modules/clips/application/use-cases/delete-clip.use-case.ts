import { Inject, Injectable } from '@nestjs/common';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';

export interface DeleteClipInput {
  id: string;
}

@Injectable()
export class DeleteClipUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
  ) {}

  async execute(input: DeleteClipInput): Promise<boolean> {
    const clip = await this.clipRepository.findById(input.id);

    if (!clip) {
      return false;
    }

    await this.clipRepository.delete(input.id);
    return true;
  }
}
