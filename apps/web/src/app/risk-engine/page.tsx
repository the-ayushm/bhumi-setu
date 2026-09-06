'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import {
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  AlertOctagon,
  Scale,
  DollarSign,
  CheckCircle,
} from 'lucide-react';
import { RiskLevel } from '@sih/shared';

export default function RiskEnginePage() {
  const { data: riskData, isLoading } = useQuery({
    queryKey: ['risk-indicators'],
    queryFn: () => fetchApi('/analytics/risk-indicators'),
  });

  const risks = riskData?.data || [];

  const criticalCount = risks.filter((r: any) => r.riskLevel === 'CRITICAL').length;
  const highCount = risks.filter((r: any) => r.riskLevel === 'HIGH').length;
  const mediumCount = risks.filter((r: any) => r.riskLevel === 'MEDIUM').length;
  const lowCount = risks.filter((r: any) => r.riskLevel === 'LOW').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            Predictive Risk & Statutory Bottlenecks Intelligence Center
          </h2>
          <p className="text-xs text-slate-500">
            Early warning radar monitoring Section 11-to-19 statutory clock lapses, disbursement lags, and litigation stays
          </p>
        </div>
      </div>

      {/* Risk Distribution Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200 shadow-sm">
          <div className="text-xs font-semibold text-red-700 uppercase">Critical Risk</div>
          <div className="text-2xl font-bold text-red-800 mt-1">{criticalCount}</div>
          <div className="text-[11px] text-red-600 mt-1">Imminent Statutory Lapse</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 shadow-sm">
          <div className="text-xs font-semibold text-orange-700 uppercase">High Risk</div>
          <div className="text-2xl font-bold text-orange-800 mt-1">{highCount}</div>
          <div className="text-[11px] text-orange-600 mt-1">High Objections / Court Stay</div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 shadow-sm">
          <div className="text-xs font-semibold text-amber-700 uppercase">Medium Risk</div>
          <div className="text-2xl font-bold text-amber-800 mt-1">{mediumCount}</div>
          <div className="text-[11px] text-amber-600 mt-1">Disbursement Scurry</div>
        </div>

        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 shadow-sm">
          <div className="text-xs font-semibold text-emerald-700 uppercase">Low Risk</div>
          <div className="text-2xl font-bold text-gov-green mt-1">{lowCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">On-Schedule Execution</div>
        </div>
      </div>

      {/* Flagged Projects Radar List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
          National Priority Bottlenecks Schedule ({risks.length} Monitored Projects)
        </h3>

        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-500">Analyzing Project Risk Vectors...</div>
        ) : (
          risks.map((r: any) => {
            const isCritical = r.riskLevel === 'CRITICAL';
            const isHigh = r.riskLevel === 'HIGH';

            return (
              <div
                key={r.projectId}
                className={`bg-white rounded-lg border p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isCritical
                    ? 'border-red-400 border-l-8 border-l-red-600 bg-red-50/20'
                    : isHigh
                    ? 'border-orange-300 border-l-8 border-l-orange-500'
                    : 'border-slate-200'
                }`}
              >
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                      {r.projectCode}
                    </span>
                    <span
                      className={`gov-badge ${
                        r.riskLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : r.riskLevel === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : r.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.riskLevel} RISK (SCORE {r.riskScore} / 100)
                    </span>
                  </div>

                  <Link href={`/projects/${r.projectId}`} className="hover:text-gov-navy-light">
                    <h4 className="text-base font-bold text-gov-navy">{r.projectName}</h4>
                  </Link>

                  <div className="text-xs text-slate-600">
                    Jurisdiction: {r.district}, {r.state}
                  </div>

                  <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-200 mt-2 leading-relaxed">
                    <strong>Statutory Diagnosis:</strong> {r.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                    {r.statutoryLapseDaysRemaining !== null && (
                      <span className="flex items-center gap-1 font-bold text-red-700">
                        <Clock className="w-3.5 h-3.5" />
                        Sec 19 Clock: {r.statutoryLapseDaysRemaining} Days Left
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-slate-400" />
                      Litigation Parcels: {r.litigationParcelCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Disbursement Lag: {Math.round(r.disbursementLagRatio * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end gap-2 border-t md:border-t-0 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-500 uppercase">Risk Index</div>
                    <div
                      className={`text-2xl font-black ${
                        isCritical ? 'text-red-600' : isHigh ? 'text-orange-600' : 'text-gov-navy'
                      }`}
                    >
                      {r.riskScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <Link
                    href={`/projects/${r.projectId}`}
                    className="bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold px-3 py-2 rounded shadow flex items-center gap-1.5 transition-colors"
                  >
                    <span>Remediate in Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
