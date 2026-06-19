'use strict';

require('dotenv').config();
const prisma = require('../repositories/prismaClient');
const logger = require('./logger');

const seedCategories = [
  { name: 'Herbal Supplements', description: 'Traditional Ayurvedic tablets, capsules, and wellness formulations for daily health support.', sortOrder: 1, isActive: true },
  { name: 'Massage & Hair Oils', description: 'Traditional therapeutic Ayurvedic tailams, body oils, and nourishing hair formulations.', sortOrder: 2, isActive: true },
  { name: 'Skincare & Personal Care', description: 'Natural herbal soaps, face packs, cleansers, and organic beauty products.', sortOrder: 3, isActive: true },
  { name: 'Wellness Teas & Juices', description: 'Pure organic herbal teas, health tonics, and rejuvenating wellness drinks.', sortOrder: 4, isActive: true },
  { name: 'Single Herb Powders (Churna)', description: '100% pure powders of single herbs like Ashwagandha, Triphala, Shatavari, and Turmeric.', sortOrder: 5, isActive: true },
];

const seed = async () => {
  try {
    await prisma.$connect();

    logger.info('Clearing old categories...');
    await prisma.category.deleteMany({});

    logger.info('Seeding default categories...');
    for (const cat of seedCategories) {
      await prisma.category.create({ data: cat });
    }
    logger.info(`✅ Successfully seeded ${seedCategories.length} categories!`);
  } catch (err) {
    logger.error('Failed to seed categories:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    logger.info('Database connection closed.');
    process.exit(0);
  }
};

seed();
