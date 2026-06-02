import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { QrisNotificationDto } from './dto/qris-notification.dto';

type QrisNotificationResult = {
  ok: true;
  deduped: boolean;
  paymentUpdated: boolean;
};

@Injectable()
export class QrisService {
  private readonly expectedPackageName = 'id.co.speedcash.merchant';

  constructor(private readonly prisma: PrismaService) {}

  async handleNotification(
    secretHeader: string | undefined,
    dto: QrisNotificationDto,
  ): Promise<QrisNotificationResult> {
    const expectedSecret = process.env.NOTIF_SECRET;

    if (!expectedSecret) {
      throw new UnauthorizedException('NOTIF_SECRET belum dikonfigurasi.');
    }

    if (!secretHeader || secretHeader !== expectedSecret) {
      throw new UnauthorizedException('X-Notif-Secret tidak valid.');
    }

    if (dto.packageName !== this.expectedPackageName) {
      throw new BadRequestException('packageName tidak valid.');
    }

    if (!Number.isSafeInteger(dto.amount) || dto.amount <= 0) {
      throw new BadRequestException('amount tidak valid.');
    }

    if (!Number.isSafeInteger(dto.receivedAt) || dto.receivedAt <= 0) {
      throw new BadRequestException('receivedAt tidak valid.');
    }

    const signature = `${dto.packageName}|${dto.receivedAt}|${dto.amount}`;

    // 1) Dedup notification
    try {
      await this.prisma.qrisNotification.create({
        data: {
          signature,
          amount: dto.amount,
          receivedAt: BigInt(dto.receivedAt),
          rawPayload: dto as unknown as Prisma.JsonObject,
        },
        select: { id: true },
      });
    } catch (error) {
      // P2002 => unique violation (duplicate signature)
      if (this.isUniqueViolation(error)) {
        return {
          ok: true,
          deduped: true,
          paymentUpdated: false,
        };
      }

      throw error;
    }

    // 2) Map to payment
    const payment = await this.prisma.payment.findFirst({
      where: {
        status: 'PENDING',
        amount: dto.amount,
      },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    if (!payment) {
      return {
        ok: true,
        deduped: false,
        paymentUpdated: false,
      };
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAYMENT_DETECTED',
        rawNotification: dto as unknown as Prisma.JsonObject,
        detectedAt: new Date(),
      },
      select: { id: true },
    });

    return {
      ok: true,
      deduped: false,
      paymentUpdated: true,
    };
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }
    const prismaError = error as { code?: string };
    return prismaError.code === 'P2002';
  }
}

