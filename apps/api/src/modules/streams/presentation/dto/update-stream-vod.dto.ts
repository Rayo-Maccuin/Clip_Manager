import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class UpdateStreamVodDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  vodUrl!: string;
}