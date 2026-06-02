import { Body, Controller, Headers, Post } from '@nestjs/common';
import { QrisNotificationDto } from './dto/qris-notification.dto';
import { QrisService } from './qris.service';

@Controller('api/qris')
export class QrisController {
  constructor(private readonly qrisService: QrisService) {}

  @Post('notification')
  notification(
    @Headers('x-notif-secret') secret: string | undefined,
    @Body() dto: QrisNotificationDto,
  ) {
    return this.qrisService.handleNotification(secret, dto);
  }
}

