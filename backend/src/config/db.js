// === backend/src/config/db.js ===
// Purpose: Prisma client singleton — prevents multiple instances in development
// Dependencies: @prisma/client

// const { PrismaClient } = require('@prisma/client');  // TODO: uncomment

/**
 * TODO: Create Prisma client singleton
 *
 * Steps:
 *   1. Check if globalThis.__prisma exists (prevent hot-reload duplicates)
 *   2. If not: create new PrismaClient({ log: ['query', 'error', 'warn'] })
 *   3. Assign to globalThis.__prisma in development mode
 *   4. Export the singleton instance
 *
 * USAGE in any service:
 *   const prisma = require('../config/db');
 *   const users = await prisma.user.findMany();
 */

// let prisma;
// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
// } else {
//   if (!globalThis.__prisma) {
//     globalThis.__prisma = new PrismaClient({ log: ['query', 'error', 'warn'] });
//   }
//   prisma = globalThis.__prisma;
// }
// module.exports = prisma;
