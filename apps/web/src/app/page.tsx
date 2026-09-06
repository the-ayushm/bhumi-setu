'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import {
  ShieldCheck,
  TrendingUp,
  MapPin,
  Clock,
  Layers,
  ArrowRight,
  AlertOctagon,
  Award,
  Users,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { formatINR, RFCTLARR_STAGES } from '@sih/shared';

export default function HomePage() {
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['national-summary'],
    queryFn: () => fetchApi('/analytics/national-summary'),
  });

  const kpis = summaryData?.data?.kpis || {
    totalProjects: 4,
    totalAreaHectares: 7155.7,
    totalBudgetCr: 51755.0,
    totalCompensationBudgetCr: 7190.0,
    totalDisbursedCr: 21.8,
    totalParcels: 9,
    totalDisplacedFamilies: 4,
    highRiskProjectsCount: 1,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Notification Ribbon */}
      <div className="bg-gradient-to-r from-gov-navy to-gov-navy-light text-white p-6 rounded-xl shadow-gov-md border-l-8 border-gov-saffron">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-gov-saffron/20 border border-gov-saffron/40 px-3 py-1 rounded-full text-xs font-semibold text-gov-saffron-light mb-2">
              <ShieldCheck className="w-4 h-4 text-gov-saffron" />
              <span>National Single-Window Land Governance Platform</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              End-to-End Digital Monitoring & Decision Support
            </h2>
            <p className="text-sm text-slate-200 mt-1 max-w-2xl leading-relaxed">
              Enforcing statutory compliance under the Right to Fair Compensation and Transparency in Land Acquisition,
              Rehabilitation and Resettlement Act, 2013 (RFCTLARR Act).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="bg-gov-saffron hover:bg-gov-saffron-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow transition-colors flex items-center space-x-2"
            >
              <span>Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/parcels"
              className="bg-white/10 hover:bg-white/20 text-white font-medium text-sm px-4 py-2.5 rounded-lg border border-white/20 transition-colors flex items-center space-x-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Cadastral GIS</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Real-time National Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm border-t-4 border-t-blue-600">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Requisitioned Land
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gov-navy mt-1">
            {kpis.totalAreaHectares.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500">Ha</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            Across {kpis.totalProjects} National Priority Corridors
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm border-t-4 border-t-gov-green">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Total Compensation Budget
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-gov-green mt-1">
            ₹{kpis.totalCompensationBudgetCr.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500">Cr</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-gov-green" />
            Section 26-30 Valuation Pool
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm border-t-4 border-t-purple-600">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            PFMS DBT Disbursed
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 mt-1">
            ₹{kpis.totalDisbursedCr.toLocaleString('en-IN')} <span className="text-sm font-normal text-slate-500">Cr</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            Direct to Aadhaar-linked Bank Accounts
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm border-t-4 border-t-red-500">
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Statutory Risk Flags
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-600 mt-1">
            {kpis.highRiskProjectsCount} <span className="text-sm font-normal text-slate-500">Corridors</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" />
            <Link href="/risk-engine" className="text-red-600 underline font-medium">
              12-Month Sec 11 Lapse Alerts
            </Link>
          </div>
        </div>
      </div>

      {/* RFCTLARR 2013 Statutory Lifecycle Gates Tracker */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-gov-navy flex items-center gap-2">
              <Clock className="w-4 h-4 text-gov-saffron" />
              RFCTLARR Act 2013 Mandatory Statutory Gates
            </h3>
            <p className="text-xs text-slate-500">
              The platform enforces sequential legal compliance; no gate may be bypassed without statutory orders.
            </p>
          </div>
          <span className="text-xs font-semibold text-gov-navy bg-slate-100 px-2.5 py-1 rounded">
            9 Statutory Milestones
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {RFCTLARR_STAGES.slice(0, 5).map((s, idx) => (
            <div key={s.stage} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-gov-navy/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>GATE {idx + 1}</span>
                <span className="text-[10px] text-gov-saffron bg-gov-saffron/10 px-1.5 py-0.5 rounded font-mono">
                  {s.actSection}
                </span>
              </div>
              <div className="font-semibold text-xs text-gov-navy line-clamp-1">{s.label}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{s.description}</div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          {RFCTLARR_STAGES.slice(5).map((s, idx) => (
            <div key={s.stage} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 hover:border-gov-navy/40 transition-colors">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>GATE {idx + 6}</span>
                <span className="text-[10px] text-gov-green bg-gov-green/10 px-1.5 py-0.5 rounded font-mono">
                  {s.actSection}
                </span>
              </div>
              <div className="font-semibold text-xs text-gov-navy line-clamp-1">{s.label}</div>
              <div className="text-[11px] text-slate-500 mt-1 leading-snug line-clamp-2">{s.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Access Operational Portals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <MapPin className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gov-navy text-sm">Cadastral GIS & Khasra Map</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Overlay proposed road/rail alignments on revenue village maps. Inspect individual survey numbers,
              boundaries, title deeds, and tree/structure enumeration.
            </p>
          </div>
          <Link
            href="/parcels"
            className="mt-4 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            Launch GIS Map &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gov-navy text-sm">Valuation, 100% Solatium & Awards</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Automated calculator adhering to Section 26 base rate, 1.5-2.0x rural multiplier, PWD/Forest asset
              valuation, 100% statutory solatium, and 12% p.a. interest.
            </p>
          </div>
          <Link
            href="/awards"
            className="mt-4 inline-flex items-center text-xs font-semibold text-amber-600 hover:text-amber-800"
          >
            Open Valuation Engine &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-gov-navy text-sm">Rehabilitation & Resettlement (R&R)</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Family-level census monitoring under Second Schedule: pucca house allotments, monthly subsistence grants
              (₹3,000/mo x 12), and one-time resettlement allowances.
            </p>
          </div>
          <Link
            href="/rr-monitoring"
            className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-600 hover:text-emerald-800"
          >
            Monitor R&R Compliance &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
