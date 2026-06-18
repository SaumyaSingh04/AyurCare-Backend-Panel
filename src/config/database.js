'use strict';

const prisma = require('../repositories/prismaClient');
const logger = require('../utils/logger');

const connectDB = async (retries = 3) => {
  for (let i = 1; i <= retries; i++) {
    try {
      await prisma.$connect();
      logger.info('✅ PostgreSQL connected via Prisma');
      return;
    } catch (err) {
      logger.error(`PostgreSQL connection failed (attempt ${i}/${retries}):`, err.message);
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
};

module.exports = { connectDB };
