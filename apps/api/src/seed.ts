import 'dotenv/config';
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import { PasswordService } from './modules/auth/infrastructure/password.service.js';
import { seedInitialUsers } from './modules/auth/application/seed-initial-users.js';

async function seed() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });
  const passwords = new PasswordService();

  console.log('Seeding initial users...');
  await seedInitialUsers(prisma, passwords);

  console.log('Seeding default tags...');
  const defaultTags = ['Funny', 'Epic', 'Bug', 'Rage', 'Reaction', 'Clutch', 'Fail', 'Highlight'];
  for (const name of defaultTags) {
    const existing = await prisma.tag.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
    });
    if (!existing) {
      await prisma.tag.create({ data: { name } });
      console.log(`Created tag: ${name}`);
    } else {
      console.log(`Tag already exists: ${existing.name}`);
    }
  }

  await prisma.$disconnect();
  console.log('Seed completed successfully!');
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});

