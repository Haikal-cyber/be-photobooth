import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import TelegramBot = require('node-telegram-bot-api');
import { CodeService } from '../code/code.service';

@Injectable()
export class TelegramService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  private bot: TelegramBot | null = null;
  private allowedUserIds = new Set<number>();

  constructor(private readonly codeService: CodeService) {}

  onModuleInit(): void {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN is not set. Telegram bot is disabled.');
      return;
    }

    this.allowedUserIds = this.parseAllowedUserIds();
    this.bot = new TelegramBot(token, { polling: true });

    this.bot.onText(/^\/generate$/, async (msg: TelegramBot.Message) => {
      const chatId = msg.chat.id;
      const senderId = msg.from?.id;

      if (!this.isAllowedUser(senderId)) {
        await this.bot?.sendMessage(chatId, 'Akses ditolak untuk command ini.');
        return;
      }

      try {
        const result = await this.codeService.generateCode(null);

        await this.bot?.sendMessage(
          chatId,
          `Kode berhasil dibuat\nCode: ${result.code}\nMaks penggunaan: ${result.maxUsage}x`,
        );
      } catch (error) {
        this.logger.error('Failed to generate code from telegram command', error);
        await this.bot?.sendMessage(chatId, 'Gagal generate code. Coba lagi.');
      }
    });

    this.logger.log('Telegram bot is running in polling mode.');
  }

  async onModuleDestroy(): Promise<void> {
    if (!this.bot) {
      return;
    }

    await this.bot.stopPolling();
    this.bot = null;
  }

  private parseAllowedUserIds(): Set<number> {
    const raw = process.env.TELEGRAM_ALLOWED_IDS;

    if (!raw) {
      this.logger.warn('TELEGRAM_ALLOWED_IDS is empty. All users are allowed.');
      return new Set<number>();
    }

    const ids = raw
      .split(',')
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isInteger(value) && value > 0);

    return new Set(ids);
  }

  private isAllowedUser(senderId?: number): boolean {
    if (!senderId) {
      return false;
    }

    if (this.allowedUserIds.size === 0) {
      return true;
    }

    return this.allowedUserIds.has(senderId);
  }
}
