import { Module } from '@nestjs/common';
import { CodeModule } from './code/code.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [PrismaModule, CodeModule, TelegramModule],
})
export class AppModule {}
