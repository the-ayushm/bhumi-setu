import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { AwardCreateSchema, calculateStatutoryAward } from '@sih/shared';

export async function calculateAwardPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const { baseRatePerAcre, areaAcres, isRural, ruralMultiplier, assetsValue, section11Date, awardDate } =
      req.body;

    const result = calculateStatutoryAward({
      baseRatePerAcre: Number(baseRatePerAcre),
      areaAcres: Number(areaAcres),
      isRural: Boolean(isRural),
      ruralMultiplier: ruralMultiplier ? Number(ruralMultiplier) : 1.5,
      assetsValue: assetsValue ? Number(assetsValue) : 0,
      section11Date: section11Date || new Date().toISOString(),
      awardDate: awardDate || new Date().toISOString(),
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createAward(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = AwardCreateSchema.parse(req.body);

    const parcel = await prisma.landParcel.findUnique({
      where: { id: validated.parcelId },
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Parcel not found' });
    }

    const calcResult = calculateStatutoryAward({
      baseRatePerAcre: validated.baseRatePerAcre,
      areaAcres: parcel.areaAcres,
      isRural: parcel.landType.startsWith('RURAL'),
      ruralMultiplier: validated.ruralMultiplier,
      assetsValue: validated.assetsValue,
      section11Date: validated.section11Date,
      awardDate: validated.awardDate,
    });

    const award = await prisma.valuationAward.create({
      data: {
        parcelId: validated.parcelId,
        baseRatePerAcre: validated.baseRatePerAcre,
        marketValueLand: calcResult.marketValueLand,
        ruralMultiplier: calcResult.ruralMultiplier,
        multipliedMarketValue: calcResult.multipliedMarketValue,
        assetsValue: calcResult.assetsValue,
        subTotalBeforeSolatium: calcResult.subTotalBeforeSolatium,
        solatiumAmount: calcResult.solatiumAmount,
        daysBetweenSec11AndAward: calcResult.daysBetweenSec11AndAward,
        additionalInterestAmount: calcResult.additionalInterestAmount,
        totalAwardAmount: calcResult.totalAwardAmount,
        awardDate: new Date(validated.awardDate),
        status: 'APPROVED_COLLECTOR',
        approvedBy: req.user ? req.user.name : 'Competent Authority / Collector',
      },
    });

    // Update parcel status to VALUATION_DONE
    await prisma.landParcel.update({
      where: { id: validated.parcelId },
      data: { status: 'VALUATION_DONE' },
    });

    return res.status(201).json({
      success: true,
      message: 'Statutory Land Acquisition Award formalized and approved under Section 26-30',
      data: award,
    });
  } catch (error) {
    return next(error);
  }
}

export async function listAwardsByProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId } = req.params;

    const awards = await prisma.valuationAward.findMany({
      where: {
        parcel: { projectId },
      },
      include: {
        parcel: true,
        disbursements: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({
      success: true,
      count: awards.length,
      data: awards,
    });
  } catch (error) {
    return next(error);
  }
}
