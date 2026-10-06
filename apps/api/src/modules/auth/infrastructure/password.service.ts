import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);
const KEY_LENGTH = 64;

export class PasswordService {
  async hash(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derivedKey = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;

    return `scrypt:${salt}:${derivedKey.toString('hex')}`;
  }

  async verify(password: string, storedHash: string): Promise<boolean> {
    const [, salt, encodedKey] = storedHash.split(':');

    if (!salt || !encodedKey) {
      return false;
    }

    const expectedKey = Buffer.from(encodedKey, 'hex');
    const actualKey = (await scrypt(password, salt, expectedKey.length)) as Buffer;

    return expectedKey.length === actualKey.length && timingSafeEqual(expectedKey, actualKey);
  }
}
