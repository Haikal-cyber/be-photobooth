import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { JwtValidatedUser } from '../auth/jwt-payload.type';
import { SubmitCodeDto } from './dto/submit-code.dto';
import { CodeService } from './code.service';

@Controller('codes')
export class CodeController {
  constructor(private readonly codeService: CodeService) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard)
  generateCode(@CurrentUser() user: JwtValidatedUser) {
    return this.codeService.generateCode(user.userId);
  }

  @Post('submit')
  submitCode(@Body() submitCodeDto: SubmitCodeDto) {
    return this.codeService.submitCode(submitCodeDto.code);
  }
}
