import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service.js';
import type { AuthUser } from '../domain/auth.types.js';
import { PasswordService } from '../infrastructure/password.service.js';
import { TokenService } from '../infrastructure/token.service.js';

export class InvalidPasswordError extends Error {
  constructor(
    public readonly errors: string[],
  ) {
    super('Invalid password format');
    this.name = 'InvalidPasswordError';
  }
}

export class PasswordRequirements {
  static readonly minLength = 8;
  static readonly hasUpperCase = /(?=.*[A-Z])/;
  static readonly hasLowerCase = /(?=.*[a-z])/;
  static readonly hasNumber = /(?=.*\d)/;
  static readonly hasSpecialChar = /(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~])/;

  static validate(password: string): string[] {
    const errors: string[] = [];

    if (password.length < this.minLength) {
      errors.push(`La contraseña debe tener al menos ${this.minLength} caracteres.`);
    }
    if (!this.hasUpperCase.test(password)) {
      errors.push('La contraseña debe contener al menos una letra mayúscula.');
    }
    if (!this.hasLowerCase.test(password)) {
      errors.push('La contraseña debe contener al menos una letra minúscula.');
    }
    if (!this.hasNumber.test(password)) {
      errors.push('La contraseña debe contener al menos un número.');
    }
    if (!this.hasSpecialChar.test(password)) {
      errors.push('La contraseña debe contener al menos un carácter especial.');
    }

    return errors;
  }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly tokens: TokenService,
  ) {}

  async login(email: string, password: string): Promise<{ user: AuthUser; token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });

    if (!user || user.status !== 'ACTIVE' || !(await this.passwords.verify(password, user.passwordHash))) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    return { user: authUser, token: this.tokens.sign(authUser, user.tokenVersion) };
  }

  async getUserFromToken(token: string): Promise<AuthUser | null> {
    const payload = this.tokens.verify(token);

    if (!payload) {
      return null;
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });

    if (!user || user.status !== 'ACTIVE' || user.tokenVersion !== payload.tokenVersion) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  async logout(token: string): Promise<void> {
    const payload = this.tokens.verify(token);
    if (!payload) return;

    const user = await this.prisma.user.findUnique({ where: { id: payload.id } });
    if (!user || user.tokenVersion !== payload.tokenVersion) return;

    await this.prisma.user.update({
      where: { id: user.id },
      data: { tokenVersion: { increment: 1 } },
    });
  }

}
