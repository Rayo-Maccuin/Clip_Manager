export interface CreateStreamProps {
  title: string;
  vodUrl: string;
  startedAt: Date;
}

export interface StreamProps {
  id: string;
  title: string;
  vodUrl: string;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
}

export class Stream {
  private constructor(private readonly props: StreamProps) {}

  static create(props: CreateStreamProps): Stream {
    const title = props.title.trim();
    const vodUrl = props.vodUrl.trim();

    if (!title) {
      throw new Error('Stream title is required');
    }

    if (!vodUrl) {
      throw new Error('Stream VOD URL is required');
    }

    if (Number.isNaN(props.startedAt.getTime())) {
      throw new Error('Stream start date is invalid');
    }

    return new Stream({
      id: crypto.randomUUID(),
      title,
      vodUrl,
      startedAt: new Date(props.startedAt),
      endedAt: null,
      createdAt: new Date(),
    });
  }

  static rehydrate(props: StreamProps): Stream {
    return new Stream({
      id: props.id,
      title: props.title,
      vodUrl: props.vodUrl,
      startedAt: new Date(props.startedAt),
      endedAt: props.endedAt ? new Date(props.endedAt) : null,
      createdAt: new Date(props.createdAt),
    });
  }

  end(endedAt: Date): void {
    if (Number.isNaN(endedAt.getTime())) {
      throw new Error('Stream end date is invalid');
    }

    if (endedAt <= this.props.startedAt) {
      throw new Error('Stream end date must be after start date');
    }

    this.props.endedAt = new Date(endedAt);
  }

  get id(): string {
    return this.props.id;
  }

  get title(): string {
    return this.props.title;
  }

  get vodUrl(): string {
    return this.props.vodUrl;
  }

  get startedAt(): Date {
    return new Date(this.props.startedAt);
  }

  get endedAt(): Date | null {
    return this.props.endedAt
      ? new Date(this.props.endedAt)
      : null;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }
}
