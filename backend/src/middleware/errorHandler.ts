import { Request, Response, NextFunction } from 'express';
import { logger } from '../server';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle PostgreSQL Errors
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'A record with this information already exists.';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Related record does not exist.';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Invalid input format.';
        break;
    }
  }

  // Log error
  logger.error(\`\${statusCode} - \${message} - \${req.originalUrl} - \${req.method} - \${req.ip}\`);
  if (statusCode === 500) {
    console.error('Unhandled Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};
