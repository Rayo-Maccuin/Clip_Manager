import { Inject, Injectable } from '@nestjs/common';
import type { Tag } from '../../domain/entities/tag.entity.js';
import type { TagRepository } from '../ports/tag.repository.js';
import { TAG_REPOSITORY } from '../ports/tag-repository.token.js';

@Injectable()
export class ListTagsUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
  ) {}

  async execute(): Promise<Tag[]> {
    return this.tagRepository.findAll();
  }
}

