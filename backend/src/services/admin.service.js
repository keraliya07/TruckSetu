const prisma = require('../config/db');
const { hashPassword } = require('../utils/bcrypt.utils');
const ApiError = require('../utils/apiError.utils');
const { invalidateUserSessionCache } = require('../middleware/auth.middleware');

const userInclude = {
  warehouse: true,
  truckDealer: true,
  _count: {
    select: {
      notifications: true,
    },
  },
};

const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  accountStatus: true,
  createdAt: true,
  _count: {
    select: {
      notifications: true,
    },
  },
};

const getUsers = async (filters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.role ? { role: filters.role } : {}),
    ...(filters.status ? { accountStatus: filters.status } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      select: userListSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
    page,
    limit,
  };
};

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      warehouse: true,
      truckDealer: {
        include: {
          trucks: {
            select: {
              id: true,
              registrationNo: true,
              status: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      },
      notifications: {
        take: 8,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          title: true,
          type: true,
          createdAt: true,
          isRead: true,
        },
      },
      _count: {
        select: {
          notifications: true,
          shipmentsCreated: true,
          bookingsRequested: true,
        },
      },
    },
  });

  if (!user) {
    throw ApiError.notFound('User not found');
  }

  return user;
};

const updateUserStatus = async (id, data) => {
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    throw ApiError.notFound('User not found');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      accountStatus: data.accountStatus,
    },
    include: userInclude,
  });

  invalidateUserSessionCache(id);
  return updated;
};

const createAnalyst = async ({ name, email, phone, password }) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw ApiError.conflict('Email already registered');
  }

  const analyst = await prisma.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      passwordHash: await hashPassword(password),
      role: 'ANALYST',
      accountStatus: 'ACTIVE',
      profileComplete: true,
      isEmailVerified: true,
    },
    include: userInclude,
  });

  return analyst;
};

module.exports = {
  createAnalyst,
  getUserById,
  getUsers,
  updateUserStatus,
};
