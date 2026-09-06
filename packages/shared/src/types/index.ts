export enum UserRole {
  NATIONAL_ADMIN = 'NATIONAL_ADMIN',
  STATE_NODAL_OFFICER = 'STATE_NODAL_OFFICER',
  DISTRICT_COLLECTOR = 'DISTRICT_COLLECTOR',
  LAND_ACQUISITION_OFFICER = 'LAND_ACQUISITION_OFFICER',
  REQUISITIONING_AGENCY = 'REQUISITIONING_AGENCY',
  FIELD_SURVEYOR = 'FIELD_SURVEYOR',
  CITIZEN_VIEWER = 'CITIZEN_VIEWER',
}

export enum ProjectStage {
  STAGE_1_REQUISITION = 'STAGE_1_REQUISITION',
  STAGE_2_SIA = 'STAGE_2_SIA',
  STAGE_3_PRELIMINARY_NOTIFICATION = 'STAGE_3_PRELIMINARY_NOTIFICATION',
  STAGE_4_RR_SCHEME = 'STAGE_4_RR_SCHEME',
  STAGE_5_DECLARATION = 'STAGE_5_DECLARATION',
  STAGE_6_CLAIMS_AWARD = 'STAGE_6_CLAIMS_AWARD',
  STAGE_7_DISBURSEMENT = 'STAGE_7_DISBURSEMENT',
  STAGE_8_POSSESSION = 'STAGE_8_POSSESSION',
  COMPLETED = 'COMPLETED',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  STAYED = 'STAYED',
  COMPLETED = 'COMPLETED',
}

export enum Sector {
  HIGHWAYS = 'HIGHWAYS',
  RAILWAYS = 'RAILWAYS',
  IRRIGATION = 'IRRIGATION',
  RENEWABLE_ENERGY = 'RENEWABLE_ENERGY',
  INDUSTRIAL_CORRIDOR = 'INDUSTRIAL_CORRIDOR',
  DEFENCE = 'DEFENCE',
  URBAN_INFRA = 'URBAN_INFRA',
}

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum NotificationSection {
  SECTION_4_SIA = 'SECTION_4_SIA',
  SECTION_11_PRELIMINARY = 'SECTION_11_PRELIMINARY',
  SECTION_19_DECLARATION = 'SECTION_19_DECLARATION',
}

export enum NotificationStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  EXPIRED = 'EXPIRED',
  SUPERSEDED = 'SUPERSEDED',
}

export enum ParcelStatus {
  NOTIFIED = 'NOTIFIED',
  SURVEYED = 'SURVEYED',
  VALUATION_DONE = 'VALUATION_DONE',
  AWARD_APPROVED = 'AWARD_APPROVED',
  DISBURSED = 'DISBURSED',
  POSSESSION_TAKEN = 'POSSESSION_TAKEN',
  LITIGATION_STAY = 'LITIGATION_STAY',
}

export enum LandType {
  RURAL_AGRICULTURAL = 'RURAL_AGRICULTURAL',
  RURAL_HOMESTEAD = 'RURAL_HOMESTEAD',
  SEMI_URBAN = 'SEMI_URBAN',
  URBAN_COMMERCIAL = 'URBAN_COMMERCIAL',
  FOREST_GOVERNMENT = 'FOREST_GOVERNMENT',
}

export enum AwardStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED_COLLECTOR = 'APPROVED_COLLECTOR',
  CHALLENGED = 'CHALLENGED',
}

export enum DisbursementStatus {
  PENDING_AUTHORIZATION = 'PENDING_AUTHORIZATION',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED',
}

export enum PaymentMode {
  PFMS_DBT = 'PFMS_DBT',
  NEFT = 'NEFT',
  RTGS = 'RTGS',
  ESCROW_DEPOSIT = 'ESCROW_DEPOSIT',
}

export enum SocialCategory {
  SC = 'SC',
  ST = 'ST',
  OBC = 'OBC',
  GENERAL = 'GENERAL',
  BPL = 'BPL',
}

export enum HousingEntitlementStatus {
  NOT_APPLICABLE = 'NOT_APPLICABLE',
  ALLOTTED_PUCCA_HOUSE = 'ALLOTTED_PUCCA_HOUSE',
  GRANT_IN_LIEU_INR_150000 = 'GRANT_IN_LIEU_INR_150000',
  PENDING = 'PENDING',
}

export enum OverallRRStatus {
  SURVEYED = 'SURVEYED',
  SCHEME_APPROVED = 'SCHEME_APPROVED',
  PACKAGE_DISBURSED = 'PACKAGE_DISBURSED',
  RELOCATED = 'RELOCATED',
}

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  designation: string;
  state?: string | null;
  district?: string | null;
  department?: string | null;
}

export interface StatutoryStageDetail {
  stage: ProjectStage;
  label: string;
  actSection: string;
  description: string;
  order: number;
}

export interface CompensationCalculationInput {
  baseRatePerAcre: number;
  areaAcres: number;
  isRural: boolean;
  ruralMultiplier?: number; // Defaults to 1.5 or 2.0 based on distance
  assetsValue: number; // trees + structures
  section11Date: string | Date;
  awardDate: string | Date;
}

export interface CompensationCalculationResult {
  marketValueLand: number;
  ruralMultiplier: number;
  multipliedMarketValue: number;
  assetsValue: number;
  subTotalBeforeSolatium: number;
  solatiumAmount: number; // 100% of (multipliedMarketValue + assetsValue)
  daysBetweenSec11AndAward: number;
  additionalInterestAmount: number; // 12% p.a.
  totalAwardAmount: number;
}

export interface RiskIndicatorDetail {
  projectId: string;
  projectCode: string;
  projectName: string;
  state: string;
  district: string;
  riskScore: number;
  riskLevel: RiskLevel;
  statutoryLapseDaysRemaining?: number | null;
  hasSec11LapseWarning: boolean;
  disbursementLagRatio: number;
  objectionRatio: number;
  litigationParcelCount: number;
  summary: string;
}

export interface RolePermissions {
  label: string;
  allowedRoutes: string[];
  canCreateProject: boolean;
  canTransitionStage: boolean;
  canPublishGazette: boolean;
  canFormulateAward: boolean;
  canApproveAward: boolean;
  canTriggerDisbursement: boolean;
  canConductSurvey: boolean;
  canViewInternalRisk: boolean;
  canViewAuditLogs: boolean;
  canViewSensitivePII: boolean;
  jurisdictionScope: 'NATIONAL' | 'STATE' | 'DISTRICT' | 'AGENCY' | 'FIELD' | 'PUBLIC';
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.NATIONAL_ADMIN]: {
    label: 'National Admin (MoRD)',
    allowedRoutes: [
      '/dashboard',
      '/projects',
      '/parcels',
      '/notifications',
      '/awards',
      '/rr-monitoring',
      '/disbursements',
      '/risk-engine',
      '/mis-reports',
      '/field-survey',
    ],
    canCreateProject: true,
    canTransitionStage: true,
    canPublishGazette: true,
    canFormulateAward: true,
    canApproveAward: true,
    canTriggerDisbursement: true,
    canConductSurvey: true,
    canViewInternalRisk: true,
    canViewAuditLogs: true,
    canViewSensitivePII: true,
    jurisdictionScope: 'NATIONAL',
  },
  [UserRole.STATE_NODAL_OFFICER]: {
    label: 'State Nodal Officer',
    allowedRoutes: [
      '/dashboard',
      '/projects',
      '/parcels',
      '/notifications',
      '/awards',
      '/rr-monitoring',
      '/disbursements',
      '/risk-engine',
      '/mis-reports',
    ],
    canCreateProject: false,
    canTransitionStage: true,
    canPublishGazette: true,
    canFormulateAward: false,
    canApproveAward: false,
    canTriggerDisbursement: false,
    canConductSurvey: false,
    canViewInternalRisk: true,
    canViewAuditLogs: true,
    canViewSensitivePII: true,
    jurisdictionScope: 'STATE',
  },
  [UserRole.DISTRICT_COLLECTOR]: {
    label: 'District Collector',
    allowedRoutes: [
      '/dashboard',
      '/projects',
      '/parcels',
      '/notifications',
      '/awards',
      '/rr-monitoring',
      '/disbursements',
      '/risk-engine',
    ],
    canCreateProject: false,
    canTransitionStage: true,
    canPublishGazette: true,
    canFormulateAward: true,
    canApproveAward: true,
    canTriggerDisbursement: true,
    canConductSurvey: true,
    canViewInternalRisk: true,
    canViewAuditLogs: true,
    canViewSensitivePII: true,
    jurisdictionScope: 'DISTRICT',
  },
  [UserRole.LAND_ACQUISITION_OFFICER]: {
    label: 'Competent Authority (CALA)',
    allowedRoutes: [
      '/dashboard',
      '/projects',
      '/parcels',
      '/notifications',
      '/awards',
      '/rr-monitoring',
      '/disbursements',
    ],
    canCreateProject: false,
    canTransitionStage: false,
    canPublishGazette: false,
    canFormulateAward: true,
    canApproveAward: true,
    canTriggerDisbursement: true,
    canConductSurvey: true,
    canViewInternalRisk: false,
    canViewAuditLogs: false,
    canViewSensitivePII: true,
    jurisdictionScope: 'DISTRICT',
  },
  [UserRole.REQUISITIONING_AGENCY]: {
    label: 'Requisitioning Agency (NHAI)',
    allowedRoutes: [
      '/dashboard',
      '/projects',
      '/parcels',
      '/notifications',
      '/awards',
      '/disbursements',
      '/risk-engine',
    ],
    canCreateProject: true,
    canTransitionStage: false,
    canPublishGazette: false,
    canFormulateAward: false,
    canApproveAward: false,
    canTriggerDisbursement: false,
    canConductSurvey: false,
    canViewInternalRisk: true,
    canViewAuditLogs: false,
    canViewSensitivePII: true,
    jurisdictionScope: 'AGENCY',
  },
  [UserRole.FIELD_SURVEYOR]: {
    label: 'Field Surveyor',
    allowedRoutes: ['/dashboard', '/projects', '/parcels', '/field-survey'],
    canCreateProject: false,
    canTransitionStage: false,
    canPublishGazette: false,
    canFormulateAward: false,
    canApproveAward: false,
    canTriggerDisbursement: false,
    canConductSurvey: true,
    canViewInternalRisk: false,
    canViewAuditLogs: false,
    canViewSensitivePII: true,
    jurisdictionScope: 'FIELD',
  },
  [UserRole.CITIZEN_VIEWER]: {
    label: 'Citizen Viewer',
    allowedRoutes: ['/dashboard', '/projects', '/parcels', '/notifications'],
    canCreateProject: false,
    canTransitionStage: false,
    canPublishGazette: false,
    canFormulateAward: false,
    canApproveAward: false,
    canTriggerDisbursement: false,
    canConductSurvey: false,
    canViewInternalRisk: false,
    canViewAuditLogs: false,
    canViewSensitivePII: false,
    jurisdictionScope: 'PUBLIC',
  },
};

export function hasPermission(
  role: UserRole,
  permission: keyof Omit<RolePermissions, 'label' | 'allowedRoutes' | 'jurisdictionScope'>
): boolean {
  const perm = ROLE_PERMISSIONS[role];
  return perm ? Boolean(perm[permission]) : false;
}

export function isRouteAllowed(role: UserRole, routePath: string): boolean {
  const perm = ROLE_PERMISSIONS[role];
  if (!perm) return false;
  // Exact match or base path match
  return perm.allowedRoutes.some(
    (allowed) => routePath === allowed || routePath.startsWith(`${allowed}/`) || routePath.startsWith(`${allowed}?`)
  );
}

