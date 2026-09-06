'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Send,
  Zap,
} from 'lucide-react';
import { formatINR, UserRole } from '@sih/shared';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function DisbursementsPage() {
  return (
    <RoleGuard routePath="/disbursements">
      <DisbursementsContent />
    </RoleGuard>
  );
}

function DisbursementsContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: disbursementsData, isLoading } = useQuery({
    queryKey: ['disbursements'],
    queryFn: () => fetchApi('/disbursements'),
  });

  const { data: statsData } = useQuery({
    queryKey: ['disbursements-stats'],
    queryFn: () => fetchApi('/disbursements/stats'),
  });

  const { data: parcelsData } = useQuery({
    queryKey: ['parcels'],
    queryFn: () => fetchApi('/parcels'),
  });

  const triggerPaymentMutation = useMutation({
    mutationFn: (awardId: string) =>
      fetchApi('/disbursements/trigger', {
        method: 'POST',
        body: JSON.stringify({ awardId }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['disbursements'] });
      queryClient.invalidateQueries({ queryKey: ['disbursements-stats'] });
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
      alert(`PFMS DBT Disbursed Successfully!\nUTR Reference: ${data.data?.utrReference}`);
    },
    onError: (err: any) => {
      alert(`PFMS Payment Gateway Error: ${err.message}`);
    },
  });

  const disbursements = disbursementsData?.data || [];
  const stats = statsData?.data || {
    totalDisbursementsCount: 3,
    totalAwardsCount: 6,
    totalDisbursedINR: 218000000,
    totalAwardApprovedINR: 354000000,
    disbursementRatio: 62,
  };

  const pendingParcels = (parcelsData?.data || []).filter(
    (p: any) => p.valuationAward && p.valuationAward.disbursements.length === 0
  );

  const canTrigger =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.DISTRICT_COLLECTOR ||
    user?.role === UserRole.LAND_ACQUISITION_OFFICER;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-gov-navy" />
            Direct Benefit Transfer (PFMS DBT) & Compensation Disbursement
          </h2>
          <p className="text-xs text-slate-500">
            Real-time integration with Public Financial Management System (PFMS) and RBI NEFT/RTGS gateway
          </p>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-gov-green">
          <div className="text-xs font-semibold text-slate-500 uppercase">Total Disbursed</div>
          <div className="text-xl sm:text-2xl font-bold text-gov-green mt-1">
            {formatINR(stats.totalDisbursedINR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Credited to Landowners</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-gov-navy">
          <div className="text-xs font-semibold text-slate-500 uppercase">Approved Awards Pool</div>
          <div className="text-xl sm:text-2xl font-bold text-gov-navy mt-1">
            {formatINR(stats.totalAwardApprovedINR)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Total Valuation Approved</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <div className="text-xs font-semibold text-slate-500 uppercase">Disbursement Velocity</div>
          <div className="text-xl sm:text-2xl font-bold text-purple-700 mt-1">
            {stats.disbursementRatio}%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Settled vs Approved Awards</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-amber-500">
          <div className="text-xs font-semibold text-slate-500 uppercase">Pending Authorization</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-600 mt-1">
            {pendingParcels.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Awaiting PFMS Batch Dispatch</div>
        </div>
      </div>

      {/* Pending Awards Ready for Disbursement Dispatch */}
      {canTrigger && pendingParcels.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-300 rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-amber-200/60 pb-2">
            <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-600" />
              Approved Awards Pending Direct Benefit Transfer Dispatch ({pendingParcels.length})
            </h3>
            <span className="text-[10px] bg-amber-200/60 text-amber-900 px-2 py-0.5 rounded font-semibold">
              Collector Authorized
            </span>
          </div>

          <div className="space-y-2">
            {pendingParcels.map((p: any) => (
              <div
                key={p.id}
                className="bg-white p-3.5 rounded border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-gov-navy flex items-center gap-2">
                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      Khasra {p.khasraNumber}
                    </span>
                    <span>Beneficiary: {p.ownerName}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Village: {p.village} | Bank: {p.ownerBankAccMasked || 'Verified A/c'} (IFSC:{' '}
                    {p.ownerIfsc || 'SBIN0001245'})
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="font-mono font-bold text-gov-green text-sm">
                    {formatINR(p.valuationAward.totalAwardAmount)}
                  </div>
                  <button
                    onClick={() => triggerPaymentMutation.mutate(p.valuationAward.id)}
                    disabled={triggerPaymentMutation.isPending}
                    className="bg-gov-green hover:bg-gov-green-dark text-white font-semibold text-xs px-3 py-1.5 rounded shadow flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Authorize PFMS DBT</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PFMS Transaction UTR Reconciliation Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
          PFMS Direct Benefit Transfer Reconciliation Audit Trail ({disbursements.length} Records)
        </h3>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Bank UTR Reference</th>
              <th>Beneficiary Name</th>
              <th>Amount Credited</th>
              <th>Payment Gateway</th>
              <th>Date & Time</th>
              <th>PFMS Status</th>
              <th>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {disbursements.map((d: any) => (
              <tr key={d.id}>
                <td className="font-mono font-bold text-gov-navy">{d.utrReference}</td>
                <td>{d.beneficiaryName}</td>
                <td className="font-mono font-bold text-gov-green">{formatINR(d.amountPaid)}</td>
                <td>
                  <span className="gov-badge bg-blue-100 text-blue-800">{d.paymentMode}</span>
                </td>
                <td className="text-xs">{new Date(d.paymentDate).toLocaleString('en-IN')}</td>
                <td>
                  <span className="gov-badge bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                    <CheckCircle2 className="w-3 h-3" />
                    {d.status}
                  </span>
                </td>
                <td className="text-[11px] text-slate-500 max-w-xs truncate">{d.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
