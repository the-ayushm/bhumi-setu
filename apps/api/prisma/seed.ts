import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding National Land Acquisition & Management System database...');

  // Clear existing records
  await prisma.auditLog.deleteMany();
  await prisma.disbursement.deleteMany();
  await prisma.valuationAward.deleteMany();
  await prisma.landParcel.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.displacedFamily.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Official Users
  const passwordHash = bcrypt.hashSync('Admin@123', 10);
  const collectorPass = bcrypt.hashSync('Collector@123', 10);
  const calaPass = bcrypt.hashSync('Cala@123', 10);
  const nhaiPass = bcrypt.hashSync('Nhai@123', 10);
  const surveyPass = bcrypt.hashSync('Survey@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin.mord@nic.in',
      passwordHash,
      name: 'Dr. Rajeshwar Sharma, IAS',
      designation: 'Joint Secretary (Land Resources)',
      role: 'NATIONAL_ADMIN',
      department: 'Ministry of Rural Development, New Delhi',
      phone: '+91-11-2338-4501',
    },
  });

  const stateNodal = await prisma.user.create({
    data: {
      email: 'nodal.maharashtra@nic.in',
      passwordHash,
      name: 'Smt. Vandana Suryavanshi, IAS',
      designation: 'Principal Secretary (Revenue)',
      role: 'STATE_NODAL_OFFICER',
      state: 'Maharashtra',
      department: 'Revenue & Forest Department, Mantralaya',
      phone: '+91-22-2202-6124',
    },
  });

  const collector = await prisma.user.create({
    data: {
      email: 'collector.pune@nic.in',
      passwordHash: collectorPass,
      name: 'Shri Vikramaditya Shinde, IAS',
      designation: 'Collector & District Magistrate',
      role: 'DISTRICT_COLLECTOR',
      state: 'Maharashtra',
      district: 'Pune',
      department: 'Office of the District Collectorate, Pune',
      phone: '+91-20-2612-3456',
    },
  });

  const cala = await prisma.user.create({
    data: {
      email: 'cala.nh66@nic.in',
      passwordHash: calaPass,
      name: 'Shri Anand Deshmukh, MCS',
      designation: 'Competent Authority for Land Acquisition (CALA) / SDO',
      role: 'LAND_ACQUISITION_OFFICER',
      state: 'Maharashtra',
      district: 'Pune',
      department: 'Sub-Divisional Revenue Office',
      phone: '+91-20-2445-8901',
    },
  });

  const nhai = await prisma.user.create({
    data: {
      email: 'nhai.projects@nic.in',
      passwordHash: nhaiPass,
      name: 'Er. R. K. Meena',
      designation: 'Project Director (PIU Pune)',
      role: 'REQUISITIONING_AGENCY',
      state: 'Maharashtra',
      district: 'Pune',
      department: 'National Highways Authority of India (NHAI)',
      phone: '+91-20-2567-1122',
    },
  });

  const surveyor = await prisma.user.create({
    data: {
      email: 'surveyor.amin@nic.in',
      passwordHash: surveyPass,
      name: 'Shri Santosh Patil',
      designation: 'Revenue Inspector / Head Surveyor',
      role: 'FIELD_SURVEYOR',
      state: 'Maharashtra',
      district: 'Pune',
      department: 'Taluka Land Records Office (Bhoomi Abhilekh)',
      phone: '+91-98220-44332',
    },
  });

  const citizenPass = bcrypt.hashSync('Citizen@123', 10);
  const citizen = await prisma.user.create({
    data: {
      email: 'citizen@gov.in',
      passwordHash: citizenPass,
      name: 'Shri Rajesh Kumar',
      designation: 'Public Citizen / Landowner',
      role: 'CITIZEN_VIEWER',
      department: 'Public Transparency Portal',
      phone: '+91-98765-43210',
    },
  });

  console.log('Official users seeded successfully (7 Personas).');

  // 2. Project 1: Bharatmala Pariyojana NH-66 Pune Ring Road Alignment (High Priority / In Progress)
  const proj1 = await prisma.project.create({
    data: {
      code: 'NHAI-MAH-PUN-RING-2024',
      name: 'Pune Western Ring Road Bypass (Package III - Bhor to Haveli)',
      description:
        'Greenfield 8-lane expressway bypass connecting Bhor, Haveli and Mulshi talukas to decongest national freight corridors under Bharatmala Pariyojana.',
      sector: 'HIGHWAYS',
      requisitioningAgency: 'National Highways Authority of India (NHAI)',
      state: 'Maharashtra',
      district: 'Pune',
      totalAreaHectares: 245.8,
      estimatedBudgetCr: 1850.0,
      compensationBudgetCr: 620.0,
      currentStage: 'STAGE_6_CLAIMS_AWARD',
      status: 'APPROVED',
      riskScore: 28.0,
      riskLevel: 'MEDIUM',
    },
  });

  // Project 1 Notifications (Section 4 SIA, Section 11 Preliminary, Section 19 Declaration)
  await prisma.notification.create({
    data: {
      projectId: proj1.id,
      section: 'SECTION_4_SIA',
      gazetteNumber: 'MAH-GAZ-PUN-2023-084',
      issueDate: new Date('2023-04-12'),
      expiryDate: new Date('2023-07-12'),
      newspaperLocal1: 'Sakal Daily (Pune Edition)',
      newspaperLocal2: 'Lokmat (Marathi)',
      documentUrl: 'https://egazette.gov.in/notices/SIA_Pune_RingRoad_2023.pdf',
      status: 'PUBLISHED',
      objectionsCount: 14,
      objectionsResolved: 14,
    },
  });

  const sec11_proj1 = await prisma.notification.create({
    data: {
      projectId: proj1.id,
      section: 'SECTION_11_PRELIMINARY',
      gazetteNumber: 'DL-(N)/04/0007/2023-24',
      issueDate: new Date('2023-10-18'),
      expiryDate: new Date('2023-12-18'),
      newspaperLocal1: 'Pudhari (Pune Edition)',
      newspaperLocal2: 'Maharashtra Times',
      documentUrl: 'https://egazette.gov.in/notices/Sec11_Pune_Bypass_2023.pdf',
      status: 'PUBLISHED',
      objectionsCount: 38,
      objectionsResolved: 35,
    },
  });

  await prisma.notification.create({
    data: {
      projectId: proj1.id,
      section: 'SECTION_19_DECLARATION',
      gazetteNumber: 'DL-(N)/04/0089/2024-25',
      issueDate: new Date('2024-05-15'),
      expiryDate: null,
      newspaperLocal1: 'Sakal Daily',
      newspaperLocal2: 'Loksatta',
      documentUrl: 'https://egazette.gov.in/notices/Sec19_Pune_Bypass_2024.pdf',
      status: 'PUBLISHED',
      objectionsCount: 8,
      objectionsResolved: 6,
    },
  });

  // Cadastral Land Parcels for Project 1 (Haveli Taluka villages)
  const parcelsP1Data = [
    {
      khasraNumber: '142/1',
      village: 'Khed Shivapur',
      tehsil: 'Haveli',
      areaAcres: 2.4,
      landType: 'RURAL_AGRICULTURAL',
      ownerName: 'Baburao Tukaram Jadhav',
      ownerAadhaarMasked: 'XXXX-XXXX-8912',
      ownerBankAccMasked: 'XXXXXX4819',
      ownerIfsc: 'SBIN0001245',
      status: 'DISBURSED',
      latitude: 18.3542,
      longitude: 73.8567,
      treesCount: 14,
      structuresCount: 1,
      baseRate: 3500000,
      assetsVal: 480000,
      disbursed: true,
    },
    {
      khasraNumber: '142/2A',
      village: 'Khed Shivapur',
      tehsil: 'Haveli',
      areaAcres: 1.8,
      landType: 'RURAL_AGRICULTURAL',
      ownerName: 'Sunita Dnyaneshwar Patil',
      ownerAadhaarMasked: 'XXXX-XXXX-3341',
      ownerBankAccMasked: 'XXXXXX9012',
      ownerIfsc: 'BARB0KHEDXX',
      status: 'DISBURSED',
      latitude: 18.3551,
      longitude: 73.8582,
      treesCount: 8,
      structuresCount: 0,
      baseRate: 3500000,
      assetsVal: 160000,
      disbursed: true,
    },
    {
      khasraNumber: '143/1',
      village: 'Khed Shivapur',
      tehsil: 'Haveli',
      areaAcres: 3.1,
      landType: 'RURAL_AGRICULTURAL',
      ownerName: 'Ramesh Laxman Chavan',
      ownerAadhaarMasked: 'XXXX-XXXX-7104',
      ownerBankAccMasked: 'XXXXXX1143',
      ownerIfsc: 'MAHB0000412',
      status: 'VALUATION_DONE',
      latitude: 18.3563,
      longitude: 73.8599,
      treesCount: 22,
      structuresCount: 2,
      baseRate: 3500000,
      assetsVal: 750000,
      disbursed: false,
    },
    {
      khasraNumber: '89/3',
      village: 'Nasrapur',
      tehsil: 'Bhor',
      areaAcres: 4.5,
      landType: 'RURAL_HOMESTEAD',
      ownerName: 'Kashinath Pandurang More',
      ownerAadhaarMasked: 'XXXX-XXXX-5529',
      ownerBankAccMasked: 'XXXXXX8871',
      ownerIfsc: 'CBIN0281456',
      status: 'VALUATION_DONE',
      latitude: 18.2891,
      longitude: 73.8942,
      treesCount: 30,
      structuresCount: 3,
      baseRate: 4200000,
      assetsVal: 1450000,
      disbursed: false,
    },
    {
      khasraNumber: '92/1B',
      village: 'Nasrapur',
      tehsil: 'Bhor',
      areaAcres: 1.2,
      landType: 'RURAL_AGRICULTURAL',
      ownerName: 'Anusaya Ramchandra Gaikwad',
      ownerAadhaarMasked: 'XXXX-XXXX-9901',
      ownerBankAccMasked: 'XXXXXX6621',
      ownerIfsc: 'PUNB0192800',
      status: 'LITIGATION_STAY',
      latitude: 18.2912,
      longitude: 73.8965,
      treesCount: 5,
      structuresCount: 1,
      baseRate: 4200000,
      assetsVal: 320000,
      disbursed: false,
    },
  ];

  for (const p of parcelsP1Data) {
    const parcel = await prisma.landParcel.create({
      data: {
        projectId: proj1.id,
        village: p.village,
        tehsil: p.tehsil,
        khasraNumber: p.khasraNumber,
        areaAcres: p.areaAcres,
        landType: p.landType,
        ownerName: p.ownerName,
        ownerAadhaarMasked: p.ownerAadhaarMasked,
        ownerBankAccMasked: p.ownerBankAccMasked,
        ownerIfsc: p.ownerIfsc,
        status: p.status,
        latitude: p.latitude,
        longitude: p.longitude,
        treesCount: p.treesCount,
        structuresCount: p.structuresCount,
        lastSurveyedAt: new Date('2024-03-20'),
      },
    });

    // Create Valuation Award (RFCTLARR Sec 26-30)
    const marketValueLand = Math.round(p.baseRate * p.areaAcres);
    const ruralMultiplier = 1.5;
    const multipliedMarketValue = Math.round(marketValueLand * ruralMultiplier);
    const subTotalBeforeSolatium = multipliedMarketValue + p.assetsVal;
    const solatiumAmount = subTotalBeforeSolatium; // 100% Solatium under Sec 30(1)
    const additionalInterestAmount = Math.round(multipliedMarketValue * 0.12 * 0.7); // 12% p.a.
    const totalAwardAmount = subTotalBeforeSolatium + solatiumAmount + additionalInterestAmount;

    const award = await prisma.valuationAward.create({
      data: {
        parcelId: parcel.id,
        baseRatePerAcre: p.baseRate,
        marketValueLand,
        ruralMultiplier,
        multipliedMarketValue,
        assetsValue: p.assetsVal,
        subTotalBeforeSolatium,
        solatiumAmount,
        daysBetweenSec11AndAward: 255,
        additionalInterestAmount,
        totalAwardAmount,
        awardDate: new Date('2024-06-30'),
        status: 'APPROVED_COLLECTOR',
        approvedBy: 'Shri Vikramaditya Shinde, IAS (District Collector)',
      },
    });

    if (p.disbursed) {
      await prisma.disbursement.create({
        data: {
          awardId: award.id,
          beneficiaryName: p.ownerName,
          amountPaid: totalAwardAmount,
          paymentMode: 'PFMS_DBT',
          utrReference: `PFMS2024RBI${Math.floor(100000000 + Math.random() * 900000000)}`,
          paymentDate: new Date('2024-07-15'),
          status: 'SUCCESS',
          remarks: 'Credited directly to beneficiary Aadhaar-linked account via PFMS DBT Gateway',
        },
      });
    }
  }

  // Affected Displaced Families for Project 1
  const familiesData = [
    {
      familyHeadName: 'Baburao Tukaram Jadhav',
      category: 'OBC',
      membersCount: 5,
      isLosingHomestead: true,
      isLosingLivelihood: true,
      housingEntitlementStatus: 'ALLOTTED_PUCCA_HOUSE',
      subsistenceGrantPaid: true,
      resettlementAllowancePaid: true,
      overallRRStatus: 'RELOCATED',
    },
    {
      familyHeadName: 'Santosh Vitthal Shinde',
      category: 'GENERAL',
      membersCount: 4,
      isLosingHomestead: false,
      isLosingLivelihood: true,
      housingEntitlementStatus: 'NOT_APPLICABLE',
      subsistenceGrantPaid: true,
      resettlementAllowancePaid: true,
      overallRRStatus: 'PACKAGE_DISBURSED',
    },
    {
      familyHeadName: 'Gopal Krishna Kamble',
      category: 'SC',
      membersCount: 6,
      isLosingHomestead: true,
      isLosingLivelihood: true,
      housingEntitlementStatus: 'GRANT_IN_LIEU_INR_150000',
      subsistenceGrantPaid: true,
      resettlementAllowancePaid: false,
      overallRRStatus: 'SCHEME_APPROVED',
    },
    {
      familyHeadName: 'Kashinath Pandurang More',
      category: 'OBC',
      membersCount: 7,
      isLosingHomestead: true,
      isLosingLivelihood: false,
      housingEntitlementStatus: 'PENDING',
      subsistenceGrantPaid: false,
      resettlementAllowancePaid: false,
      overallRRStatus: 'SURVEYED',
    },
  ];

  for (const f of familiesData) {
    await prisma.displacedFamily.create({
      data: {
        projectId: proj1.id,
        ...f,
      },
    });
  }

  // 3. Project 2: Eastern Dedicated Freight Corridor (EDFC Sonnagar to Dankuni) - CRITICAL RISK / SECTION 11 STATUTORY LAPSE WARNING
  const lapseDeadlineProj2 = new Date();
  lapseDeadlineProj2.setDate(lapseDeadlineProj2.getDate() + 42); // Only 42 days remaining to issue Sec 19!

  const proj2 = await prisma.project.create({
    data: {
      code: 'DFCCIL-EDFC-SON-DAN-2023',
      name: 'Eastern Dedicated Freight Corridor (Sonnagar - Gomoh Section)',
      description:
        'Electrified heavy-haul railway freight line acquisition spanning Rohtas, Gaya and Dhanbad districts to bypass saturated golden quadrilateral tracks.',
      sector: 'RAILWAYS',
      requisitioningAgency: 'Dedicated Freight Corridor Corporation of India (DFCCIL)',
      state: 'Bihar',
      district: 'Gaya',
      totalAreaHectares: 380.5,
      estimatedBudgetCr: 3200.0,
      compensationBudgetCr: 940.0,
      currentStage: 'STAGE_3_PRELIMINARY_NOTIFICATION',
      status: 'IN_REVIEW',
      riskScore: 82.0,
      riskLevel: 'CRITICAL',
      statutoryLapseDeadline: lapseDeadlineProj2,
    },
  });

  const sec11DateProj2 = new Date();
  sec11DateProj2.setMonth(sec11DateProj2.getMonth() - 10);
  sec11DateProj2.setDate(sec11DateProj2.getDate() - 18); // ~11 months ago!

  await prisma.notification.create({
    data: {
      projectId: proj2.id,
      section: 'SECTION_11_PRELIMINARY',
      gazetteNumber: 'DL-(N)/01/0142/2023-24',
      issueDate: sec11DateProj2,
      expiryDate: new Date(sec11DateProj2.getTime() + 60 * 24 * 60 * 60 * 1000),
      newspaperLocal1: 'Hindustan (Patna Edition)',
      newspaperLocal2: 'Dainik Jagran',
      documentUrl: 'https://egazette.gov.in/notices/EDFC_Sec11_Gaya.pdf',
      status: 'PUBLISHED',
      objectionsCount: 54,
      objectionsResolved: 18,
    },
  });

  // Parcels for Project 2
  await prisma.landParcel.createMany({
    data: [
      {
        projectId: proj2.id,
        village: 'Fatehpur',
        tehsil: 'Wazirganj',
        khasraNumber: '304/A',
        areaAcres: 3.8,
        landType: 'RURAL_AGRICULTURAL',
        ownerName: 'Ramprasad Singh Yadav',
        status: 'NOTIFIED',
        latitude: 24.7821,
        longitude: 85.1245,
        treesCount: 18,
        structuresCount: 1,
      },
      {
        projectId: proj2.id,
        village: 'Fatehpur',
        tehsil: 'Wazirganj',
        khasraNumber: '305/1',
        areaAcres: 5.2,
        landType: 'RURAL_AGRICULTURAL',
        ownerName: 'Birendra Kumar Manjhi',
        status: 'LITIGATION_STAY',
        latitude: 24.7835,
        longitude: 85.1278,
        treesCount: 25,
        structuresCount: 2,
      },
      {
        projectId: proj2.id,
        village: 'Fatehpur',
        tehsil: 'Wazirganj',
        khasraNumber: '308',
        areaAcres: 2.1,
        landType: 'RURAL_HOMESTEAD',
        ownerName: 'Sanjay Kumar Paswan',
        status: 'NOTIFIED',
        latitude: 24.7852,
        longitude: 85.1311,
        treesCount: 4,
        structuresCount: 2,
      },
    ],
  });

  // 4. Project 3: Ken-Betwa River Linkage Project Phase-1 (Dauddhan Dam Reservoir)
  const proj3 = await prisma.project.create({
    data: {
      code: 'MOWR-KEN-BETWA-PH1-2024',
      name: 'Ken-Betwa River Interlinking National Project (Dauddhan Dam Catchment)',
      description:
        'National water transfer project transferring surplus water from the Ken basin to the Betwa river basin, irrigating 10.6 lakh hectares in drought-prone Bundelkhand.',
      sector: 'IRRIGATION',
      requisitioningAgency: 'National Water Development Agency (NWDA)',
      state: 'Madhya Pradesh',
      district: 'Chhatarpur',
      totalAreaHectares: 6017.0,
      estimatedBudgetCr: 44605.0,
      compensationBudgetCr: 4850.0,
      currentStage: 'STAGE_4_RR_SCHEME',
      status: 'APPROVED',
      riskScore: 45.0,
      riskLevel: 'MEDIUM',
    },
  });

  await prisma.notification.create({
    data: {
      projectId: proj3.id,
      section: 'SECTION_4_SIA',
      gazetteNumber: 'MP-GAZ-CHT-2023-112',
      issueDate: new Date('2023-01-10'),
      newspaperLocal1: 'Dainik Bhaskar (Chhatarpur)',
      newspaperLocal2: 'Nai Dunia',
      documentUrl: 'https://egazette.gov.in/notices/KenBetwa_SIA.pdf',
      status: 'PUBLISHED',
      objectionsCount: 82,
      objectionsResolved: 82,
    },
  });

  await prisma.notification.create({
    data: {
      projectId: proj3.id,
      section: 'SECTION_11_PRELIMINARY',
      gazetteNumber: 'DL-(N)/02/0998/2023-24',
      issueDate: new Date('2023-08-22'),
      newspaperLocal1: 'Dainik Bhaskar',
      newspaperLocal2: 'Patrika',
      documentUrl: 'https://egazette.gov.in/notices/KenBetwa_Sec11.pdf',
      status: 'PUBLISHED',
      objectionsCount: 145,
      objectionsResolved: 130,
    },
  });

  // 5. Project 4: Dholera Special Investment Region (SIR) Multi-Modal Logistics Hub
  const proj4 = await prisma.project.create({
    data: {
      code: 'NICDC-GUJ-DHOLERA-LOG-2024',
      name: 'Dholera SIR Multi-Modal Logistics & Freight Node (TP4A)',
      description:
        'Sub-regional freight hub integrating expressway corridor, rail cargo terminal, and Dholera greenfield international cargo airport.',
      sector: 'INDUSTRIAL_CORRIDOR',
      requisitioningAgency: 'National Industrial Corridor Development Corp (NICDC)',
      state: 'Gujarat',
      district: 'Ahmedabad',
      totalAreaHectares: 512.4,
      estimatedBudgetCr: 2100.0,
      compensationBudgetCr: 780.0,
      currentStage: 'STAGE_8_POSSESSION',
      status: 'APPROVED',
      riskScore: 12.0,
      riskLevel: 'LOW',
    },
  });

  // Project 4 Parcels (All Disbursed & Possession Taken)
  const parcelDholera = await prisma.landParcel.create({
    data: {
      projectId: proj4.id,
      village: 'Bhimtalao',
      tehsil: 'Dholera',
      khasraNumber: '112/A',
      areaAcres: 8.5,
      landType: 'RURAL_AGRICULTURAL',
      ownerName: 'Govindbhai Ranchhodbhai Patel',
      ownerAadhaarMasked: 'XXXX-XXXX-1209',
      ownerBankAccMasked: 'XXXXXX5541',
      ownerIfsc: 'BKID0002011',
      status: 'POSSESSION_TAKEN',
      latitude: 22.2412,
      longitude: 72.1985,
      treesCount: 10,
      structuresCount: 0,
      lastSurveyedAt: new Date('2023-11-12'),
    },
  });

  const awardDholera = await prisma.valuationAward.create({
    data: {
      parcelId: parcelDholera.id,
      baseRatePerAcre: 2800000,
      marketValueLand: 23800000,
      ruralMultiplier: 1.5,
      multipliedMarketValue: 35700000,
      assetsValue: 250000,
      subTotalBeforeSolatium: 35950000,
      solatiumAmount: 35950000,
      daysBetweenSec11AndAward: 190,
      additionalInterestAmount: 2240000,
      totalAwardAmount: 74140000,
      awardDate: new Date('2024-01-15'),
      status: 'APPROVED_COLLECTOR',
      approvedBy: 'Collector & DM Ahmedabad',
    },
  });

  await prisma.disbursement.create({
    data: {
      awardId: awardDholera.id,
      beneficiaryName: 'Govindbhai Ranchhodbhai Patel',
      amountPaid: 74140000,
      paymentMode: 'PFMS_DBT',
      utrReference: 'PFMS2024RBIDHO9912048',
      paymentDate: new Date('2024-02-10'),
      status: 'SUCCESS',
      remarks: '100% compensation disbursed via PFMS. Possession memo signed under Section 38.',
    },
  });

  // Seed Initial Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        userRole: 'NATIONAL_ADMIN',
        action: 'PROJECT_PROPOSAL_APPROVED',
        entityType: 'PROJECT',
        entityId: proj1.id,
        ipAddress: '10.24.18.9',
        newState: JSON.stringify({ status: 'APPROVED', stage: 'STAGE_1_REQUISITION' }),
      },
      {
        userId: collector.id,
        userRole: 'DISTRICT_COLLECTOR',
        action: 'AWARD_APPROVED',
        entityType: 'AWARD',
        entityId: awardDholera.id,
        ipAddress: '10.82.4.21',
        newState: JSON.stringify({ totalAwardAmount: 74140000, status: 'APPROVED_COLLECTOR' }),
      },
      {
        userId: cala.id,
        userRole: 'LAND_ACQUISITION_OFFICER',
        action: 'PFMS_DISBURSEMENT_TRIGGERED',
        entityType: 'DISBURSEMENT',
        entityId: awardDholera.id,
        ipAddress: '10.82.4.45',
        newState: JSON.stringify({ utr: 'PFMS2024RBIDHO9912048', amount: 74140000 }),
      },
    ],
  });

  console.log('✅ Seed completed successfully with 4 Flagship Indian Infrastructure Projects!');
}

main()
  .catch((e) => {
    console.error('❌ Seed script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
