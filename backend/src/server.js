require('dotenv').config();

const http = require('http');
const app = require('./app');
const { closeSocketServer, initSocketServer } = require('./config/socket');

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);
initSocketServer(server);

server.listen(PORT, () => {
  console.log(`STLOS API running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down STLOS API...`);
  server.close(() => {
    closeSocketServer()
      .catch(() => {})
      .finally(() => {
        process.exit(0);
      });
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
