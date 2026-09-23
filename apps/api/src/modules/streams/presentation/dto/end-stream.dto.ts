import { IsDateString } from 'class-validator';

export class EndStreamDto {
  @IsDateString()
  endedAt!: string;
}
