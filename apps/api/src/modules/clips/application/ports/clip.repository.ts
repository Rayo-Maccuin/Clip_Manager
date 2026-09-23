import type { Clip } from '../../domain/entities/clip.entity.js';

export interface ClipRepository {
  create(clip: Clip): Promise<void>;
  update(clip: Clip): Promise<void>;
  findAllByStreamId(streamId: string): Promise<Clip[]>;
  findById(id: string): Promise<Clip | null>;
}

