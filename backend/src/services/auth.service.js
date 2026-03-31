// === backend/src/services/auth.service.js ===
// Purpose: Authentication business logic — register, login, token generation
// Dependencies: ../config/db, ../utils/jwt.utils, ../utils/bcrypt.utils

// const prisma = require('../config/db');           // TODO: uncomment
// const { generateToken } = require('../utils/jwt.utils'); // TODO: uncomment
// const { hashPassword, comparePassword } = require('../utils/bcrypt.utils'); // TODO: uncomment

/**
 * TODO: Implement register
 * @param {{ email, password, name, phone, role }} data
 * @returns {Promise<{ token, user }>}
 *
 * Steps:
 *   1. Check if email already exists: prisma.user.findUnique({ where: { email } })
 *   2. If exists: throw ApiError(409, 'Email already registered')
 *   3. Hash password with bcrypt (10 salt rounds)
 *   4. Create user: prisma.user.create({ data: { email, passwordHash, name, phone, role } })
 *   5. Generate JWT with { userId: user.id, email, role }
 *   6. Return { token, user: (without passwordHash) }
 */

/**
 * TODO: Implement login
 * @param {{ email, password }} credentials
 * @returns {Promise<{ token, user }>}
 *
 * Steps:
 *   1. Find user by email: prisma.user.findUnique({ where: { email } })
 *   2. If not found: throw ApiError(401, 'Invalid credentials')
 *   3. Compare password with hash: bcrypt.compare(password, user.passwordHash)
 *   4. If mismatch: throw ApiError(401, 'Invalid credentials')
 *   5. Generate JWT
 *   6. Return { token, user }
 */

/**
 * TODO: Implement getProfile
 * @param {string} userId
 * @returns {Promise<object>}
 *
 * Prisma query:
 *   prisma.user.findUnique({
 *     where: { id: userId },
 *     include: { warehouse: true, truckDealer: true },
 *     omit: { passwordHash: true },
 *   })
 */

// module.exports = { register, login, getProfile, updateProfile };
