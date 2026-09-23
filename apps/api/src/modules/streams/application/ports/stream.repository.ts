import type { Stream } from '../../domain/entities/stream.entity.js';

export interface StreamRepository {
  create(stream: Stream): Promise<void>;
  update(stream: Stream): Promise<void>;
  findAll(): Promise<Stream[]>;
  findById(id: string): Promise<Stream | null>;
}
