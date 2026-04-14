import { Module } from '@nestjs/common';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';

@Module({
  controllers: [CodeController],
  providers: [CodeService],
  exports: [CodeService],
})
export class CodeModule {}
