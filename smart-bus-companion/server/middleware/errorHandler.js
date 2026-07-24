const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err, `Error in ${req.method} ${req.url}`);

  if (res.headersSent) {
    return next(err);
  }

  // Handle Mongoose Validation Error specifically
  if (err.name === 'ValidationError') {
    const errors = {};
    for (const key in err.errors) {
      errors[key] = err.errors[key].message;
    }
    return res.status(400).json({
      error: 'Validation Error',
      details: errors
    });
  }
  
  // Handle CastError (invalid ObjectId, etc)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid ID format'
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
  });
};

module.exports = errorHandler;
