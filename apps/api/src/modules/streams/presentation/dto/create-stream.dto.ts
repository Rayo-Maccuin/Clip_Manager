import { IsDateString, IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class CreateStreamDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  vodUrl!: string;

  @IsDateString()
  startedAt!: string;
}
