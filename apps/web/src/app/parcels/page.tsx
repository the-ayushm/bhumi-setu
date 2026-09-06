'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import {
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building,
  UserCheck,
  TreeDeciduous,
  Home,
  IndianRupee,
  Layers,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';
import { formatINR, UserRole, hasPermission } from '@sih/shared';
import { useAuth } from '@/lib/auth-context';

// Dynamically load Leaflet Map to avoid SSR errors
const CadastralMap = dynamic(() => import('@/components/map/CadastralMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[460px] bg-slate-100 flex items-center justify-center rounded-lg border text-xs text-slate-400">
      Loading GIS Cadastral Map Engine...
    </div>
  ),
});

function ParcelsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('projectId') || '';
  const initialParcelId = searchParams.get('parcelId') || '';

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects'),
  });

  const { data: parcelsData, isLoading } = useQuery({
    queryKey: ['parcels', selectedProjectId, selectedStatus, search],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProjectId) params.append('projectId', selectedProjectId);
      if (selectedStatus) params.append('status', selectedStatus);
      if (search) params.append('search', search);
      return fetchApi(`/parcels?${params.toString()}`);
    },
  });

  const projects = projectsData?.data || [];
  const parcels = parcelsData?.data || [];

  useEffect(() => {
    if (initialParcelId && parcels.length > 0) {
      const matched = parcels.find((p: any) => p.id === initialParcelId);
      if (matched) setSelectedParcel(matched);
    }
  }, [initialParcelId, parcels]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <MapPin className="w-6 h-6 text-gov-navy" />
            Cadastral Land Parcel Registry & GIS Visualization
          </h2>
          <p className="text-xs text-slate-500">
            Khasra survey number mapping, landowner verification, and compensation status
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Khasra/Survey number, Owner name, or Village..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none max-w-[200px] truncate"
          >
            <option value="">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="NOTIFIED">Notified</option>
            <option value="SURVEYED">Surveyed</option>
            <option value="VALUATION_DONE">Valuation Done</option>
            <option value="DISBURSED">PFMS Disbursed</option>
            <option value="POSSESSION_TAKEN">Possession Taken</option>
            <option value="LITIGATION_STAY">Litigation Stay</option>
          </select>
        </div>
      </div>

      {/* Main Content: Map & Parcel Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Map (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="w-full">
            <CadastralMap
              parcels={parcels}
              selectedParcelId={selectedParcel?.id || null}
              onSelectParcel={(p) => setSelectedParcel(p)}
            />
          </div>

          {/* Table List of Parcels */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 overflow-x-auto">
            <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
              Cadastral Parcels Schedule ({parcels.length} Records)
            </h3>
            <table className="gov-table">
              <thead>
                <tr>
                  <th>Khasra No</th>
                  <th>Village / Tehsil</th>
                  <th>Area</th>
                  <th>Titleholder</th>
                  <th>Status</th>
                  <th>Award (INR)</th>
                </tr>
              </thead>
              <tbody>
                {parcels.map((p: any) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedParcel(p)}
                    className={`cursor-pointer transition-colors ${
                      selectedParcel?.id === p.id ? 'bg-amber-50 font-medium' : ''
                    }`}
                  >
                    <td className="font-mono font-bold text-gov-navy">{p.khasraNumber}</td>
                    <td>
                      {p.village}, {p.tehsil}
                    </td>
                    <td>{p.areaAcres} Acres</td>
                    <td>{p.ownerName}</td>
                    <td>
                      <span
                        className={`gov-badge ${
                          p.status === 'DISBURSED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : p.status === 'LITIGATION_STAY'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="font-mono">
                      {p.valuationAward ? formatINR(p.valuationAward.totalAwardAmount) : 'Pending'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Parcel Dossier Inspector (1 column) */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  CADASTRE INSPECTOR
                </span>
                <h3 className="text-base font-bold text-gov-navy mt-1">
                  {selectedParcel ? `Khasra No. ${selectedParcel.khasraNumber}` : 'Select a Parcel'}
                </h3>
              </div>
              {selectedParcel && (
                <span
                  className={`gov-badge ${
                    selectedParcel.status === 'DISBURSED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {selectedParcel.status}
                </span>
              )}
            </div>

            {selectedParcel ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Revenue Jurisdiction
                  </div>
                  <div>
                    <strong>Village:</strong> {selectedParcel.village}
                  </div>
                  <div>
                    <strong>Tehsil / Taluka:</strong> {selectedParcel.tehsil}
                  </div>
                  <div>
                    <strong>Land Type:</strong> {selectedParcel.landType}
                  </div>
                  <div>
                    <strong>Total Area:</strong> {selectedParcel.areaAcres} Acres
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Titleholder & DBT Account
                  </div>
                  <div>
                    <strong>Recorded Owner:</strong> {selectedParcel.ownerName}
                  </div>
                  <div>
                    <strong>Masked Aadhaar:</strong> {selectedParcel.ownerAadhaarMasked || 'Verified in UIDAI'}
                  </div>
                  <div>
                    <strong>Bank Account:</strong> {selectedParcel.ownerBankAccMasked || 'Verified IFSC'}
                  </div>
                  <div>
                    <strong>IFSC:</strong> {selectedParcel.ownerIfsc || 'SBIN0001245'}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1.5">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    Field Survey Assets (Sec 29)
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <TreeDeciduous className="w-3.5 h-3.5 text-gov-green" />
                      Fruit & Timber Trees:
                    </span>
                    <span className="font-bold">{selectedParcel.treesCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-blue-600" />
                      Built Structures / Wells:
                    </span>
                    <span className="font-bold">{selectedParcel.structuresCount}</span>
                  </div>
                </div>

                {selectedParcel.valuationAward && (
                  <div className="bg-amber-50 p-3 rounded border border-amber-200 space-y-1.5 text-amber-900">
                    <div className="text-[11px] font-semibold uppercase tracking-wider">
                      Approved Statutory Award (Sec 26-30)
                    </div>
                    <div className="text-lg font-bold text-gov-navy">
                      {formatINR(selectedParcel.valuationAward.totalAwardAmount)}
                    </div>
                    <div className="text-[11px]">
                      Includes 100% Solatium & 12% p.a. statutory interest.
                    </div>
                  </div>
                )}

                {/* Direct Lifecycle Action Buttons (Role Gated) */}
                <div className="pt-2 border-t border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Next Statutory Action:
                  </div>

                  {user?.role === UserRole.CITIZEN_VIEWER && (
                    <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded text-xs">
                      🔒 Administrative and field actions are restricted to verified revenue and survey officials. Public citizen mode provides transparent audit visibility only.
                    </div>
                  )}

                  {selectedParcel.status === 'NOTIFIED' && (
                    hasPermission(user?.role || UserRole.CITIZEN_VIEWER, 'canConductSurvey') ? (
                      <Link
                        href={`/field-survey?parcelId=${selectedParcel.id}`}
                        className="w-full bg-gov-navy hover:bg-gov-navy-light text-white text-xs font-semibold py-2 px-3 rounded shadow flex items-center justify-between transition-colors"
                      >
                        <span>Conduct Field Survey & Assets Count</span>
                        <ArrowRight className="w-3.5 h-3.5 text-gov-saffron" />
                      </Link>
                    ) : (
                      user?.role !== UserRole.CITIZEN_VIEWER && (
                        <div className="text-[11px] text-slate-400 italic">Field Survey action restricted to Field Surveyor / LAO.</div>
                      )
                    )
                  )}

                  {selectedParcel.status === 'SURVEYED' && (
                    hasPermission(user?.role || UserRole.CITIZEN_VIEWER, 'canFormulateAward') ? (
                      <Link
                        href={`/awards?parcelId=${selectedParcel.id}`}
                        className="w-full bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold py-2 px-3 rounded shadow flex items-center justify-between transition-colors"
                      >
                        <span>Formulate Statutory Award (Sec 26-30)</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      user?.role !== UserRole.CITIZEN_VIEWER && (
                        <div className="text-[11px] text-slate-400 italic">Award formulation restricted to CALA / District Collector.</div>
                      )
                    )
                  )}

                  {(selectedParcel.status === 'VALUATION_DONE' ||
                    selectedParcel.status === 'AWARD_APPROVED') && (
                    hasPermission(user?.role || UserRole.CITIZEN_VIEWER, 'canTriggerDisbursement') ? (
                      <Link
                        href={`/disbursements?parcelId=${selectedParcel.id}`}
                        className="w-full bg-gov-green hover:bg-gov-green-dark text-white text-xs font-semibold py-2 px-3 rounded shadow flex items-center justify-between transition-colors"
                      >
                        <span>Authorize PFMS Direct Benefit Transfer</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      user?.role !== UserRole.CITIZEN_VIEWER && (
                        <div className="text-[11px] text-slate-400 italic">PFMS DBT authorization restricted to District Collector / CALA.</div>
                      )
                    )
                  )}

                  {selectedParcel.status === 'DISBURSED' && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded text-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-gov-green flex-shrink-0" />
                      <span>Compensation 100% Disbursed • Ready for Section 38 Physical Possession</span>
                    </div>
                  )}

                  {selectedParcel.status === 'LITIGATION_STAY' && (
                    <div className="bg-red-50 border border-red-200 text-red-800 p-2.5 rounded text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      <span>Proceedings stayed by judicial order • Flagged in Risk Intelligence</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Click on any map pin or table row to inspect khasra details, ownership record, and
                compensation status.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ParcelsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-xs text-slate-500">
          Loading Cadastral Parcels Registry...
        </div>
      }
    >
      <ParcelsContent />
    </Suspense>
  );
}

