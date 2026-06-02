import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class QrisNotificationDto {
  @IsString()
  @MaxLength(200)
  packageName!: string;

  @IsString()
  @MaxLength(500)
  title!: string;

  @IsString()
  @MaxLength(5000)
  message!: string;

  @IsInt()
  @Min(1)
  amount!: number;

  @IsInt()
  @Min(1)
  receivedAt!: number; // ms timestamp
}

