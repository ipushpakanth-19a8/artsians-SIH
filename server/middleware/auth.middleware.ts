import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/auth.service.js';
import { db } from '../db.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    phone: string;
    name: string;
  };
}

/**
 * Middleware: Requires a valid bearer session token.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please provide a valid token.' });
  }

  const payload = verifyToken(authHeader);
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }

  req.user = payload;
  next();
}

/**
 * Middleware: Requires one of the specified roles.
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const userRole = req.user.role;
    // Map seller <-> artisan interchangeably
    const isAllowed = allowedRoles.some(r => {
      if (r === 'artisan' && (userRole === 'artisan' || userRole === 'seller')) return true;
      if (r === 'seller' && (userRole === 'artisan' || userRole === 'seller')) return true;
      return r === userRole;
    });

    if (!isAllowed) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Optional Auth: Attaches user payload if valid token present.
 */
export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const payload = verifyToken(authHeader);
    if (payload) {
      req.user = payload;
    }
  }
  next();
}
