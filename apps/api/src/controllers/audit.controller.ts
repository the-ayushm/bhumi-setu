import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export async function listAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const { entityType, entityId, limit } = req.query;

    const where: any = {};
    if (entityType && typeof entityType === 'string') where.entityType = entityType;
    if (entityId && typeof entityId === 'string') where.entityId = entityId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            designation: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ? Number(limit) : 50,
    });

    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return next(error);
  }
}
