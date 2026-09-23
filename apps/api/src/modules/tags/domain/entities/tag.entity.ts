export interface CreateTagProps {
  name: string;
}

export interface TagProps {
  id: string;
  name: string;
  createdAt: Date;
}

export class Tag {
  private constructor(private readonly props: TagProps) {}

  static create(props: CreateTagProps): Tag {
    const name = props.name.trim();

    if (!name) {
      throw new Error('Tag name is required');
    }

    return new Tag({
      id: crypto.randomUUID(),
      name,
      createdAt: new Date(),
    });
  }

  static rehydrate(props: TagProps): Tag {
    return new Tag({
      id: props.id,
      name: props.name,
      createdAt: new Date(props.createdAt),
    });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }
}

