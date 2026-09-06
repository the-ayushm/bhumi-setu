import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserRole, UserSession } from '@sih/shared';

declare global {
  namespace Express {
    interface Request {
      user?: UserSession;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || 'mord-land-acq-national-secret-key-2024-sih-rfctlarr';

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Missing or invalid authorization token',
    });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Expired or invalid session token',
    });
  }
}

/**
 * Enforces Role-Based Access Control
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User context not authenticated',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient role permissions. Required: [${allowedRoles.join(', ')}], Current: ${req.user.role}`,
      });
    }

    return next();
  };
}
