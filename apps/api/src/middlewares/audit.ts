import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export function recordAuditLog(action: string, entityType: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const originalJson = res.json;

    res.json = function (body: any) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Asynchronously record audit log without blocking the response
        const entityId = req.params.id || body?.data?.id || body?.data?.projectId || 'SYSTEM';
        const userId = req.user?.id || null;
        const userRole = req.user?.role || 'AUTHORIZED_OFFICIAL';

        prisma.auditLog
          .create({
            data: {
              userId,
              userRole,
              action,
              entityType,
              entityId: String(entityId),
              ipAddress: req.ip || (req.headers['x-forwarded-for'] as string) || '127.0.0.1',
              previousState: req.body ? JSON.stringify(req.body) : null,
              newState: body?.data ? JSON.stringify(body.data) : null,
            },
          })
          .catch((err) => {
            console.error('[AUDIT_LOG_ERROR]', err);
          });
      }
      return originalJson.call(this, body);
    };

    next();
  };
}
