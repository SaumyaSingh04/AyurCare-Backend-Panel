'use strict';

const prisma = require('../repositories/prismaClient');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ PostgreSQL connected via Prisma');
  } catch (err) {
    logger.error('PostgreSQL connection failed:', err.message);
    throw err;
  }
};

module.exports = { connectDB };
