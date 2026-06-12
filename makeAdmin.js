'use strict';

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const makeAdmin = async () => {
  try {
    const email = 'saumya0419@gmail.com';
    const hashed = await bcrypt.hash('SecurePassword123', 12);

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        firstName: 'Saumya',
        lastName: 'Singh',
        email,
        phone: '6388691336',
        password: hashed,
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
      },
      update: {
        role: 'admin',
        isEmailVerified: true,
        isActive: true,
        password: hashed,
        loginAttempts: 0,
        lockUntil: null,
      },
    });

    console.log(`✅ ${user.email} is now an Admin (id: ${user.id})`);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

makeAdmin();
