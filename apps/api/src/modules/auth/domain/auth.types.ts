import type { UserRole } from '../../../generated/prisma/enums.js';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type AuthTokenPayload = AuthUser & {
  exp: number;
  tokenVersion: number;
};
