import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { TagRepository } from '../ports/tag.repository.js';
import { TAG_REPOSITORY } from '../ports/tag-repository.token.js';

@Injectable()
export class DeleteTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.tagRepository.findById(id);

    if (!existing) {
      throw new NotFoundException('Tag not found');
    }

    await this.tagRepository.delete(id);
  }
}

