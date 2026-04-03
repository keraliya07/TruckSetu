const prisma = require('../config/db');
const ApiError = require('../utils/apiError.utils');

const userInclude = {
  warehouse: true,
  truckDealer: true,
  _count: {
    select: {
      notifications: true,
      sessions: true,
      disputesRaised: true,
    },
  },
};

const disputeInclude = {
  raisedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  resolvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  shipment: {
    select: {
      id: true,
      title: true,
      referenceNo: true,
      originCity: true,
      destCity: true,
      status: true,
    },
  },
  trip: {
    select: {
      id: true,
      status: true,
      truck: {
        select: {
          registrationNo: true,
        },
      },
    },
  },
  bookingRequest: {
    select: {
      id: true,
      status: true,
      truck: {
        select: {
          registrationNo: true,
        },
      },
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
      include: userInclude,
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
      sessions: {
        where: {
          revokedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
        select: {
          id: true,
          userAgent: true,
          ipAddress: true,
          createdAt: true,
          expiresAt: true,
        },
      },
      _count: {
        select: {
          notifications: true,
          sessions: true,
          disputesRaised: true,
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

  return prisma.user.update({
    where: { id },
    data: {
      accountStatus: data.accountStatus,
    },
    include: userInclude,
  });
};

const getDisputes = async (filters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.type ? { type: filters.type } : {}),
  };

  const [disputes, total] = await prisma.$transaction([
    prisma.dispute.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: disputeInclude,
    }),
    prisma.dispute.count({ where }),
  ]);

  return {
    disputes,
    total,
    page,
    limit,
  };
};

const resolveDispute = async (id, data, user) => {
  const dispute = await prisma.dispute.findUnique({
    where: { id },
  });

  if (!dispute) {
    throw ApiError.notFound('Dispute not found');
  }

  return prisma.dispute.update({
    where: { id },
    data: {
      status: data.status,
      resolution: data.resolution,
      resolvedById: user.userId,
      resolvedAt: new Date(),
    },
    include: disputeInclude,
  });
};

module.exports = {
  getDisputes,
  getUserById,
  getUsers,
  resolveDispute,
  updateUserStatus,
};
