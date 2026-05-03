import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export type AuthUserPayload = {
  id: string;
  email: string;
  name: string | null;
};

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<{ accessToken: string; user: AuthUserPayload }> {
    const passwordHash = await bcrypt.hash(dto.password, this.saltRounds);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          password: passwordHash,
          name: dto.name?.trim() || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
        },
      });

      return this.buildAuthResponse(user);
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new ConflictException('Email sudah terdaftar.');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<{ accessToken: string; user: AuthUserPayload }> {
    const email = dto.email.toLowerCase().trim();

    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid.');
    }

    const passwordOk = await bcrypt.compare(dto.password, user.password);

    if (!passwordOk) {
      throw new UnauthorizedException('Email atau kata sandi tidak valid.');
    }

    const { password: _password, ...safeUser } = user;
    return this.buildAuthResponse(safeUser);
  }

  private buildAuthResponse(user: {
    id: bigint;
    email: string;
    name: string | null;
  }): { accessToken: string; user: AuthUserPayload } {
    const payload = {
      sub: user.id.toString(),
      email: user.email,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
      },
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
