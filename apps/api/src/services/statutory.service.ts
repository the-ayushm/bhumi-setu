import { prisma } from '../config/prisma.js';
import { ProjectStage } from '@sih/shared';

export interface StageValidationResult {
  canTransition: boolean;
  errors: string[];
}

export class StatutoryService {
  /**
   * Enforces statutory prerequisites before advancing a project's RFCTLARR stage
   */
  static async validateStageTransition(
    projectId: string,
    targetStage: ProjectStage
  ): Promise<StageValidationResult> {
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
      return { canTransition: false, errors: ['Project record not found.'] };
    }

    const errors: string[] = [];

    // Stage 3 requires Section 4 SIA published
    if (targetStage === ProjectStage.STAGE_3_PRELIMINARY_NOTIFICATION) {
      const hasSia = project.notifications.some(
        (n: any) => n.section === 'SECTION_4_SIA' && n.status === 'PUBLISHED'
      );
      if (!hasSia) {
        errors.push(
          'Section 4 SIA (Social Impact Assessment) notification must be published and approved before issuing Section 11 Preliminary Notification.'
        );
      }
    }

    // Stage 5 Declaration requires Section 11 Preliminary Notification published
    if (targetStage === ProjectStage.STAGE_5_DECLARATION) {
      const hasSec11 = project.notifications.some(
        (n: any) => n.section === 'SECTION_11_PRELIMINARY' && n.status === 'PUBLISHED'
      );
      if (!hasSec11) {
        errors.push(
          'Section 11 Preliminary Notification must be published in official gazette and newspapers before issuing Section 19 Declaration.'
        );
      }
    }

    // Stage 6 Claims & Award requires Section 19 Declaration
    if (targetStage === ProjectStage.STAGE_6_CLAIMS_AWARD) {
      const hasSec19 = project.notifications.some(
        (n: any) => n.section === 'SECTION_19_DECLARATION' && n.status === 'PUBLISHED'
      );
      if (!hasSec19) {
        errors.push(
          'Section 19 Declaration of Acquisition must be formally published before determining final awards under Section 26-30.'
        );
      }
    }

    // Stage 8 Possession requires 100% compensation disbursement under Section 38
    if (targetStage === ProjectStage.STAGE_8_POSSESSION) {
      const totalParcels = project.parcels.length;
      if (totalParcels === 0) {
        errors.push('No land parcels registered for this project.');
      } else {
        const undisbursed = project.parcels.filter(
          (p: any) => !p.valuationAward || p.valuationAward.disbursements.length === 0
        );
        if (undisbursed.length > 0) {
          errors.push(
            `Statutory violation under Section 38: Possession CANNOT be taken until full monetary compensation is disbursed to all land owners. (${undisbursed.length} parcels pending disbursement)`
          );
        }
      }
    }

    return {
      canTransition: errors.length === 0,
      errors,
    };
  }
}
