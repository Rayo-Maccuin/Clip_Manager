import { IsEnum } from 'class-validator';
import { ClipStatus } from '../../domain/entities/clip.entity.js';

export class UpdateClipStatusDto {
  @IsEnum(ClipStatus)
  status!: ClipStatus;
}

