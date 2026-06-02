import { Module } from '@nestjs/common';
import { QrisController } from './qris.controller';
import { QrisService } from './qris.service';

@Module({
  controllers: [QrisController],
  providers: [QrisService],
})
export class QrisModule {}

