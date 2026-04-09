const { PrismaClient } = require('../../generated/prisma');
const { NODE_ENV } = require('./env');

let prisma;

if (NODE_ENV === 'production') {
  prisma = new PrismaClient({
    log: ['warn', 'error'],
  });
} else {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }

  prisma = globalThis.__prisma;
}

module.exports = prisma;
