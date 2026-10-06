import { createHmac, timingSafeEqual } from 'node:crypto';
import type { AuthTokenPayload, AuthUser } from '../domain/auth.types.js';

export class TokenService {
  private readonly secret: string;

  constructor() {
    const secret = process.env.AUTH_SECRET;

    if (!secret || secret.length < 32) {
      throw new Error('AUTH_SECRET must be configured with at least 32 characters');
    }

    this.secret = secret;
  }

  sign(user: AuthUser, tokenVersion: number): string {
    const header = this.encode({ alg: 'HS256', typ: 'JWT' });
    const payload = this.encode({
      ...user,
      tokenVersion,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
    });
    const content = `${header}.${payload}`;
    const signature = createHmac('sha256', this.secret).update(content).digest('base64url');

    return `${content}.${signature}`;
  }

  verify(token: string): AuthTokenPayload | null {
    const [header, payload, signature] = token.split('.');

    if (!header || !payload || !signature) {
      return null;
    }

    const content = `${header}.${payload}`;
    const expected = createHmac('sha256', this.secret).update(content).digest();
    const actual = Buffer.from(signature, 'base64url');

    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
      return null;
    }

    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthTokenPayload;

      if (
        !decoded.id ||
        !decoded.email ||
        !decoded.name ||
        !decoded.role ||
        !Number.isInteger(decoded.tokenVersion) ||
        decoded.tokenVersion < 0 ||
        decoded.exp <= Math.floor(Date.now() / 1000)
      ) {
        return null;
      }

      return decoded;
    } catch {
      return null;
    }
  }

  private encode(value: object): string {
    return Buffer.from(JSON.stringify(value)).toString('base64url');
  }
}
