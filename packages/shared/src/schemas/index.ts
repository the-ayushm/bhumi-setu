import { z } from 'zod';
import {
  UserRole,
  ProjectStage,
  ProjectStatus,
  Sector,
  NotificationSection,
  NotificationStatus,
  ParcelStatus,
  LandType,
  AwardStatus,
  DisbursementStatus,
  SocialCategory,
  HousingEntitlementStatus,
} from '../types/index.js';

export const LoginSchema = z.object({
  email: z.string().email('Valid official government email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const ProjectCreateSchema = z.object({
  name: z.string().min(5, 'Project name must have at least 5 characters'),
  code: z.string().min(3, 'Project code is required'),
  description: z.string().min(10, 'Detailed description is required'),
  sector: z.nativeEnum(Sector),
  requisitioningAgency: z.string().min(2, 'Requisitioning agency is required'),
  state: z.string().min(2, 'State is required'),
  district: z.string().min(2, 'District is required'),
  totalAreaHectares: z.number().positive('Total area must be positive'),
  estimatedBudgetCr: z.number().positive('Estimated budget must be positive'),
  compensationBudgetCr: z.number().positive('Compensation budget must be positive'),
});

export const ProjectStageTransitionSchema = z.object({
  targetStage: z.nativeEnum(ProjectStage),
  remarks: z.string().min(5, 'Statutory verification remarks are mandatory'),
  approvalDocumentRef: z.string().optional(),
});

export const NotificationCreateSchema = z.object({
  projectId: z.string().uuid(),
  section: z.nativeEnum(NotificationSection),
  gazetteNumber: z.string().min(3, 'Official Gazette notification number is required'),
  issueDate: z.string(),
  expiryDate: z.string().optional(),
  newspaperLocal1: z.string().optional(),
  newspaperLocal2: z.string().optional(),
  documentUrl: z.string().url().optional(),
});

export const LandParcelCreateSchema = z.object({
  projectId: z.string().uuid(),
  village: z.string().min(2),
  tehsil: z.string().min(2),
  khasraNumber: z.string().min(1),
  areaAcres: z.number().positive(),
  landType: z.nativeEnum(LandType),
  ownerName: z.string().min(2),
  ownerAadhaarMasked: z.string().optional(),
  ownerBankAccMasked: z.string().optional(),
  ownerIfsc: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  treesCount: z.number().int().nonnegative().default(0),
  structuresCount: z.number().int().nonnegative().default(0),
});

export const FieldSurveyUpdateSchema = z.object({
  treesCount: z.number().int().nonnegative(),
  structuresCount: z.number().int().nonnegative(),
  fieldNotes: z.string().optional(),
  verifiedLatitude: z.number().optional(),
  verifiedLongitude: z.number().optional(),
});

export const AwardCreateSchema = z.object({
  parcelId: z.string().uuid(),
  baseRatePerAcre: z.number().positive(),
  ruralMultiplier: z.number().min(1.0).max(2.0).default(1.5),
  assetsValue: z.number().nonnegative().default(0),
  section11Date: z.string(),
  awardDate: z.string(),
});

export const DisplacedFamilyCreateSchema = z.object({
  projectId: z.string().uuid(),
  familyHeadName: z.string().min(2),
  category: z.nativeEnum(SocialCategory),
  membersCount: z.number().int().positive(),
  isLosingHomestead: z.boolean().default(false),
  isLosingLivelihood: z.boolean().default(false),
  housingEntitlementStatus: z.nativeEnum(HousingEntitlementStatus).default(HousingEntitlementStatus.PENDING),
});

export const DisbursementTriggerSchema = z.object({
  awardId: z.string().uuid(),
  remarks: z.string().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;
export type ProjectStageTransitionInput = z.infer<typeof ProjectStageTransitionSchema>;
export type NotificationCreateInput = z.infer<typeof NotificationCreateSchema>;
export type LandParcelCreateInput = z.infer<typeof LandParcelCreateSchema>;
export type FieldSurveyUpdateInput = z.infer<typeof FieldSurveyUpdateSchema>;
export type AwardCreateInput = z.infer<typeof AwardCreateSchema>;
export type DisplacedFamilyCreateInput = z.infer<typeof DisplacedFamilyCreateSchema>;
export type DisbursementTriggerInput = z.infer<typeof DisbursementTriggerSchema>;
