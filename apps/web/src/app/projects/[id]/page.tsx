'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  MapPin,
  Users,
  IndianRupee,
  Layers,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
} from 'lucide-react';
import { RFCTLARR_STAGES, ProjectStage, UserRole, formatINR } from '@sih/shared';

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isTransitionModalOpen, setIsTransitionModalOpen] = useState(false);
  const [targetStage, setTargetStage] = useState<ProjectStage>(ProjectStage.STAGE_2_SIA);
  const [transitionRemarks, setTransitionRemarks] = useState('');

  const { data: projectRes, isLoading, error } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchApi(`/projects/${projectId}`),
  });

  const transitionMutation = useMutation({
    mutationFn: (payload: any) =>
      fetchApi(`/projects/${projectId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsTransitionModalOpen(false);
      setTransitionRemarks('');
      alert('Statutory stage advanced successfully!');
    },
    onError: (err: any) => {
      alert(`Statutory Stage Gate Violation:\n${err.message}`);
    },
  });

  const handleStageTransition = (e: React.FormEvent) => {
    e.preventDefault();
    transitionMutation.mutate({
      targetStage,
      remarks: transitionRemarks || 'Statutory review completed by competent authority.',
    });
  };

  if (isLoading) {
    return <div className="text-center py-16 text-xs text-slate-500">Loading Project Dossier...</div>;
  }

  const project = projectRes?.data;
  if (!project) {
    return (
      <div className="bg-white p-8 rounded border text-center text-red-600">
        Project dossier could not be retrieved.
      </div>
    );
  }

  const metrics = project.metrics || {};
  const currentStageIndex = RFCTLARR_STAGES.findIndex((s) => s.stage === project.currentStage);

  const canTransition =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.DISTRICT_COLLECTOR ||
    user?.role === UserRole.STATE_NODAL_OFFICER;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Dossier Header */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold bg-gov-navy text-white px-2 py-0.5 rounded">
              {project.code}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {project.sector.replace('_', ' ')} SECTOR
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy">{project.name}</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            {project.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-600">
            <span>
              <strong>District:</strong> {project.district}, {project.state}
            </span>
            <span>•</span>
            <span>
              <strong>Requisitioning Agency:</strong> {project.requisitioningAgency}
            </span>
            <span>•</span>
            <span>
              <strong>Requisitioned Extent:</strong> {project.totalAreaHectares} Ha
            </span>
          </div>
        </div>

        {canTransition && (
          <div className="flex flex-col items-end gap-2">
            <button
              onClick={() => setIsTransitionModalOpen(true)}
              className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4" />
              <span>Advance Statutory Gate</span>
            </button>
            <span className="text-[10px] text-slate-400">Enforces Section 4-38 Pre-conditions</span>
          </div>
        )}
      </div>

      {/* Connected Domain Navigation Bar */}
      <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-500 font-semibold px-2">Project Dossier Views:</span>
        <Link
          href={`/parcels?projectId=${project.id}`}
          className="bg-white hover:bg-slate-50 text-gov-navy font-semibold px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Cadastral GIS ({metrics.totalParcels || 0} Parcels)</span>
        </Link>
        <Link
          href={`/notifications?projectId=${project.id}`}
          className="bg-white hover:bg-slate-50 text-gov-navy font-semibold px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <FileText className="w-3.5 h-3.5 text-purple-600" />
          <span>Gazette Orders ({project.notifications?.length || 0})</span>
        </Link>
        <Link
          href="/awards"
          className="bg-white hover:bg-slate-50 text-gov-navy font-semibold px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <IndianRupee className="w-3.5 h-3.5 text-gov-saffron" />
          <span>Valuation & Awards</span>
        </Link>
        <Link
          href={`/rr-monitoring?projectId=${project.id}`}
          className="bg-white hover:bg-slate-50 text-gov-navy font-semibold px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>R&R Families ({project.displacedFamilies?.length || 0})</span>
        </Link>
        <Link
          href={`/disbursements?projectId=${project.id}`}
          className="bg-white hover:bg-slate-50 text-gov-navy font-semibold px-3 py-1.5 rounded border border-slate-200 shadow-sm flex items-center gap-1.5 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-gov-green" />
          <span>PFMS Disbursements</span>
        </Link>
      </div>

      {/* Statutory Lapse Clock Warning Box (if applicable) */}
      {project.riskAnalysis?.hasSec11LapseWarning && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-r-lg space-y-2">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-900">
              <span className="font-bold uppercase tracking-wider">
                Section 19 Statutory Clock Alert:
              </span>{' '}
              {project.riskAnalysis.summary}
              <div className="mt-1 font-semibold text-red-700">
                Action Required: District Collector / Competent Authority must publish Section 19
                Declaration within {project.riskAnalysis.statutoryLapseDaysRemaining} days to prevent
                statutory lapse of acquisition proceedings!
              </div>
              <div className="mt-2">
                <Link
                  href={`/notifications?projectId=${project.id}`}
                  className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white font-semibold px-3.5 py-1.5 rounded shadow text-xs transition-colors"
                >
                  <span>Remediate Risk: Publish Section 19 Declaration</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9-Stage RFCTLARR Statutory Pipeline */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gov-navy" />
          RFCTLARR Act, 2013 Statutory Lifecycle Progression
        </h3>

        <div className="relative flex flex-col md:flex-row items-stretch justify-between gap-2 overflow-x-auto pb-2">
          {RFCTLARR_STAGES.map((st, idx) => {
            const isCompleted = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={st.stage}
                className={`flex-1 min-w-[130px] p-3 rounded-lg border text-xs transition-all ${
                  isCurrent
                    ? 'bg-amber-50 border-gov-saffron shadow-sm ring-1 ring-gov-saffron'
                    : isCompleted
                    ? 'bg-emerald-50 border-gov-green/30 text-slate-700'
                    : 'bg-slate-50 border-slate-200 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold">GATE {idx + 1}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-gov-green" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 text-gov-saffron animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-300" />
                  )}
                </div>
                <div className={`font-bold line-clamp-1 ${isCurrent ? 'text-gov-saffron-dark' : 'text-slate-800'}`}>
                  {st.label}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-1">{st.actSection}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Project Execution Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Cadastral Parcels</div>
          <div className="text-2xl font-bold text-gov-navy mt-1">{metrics.totalParcels || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.surveyedParcels || 0} Field Surveyed
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Awards Determined</div>
          <div className="text-2xl font-bold text-gov-green mt-1">{metrics.awardedParcels || 0}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            ₹{((metrics.totalAwardApprovedINR || 0) / 10000000).toFixed(2)} Cr Approved
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Compensation Disbursed</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">
            ₹{((metrics.totalAwardDisbursedINR || 0) / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {metrics.disbursementProgressPercent || 0}% Total Progress
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <div className="text-xs font-semibold text-slate-500 uppercase">Affected Families</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {project.displacedFamilies?.length || 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">R&R Second Schedule Census</div>
        </div>
      </div>

      {/* Gazetted Notifications Section */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-gov-navy" />
            Statutory Gazette Notifications Issued
          </h3>
          <Link
            href="/notifications"
            className="text-xs font-semibold text-gov-navy hover:underline"
          >
            All Gazette Orders &rarr;
          </Link>
        </div>

        {project.notifications?.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No statutory gazette notifications issued yet.</p>
        ) : (
          <div className="space-y-2">
            {project.notifications.map((notif: any) => (
              <div
                key={notif.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-200 text-xs"
              >
                <div>
                  <div className="font-bold text-gov-navy flex items-center gap-2">
                    <span className="font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                      {notif.section}
                    </span>
                    <span>Gazette No: {notif.gazetteNumber}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Published: {new Date(notif.issueDate).toLocaleDateString('en-IN')} | Sec 15
                    Objections: {notif.objectionsCount} (Resolved: {notif.objectionsResolved})
                  </div>
                </div>

                {notif.documentUrl && (
                  <a
                    href={notif.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-gov-saffron hover:underline flex items-center gap-1"
                  >
                    <span>View Gazette PDF</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advance Stage Modal */}
      {isTransitionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gov-navy mb-1 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-gov-saffron" />
              Advance Statutory Stage (RFCTLARR 2013)
            </h3>
            <p className="text-slate-500 mb-4">
              Advancing gates enforces statutory verification (e.g. Sec 11 gazette, Sec 19 declaration, Sec 38 100% payment before possession).
            </p>

            <form onSubmit={handleStageTransition} className="space-y-4">
              <div>
                <label className="font-semibold text-slate-700">Target Statutory Stage *</label>
                <select
                  value={targetStage}
                  onChange={(e) => setTargetStage(e.target.value as ProjectStage)}
                  className="w-full mt-1 border border-slate-300 rounded p-2 bg-white text-xs"
                >
                  {RFCTLARR_STAGES.map((s) => (
                    <option key={s.stage} value={s.stage}>
                      {s.order}. {s.label} ({s.actSection})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Competent Authority Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={transitionRemarks}
                  onChange={(e) => setTransitionRemarks(e.target.value)}
                  placeholder="Record file reference number, hearing date, or Collector approval note..."
                  className="w-full mt-1 border border-slate-300 rounded p-2 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsTransitionModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={transitionMutation.isPending}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white font-semibold rounded shadow"
                >
                  {transitionMutation.isPending ? 'Validating...' : 'Authorize Stage Transition'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
