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

  updateTitle(title: string): void {
    const trimmed = title.trim();

    if (!trimmed) {
      throw new Error('Clip title is required');
    }

    this.props.title = trimmed;
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this.props.description = description?.trim() || null;
    this.props.updatedAt = new Date();
  }

  updateTimestamp(timestamp: number): void {
    if (!Number.isInteger(timestamp) || timestamp < 0) {
      throw new Error('Clip timestamp must be a non-negative integer');
    }

    this.props.timestamp = timestamp;
    this.props.updatedAt = new Date();
  }

  updateDuration(duration: number): void {
    if (!Number.isInteger(duration) || duration <= 0) {
      throw new Error('Clip duration must be a positive integer');
    }

    this.props.duration = duration;
    this.props.updatedAt = new Date();
  }
}

