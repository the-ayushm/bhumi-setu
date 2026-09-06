import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';

export async function getMISReport(req: Request, res: Response, next: NextFunction) {
  try {
    const { format } = req.query;

    const projects = await prisma.project.findMany({
      include: {
        parcels: {
          include: {
            valuationAward: {
              include: { disbursements: true },
            },
          },
        },
        notifications: true,
        displacedFamilies: true,
      },
      orderBy: { state: 'asc' },
    });

    const reportRows = projects.map((p) => {
      let awardedAmount = 0;
      let disbursedAmount = 0;
      for (const parcel of p.parcels) {
        if (parcel.valuationAward) {
          awardedAmount += parcel.valuationAward.totalAwardAmount;
          for (const d of parcel.valuationAward.disbursements) {
            disbursedAmount += d.amountPaid;
          }
        }
      }

      return {
        projectCode: p.code,
        projectName: p.name,
        sector: p.sector,
        state: p.state,
        district: p.district,
        agency: p.requisitioningAgency,
        currentStage: p.currentStage,
        totalAreaHectares: p.totalAreaHectares,
        parcelsCount: p.parcels.length,
        displacedFamiliesCount: p.displacedFamilies.length,
        awardedAmountCr: Math.round((awardedAmount / 10000000) * 100) / 100,
        disbursedAmountCr: Math.round((disbursedAmount / 10000000) * 100) / 100,
        riskLevel: p.riskLevel,
        riskScore: p.riskScore,
      };
    });

    if (format === 'csv') {
      const headers = [
        'Project Code',
        'Project Name',
        'Sector',
        'State',
        'District',
        'Agency',
        'Current Stage',
        'Area (Ha)',
        'Parcels',
        'Displaced Families',
        'Awarded (Cr INR)',
        'Disbursed (Cr INR)',
        'Risk Level',
        'Risk Score',
      ];

      const rows = reportRows.map((r) => [
        `"${r.projectCode}"`,
        `"${r.projectName}"`,
        `"${r.sector}"`,
        `"${r.state}"`,
        `"${r.district}"`,
        `"${r.agency}"`,
        `"${r.currentStage}"`,
        r.totalAreaHectares,
        r.parcelsCount,
        r.displacedFamiliesCount,
        r.awardedAmountCr,
        r.disbursedAmountCr,
        `"${r.riskLevel}"`,
        r.riskScore,
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="MoRD_Land_Acquisition_MIS_${Date.now()}.csv"`
      );
      return res.send(csvContent);
    }

    return res.json({
      success: true,
      reportTitle: 'Ministry of Rural Development — Land Acquisition National MIS Summary',
      generatedAt: new Date().toISOString(),
      rowCount: reportRows.length,
      data: reportRows,
    });
  } catch (error) {
    return next(error);
  }
}
