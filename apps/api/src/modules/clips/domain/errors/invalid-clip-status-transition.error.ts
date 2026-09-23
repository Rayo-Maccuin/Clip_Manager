import { ClipStatus } from '../entities/clip.entity.js';

export class InvalidClipStatusTransitionError extends Error {
  constructor(
    public readonly from: ClipStatus,
    public readonly to: ClipStatus,
  ) {
    super(`Invalid clip status transition: ${from} -> ${to}`);
    this.name = 'InvalidClipStatusTransitionError';
  }
}

