import { Module } from '@nestjs/common';
import { CodeModule } from './code/code.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, CodeModule],
})
export class AppModule {}
