const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');

const prisma = require('./db');
const {
  CORS_ORIGIN,
  REDIS_ENABLED,
  SOCKET_REDIS_REATTACH_BASE_MS,
  SOCKET_REDIS_REATTACH_MAX_DELAY_MS,
} = require('./env');
const { createRedisClient, getRedisConnectionMeta } = require('./redis');
const { verifyAccessToken } = require('../utils/jwt.utils');
const { registerTripSocket } = require('../sockets/trip.socket');
const { registerLocationSocket } = require('../sockets/location.socket');
const { registerNotificationSocket } = require('../sockets/notification.socket');

let io;
let pubClient;
let subClient;
let attachAttemptCount = 0;
let isAttachingAdapter = false;
let isAdapterActive = false;
let reattachTimer = null;
let isShuttingDown = false;

const connectionMeta = getRedisConnectionMeta();

const getAttachDelay = (attemptNumber) =>
  Math.min(
    SOCKET_REDIS_REATTACH_BASE_MS * 2 ** Math.max(0, attemptNumber - 1),
    SOCKET_REDIS_REATTACH_MAX_DELAY_MS
  );

const clearReattachTimer = () => {
  if (reattachTimer) {
    clearTimeout(reattachTimer);
    reattachTimer = null;
  }
};

const closeRedisClient = async (client, name) => {
  if (!client || client.status === 'end') {
    return;
  }

  try {
    await client.quit();
  } catch (error) {
    console.warn(`[${name}] Redis quit failed: ${error.message}. Forcing disconnect.`);
    client.disconnect();
  }
};

const resetAdapterClients = async () => {
  const closingClients = [
    { client: pubClient, name: 'socket-pub' },
    { client: subClient, name: 'socket-sub' },
  ];

  pubClient = null;
  subClient = null;

  await Promise.all(closingClients.map(({ client, name }) => closeRedisClient(client, name)));
};

const scheduleAdapterAttach = (reason) => {
  if (!io || isShuttingDown || reattachTimer || isAttachingAdapter) {
    return;
  }

  attachAttemptCount += 1;
  const delay = getAttachDelay(attachAttemptCount);

  console.warn(
    `Socket.IO Redis adapter unavailable (${reason}). Retrying in ${delay}ms using ${connectionMeta.label}.`
  );

  reattachTimer = setTimeout(() => {
    reattachTimer = null;
    attachRedisAdapter().catch(() => {});
  }, delay);
};

const handleAdapterClientStateChange = (clientName, eventName) => {
  if (isShuttingDown || !isAdapterActive) {
    return;
  }

  isAdapterActive = false;
  console.warn(
    `Socket.IO Redis adapter lost ${clientName} on ${eventName}. Falling back to local delivery until Redis reconnects.`
  );
  scheduleAdapterAttach(`${clientName} ${eventName}`);
};

const bindAdapterClientEvents = (client, clientName) => {
  client.on('end', () => {
    handleAdapterClientStateChange(clientName, 'end');
  });

  client.on('close', () => {
    if (client.status === 'end') {
      handleAdapterClientStateChange(clientName, 'close');
    }
  });
};

async function attachRedisAdapter() {
  if (!REDIS_ENABLED) {
    return;
  }

  if (!io || isAttachingAdapter || isShuttingDown) {
    return;
  }

  isAttachingAdapter = true;
  clearReattachTimer();
  isAdapterActive = false;
  await resetAdapterClients();

  const nextPubClient = createRedisClient('socket-pub');
  const nextSubClient = createRedisClient('socket-sub');

  bindAdapterClientEvents(nextPubClient, 'socket-pub');
  bindAdapterClientEvents(nextSubClient, 'socket-sub');

  try {
    await Promise.all([nextPubClient.connect(), nextSubClient.connect()]);
    io.adapter(createAdapter(nextPubClient, nextSubClient));
    pubClient = nextPubClient;
    subClient = nextSubClient;
    isAdapterActive = true;
    attachAttemptCount = 0;
    console.log(`Socket.IO Redis adapter enabled on ${connectionMeta.label}`);
  } catch (error) {
    console.warn(`Socket.IO Redis adapter connection failed: ${error.message}`);
    await Promise.all([
      closeRedisClient(nextPubClient, 'socket-pub'),
      closeRedisClient(nextSubClient, 'socket-sub'),
    ]);
    scheduleAdapterAttach(error.message);
  } finally {
    isAttachingAdapter = false;
  }
}

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      next(new Error('Authentication error'));
      return;
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access' || !payload.sessionId) {
      next(new Error('Authentication error'));
      return;
    }

    const session = await prisma.refreshSession.findUnique({
      where: { id: payload.sessionId },
      include: {
        user: {
          select: {
            accountStatus: true,
          },
        },
      },
    });

    if (
      !session ||
      session.revokedAt ||
      session.expiresAt <= new Date() ||
      session.user.accountStatus !== 'ACTIVE'
    ) {
      next(new Error('Authentication error'));
      return;
    }

    socket.data.user = payload;
    next();
  } catch {
    next(new Error('Authentication error'));
  }
};

function initSocketServer(httpServer) {
  if (io) {
    return io;
  }

  isShuttingDown = false;
  io = new Server(httpServer, {
    cors: {
      origin: CORS_ORIGIN,
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.user.userId}`);
    registerTripSocket(io, socket);
    registerLocationSocket(io, socket);
    registerNotificationSocket(io, socket);
  });

  if (REDIS_ENABLED) {
    attachRedisAdapter().catch(() => {});
  } else {
    console.log('Socket.IO Redis adapter disabled. Using local-only socket delivery.');
  }
  return io;
}

function getIO() {
  return io;
}

async function closeSocketServer() {
  isShuttingDown = true;
  clearReattachTimer();
  isAdapterActive = false;
  attachAttemptCount = 0;

  await resetAdapterClients();

  if (io) {
    await new Promise((resolve) => {
      io.close(() => resolve());
    });
    io = null;
  }
}

module.exports = {
  closeSocketServer,
  getIO,
  initSocketServer,
};
