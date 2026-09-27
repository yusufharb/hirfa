import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { pool } from '../config/database';
import { AppError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError(401, 'Access token is required'));
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    const userRes = await pool.query('SELECT id, role, is_active FROM users WHERE id = $1', [decoded.id]);
    
    if (userRes.rows.length === 0) {
      return next(new AppError(401, 'User not found'));
    }

    if (!userRes.rows[0].is_active) {
      return next(new AppError(403, 'User account is deactivated'));
    }

    req.user = decoded;
    next();
  } catch (error) {
    next(new AppError(403, 'Invalid or expired token'));
  }
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    req.user = decoded;
    next();
  } catch (error) {
    // If invalid, just ignore for optional auth
    next();
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError(403, 'Insufficient permissions'));
    }
    next();
  };
};
