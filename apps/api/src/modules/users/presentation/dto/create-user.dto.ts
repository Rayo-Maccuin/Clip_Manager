import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserStatus } from '../../domain/entities/user.entity.js';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(['ADMIN', 'MODERATOR'])
  role!: 'ADMIN' | 'MODERATOR';

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
