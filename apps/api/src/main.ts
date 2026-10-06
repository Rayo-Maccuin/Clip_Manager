import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter.js';
import { PasswordService } from './modules/auth/infrastructure/password.service.js';
import { seedInitialUsers } from './modules/auth/application/seed-initial-users.js';
import { PrismaService } from './infrastructure/persistence/prisma/prisma.service.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || allowedOrigins.includes(origin) || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const prisma = app.get(PrismaService);
  await seedInitialUsers(prisma, app.get(PasswordService));
  const defaultTags = ['Funny', 'Epic', 'Bug', 'Rage', 'Reaction', 'Clutch', 'Fail', 'Highlight'];
  for (const name of defaultTags) {
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!existing) {
      await prisma.tag.create({ data: { name } });
    }
  }

  await app.listen(process.env.PORT ?? 3002);
}

void bootstrap();