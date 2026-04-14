# be-photobooth

Backend API untuk photobooth menggunakan NestJS + Prisma + MySQL.

## Endpoint

- `GET /codes/generate` membuat 1 kode unik 4 digit
- `POST /codes/submit` submit kode dengan maksimal pemakaian 2x

## Telegram Bot (Satu Service)

Bot Telegram berjalan di service NestJS yang sama. Command yang tersedia:

- `/generate` untuk generate code baru dari backend

Tambahkan env berikut di `.env`:

```env
TELEGRAM_BOT_TOKEN=isi_token_dari_botfather
TELEGRAM_ALLOWED_IDS=123456789,987654321
```

Catatan:

- Jika `TELEGRAM_BOT_TOKEN` kosong, bot tidak akan aktif.
- Jika `TELEGRAM_ALLOWED_IDS` kosong, semua user Telegram diizinkan mengakses `/generate`.

Body submit:

```json
{
  "code": "1234"
}
```

## Setup

1. Install dependency:

```bash
npm install
```

2. Copy environment file:

```bash
cp .env.example .env
```

3. Sesuaikan `DATABASE_URL` di `.env`

4. Generate Prisma Client:

```bash
npm run prisma:generate
```

5. Jalankan migrasi database:

```bash
npm run prisma:migrate -- --name init
```

6. Jalankan server:

```bash
npm run start:dev
```

## Docker Compose

Jalankan app + MySQL dengan Docker:

```bash
docker compose up --build
```

API bisa diakses di:

- `http://localhost:3000`

Untuk menghentikan container:

```bash
docker compose down
```
