const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./db');
const logger = require('./utils/logger');
const cookieParser = require('cookie-parser');
const pinoHttp = require('pino-http')({ logger });

dotenv.config();

const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const { startBusSimulator } = require('./services/busSimulator');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // allow all for dev
    methods: ["GET", "POST"]
  }
});
app.set('io', io); // Attach io to app for use in routes

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(pinoHttp);

const apiRoutes = require('./routes/api');
const authRoutes = require('./routes/auth');

// Routes
app.use('/api', apiRoutes);
app.use('/api/auth', authRoutes);

app.get('/api/health', (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.status(isDbConnected ? 200 : 503).json({ 
    status: isDbConnected ? 'ok' : 'error',
    dbState: mongoose.connection.readyState,
    uptime: process.uptime()
  });
});

io.on('connection', (socket) => {
  logger.info(`Client connected to tracking socket: ${socket.id}`);
  
  socket.on('joinRoute', (routeId) => {
    socket.join(routeId);
    logger.info(`Socket ${socket.id} joined route room ${routeId}`);
  });

  socket.on('leaveRoute', (routeId) => {
    socket.leave(routeId);
    logger.info(`Socket ${socket.id} left route room ${routeId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    startBusSimulator(io);
  })
  .catch(err => logger.error({ err }, 'MongoDB connection error'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

// Graceful Shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`);
  server.close(() => {
    logger.info('HTTP server closed');
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// style updates
