import { InvalidClipStatusTransitionError } from '../errors/invalid-clip-status-transition.error.js';

export enum ClipStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  SELECTED = 'SELECTED',
  EDITED = 'EDITED',
  PUBLISHED = 'PUBLISHED',
  DISCARDED = 'DISCARDED',
}

export interface CreateClipProps {
  streamId: string;
  title: string;
  description?: string | null;
  timestamp: number;
  duration: number;
}

export interface ClipProps {
  id: string;
  streamId: string;
  title: string;
  description: string | null;
  timestamp: number;
  duration: number;
  status: ClipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class Clip {
  private constructor(private readonly props: ClipProps) {}

  static create(props: CreateClipProps): Clip {
    const streamId = props.streamId.trim();
    const title = props.title.trim();
    const description = props.description?.trim() || null;

    if (!streamId) {
      throw new Error('Clip stream ID is required');
    }

    if (!title) {
      throw new Error('Clip title is required');
    }

    if (!Number.isInteger(props.timestamp) || props.timestamp < 0) {
      throw new Error('Clip timestamp must be a non-negative integer');
    }

    if (!Number.isInteger(props.duration) || props.duration <= 0) {
      throw new Error('Clip duration must be a positive integer');
    }

    const now = new Date();

    return new Clip({
      id: crypto.randomUUID(),
      streamId,
      title,
      description,
      timestamp: props.timestamp,
      duration: props.duration,
      status: ClipStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(props: ClipProps): Clip {
    return new Clip({
      id: props.id,
      streamId: props.streamId,
      title: props.title,
      description: props.description,
      timestamp: props.timestamp,
      duration: props.duration,
      status: props.status,
      createdAt: new Date(props.createdAt),
      updatedAt: new Date(props.updatedAt),
    });
  }

  moveTo(status: ClipStatus): void {
    if (status === this.props.status) {
      return;
    }

    const allowedTransitions: Record<ClipStatus, ClipStatus[]> = {
      [ClipStatus.PENDING]: [ClipStatus.IN_REVIEW],
      [ClipStatus.IN_REVIEW]: [
        ClipStatus.SELECTED,
        ClipStatus.DISCARDED,
      ],
      [ClipStatus.SELECTED]: [
        ClipStatus.EDITED,
        ClipStatus.DISCARDED,
      ],
      [ClipStatus.EDITED]: [
        ClipStatus.PUBLISHED,
        ClipStatus.DISCARDED,
      ],
      [ClipStatus.PUBLISHED]: [],
      [ClipStatus.DISCARDED]: [],
    };

    if (!allowedTransitions[this.props.status].includes(status)) {
      throw new InvalidClipStatusTransitionError(
        this.props.status,
        status,
      );
    }

    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id;
  }

  get streamId(): string {
    return this.props.streamId;
  }

  get title(): string {
    return this.props.title;
  }

  get description(): string | null {
    return this.props.description;
  }

  get timestamp(): number {
    return this.props.timestamp;
  }

  get duration(): number {
    return this.props.duration;
  }

  get status(): ClipStatus {
    return this.props.status;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get updatedAt(): Date {
    return new Date(this.props.updatedAt);
  }
}

