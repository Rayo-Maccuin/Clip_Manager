import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PrismaClient } from '../../../generated/prisma/client.js';
import { PasswordService } from '../infrastructure/password.service.js';
import { seedInitialUsers } from './seed-initial-users.js';

describe('seedInitialUsers', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
  };
  const passwords = { hash: vi.fn() };
  const admin = {
    id: 'admin-id',
    name: 'Admin',
    email: 'angelmp2097@gmail.com',
    role: 'ADMIN',
    status: 'ACTIVE',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('INITIAL_USER_EMAIL', 'angelmp2097@gmail.com');
    vi.stubEnv('INITIAL_USER_NAME', 'Admin');
    vi.stubEnv('INITIAL_USER_PASSWORD', 'NewAdminPass1!');
    vi.stubEnv('INITIAL_MOD_EMAIL', '');
    vi.stubEnv('INITIAL_MOD_PASSWORD', '');
    vi.stubEnv('RESET_INITIAL_USER_PASSWORDS', 'false');
    prisma.user.findUnique.mockResolvedValue(admin);
    passwords.hash.mockResolvedValue('new-password-hash');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('preserves an existing admin password during normal startup', async () => {
    await seedInitialUsers(
      prisma as unknown as Pick<PrismaClient, 'user'>,
      passwords as unknown as PasswordService,
    );

    expect(passwords.hash).not.toHaveBeenCalled();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('resets existing credentials only when explicitly requested and revokes tokens', async () => {
    vi.stubEnv('RESET_INITIAL_USER_PASSWORDS', 'true');

    await seedInitialUsers(
      prisma as unknown as Pick<PrismaClient, 'user'>,
      passwords as unknown as PasswordService,
    );

    expect(passwords.hash).toHaveBeenCalledWith('NewAdminPass1!');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'admin-id' },
      data: {
        email: 'angelmp2097@gmail.com',
        name: 'Admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        passwordHash: 'new-password-hash',
        tokenVersion: { increment: 1 },
      },
    });
  });
});