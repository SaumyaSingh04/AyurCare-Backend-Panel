'use strict';

const supertest = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/repositories/prismaClient');
const bcrypt = require('bcryptjs');

const connectTestDB = async () => {
  await prisma.$connect();
};

const disconnectTestDB = async () => {
  await prisma.$disconnect();
};

const clearAllCollections = async () => {
  // Delete in dependency order to avoid FK violations
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.coupon.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.user.deleteMany({});
};

const createTestUser = async (overrides = {}) => {
  const password = overrides.password || 'TestPass@123';
  const hashed = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      firstName: 'Test',
      lastName: 'User',
      email: `test_${Date.now()}@example.com`,
      password: hashed,
      isEmailVerified: true,
      isActive: true,
      role: 'user',
      ...overrides,
      ...(overrides.password ? { password: hashed } : {}),
    },
  });
};

const getAuthHeader = async (user) => {
  const { generateAuthTokens } = require('../../src/helpers/tokenHelper');
  const { accessToken } = generateAuthTokens(user.id || user._id, user.role);
  return { Authorization: `Bearer ${accessToken}` };
};

const request = supertest(app);

module.exports = { connectTestDB, disconnectTestDB, clearAllCollections, createTestUser, getAuthHeader, request };
