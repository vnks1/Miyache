import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
  try {
    await prisma.user.deleteMany({});
    console.log('Cleared users');
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

clear();
