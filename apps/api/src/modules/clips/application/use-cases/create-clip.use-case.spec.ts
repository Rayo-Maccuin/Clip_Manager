import { BadRequestException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Stream } from '../../../streams/domain/entities/stream.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import type { StreamRepository } from '../../../streams/application/ports/stream.repository.js';
import { CreateClipUseCase } from './create-clip.use-case.js';

describe('CreateClipUseCase', () => {
  const clipRepository = { create: vi.fn() };
  const streamRepository = { findById: vi.fn() };
  let useCase: CreateClipUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateClipUseCase(
      clipRepository as unknown as ClipRepository,
      streamRepository as unknown as StreamRepository,
    );
  });

  it('rejects timestamps beyond the elapsed duration of an active stream', async () => {
    streamRepository.findById.mockResolvedValue({
      id: 'stream-id',
      startedAt: new Date(Date.now() - 5_000),
      endedAt: null,
    } as Stream);

    await expect(useCase.execute({
      streamId: 'stream-id',
      title: 'Moment',
      timestamp: 60,
      duration: 30,
    })).rejects.toThrow(BadRequestException);
    expect(clipRepository.create).not.toHaveBeenCalled();
  });
});