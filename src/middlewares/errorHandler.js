const logger = require("../utils/logger");

function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    message: err.message || "Internal Server Error",
  });
}

module.exports = errorHandler;