import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller.js';
import {
  listProjects,
  getProjectById,
  createProject,
  transitionProjectStage,
} from '../controllers/project.controller.js';
import {
  listParcels,
  getParcelById,
  getParcelsGeoJSON,
  createParcel,
  updateFieldSurvey,
} from '../controllers/parcel.controller.js';
import {
  listNotifications,
  createNotification,
  recordObjection,
} from '../controllers/notification.controller.js';
import {
  calculateAwardPreview,
  createAward,
  listAwardsByProject,
} from '../controllers/award.controller.js';
import {
  listDisbursements,
  triggerDisbursement,
  getDisbursementStats,
} from '../controllers/disbursement.controller.js';
import {
  listFamilies,
  createFamily,
  updateFamilyEntitlement,
  getRRSummaryByProject,
} from '../controllers/rr.controller.js';
import {
  getNationalSummary,
  getStateRankings,
  getRiskIndicators,
} from '../controllers/analytics.controller.js';
import { getMISReport } from '../controllers/report.controller.js';
import { listAuditLogs } from '../controllers/audit.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { recordAuditLog } from '../middlewares/audit.js';
import { UserRole } from '@sih/shared';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date().toISOString(),
    service: 'Ministry of Rural Development — Land Acquisition & Management Engine',
    version: '1.0.0-SIH26016',
  });
});

// Authentication Routes
router.post('/auth/login', login);
router.get('/auth/me', authenticate, getMe);

// Project Routes
router.get('/projects', listProjects);
router.get('/projects/:id', getProjectById);
router.post(
  '/projects',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.REQUISITIONING_AGENCY),
  recordAuditLog('PROJECT_PROPOSAL_CREATED', 'PROJECT'),
  createProject
);
router.patch(
  '/projects/:id/stage',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.STATE_NODAL_OFFICER, UserRole.DISTRICT_COLLECTOR),
  recordAuditLog('PROJECT_STAGE_TRANSITION', 'PROJECT'),
  transitionProjectStage
);

// Cadastral Parcel & GIS Routes
router.get('/parcels/geojson', getParcelsGeoJSON);
router.get('/parcels', listParcels);
router.get('/parcels/:id', getParcelById);
router.post(
  '/parcels',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.LAND_ACQUISITION_OFFICER, UserRole.FIELD_SURVEYOR),
  recordAuditLog('PARCEL_REGISTERED', 'PARCEL'),
  createParcel
);
router.patch(
  '/parcels/:id/field-survey',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.FIELD_SURVEYOR, UserRole.LAND_ACQUISITION_OFFICER),
  recordAuditLog('FIELD_SURVEY_RECORDED', 'PARCEL'),
  updateFieldSurvey
);

// Gazette Notification Routes (Sec 4, 11, 19)
router.get('/notifications', listNotifications);
router.post(
  '/notifications',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.STATE_NODAL_OFFICER, UserRole.DISTRICT_COLLECTOR),
  recordAuditLog('GAZETTE_NOTIFICATION_ISSUED', 'NOTIFICATION'),
  createNotification
);
router.post(
  '/notifications/:id/objections',
  authenticate,
  recordAuditLog('SECTION_15_OBJECTION_RECORDED', 'NOTIFICATION'),
  recordObjection
);

// Valuation & Award Routes (Sec 26-30)
router.post('/awards/calculate', calculateAwardPreview);
router.post(
  '/awards',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.DISTRICT_COLLECTOR, UserRole.LAND_ACQUISITION_OFFICER),
  recordAuditLog('VALUATION_AWARD_CREATED', 'AWARD'),
  createAward
);
router.get('/awards/project/:projectId', listAwardsByProject);

// Compensation Disbursement Routes (PFMS DBT)
router.get('/disbursements', listDisbursements);
router.get('/disbursements/stats', getDisbursementStats);
router.post(
  '/disbursements/trigger',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.DISTRICT_COLLECTOR, UserRole.LAND_ACQUISITION_OFFICER),
  recordAuditLog('PFMS_DISBURSEMENT_TRIGGERED', 'DISBURSEMENT'),
  triggerDisbursement
);

// R&R Routes (Sec 16, 31)
router.get('/rr/families', listFamilies);
router.get('/rr/summary/:projectId', getRRSummaryByProject);
router.post(
  '/rr/families',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.LAND_ACQUISITION_OFFICER, UserRole.DISTRICT_COLLECTOR),
  recordAuditLog('DISPLACED_FAMILY_REGISTERED', 'DISPLACED_FAMILY'),
  createFamily
);
router.patch(
  '/rr/families/:id/entitlement',
  authenticate,
  authorize(UserRole.NATIONAL_ADMIN, UserRole.DISTRICT_COLLECTOR, UserRole.LAND_ACQUISITION_OFFICER),
  recordAuditLog('RR_ENTITLEMENT_UPDATED', 'DISPLACED_FAMILY'),
  updateFamilyEntitlement
);

// Analytics & Risk Routes
router.get('/analytics/national-summary', getNationalSummary);
router.get('/analytics/state-rankings', getStateRankings);
router.get('/analytics/risk-indicators', getRiskIndicators);

// MIS Reports & Audit Logs
router.get('/reports/mis', getMISReport);
router.get('/audit-logs', listAuditLogs);

export default router;
