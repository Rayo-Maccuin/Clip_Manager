import { Inject, Injectable } from '@nestjs/common';
import type { Clip } from '../../domain/entities/clip.entity.js';
import type { ClipRepository } from '../ports/clip.repository.js';
import { CLIP_REPOSITORY } from '../ports/clip-repository.token.js';

@Injectable()
export class ListClipsUseCase {
  constructor(
    @Inject(CLIP_REPOSITORY)
    private readonly clipRepository: ClipRepository,
  ) {}

  async execute(): Promise<Clip[]> {
    return this.clipRepository.findAll();
  }
}
