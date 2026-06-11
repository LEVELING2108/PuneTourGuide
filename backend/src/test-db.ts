import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({});

async function test() {
  try {
    const count = await prisma.place.count();
    console.log('Places count:', count);
  } catch (err) {
    console.error('Connection error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
