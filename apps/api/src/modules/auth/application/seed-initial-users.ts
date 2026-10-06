import type { PrismaClient } from '../../../generated/prisma/client.js';
import { PasswordRequirements } from './auth.service.js';
import { PasswordService } from '../infrastructure/password.service.js';

type UserSeedPrisma = Pick<PrismaClient, 'user'>;

export async function seedInitialUsers(
  prisma: UserSeedPrisma,
  passwords: PasswordService,
): Promise<void> {
  const adminEmail = 'angelmp2097@gmail.com';
  const configuredAdminEmail = (process.env.INITIAL_USER_EMAIL ?? adminEmail).trim().toLowerCase();
  const resetExistingPasswords = process.env.RESET_INITIAL_USER_PASSWORDS === 'true';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } }) ??
    (configuredAdminEmail === adminEmail
      ? null
      : await prisma.user.findUnique({ where: { email: configuredAdminEmail } }));
  const adminPassword = process.env.INITIAL_USER_PASSWORD ?? process.env.ADMIN_PASSWORD;
  let adminPasswordHash: string | undefined;

  if (!existingAdmin || resetExistingPasswords) {
    if (!adminPassword) {
      throw new Error('INITIAL_USER_PASSWORD must be configured to create or reset the administrator');
    }

    const adminPasswordErrors = PasswordRequirements.validate(adminPassword);
    if (adminPasswordErrors.length > 0) {
      throw new Error(adminPasswordErrors.join(' '));
    }

    adminPasswordHash = await passwords.hash(adminPassword);
  }

  const adminName = (process.env.INITIAL_USER_NAME ?? existingAdmin?.name ?? 'Admin').trim();
  const adminData: {
    email: string;
    name: string;
    passwordHash?: string;
    role: 'ADMIN';
    status: 'ACTIVE';
    tokenVersion?: { increment: number };
  } = {
    email: adminEmail,
    name: adminName,
    role: 'ADMIN',
    status: 'ACTIVE',
  };

  if (existingAdmin) {
    const identityChanged =
      existingAdmin.email !== adminEmail ||
      existingAdmin.role !== 'ADMIN' ||
      existingAdmin.status !== 'ACTIVE';

    if (adminPasswordHash) adminData.passwordHash = adminPasswordHash;
    if (identityChanged || resetExistingPasswords) {
      adminData.tokenVersion = { increment: 1 };
    }

    if (identityChanged || resetExistingPasswords || existingAdmin.name !== adminName) {
      await prisma.user.update({ where: { id: existingAdmin.id }, data: adminData });
    }
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: adminName,
        passwordHash: adminPasswordHash!,
        role: 'ADMIN',
        status: 'ACTIVE',
      },
    });
  }

  const moderatorEmail = process.env.INITIAL_MOD_EMAIL?.trim().toLowerCase();
  const moderatorPassword = process.env.INITIAL_MOD_PASSWORD;

  if (Boolean(moderatorEmail) !== Boolean(moderatorPassword)) {
    throw new Error('INITIAL_MOD_EMAIL and INITIAL_MOD_PASSWORD must be configured together');
  }

  if (moderatorEmail && moderatorPassword) {
    const existingModerator = await prisma.user.findUnique({ where: { email: moderatorEmail } });
    let moderatorPasswordHash: string | undefined;

    if (!existingModerator || resetExistingPasswords) {
      const moderatorPasswordErrors = PasswordRequirements.validate(moderatorPassword);
      if (moderatorPasswordErrors.length > 0) {
        throw new Error(moderatorPasswordErrors.join(' '));
      }
      moderatorPasswordHash = await passwords.hash(moderatorPassword);
    }

    if (!existingModerator) {
      await prisma.user.create({
        data: {
          email: moderatorEmail,
          name: (process.env.INITIAL_MOD_NAME ?? 'Moderador').trim(),
          passwordHash: moderatorPasswordHash!,
          role: 'MODERATOR',
          status: 'ACTIVE',
        },
      });
    } else {
      const moderatorName = (process.env.INITIAL_MOD_NAME ?? existingModerator.name).trim();
      const identityChanged = existingModerator.role !== 'MODERATOR' || existingModerator.status !== 'ACTIVE';
      const moderatorData: {
        name?: string;
        role?: 'MODERATOR';
        status?: 'ACTIVE';
        passwordHash?: string;
        tokenVersion?: { increment: number };
      } = {};

      if (moderatorName !== existingModerator.name) moderatorData.name = moderatorName;
      if (identityChanged) {
        moderatorData.role = 'MODERATOR';
        moderatorData.status = 'ACTIVE';
      }
      if (moderatorPasswordHash) moderatorData.passwordHash = moderatorPasswordHash;
      if (identityChanged || resetExistingPasswords) moderatorData.tokenVersion = { increment: 1 };

      if (Object.keys(moderatorData).length > 0) {
        await prisma.user.update({ where: { id: existingModerator.id }, data: moderatorData });
      }
    }
  }
}