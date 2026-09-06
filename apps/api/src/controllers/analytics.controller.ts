import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { RiskService } from '../services/risk.service.js';

export async function getNationalSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const totalProjects = await prisma.project.count();
    const totalParcels = await prisma.landParcel.count();
    const totalDisplacedFamilies = await prisma.displacedFamily.count();

    const projects = await prisma.project.findMany({
      select: {
        totalAreaHectares: true,
        estimatedBudgetCr: true,
        compensationBudgetCr: true,
        currentStage: true,
        riskLevel: true,
      },
    });

    const disbursements = await prisma.disbursement.findMany({
      select: { amountPaid: true },
    });

    const totalAreaHectares = projects.reduce((acc, curr) => acc + curr.totalAreaHectares, 0);
    const totalBudgetCr = projects.reduce((acc, curr) => acc + curr.estimatedBudgetCr, 0);
    const totalCompensationBudgetCr = projects.reduce(
      (acc, curr) => acc + curr.compensationBudgetCr,
      0
    );
    const totalDisbursedINR = disbursements.reduce((acc, curr) => acc + curr.amountPaid, 0);

    const highRiskProjectsCount = projects.filter(
      (p) => p.riskLevel === 'HIGH' || p.riskLevel === 'CRITICAL'
    ).length;

    // Breakdown by sector
    const sectorStats = await prisma.project.groupBy({
      by: ['sector'],
      _count: { id: true },
      _sum: { totalAreaHectares: true, compensationBudgetCr: true },
    });

    // Breakdown by stage
    const stageStats = await prisma.project.groupBy({
      by: ['currentStage'],
      _count: { id: true },
    });

    return res.json({
      success: true,
      data: {
        kpis: {
          totalProjects,
          totalAreaHectares: Math.round(totalAreaHectares * 100) / 100,
          totalBudgetCr: Math.round(totalBudgetCr * 100) / 100,
          totalCompensationBudgetCr: Math.round(totalCompensationBudgetCr * 100) / 100,
          totalDisbursedCr: Math.round((totalDisbursedINR / 10000000) * 100) / 100,
          totalParcels,
          totalDisplacedFamilies,
          highRiskProjectsCount,
        },
        sectorStats,
        stageStats,
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function getStateRankings(req: Request, res: Response, next: NextFunction) {
  try {
    const states = await prisma.project.groupBy({
      by: ['state'],
      _count: { id: true },
      _sum: { totalAreaHectares: true, compensationBudgetCr: true },
      _avg: { riskScore: true },
    });

    const formatted = states.map((s) => ({
      state: s.state,
      projectCount: s._count.id,
      totalAreaHectares: Math.round((s._sum.totalAreaHectares || 0) * 10) / 10,
      totalCompensationCr: Math.round((s._sum.compensationBudgetCr || 0) * 10) / 10,
      averageRiskScore: Math.round(s._avg.riskScore || 20),
    }));

    return res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getRiskIndicators(req: Request, res: Response, next: NextFunction) {
  try {
    const risks = await RiskService.getAllProjectRisks();
    return res.json({
      success: true,
      count: risks.length,
      data: risks,
    });
  } catch (error) {
    return next(error);
  }
}
