import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/prisma.js';
import { LandParcelCreateSchema, FieldSurveyUpdateSchema, UserRole } from '@sih/shared';
import { buildJurisdictionScope } from '../middlewares/auth.js';

export async function listParcels(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, status, village, search } = req.query;

    const { parcelWhere } = buildJurisdictionScope(req);
    const where: any = { ...parcelWhere };

    if (projectId && typeof projectId === 'string') where.projectId = projectId;
    if (status && typeof status === 'string') where.status = status;
    if (village && typeof village === 'string') where.village = village;
    if (search && typeof search === 'string') {
      where.AND = [
        ...(where.AND || []),
        {
          OR: [
            { khasraNumber: { contains: search } },
            { ownerName: { contains: search } },
            { village: { contains: search } },
          ],
        },
      ];
    }

    const parcels = await prisma.landParcel.findMany({
      where,
      include: {
        valuationAward: {
          include: {
            disbursements: true,
          },
        },
        project: {
          select: {
            id: true,
            code: true,
            name: true,
            state: true,
            district: true,
          },
        },
      },
      orderBy: { khasraNumber: 'asc' },
    });

    // Redact sensitive PII if user is CITIZEN_VIEWER or not logged in
    const isCitizenOrPublic = !req.user || req.user.role === UserRole.CITIZEN_VIEWER;
    const sanitizedParcels = isCitizenOrPublic
      ? parcels.map((p) => ({
          ...p,
          ownerAadhaarMasked: 'XXXX-XXXX-XXXX (Protected)',
          ownerBankAccMasked: 'XXXXXXXX (Protected)',
          ownerIfsc: 'Protected',
        }))
      : parcels;

    return res.json({
      success: true,
      count: sanitizedParcels.length,
      data: sanitizedParcels,
    });
  } catch (error) {
    return next(error);
  }
}

export async function getParcelById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const parcel = await prisma.landParcel.findUnique({
      where: { id },
      include: {
        project: true,
        valuationAward: {
          include: {
            disbursements: true,
          },
        },
      },
    });

    if (!parcel) {
      return res.status(404).json({ success: false, message: 'Land parcel not found' });
    }

    const isCitizenOrPublic = !req.user || req.user.role === UserRole.CITIZEN_VIEWER;
    const sanitized = isCitizenOrPublic
      ? {
          ...parcel,
          ownerAadhaarMasked: 'XXXX-XXXX-XXXX (Protected)',
          ownerBankAccMasked: 'XXXXXXXX (Protected)',
          ownerIfsc: 'Protected',
        }
      : parcel;

    return res.json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Returns GeoJSON FeatureCollection of parcels for GIS map rendering
 */
export async function getParcelsGeoJSON(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectId, status } = req.query;

    const where: any = {};
    if (projectId && typeof projectId === 'string') where.projectId = projectId;
    if (status && typeof status === 'string') where.status = status;

    const parcels = await prisma.landParcel.findMany({
      where,
      include: {
        valuationAward: true,
      },
    });

    const features = parcels.map((p) => {
      let geometry = null;
      if (p.geometryGeoJSON) {
        try {
          geometry = JSON.parse(p.geometryGeoJSON);
        } catch (e) {
          geometry = null;
        }
      }

      // If no stored polygon, synthesize a rectangular parcel geometry around its lat/lng center
      if (!geometry) {
        const offset = 0.0015;
        geometry = {
          type: 'Polygon',
          coordinates: [
            [
              [p.longitude - offset, p.latitude - offset],
              [p.longitude + offset, p.latitude - offset],
              [p.longitude + offset, p.latitude + offset],
              [p.longitude - offset, p.latitude + offset],
              [p.longitude - offset, p.latitude - offset],
            ],
          ],
        };
      }

      return {
        type: 'Feature',
        id: p.id,
        geometry,
        properties: {
          id: p.id,
          khasraNumber: p.khasraNumber,
          village: p.village,
          tehsil: p.tehsil,
          areaAcres: p.areaAcres,
          landType: p.landType,
          ownerName: p.ownerName,
          status: p.status,
          totalAward: p.valuationAward ? p.valuationAward.totalAwardAmount : null,
          treesCount: p.treesCount,
          structuresCount: p.structuresCount,
        },
      };
    });

    return res.json({
      type: 'FeatureCollection',
      features,
    });
  } catch (error) {
    return next(error);
  }
}

export async function createParcel(req: Request, res: Response, next: NextFunction) {
  try {
    const validated = LandParcelCreateSchema.parse(req.body);

    const parcel = await prisma.landParcel.create({
      data: validated,
    });

    return res.status(201).json({
      success: true,
      message: 'Cadastral land parcel registered successfully',
      data: parcel,
    });
  } catch (error) {
    return next(error);
  }
}

export async function updateFieldSurvey(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { id } = req.params;
    const validated = FieldSurveyUpdateSchema.parse(req.body);

    const updateData: any = {
      treesCount: validated.treesCount,
      structuresCount: validated.structuresCount,
      fieldNotes: validated.fieldNotes,
      status: 'SURVEYED',
      lastSurveyedAt: new Date(),
    };

    if (validated.verifiedLatitude && validated.verifiedLongitude) {
      updateData.latitude = validated.verifiedLatitude;
      updateData.longitude = validated.verifiedLongitude;
    }

    const parcel = await prisma.landParcel.update({
      where: { id },
      data: updateData,
    });

    return res.json({
      success: true,
      message: 'Field survey inspection record updated successfully',
      data: parcel,
    });
  } catch (error) {
    return next(error);
  }
}
