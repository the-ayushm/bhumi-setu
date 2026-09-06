import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { DisbursementTriggerSchema, UserRole } from '@sih/shared';
import { PFMSAdapter } from '../adapters/pfms.adapter.js';
import { buildJurisdictionScope } from '../middlewares/auth.js';

export async function listDisbursements(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, status } = req.query;

    const { projectWhere } = buildJurisdictionScope(req);
    const where: any = {};
    if (status && typeof status === 'string') where.status = status;

    const parcelProjectFilter: any = { ...projectWhere };
    if (projectId && typeof projectId === 'string') {
      parcelProjectFilter.id = projectId;
    }

    if (Object.keys(parcelProjectFilter).length > 0) {
      where.award = {
        parcel: {
          project: parcelProjectFilter,
        },
      };
    }

    const disbursements = await prisma.disbursement.findMany({
      where,
      include: {
        award: {
          include: {
            parcel: {
              include: {
                project: {
                  select: {
                    id: true,
                    code: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { paymentDate: 'desc' },
    });

    return res.json({
      success: true,
      count: disbursements.length,
      data: disbursements,
    });
  } catch (error) {
    return next(error);
  }
}

export async function triggerDisbursement(req: Request, res: Response, next: NextFunction) {
  try {
    const { awardId, remarks } = DisbursementTriggerSchema.parse(req.body);

    const award = await prisma.valuationAward.findUnique({
      where: { id: awardId },
      include: { parcel: true },
    });

    if (!award) {
      return res.status(404).json({ success: false, message: 'Award record not found' });
    }

    // Call PFMS DBT gateway adapter
    const pfmsResponse = await PFMSAdapter.processDirectBenefitTransfer({
      awardId: award.id,
      beneficiaryName: award.parcel.ownerName,
      bankAccountMasked: award.parcel.ownerBankAccMasked,
      ifscCode: award.parcel.ownerIfsc,
      amount: award.totalAwardAmount,
    });

    // Create Disbursement record
    const disbursement = await prisma.disbursement.create({
      data: {
        awardId: award.id,
        beneficiaryName: award.parcel.ownerName,
        amountPaid: award.totalAwardAmount,
        paymentMode: 'PFMS_DBT',
        utrReference: pfmsResponse.utrReference,
        status: pfmsResponse.status,
        remarks: remarks || pfmsResponse.message,
      },
    });

    // Update parcel status to DISBURSED
    await prisma.landParcel.update({
      where: { id: award.parcelId },
      data: { status: 'DISBURSED' },
    });

    return res.status(201).json({
      success: true,
      message: pfmsResponse.message,
      data: disbursement,
      pfmsDetails: pfmsResponse,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getDisbursementStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectWhere } = buildJurisdictionScope(req);
    const hasFilter = Object.keys(projectWhere).length > 0;

    const disbursementWhere = hasFilter
      ? { award: { parcel: { project: projectWhere } } }
      : {};
    const awardWhere = hasFilter
      ? { parcel: { project: projectWhere } }
      : {};

    const disbursements = await prisma.disbursement.findMany({ where: disbursementWhere });
    const awards = await prisma.valuationAward.findMany({ where: awardWhere });

    const totalDisbursedINR = disbursements.reduce((acc, curr) => acc + curr.amountPaid, 0);
    const totalAwardApprovedINR = awards.reduce((acc, curr) => acc + curr.totalAwardAmount, 0);

    return res.json({
      success: true,
      data: {
        totalDisbursementsCount: disbursements.length,
        totalAwardsCount: awards.length,
        totalDisbursedINR,
        totalAwardApprovedINR,
        disbursementRatio:
          totalAwardApprovedINR > 0
            ? Math.round((totalDisbursedINR / totalAwardApprovedINR) * 100)
            : 0,
      },
    });
  } catch (error) {
    return next(error);
  }
}
