import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { DisbursementTriggerSchema } from '@sih/shared';
import { PFMSAdapter } from '../adapters/pfms.adapter.js';

export async function listDisbursements(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, status } = req.query;

    const where: any = {};
    if (status && typeof status === 'string') where.status = status;
    if (projectId && typeof projectId === 'string') {
      where.award = {
        parcel: {
          projectId,
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
    const disbursements = await prisma.disbursement.findMany();
    const awards = await prisma.valuationAward.findMany();

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
