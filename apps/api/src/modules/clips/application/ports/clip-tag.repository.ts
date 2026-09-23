import type { Tag } from '../../../tags/domain/entities/tag.entity.js';

export interface ClipTagRepository {
addTag(clipId: string, tagId: string): Promise<void>;
removeTag(clipId: string, tagId: string): Promise<void>;
findTagIdsByClipId(clipId: string): Promise<string[]>;
findTagsByClipId(clipId: string): Promise<Tag[]>;
}
