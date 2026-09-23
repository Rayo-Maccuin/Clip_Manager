import {
  ConflictException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Tag } from '../../domain/entities/tag.entity.js';
import type { TagRepository } from '../ports/tag.repository.js';
import { TAG_REPOSITORY } from '../ports/tag-repository.token.js';

export interface CreateTagInput {
  name: string;
}

@Injectable()
export class CreateTagUseCase {
  constructor(
    @Inject(TAG_REPOSITORY)
    private readonly tagRepository: TagRepository,
  ) {}

  async execute(input: CreateTagInput): Promise<Tag> {
    const name = input.name.trim();

    const existingTag = await this.tagRepository.findByName(name);

    if (existingTag) {
      throw new ConflictException('Tag already exists');
    }

    const tag = Tag.create({ name });

    await this.tagRepository.create(tag);

    return tag;
  }
}

