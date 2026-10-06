import { UnauthorizedException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../../../infrastructure/persistence/prisma/prisma.service.js';
import { AuthService } from './auth.service.js';
import { PasswordService } from '../infrastructure/password.service.js';
import { TokenService } from '../infrastructure/token.service.js';

describe('AuthService', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  };
  const passwords = {
    verify: vi.fn(),
  };
  const tokens = {
    sign: vi.fn(),
    verify: vi.fn(),
  };
  let authService: AuthService;

  beforeEach(() => {
    vi.clearAllMocks();
    authService = new AuthService(
      prisma as unknown as PrismaService,
      passwords as unknown as PasswordService,
      tokens as unknown as TokenService,
    );
  });

  it('rejects login for an inactive account', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Moderator',
      email: 'moderator@example.com',
      passwordHash: 'hash',
      role: 'MODERATOR',
      status: 'INACTIVE',
    });

    await expect(authService.login('moderator@example.com', 'ValidPass1!')).rejects.toThrow(
      UnauthorizedException,
    );
    expect(passwords.verify).not.toHaveBeenCalled();
    expect(tokens.sign).not.toHaveBeenCalled();
  });

  it('rejects a valid token after its account is deactivated', async () => {
    tokens.verify.mockReturnValue({
      id: 'user-id',
      name: 'Moderator',
      email: 'moderator@example.com',
      role: 'MODERATOR',
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenVersion: 0,
    });
    prisma.user.findUnique.mockResolvedValue({ status: 'INACTIVE', tokenVersion: 0 });

    await expect(authService.getUserFromToken('signed-token')).resolves.toBeNull();
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-id' } });
  });

  it('rejects a token invalidated by logout', async () => {
    tokens.verify.mockReturnValue({
      id: 'user-id',
      name: 'Moderator',
      email: 'moderator@example.com',
      role: 'MODERATOR',
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenVersion: 0,
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-id', status: 'ACTIVE', tokenVersion: 1 });

    await expect(authService.getUserFromToken('signed-token')).resolves.toBeNull();
  });

  it('increments the persisted token version on logout', async () => {
    tokens.verify.mockReturnValue({
      id: 'user-id',
      name: 'Moderator',
      email: 'moderator@example.com',
      role: 'MODERATOR',
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenVersion: 2,
    });
    prisma.user.findUnique.mockResolvedValue({ id: 'user-id', tokenVersion: 2 });

    await authService.logout('signed-token');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-id' },
      data: { tokenVersion: { increment: 1 } },
    });
  });

  it('uses the current role stored in the database for a valid token', async () => {
    tokens.verify.mockReturnValue({
      id: 'user-id',
      name: 'Moderator',
      email: 'moderator@example.com',
      role: 'MODERATOR',
      exp: Math.floor(Date.now() / 1000) + 60,
      tokenVersion: 0,
    });
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-id',
      name: 'Administrator',
      email: 'admin@example.com',
      role: 'ADMIN',
      status: 'ACTIVE',
      tokenVersion: 0,
    });

    await expect(authService.getUserFromToken('signed-token')).resolves.toEqual({
      id: 'user-id',
      name: 'Administrator',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
  });
});