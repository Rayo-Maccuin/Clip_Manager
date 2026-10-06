import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PasswordService } from '../../auth/infrastructure/password.service.js';
import { PasswordRequirements } from '../../auth/application/auth.service.js';
import { User, UserStatus } from '../domain/entities/user.entity.js';
import type { UserRepository } from './ports/user.repository.js';
import { USER_REPOSITORY } from './ports/user-repository.token.js';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'MODERATOR';
  status?: UserStatus;
}

export interface DeactivateUserInput {
  id: string;
}

export interface UpdateUserInput {
  id: string;
  name?: string;
  email?: string;
  role?: 'ADMIN' | 'MODERATOR';
  status?: UserStatus;
  password?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly passwords: PasswordService,
  ) {}

  async list(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async create(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepository.findByEmail(input.email);

    if (existing) {
      throw new ConflictException('El email ya está en uso');
    }

    const passwordErrors = PasswordRequirements.validate(input.password);
    if (passwordErrors.length > 0) {
      throw new BadRequestException(passwordErrors.join(' '));
    }

    const user = User.create({
      name: input.name,
      email: input.email,
      passwordHash: await this.passwords.hash(input.password),
      role: input.role,
      status: input.status,
    });

    await this.userRepository.create(user);

    return user;
  }

  async update(input: UpdateUserInput): Promise<User> {
    const user = await this.userRepository.findById(input.id);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const email = input.email?.trim().toLowerCase();
    if (email) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing && existing.id !== user.id) {
        throw new ConflictException('El email ya está en uso');
      }
    }

    if (input.password !== undefined) {
      const passwordErrors = PasswordRequirements.validate(input.password);
      if (passwordErrors.length > 0) {
        throw new BadRequestException(passwordErrors.join(' '));
      }
      user.updatePasswordHash(await this.passwords.hash(input.password));
    }

    try {
      user.updateProfile({ ...input, email });
      if (input.status) {
        user.setStatus(input.status);
      }
    } catch (error) {
      throw new BadRequestException(error instanceof Error ? error.message : 'Datos de usuario inválidos');
    }

    await this.userRepository.update(user);
    return user;
  }

  async deactivate(input: DeactivateUserInput): Promise<boolean> {
    const existing = await this.userRepository.findById(input.id);

    if (!existing) {
      return false;
    }

    await this.userRepository.deactivate(input.id);
    return true;
  }
}
