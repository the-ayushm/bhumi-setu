import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import {
  ProjectCreateSchema,
  ProjectStageTransitionSchema,
  ProjectStage,
} from '@sih/shared';
import { StatutoryService } from '../services/statutory.service.js';
import { RiskService } from '../services/risk.service.js';

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const { state, sector, stage, search, riskLevel } = req.query;

    const where: any = {};
    if (state && typeof state === 'string') where.state = state;
    if (sector && typeof sector === 'string') where.sector = sector;
    if (stage && typeof stage === 'string') where.currentStage = stage;
    if (riskLevel && typeof riskLevel === 'string') where.riskLevel = riskLevel;
    if (search && typeof search === 'string') {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { district: { contains: search } },
        { requisitioningAgency: { contains: search } },
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        _count: {
          select: {
            parcels: true,
            notifications: true,
            displacedFamilies: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        notifications: { orderBy: { issueDate: 'asc' } },
        parcels: {
          include: {
            valuationAward: {
              include: { disbursements: true },
            },
          },
        },
        displacedFamilies: true,
      },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Refresh dynamic risk indicators
    const riskAnalysis = await RiskService.evaluateProjectRisk(id);

    // Calculate aggregated parcel metrics
    const totalParcels = project.parcels.length;
    const surveyedParcels = project.parcels.filter((p) => p.status !== 'NOTIFIED').length;
    const awardedParcels = project.parcels.filter((p) => p.valuationAward).length;
    const disbursedParcels = project.parcels.filter(
      (p) => p.valuationAward && p.valuationAward.disbursements.length > 0
    ).length;

    let totalAwardDisbursedINR = 0;
    let totalAwardApprovedINR = 0;
    for (const parcel of project.parcels) {
      if (parcel.valuationAward) {
        totalAwardApprovedINR += parcel.valuationAward.totalAwardAmount;
        for (const d of parcel.valuationAward.disbursements) {
          totalAwardDisbursedINR += d.amountPaid;
        }
      }
    }

    return res.json({
      success: true,
      data: {
        ...project,
        riskAnalysis,
        metrics: {
          totalParcels,
          surveyedParcels,
          awardedParcels,
          disbursedParcels,
          totalAwardApprovedINR,
          totalAwardDisbursedINR,
          disbursementProgressPercent:
            totalAwardApprovedINR > 0
              ? Math.round((totalAwardDisbursedINR / totalAwardApprovedINR) * 100)
              : 0,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = ProjectCreateSchema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...validated,
        currentStage: ProjectStage.STAGE_1_REQUISITION,
        status: 'SUBMITTED',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Land Acquisition Project Proposal registered successfully',
      data: project,
    });
  } catch (error) {
    return next(error);
  }
}

export async function transitionProjectStage(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const { targetStage, remarks, approvalDocumentRef } =
      ProjectStageTransitionSchema.parse(req.body);

    // Enforce RFCTLARR statutory rules
    const validation = await StatutoryService.validateStageTransition(id, targetStage);
    if (!validation.canTransition) {
      return res.status(400).json({
        success: false,
        message: 'Statutory compliance validation failed',
        errors: validation.errors,
      });
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        currentStage: targetStage,
      },
    });

    // Re-evaluate risk profile
    await RiskService.evaluateProjectRisk(id);

    return res.json({
      success: true,
      message: `Project successfully advanced to ${targetStage}`,
      data: updatedProject,
    });
  } catch (error) {
    return next(error);
  }
}
