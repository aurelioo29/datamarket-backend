// run with command: yarn prisma db seed

import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  await prisma.otpCode.deleteMany({});
  // kalau mau sekalian kosongin user juga:
  await prisma.user.deleteMany({});

  // helper bikin password hash
  const hash = (password: string) => bcrypt.hash(password, 10);

  // 1. Admin utama
  const admin = await prisma.user.upsert({
    where: { email: 'admin@datamarket.test' },
    update: {},
    create: {
      email: 'admin@datamarket.test',
      username: 'admin',
      fullname: 'Super Admin',
      password: await hash('password123'),
      role: Role.Admin,
      is_verified: true,
    },
  });

  // 2. Beberapa customer
  const customersData = [
    {
      email: 'alice@datamarket.test',
      username: 'alice',
      fullname: 'Alice Dataset',
    },
    {
      email: 'bob@datamarket.test',
      username: 'bob',
      fullname: 'Bob Analytics',
    },
    {
      email: 'charlie@datamarket.test',
      username: 'charlie',
      fullname: 'Charlie ML',
    },
  ];

  for (const c of customersData) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        username: c.username,
        fullname: c.fullname,
        password: await hash('password123'),
        role: Role.Customer,
        is_verified: true,
      },
    });
  }

  console.log('✅ Seeding selesai.');
  console.log('Admin login:');
  console.log('  email/username: admin@datamarket.test / admin');
  console.log('  password      : password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
