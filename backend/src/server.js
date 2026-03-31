require('dotenv').config();

const http = require('http');
const app = require('./app');

const PORT = Number(process.env.PORT || 4000);
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`STLOS API running on port ${PORT}`);
});

const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down STLOS API...`);
  server.close(() => {
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
