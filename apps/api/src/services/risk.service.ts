import { prisma } from '../config/prisma.js';
import { RiskLevel, RiskIndicatorDetail } from '@sih/shared';

export class RiskService {
  /**
   * Evaluates predictive risks, statutory deadlines and bottlenecks for a project
   */
  static async evaluateProjectRisk(projectId: string): Promise<RiskIndicatorDetail> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        notifications: true,
        parcels: {
          include: {
            valuationAward: {
              include: { disbursements: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new Error(`Project not found: ${projectId}`);
    }

    let riskScore = 10; // Baseline
    let hasSec11LapseWarning = false;
    let statutoryLapseDaysRemaining: number | null = null;
    let summary = 'Project operating within normal statutory parameters.';

    // 1. Check Section 11 to Section 19 Statutory Clock (12-month legal limit)
    const sec11 = project.notifications.find(
      (n) => n.section === 'SECTION_11_PRELIMINARY' && n.status === 'PUBLISHED'
    );
    const sec19 = project.notifications.find(
      (n) => n.section === 'SECTION_19_DECLARATION' && n.status === 'PUBLISHED'
    );

    if (sec11 && !sec19) {
      const issueDate = new Date(sec11.issueDate);
      const lapseDeadline = new Date(issueDate);
      lapseDeadline.setMonth(lapseDeadline.getMonth() + 12);

      const now = new Date();
      const diffDays = Math.ceil(
        (lapseDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      statutoryLapseDaysRemaining = diffDays;

      if (diffDays <= 90) {
        hasSec11LapseWarning = true;
        riskScore += 45;
        summary = `CRITICAL STATUTORY DEADLINE: Only ${diffDays} days left to issue Section 19 declaration before Section 11 preliminary notification lapses under RFCTLARR Act!`;
      } else if (diffDays <= 180) {
        riskScore += 25;
        summary = `Statutory clock active: ${diffDays} days remaining for Section 19 declaration.`;
      }
    }

    // 2. Litigation / Court Stays
    const litigationParcels = project.parcels.filter(
      (p) => p.status === 'LITIGATION_STAY'
    );
    const litigationParcelCount = litigationParcels.length;
    if (litigationParcelCount > 0) {
      riskScore += Math.min(30, litigationParcelCount * 10);
      summary += ` ${litigationParcelCount} parcel(s) flagged under judicial stay/litigation.`;
    }

    // 3. Objections Ratio
    let totalObjections = 0;
    let resolvedObjections = 0;
    for (const notif of project.notifications) {
      totalObjections += notif.objectionsCount;
      resolvedObjections += notif.objectionsResolved;
    }
    const pendingObjections = totalObjections - resolvedObjections;
    const objectionRatio = totalObjections > 0 ? pendingObjections / totalObjections : 0;
    if (pendingObjections > 10) {
      riskScore += 15;
    }

    // 4. Disbursement Lag Ratio
    const parcelsWithAward = project.parcels.filter((p) => p.valuationAward);
    const disbursedParcels = project.parcels.filter(
      (p) => p.valuationAward && p.valuationAward.disbursements.length > 0
    );
    const totalAwardsCount = parcelsWithAward.length;
    const disbursedAwardsCount = disbursedParcels.length;
    const disbursementLagRatio =
      totalAwardsCount > 0 ? (totalAwardsCount - disbursedAwardsCount) / totalAwardsCount : 0;

    if (totalAwardsCount >= 5 && disbursementLagRatio > 0.4) {
      riskScore += 20;
    }

    // Cap score at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    let riskLevel = RiskLevel.LOW;
    if (riskScore >= 75) riskLevel = RiskLevel.CRITICAL;
    else if (riskScore >= 50) riskLevel = RiskLevel.HIGH;
    else if (riskScore >= 25) riskLevel = RiskLevel.MEDIUM;

    // Update in project record
    await prisma.project.update({
      where: { id: projectId },
      data: {
        riskScore,
        riskLevel: riskLevel.toString(),
      },
    });

    return {
      projectId: project.id,
      projectCode: project.code,
      projectName: project.name,
      state: project.state,
      district: project.district,
      riskScore,
      riskLevel,
      statutoryLapseDaysRemaining,
      hasSec11LapseWarning,
      disbursementLagRatio: Math.round(disbursementLagRatio * 100) / 100,
      objectionRatio: Math.round(objectionRatio * 100) / 100,
      litigationParcelCount,
      summary,
    };
  }

  /**
   * Returns risk evaluation for all active projects
   */
  static async getAllProjectRisks(): Promise<RiskIndicatorDetail[]> {
    const projects = await prisma.project.findMany({ select: { id: true } });
    const results: RiskIndicatorDetail[] = [];
    for (const p of projects) {
      const risk = await this.evaluateProjectRisk(p.id);
      results.push(risk);
    }
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }
}
