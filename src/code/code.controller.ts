import { Body, Controller, Get, Post } from '@nestjs/common';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { CodeService } from './code.service';

@Controller('codes')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get('generate')
  generateCode() {
    return this.codeService.generateCode();
  }

  @Post('submit')
  submitCode(@Body() submitCodeDto: SubmitCodeDto) {
    return this.codeService.submitCode(submitCodeDto.code);
  }
}
