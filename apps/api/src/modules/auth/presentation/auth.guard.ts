import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { AuthService } from '../application/auth.service.js';
import type { AuthUser } from '../domain/auth.types.js';
import { IS_PUBLIC_KEY } from './public.decorator.js';

export const AUTH_USER = 'authUser';

type AuthenticatedRequest = Request & {
  authUser?: AuthUser | null;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const cookieToken = request.headers.cookie
      ?.split(';')
      .map((part) => part.trim())
      .find((part) => part.startsWith('cm_access_token='))
      ?.slice('cm_access_token='.length);
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : cookieToken;
    const user = token ? await this.authService.getUserFromToken(token) : null;

    if (!user) {
      throw new UnauthorizedException('Autenticación requerida');
    }

    request.authUser = user;
    return true;
  }
}
