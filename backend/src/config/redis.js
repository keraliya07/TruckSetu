const Redis = require('ioredis');

const {
  REDIS_CONNECT_TIMEOUT_MS,
  REDIS_RETRY_BASE_MS,
  REDIS_RETRY_LIMIT,
  REDIS_RETRY_MAX_DELAY_MS,
  REDIS_URL,
} = require('./env');

const safeParseRedisUrl = () => {
  try {
    return new URL(REDIS_URL);
  } catch {
    return null;
  }
};

const getRedisConnectionMeta = () => {
  const parsed = safeParseRedisUrl();
  const host = parsed?.hostname || 'unknown-host';
  const isTls = parsed?.protocol === 'rediss:';
  const isUpstash = host.includes('upstash.io') || host.includes('upstash.dev');

  return {
    host,
    isTls,
    isUpstash,
    label: `${host}${isUpstash ? ' via Upstash' : ''}${isTls ? ' (TLS)' : ''}`,
  };
};

const getRetryDelay = (attemptNumber) => {
  if (attemptNumber > REDIS_RETRY_LIMIT) {
    return null;
  }

  const exponentialDelay = REDIS_RETRY_BASE_MS * 2 ** Math.max(0, attemptNumber - 1);
  return Math.min(exponentialDelay, REDIS_RETRY_MAX_DELAY_MS);
};

const createRedisClient = (name = 'redis') => {
  const connectionMeta = getRedisConnectionMeta();
  const options = {
    autoResubscribe: true,
    connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
    connectionName: `stlos:${name}`,
    enableOfflineQueue: false,
    keepAlive: 10000,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    retryStrategy: (attemptNumber) => {
      const delay = getRetryDelay(attemptNumber);

      if (delay == null) {
        console.warn(
          `[${name}] Redis retry limit reached for ${connectionMeta.label}. Client will stop and wait for the socket layer to reattach.`
        );
        return null;
      }

      console.warn(
        `[${name}] Redis reconnect attempt ${attemptNumber} in ${delay}ms (${connectionMeta.label})`
      );
      return delay;
    },
    reconnectOnError: (error) => {
      const message = error?.message || '';
      return Number(/READONLY|ETIMEDOUT|ECONNRESET/i.test(message));
    },
  };

  if (connectionMeta.isTls) {
    options.tls = {};
  }

  const client = new Redis(REDIS_URL, options);

  client.on('connect', () => {
    console.log(`[${name}] Redis connected to ${connectionMeta.label}`);
  });

  client.on('ready', () => {
    console.log(`[${name}] Redis ready for commands`);
  });

  client.on('error', (error) => {
    console.warn(`[${name}] Redis error on ${connectionMeta.label}: ${error.message}`);
  });

  client.on('close', () => {
    console.warn(`[${name}] Redis connection closed`);
  });

  client.on('reconnecting', () => {
    console.log(`[${name}] Redis reconnecting`);
  });

  client.on('end', () => {
    console.warn(`[${name}] Redis connection ended`);
  });

  return client;
};

const redis = createRedisClient('redis');

module.exports = {
  createRedisClient,
  getRedisConnectionMeta,
  redis,
};
