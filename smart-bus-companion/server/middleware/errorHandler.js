const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err, `Error in ${req.method} ${req.url}`);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
