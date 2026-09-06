import { ProjectStage, StatutoryStageDetail } from '../types/index.js';

export const RFCTLARR_STAGES: StatutoryStageDetail[] = [
  {
    stage: ProjectStage.STAGE_1_REQUISITION,
    label: 'Requisition & Preliminary Proposal',
    actSection: 'Section 3(e) / Rules',
    description: 'Submission of land requirement, DPR, and preliminary alignment by Requisitioning Agency.',
    order: 1,
  },
  {
    stage: ProjectStage.STAGE_2_SIA,
    label: 'Social Impact Assessment (SIA)',
    actSection: 'Sections 4 to 9',
    description: 'Institution of SIA study, SIMP preparation, public hearing, and Expert Group appraisal.',
    order: 2,
  },
  {
    stage: ProjectStage.STAGE_3_PRELIMINARY_NOTIFICATION,
    label: 'Preliminary Notification & Objections',
    actSection: 'Sections 11 to 15',
    description: 'Gazette publication of Sec 11, survey of land, hearing of objections under Section 15.',
    order: 3,
  },
  {
    stage: ProjectStage.STAGE_4_RR_SCHEME,
    label: 'R&R Scheme Formulation',
    actSection: 'Sections 16 to 18',
    description: 'Census of affected families, draft R&R scheme preparation, public hearing, and Collector review.',
    order: 4,
  },
  {
    stage: ProjectStage.STAGE_5_DECLARATION,
    label: 'Declaration of Acquisition',
    actSection: 'Section 19',
    description: 'Official declaration published in Gazette. MUST be issued within 12 months of Section 11.',
    order: 5,
  },
  {
    stage: ProjectStage.STAGE_6_CLAIMS_AWARD,
    label: 'Notice, Valuation & Award',
    actSection: 'Sections 21 to 30',
    description: 'Notice to persons interested, determination of market value, 100% solatium, 12% interest, and R&R Award (Sec 31).',
    order: 6,
  },
  {
    stage: ProjectStage.STAGE_7_DISBURSEMENT,
    label: 'Compensation & R&R Disbursement',
    actSection: 'Sections 38, 77 & DBT Rules',
    description: 'Direct Benefit Transfer (DBT via PFMS) into beneficiary Aadhaar-seeded bank accounts.',
    order: 7,
  },
  {
    stage: ProjectStage.STAGE_8_POSSESSION,
    label: 'Possession & Land Handover',
    actSection: 'Section 38 & 40',
    description: 'Collector takes physical possession ONLY after full monetary compensation & R&R entitlements are disbursed.',
    order: 8,
  },
  {
    stage: ProjectStage.COMPLETED,
    label: 'Revenue Mutation & Project Handover',
    actSection: 'State Land Revenue Code',
    description: 'Land record mutation in favour of Requisitioning Body (Bhulekh / Bhoomi) and project completion.',
    order: 9,
  },
];

export const STATUTORY_TIMELINES = {
  SEC_11_TO_SEC_19_MAX_MONTHS: 12, // Section 19(7): declaration lapses if not issued within 12 months of Sec 11
  SEC_15_OBJECTIONS_DAYS: 60, // Section 15(1): 60 days to file objections
  SOLATIUM_PERCENTAGE: 100, // Section 30(1): 100% of market value + assets
  ADDITIONAL_COMPENSATION_INTEREST_ANNUAL: 0.12, // Section 30(3): 12% per annum
  DEFAULT_RURAL_MULTIPLIER: 1.5, // Between 1.0 and 2.0 based on distance from urban area
  MIN_RURAL_MULTIPLIER: 1.0,
  MAX_RURAL_MULTIPLIER: 2.0,
  SUBSISTENCE_GRANT_MONTHLY_INR: 3000,
  SUBSISTENCE_GRANT_MONTHS: 12,
  RESETTLEMENT_ALLOWANCE_ONE_TIME_INR: 50000,
  RURAL_HOUSING_MIN_AREA_SQMT: 50,
};
