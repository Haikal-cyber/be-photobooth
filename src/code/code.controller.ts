import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
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

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByUserId(
    @Param('userId') userId: string,
    @CurrentUser() user: JwtValidatedUser,
  ) {
    if (user.userId !== userId) {
      throw new ForbiddenException('Tidak dapat mengakses kode pengguna lain.');
    }

    return this.codeService.findAccessCodesByUserId(userId);
  }

  @Post('submit')
  submitCode(@Body() submitCodeDto: SubmitCodeDto) {
    return this.codeService.submitCode(submitCodeDto.code);
  }
}
