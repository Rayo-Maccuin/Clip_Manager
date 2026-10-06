import { IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { UserStatus } from '../../domain/entities/user.entity.js';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['ADMIN', 'MODERATOR'])
  role?: 'ADMIN' | 'MODERATOR';

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: UserStatus;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;
}