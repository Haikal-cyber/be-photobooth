import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CodeService {
  private readonly maxGenerateRetries = 30;

  constructor(private readonly prisma: PrismaService) {}

  async generateCode(): Promise<{ code: string; maxUsage: number }> {
    for (let attempt = 0; attempt < this.maxGenerateRetries; attempt += 1) {
      const code = this.createFourDigitCode();

      try {
        const created = await this.prisma.accessCode.create({
          data: {
            code,
            maxUsage: 2,
            usageCount: 0,
            isActive: true,
          },
          select: {
            code: true,
            maxUsage: true,
          },
        });

        return created;
      } catch (error) {
        if (this.isUniqueViolation(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new ConflictException('Failed to generate unique code. Try again.');
  }

  async submitCode(
    submittedCode: string,
  ): Promise<{ code: string; usageCount: number; remainingUsage: number }> {
    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const incrementResult = await tx.accessCode.updateMany({
        where: {
          code: submittedCode,
          isActive: true,
          usageCount: {
            lt: 2,
          },
        },
        data: {
          usageCount: {
            increment: 1,
          },
        },
      });

      if (incrementResult.count === 0) {
        throw new ForbiddenException('Code usage limit exceeded or inactive. Access denied.');
      }

      const updated = await tx.accessCode.findUnique({
        where: { code: submittedCode },
        select: {
          code: true,
          usageCount: true,
          maxUsage: true,
          isActive: true,
        },
      });

      if (!updated) {
        throw new ForbiddenException('Code not found. Access denied.');
      }

      if (updated.usageCount >= updated.maxUsage && updated.isActive) {
        await tx.accessCode.update({
          where: { code: submittedCode },
          data: {
            isActive: false,
          },
        });

        return {
          ...updated,
          isActive: false,
        };
      }

      return updated;
    });

    return {
      code: result.code,
      usageCount: result.usageCount,
      remainingUsage: Math.max(result.maxUsage - result.usageCount, 0),
    };
  }

  private createFourDigitCode(): string {
    const value = Math.floor(Math.random() * 10000);
    return value.toString().padStart(4, '0');
  }

  private isUniqueViolation(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false;
    }

    const prismaError = error as { code?: string };
    return prismaError.code === 'P2002';
  }
}
