export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface CreateUserProps {
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'MODERATOR';
  status?: UserStatus;
}

export interface UserProps {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'ADMIN' | 'MODERATOR';
  createdAt: Date;
  status: UserStatus;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: CreateUserProps): User {
    const name = props.name.trim();
    const email = props.email.trim().toLowerCase();

    if (!name) {
      throw new Error('User name is required');
    }

    if (!email) {
      throw new Error('User email is required');
    }

    const now = new Date();

    return new User({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: now,
      status: props.status ?? UserStatus.ACTIVE,
    });
  }

  static rehydrate(props: UserProps): User {
    return new User({
      id: props.id,
      name: props.name,
      email: props.email,
      passwordHash: props.passwordHash,
      role: props.role,
      createdAt: new Date(props.createdAt),
      status: props.status,
    });
  }

  deactivate(): void {
    this.props.status = UserStatus.INACTIVE;
  }

  updateProfile(input: {
    name?: string;
    email?: string;
    role?: 'ADMIN' | 'MODERATOR';
  }): void {
    const name = input.name?.trim() ?? this.props.name;
    const email = input.email?.trim().toLowerCase() ?? this.props.email;

    if (!name) {
      throw new Error('User name is required');
    }

    if (!email) {
      throw new Error('User email is required');
    }

    this.props.name = name;
    this.props.email = email;
    this.props.role = input.role ?? this.props.role;
  }

  updatePasswordHash(passwordHash: string): void {
    if (!passwordHash) {
      throw new Error('User password hash is required');
    }

    this.props.passwordHash = passwordHash;
  }

  setStatus(status: UserStatus): void {
    this.props.status = status;
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get passwordHash(): string {
    return this.props.passwordHash;
  }

  get role(): 'ADMIN' | 'MODERATOR' {
    return this.props.role;
  }

  get createdAt(): Date {
    return new Date(this.props.createdAt);
  }

  get status(): UserStatus {
    return this.props.status;
  }
}
