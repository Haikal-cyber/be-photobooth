import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CodeModule } from './code/code.module';
import { PrismaModule } from './prisma/prisma.module';
import { TelegramModule } from './telegram/telegram.module';

@Module({
  imports: [PrismaModule, AuthModule, CodeModule, TelegramModule],
})
export class AppModule {}
