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

export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as UserSession;
      req.user = decoded;
    } catch {
      // Invalid/expired token in optional auth is treated as anonymous public viewer
      req.user = undefined;
    }
  }
  return next();
}

/**
 * Returns Prisma filtering clauses based on authenticated role and jurisdiction
 */
export function buildJurisdictionScope(req: Request) {
  const role = req.user?.role;
  const state = req.user?.state;
  const district = req.user?.district;

  const projectWhere: any = {};
  const parcelWhere: any = {};

  if (role === UserRole.STATE_NODAL_OFFICER && state) {
    projectWhere.state = state;
    parcelWhere.project = { state };
  } else if (
    (role === UserRole.DISTRICT_COLLECTOR ||
      role === UserRole.LAND_ACQUISITION_OFFICER ||
      role === UserRole.FIELD_SURVEYOR) &&
    district
  ) {
    projectWhere.district = district;
    parcelWhere.project = { district };
  } else if (role === UserRole.REQUISITIONING_AGENCY) {
    projectWhere.requisitioningAgency = { contains: 'NHAI' };
    parcelWhere.project = { requisitioningAgency: { contains: 'NHAI' } };
  }

  return { projectWhere, parcelWhere };
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


