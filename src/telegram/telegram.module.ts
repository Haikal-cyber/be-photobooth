import { Module } from '@nestjs/common';
import { CodeModule } from '../code/code.module';
import { TelegramService } from './telegram.service';

@Module({
  imports: [CodeModule],
  providers: [TelegramService],
})
export class TelegramModule {}
