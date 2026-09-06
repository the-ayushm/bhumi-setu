'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import {
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  PieChart as PieIcon,
  BarChart3,
  Layers,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '@/lib/auth-context';
import { UserRole } from '@sih/shared';

const SECTOR_COLORS = ['#0B2545', '#137547', '#FF6F00', '#7C3AED', '#2563EB', '#D97706'];

export default function DashboardPage() {
  const { user } = useAuth();
  const currentRole = user?.role as UserRole;

  // AuthGuard ensures user is always non-null here. Safety check:
  if (!user) return null;

  const { data: summaryData, isLoading: isSummaryLoading } = useQuery({
    queryKey: ['national-summary', user?.role, user?.district, user?.state],
    queryFn: () => fetchApi('/analytics/national-summary'),
  });

  const { data: stateData } = useQuery({
    queryKey: ['state-rankings'],
    queryFn: () => fetchApi('/analytics/state-rankings'),
    enabled: currentRole === UserRole.NATIONAL_ADMIN || currentRole === UserRole.STATE_NODAL_OFFICER,
  });

  const { data: riskData } = useQuery({
    queryKey: ['risk-indicators'],
    queryFn: () => fetchApi('/analytics/risk-indicators'),
    enabled: currentRole !== UserRole.CITIZEN_VIEWER && currentRole !== UserRole.FIELD_SURVEYOR,
  });

  const kpis = summaryData?.data?.kpis || {
    totalProjects: 4,
    totalAreaHectares: 7155.7,
    totalCompensationBudgetCr: 7190.0,
    totalDisbursedCr: 21.8,
    highRiskProjectsCount: 1,
    totalParcels: 6,
  };

  const sectorChartData =
    summaryData?.data?.sectorStats?.map((s: any) => ({
      name: s.sector.replace('_', ' '),
      projects: s._count.id,
      area: Math.round(s._sum.totalAreaHectares || 0),
    })) || [
      { name: 'HIGHWAYS', projects: 1, area: 246 },
      { name: 'RAILWAYS', projects: 1, area: 381 },
      { name: 'IRRIGATION', projects: 1, area: 6017 },
      { name: 'INDUSTRIAL', projects: 1, area: 512 },
    ];

  const stateRankings = stateData?.data || [];
  const riskList = riskData?.data || [];

  // Role-specific Header Titles
  const getDashboardTitle = () => {
    switch (currentRole) {
      case UserRole.STATE_NODAL_OFFICER:
        return `State Nodal Directorate — ${user?.state || 'Maharashtra'} Command Portal`;
      case UserRole.DISTRICT_COLLECTOR:
        return `District Collectorate (${user?.district || 'Pune'}) — Land Acquisition Desk`;
      case UserRole.LAND_ACQUISITION_OFFICER:
        return `CALA / Sub-Divisional Officer (SDO) Operations Console`;
      case UserRole.REQUISITIONING_AGENCY:
        return `Requisitioning Agency (NHAI) Infrastructure Corridors Desk`;
      case UserRole.FIELD_SURVEYOR:
        return `Field Cadastre & Joint Measurement Inspection Dashboard`;
      case UserRole.CITIZEN_VIEWER:
        return `National Land Acquisition Citizen Public Information Portal`;
      default:
        return `National Land Acquisition Executive Command Center`;
    }
  };

  const getDashboardSubtitle = () => {
    switch (currentRole) {
      case UserRole.STATE_NODAL_OFFICER:
        return `Statutory oversight of infrastructure acquisitions within ${user?.state || 'the State'}`;
      case UserRole.DISTRICT_COLLECTOR:
        return `Sec 11-19 gazette notifications, awards, and DBT clearances for ${user?.district || 'District'} jurisdiction`;
      case UserRole.LAND_ACQUISITION_OFFICER:
        return `Cadastral ground verification, award determination, and beneficiary accounts settlement`;
      case UserRole.REQUISITIONING_AGENCY:
        return `Proposal monitoring, right-of-way (ROW) possession tracking, and agency fund placement`;
      case UserRole.FIELD_SURVEYOR:
        return `Field survey assignments, GPS geo-tagging, and tree/structure asset counts`;
      case UserRole.CITIZEN_VIEWER:
        return `Public transparency portal for verified awards, compensation criteria, and project schedules under RFCTLARR 2013`;
      default:
        return `Real-Time statutory monitoring across Central & State Infrastructure Requisitions`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-gov-navy text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-wider">
              {currentRole}
            </span>
            {user?.state && (
              <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200">
                {user.state}{user.district ? ` • ${user.district}` : ''}
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Building2 className="w-6 h-6 text-gov-navy" />
            {getDashboardTitle()}
          </h2>
          <p className="text-xs text-slate-500">{getDashboardSubtitle()}</p>
        </div>

        <div className="flex items-center gap-2">
          {currentRole !== UserRole.CITIZEN_VIEWER && currentRole !== UserRole.FIELD_SURVEYOR && (
            <Link
              href="/mis-reports"
              className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Export Statutory MIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {currentRole === UserRole.CITIZEN_VIEWER && (
            <Link
              href="/parcels"
              className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-3 py-2 rounded flex items-center gap-1.5 transition-colors"
            >
              <span>Explore Cadastral GIS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>

      {/* Critical Early Warning Alert (for authorized roles only) */}
      {riskList.some((r: any) => r.hasSec11LapseWarning) && currentRole !== UserRole.CITIZEN_VIEWER && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold text-red-900 uppercase">
                Statutory Expiry Alert — Section 19 Clock Running Out:
              </span>
              <p className="text-red-800 mt-1">
                {riskList.find((r: any) => r.hasSec11LapseWarning)?.summary}
              </p>
              <div className="mt-2">
                <Link
                  href="/risk-engine"
                  className="font-bold text-red-900 underline hover:text-red-700"
                >
                  View in Predictive Risk Intelligence Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Role-Adaptive Executive Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium">
            {currentRole === UserRole.CITIZEN_VIEWER ? 'Monitored Corridors' : 'Requisitioned Extent'}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gov-navy mt-1">
            {currentRole === UserRole.CITIZEN_VIEWER ? `${kpis.totalProjects} Projects` : `${kpis.totalAreaHectares} Ha`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {currentRole === UserRole.DISTRICT_COLLECTOR ? 'Within District Boundary' : 'Active Requisition Footprint'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium">
            {currentRole === UserRole.FIELD_SURVEYOR ? 'Cadastral Parcels' : 'Compensation Allocation'}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-gov-green mt-1">
            {currentRole === UserRole.FIELD_SURVEYOR ? `${kpis.totalParcels} Khasras` : `₹${kpis.totalCompensationBudgetCr} Cr`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {currentRole === UserRole.FIELD_SURVEYOR ? 'Assigned Field Survey Area' : 'Section 26-30 Pool'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium">PFMS Direct Disbursed</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">
            ₹{kpis.totalDisbursedCr} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Direct to Bank Accounts</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-slate-500 text-xs font-medium">
            {currentRole === UserRole.CITIZEN_VIEWER ? 'Displaced Families R&R' : 'High Risk Corridors'}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 mt-1">
            {currentRole === UserRole.CITIZEN_VIEWER ? kpis.totalDisplacedFamilies || 4 : kpis.highRiskProjectsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {currentRole === UserRole.CITIZEN_VIEWER ? 'Entitled Under Schedule II' : 'Delayed Gazette Declarations'}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Hectarage Bar Chart */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gov-navy" />
            Land Acquisition by Infrastructure Sector (Hectares)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData}>
                <XAxis dataKey="name" fontSize={11} tickLine={false} />
                <YAxis fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [`${value} Hectares`, 'Area']}
                  contentStyle={{ backgroundColor: '#0B2545', color: '#fff', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="area" fill="#0B2545" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* State Performance Scorecard Table */}
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gov-green" />
              State-Level Land Acquisition Performance Scorecard
            </h3>
            <div className="overflow-x-auto">
              <table className="gov-table">
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Projects</th>
                    <th>Area (Ha)</th>
                    <th>Compensation</th>
                    <th>Risk Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {stateRankings.map((st: any) => (
                    <tr key={st.state}>
                      <td className="font-semibold text-gov-navy">{st.state}</td>
                      <td>{st.projectCount}</td>
                      <td>{st.totalAreaHectares}</td>
                      <td>₹{st.totalCompensationCr} Cr</td>
                      <td>
                        <span
                          className={`gov-badge ${
                            st.averageRiskScore > 60
                              ? 'bg-red-100 text-red-800'
                              : st.averageRiskScore > 30
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          Score {st.averageRiskScore}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 text-[11px] text-slate-400">
            Source: Department of Land Resources (DoLR) Integrated Database
          </div>
        </div>
      </div>
    </div>
  );
}
