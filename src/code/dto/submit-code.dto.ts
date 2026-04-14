import { IsString, Matches } from 'class-validator';

export class SubmitCodeDto {
  @IsString()
  @Matches(/^\d{4}$/)
  code!: string;
}
