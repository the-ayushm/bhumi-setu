import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { NotificationCreateSchema } from '@sih/shared';
import { GazetteAdapter } from '../adapters/gazette.adapter.js';

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, section } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === 'string') where.projectId = projectId;
    if (section && typeof section === 'string') where.section = section;

    const notifications = await prisma.notification.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            state: true,
            district: true,
          },
        },
      },
      orderBy: { issueDate: 'desc' },
    });

    return res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = NotificationCreateSchema.parse(req.body);

    // Call Gazette adapter to verify/register
    const gazetteRecord = await GazetteAdapter.publishStatutoryNotice(
      validated.projectId,
      validated.section,
      validated.gazetteNumber
    );

    const notification = await prisma.notification.create({
      data: {
        projectId: validated.projectId,
        section: validated.section,
        gazetteNumber: validated.gazetteNumber || gazetteRecord.issueNumber,
        issueDate: new Date(validated.issueDate),
        expiryDate: validated.expiryDate ? new Date(validated.expiryDate) : null,
        newspaperLocal1: validated.newspaperLocal1,
        newspaperLocal2: validated.newspaperLocal2,
        documentUrl: validated.documentUrl || gazetteRecord.publicUrl,
        status: 'PUBLISHED',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Statutory Gazette Notification published and recorded successfully',
      data: notification,
    });
  } catch (error) {
    return next(error);
  }
}

export async function recordObjection(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { resolved } = req.body;

    const updateData: any = {};
    if (resolved) {
      updateData.objectionsResolved = { increment: 1 };
    } else {
      updateData.objectionsCount = { increment: 1 };
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Section 15 objection registry updated',
      data: notification,
    });
  } catch (error) {
    return next(error);
  }
}
