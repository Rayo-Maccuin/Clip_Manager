import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Clip, ClipStatus } from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import type { StreamRepository } from '../../../streams/application/ports/stream.repository.js';
import { UpdateClipUseCase } from './update-clip.use-case.js';

describe('UpdateClipUseCase', () => {
  const clipRepository = { findById: vi.fn(), update: vi.fn() };
  const streamRepository = { findById: vi.fn() };
  let useCase: UpdateClipUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateClipUseCase(
      clipRepository as unknown as ClipRepository,
      streamRepository as unknown as StreamRepository,
    );
    clipRepository.findById.mockResolvedValue(Clip.rehydrate({
      id: 'clip-id',
      streamId: 'stream-id',
      title: 'Moment',
      description: null,
      timestamp: 1,
      duration: 30,
      status: ClipStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    streamRepository.findById.mockResolvedValue({
      id: 'stream-id',
      startedAt: new Date(Date.now() - 5_000),
      endedAt: null,
    });
  });

  it('rejects an edited timestamp beyond the elapsed duration of its stream', async () => {
    await expect(useCase.execute({ id: 'clip-id', timestamp: 60 })).rejects.toThrow(BadRequestException);
    expect(clipRepository.update).not.toHaveBeenCalled();
  });
});