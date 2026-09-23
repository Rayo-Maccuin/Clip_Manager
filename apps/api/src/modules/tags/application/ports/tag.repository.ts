import type { Tag } from '../../domain/entities/tag.entity.js';

export interface TagRepository {
  create(tag: Tag): Promise<void>;
  findAll(): Promise<Tag[]>;
  findById(id: string): Promise<Tag | null>;
  findByName(name: string): Promise<Tag | null>;
}
