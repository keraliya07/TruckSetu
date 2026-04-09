const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const prisma = require('./config/db');
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

if (NODE_ENV !== 'test') {
  app.use(helmet());
}

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
  app.use(generalLimiter);
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRawUnsafe('SELECT 1');

    return res.json({
      status: 'ok',
      service: 'backend',
      phase: 'Phase 8 - Background Jobs And Automation',
      dependencies: {
        database: 'up',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: 'degraded',
      service: 'backend',
      phase: 'Phase 8 - Background Jobs And Automation',
      dependencies: {
        database: 'down',
      },
      error: 'Database unavailable',
      timestamp: new Date().toISOString(),
    });
  }
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
