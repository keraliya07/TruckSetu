const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const routes = require('./routes');
const { CORS_ORIGIN, NODE_ENV } = require('./config/env');
const { generalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler } = require('./middleware/errorHandler.middleware');

const app = express();

if (NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(generalLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'backend',
    phase: 'Phase 4 - Tracking, Notifications, and Realtime Foundations',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

module.exports = app;
