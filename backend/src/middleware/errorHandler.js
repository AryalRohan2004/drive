import { AppError } from '../utils/AppError.js';

export const notFound = (_req, _res, next) => {
  next(new AppError('Route not found', 404));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    status: err.status || 'error',
    message,
  });
};
