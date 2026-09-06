import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { DisplacedFamilyCreateSchema } from '@sih/shared';

export async function listFamilies(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, category, rrStatus } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === 'string') where.projectId = projectId;
    if (category && typeof category === 'string') where.category = category;
    if (rrStatus && typeof rrStatus === 'string') where.overallRRStatus = rrStatus;

    const families = await prisma.displacedFamily.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: families.length,
      data: families,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createFamily(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = DisplacedFamilyCreateSchema.parse(req.body);

    const family = await prisma.displacedFamily.create({
      data: validated,
    });

    return res.status(201).json({
      success: true,
      message: 'Affected/displaced family record added to R&R census registry',
      data: family,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateFamilyEntitlement(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const {
      housingEntitlementStatus,
      subsistenceGrantPaid,
      resettlementAllowancePaid,
      overallRRStatus,
    } = req.body;

    const updateData: any = {};
    if (housingEntitlementStatus) updateData.housingEntitlementStatus = housingEntitlementStatus;
    if (subsistenceGrantPaid !== undefined) updateData.subsistenceGrantPaid = subsistenceGrantPaid;
    if (resettlementAllowancePaid !== undefined)
      updateData.resettlementAllowancePaid = resettlementAllowancePaid;
    if (overallRRStatus) updateData.overallRRStatus = overallRRStatus;

    const family = await prisma.displacedFamily.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'R&R entitlement fulfillment status updated',
      data: family,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRRSummaryByProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { projectId } = req.params;

    const families = await prisma.displacedFamily.findMany({
      where: { projectId },
    });

    const totalFamilies = families.length;
    const losingHomesteadCount = families.filter((f) => f.isLosingHomestead).length;
    const losingLivelihoodCount = families.filter((f) => f.isLosingLivelihood).length;
    const housingAllottedCount = families.filter(
      (f) => f.housingEntitlementStatus === 'ALLOTTED_PUCCA_HOUSE'
    ).length;
    const subsistenceGrantDisbursedCount = families.filter((f) => f.subsistenceGrantPaid).length;
    const resettlementAllowanceDisbursedCount = families.filter(
      (f) => f.resettlementAllowancePaid
    ).length;
    const relocatedCount = families.filter((f) => f.overallRRStatus === 'RELOCATED').length;

    // Calculate R&R compliance score percentage
    const complianceScore =
      totalFamilies > 0
        ? Math.round(
            ((subsistenceGrantDisbursedCount +
              resettlementAllowanceDisbursedCount +
              housingAllottedCount) /
              (totalFamilies * 3)) *
              100
          )
        : 100;

    return res.json({
      success: true,
      data: {
        totalFamilies,
        losingHomesteadCount,
        losingLivelihoodCount,
        housingAllottedCount,
        subsistenceGrantDisbursedCount,
        resettlementAllowanceDisbursedCount,
        relocatedCount,
        complianceScore,
      },
    });
  } catch (error) {
    return next(error);
  }
}
