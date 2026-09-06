'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Calculator,
  PlusCircle,
  CheckCircle2,
  FileCheck2,
  AlertCircle,
  IndianRupee,
  Layers,
  Sparkles,
  UserCheck,
  ArrowRight,
  CreditCard,
} from 'lucide-react';
import { formatINR, calculateStatutoryAward, UserRole } from '@sih/shared';

function AwardsContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialParcelId = searchParams.get('parcelId') || '';

  // Interactive Live Calculator State
  const [calcInput, setCalcInput] = useState({
    baseRatePerAcre: 3500000,
    areaAcres: 2.5,
    isRural: true,
    ruralMultiplier: 1.5,
    assetsValue: 450000,
    section11Date: '2023-10-18',
    awardDate: '2024-06-30',
  });

  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [isAwardModalOpen, setIsAwardModalOpen] = useState(false);
  const [approvedAwardSuccess, setApprovedAwardSuccess] = useState<any | null>(null);

  const { data: parcelsData } = useQuery({
    queryKey: ['parcels-for-award'],
    queryFn: () => fetchApi('/parcels'),
  });

  const parcels = parcelsData?.data || [];
  const unawardedParcels = parcels.filter((p: any) => !p.valuationAward);
  const awardedParcels = parcels.filter((p: any) => p.valuationAward);

  // Auto-bind calculation to selected parcel
  useEffect(() => {
    if (selectedParcelId && parcels.length > 0) {
      const chosen = parcels.find((p: any) => p.id === selectedParcelId);
      if (chosen) {
        const assessedAssets =
          (chosen.treesCount || 0) * 25000 + (chosen.structuresCount || 0) * 200000;
        setCalcInput((prev) => ({
          ...prev,
          areaAcres: chosen.areaAcres || 2.5,
          isRural: chosen.landType ? chosen.landType.startsWith('RURAL') : true,
          assetsValue: assessedAssets > 0 ? assessedAssets : prev.assetsValue,
        }));
      }
    }
  }, [selectedParcelId, parcels]);

  // Compute live calculation
  const liveResult = calculateStatutoryAward(calcInput);

  const createAwardMutation = useMutation({
    mutationFn: (newAward: any) =>
      fetchApi('/awards', {
        method: 'POST',
        body: JSON.stringify(newAward),
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['parcels-for-award'] });
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
      setIsAwardModalOpen(false);
      setApprovedAwardSuccess(res.data);
    },
    onError: (err: any) => {
      alert(`Error formalizing award: ${err.message}`);
    },
  });


  const handleCreateAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcelId) {
      alert('Please select a parcel.');
      return;
    }

    createAwardMutation.mutate({
      parcelId: selectedParcelId,
      baseRatePerAcre: Number(calcInput.baseRatePerAcre),
      ruralMultiplier: Number(calcInput.ruralMultiplier),
      assetsValue: Number(calcInput.assetsValue),
      section11Date: calcInput.section11Date,
      awardDate: calcInput.awardDate,
    });
  };

  const canCreateAward =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.DISTRICT_COLLECTOR ||
    user?.role === UserRole.LAND_ACQUISITION_OFFICER;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Calculator className="w-6 h-6 text-gov-navy" />
            Statutory Valuation & 100% Solatium Award Engine
          </h2>
          <p className="text-xs text-slate-500">
            Automated compliance with Section 26 (Market Value), Section 29 (Assets), and Section 30 (100% Solatium + 12% Interest)
          </p>
        </div>

        {canCreateAward && unawardedParcels.length > 0 && (
          <button
            onClick={() => {
              if (unawardedParcels.length > 0) {
                setSelectedParcelId(unawardedParcels[0].id);
              }
              setIsAwardModalOpen(true);
            }}
            className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Formalize Award for Parcel</span>
          </button>
        )}
      </div>

      {/* Award Approval State Change Banner */}
      {approvedAwardSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-lg p-4 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-gov-green" />
              <span>
                Statutory Award Formalized: {formatINR(approvedAwardSuccess.totalAwardAmount)}
              </span>
            </div>
            <span className="gov-badge bg-emerald-100 text-emerald-800">
              Collector Signed • Section 26-30
            </span>
          </div>
          <p className="text-emerald-700 text-[11px]">
            Award finalized including 100% Statutory Solatium (
            {formatINR(approvedAwardSuccess.solatiumAmount)}) and 12% p.a. additional interest (
            {formatINR(approvedAwardSuccess.additionalInterestAmount)}). You can now proceed to authorize
            Direct Benefit Transfer via PFMS.
          </p>
          <div className="pt-1">
            <Link
              href="/disbursements"
              className="inline-flex items-center gap-2 bg-gov-green hover:bg-gov-green-dark text-white font-semibold px-4 py-2 rounded shadow transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              <span>Proceed to Authorize PFMS DBT Disbursement</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Statutory Formula Banner */}
      <div className="bg-slate-900 text-white p-4 rounded-lg shadow-sm text-xs flex flex-wrap items-center justify-between gap-4 border-l-4 border-gov-saffron">
        <div>
          <div className="text-gov-saffron font-bold uppercase tracking-wider text-[10px]">
            RFCTLARR Act, 2013 Statutory Compensation Equation:
          </div>
          <div className="font-mono text-sm sm:text-base font-semibold text-slate-100 mt-1">
            Total Award = [ (Market Value × Rural Multiplier) + Assets ] + 100% Solatium + 12% p.a.
            Additional Interest
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-300">
          Section 26(2) • Section 30(1) • Section 30(3)
        </div>
      </div>

      {/* Interactive Valuation Simulator & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calculator Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-gov-navy uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gov-saffron" />
              Interactive Statutory Calculator
            </h3>
            <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-600 font-mono">
              Live Evaluation
            </span>
          </div>

          <div>
            <label className="font-semibold text-slate-700">
              Base Land Rate per Acre (INR) — Sec 26
            </label>
            <input
              type="number"
              step="50000"
              value={calcInput.baseRatePerAcre}
              onChange={(e) =>
                setCalcInput({ ...calcInput, baseRatePerAcre: Number(e.target.value) })
              }
              className="w-full mt-1 border border-slate-300 rounded p-2 text-xs font-mono font-bold text-gov-navy"
            />
            <div className="text-[10px] text-slate-400 mt-0.5">
              Determined circle rate / registered agreement average
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Parcel Area (Acres)</label>
              <input
                type="number"
                step="0.1"
                value={calcInput.areaAcres}
                onChange={(e) =>
                  setCalcInput({ ...calcInput, areaAcres: Number(e.target.value) })
                }
                className="w-full mt-1 border border-slate-300 rounded p-2 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Rural Multiplier</label>
              <select
                value={calcInput.ruralMultiplier}
                onChange={(e) =>
                  setCalcInput({ ...calcInput, ruralMultiplier: Number(e.target.value) })
                }
                className="w-full mt-1 border border-slate-300 rounded p-2 text-xs bg-white"
              >
                <option value={1.0}>1.0x (Urban / Municipal)</option>
                <option value={1.25}>1.25x (Semi-Urban 0-10km)</option>
                <option value={1.5}>1.5x (Rural 10-25km)</option>
                <option value={2.0}>2.0x (Rural &gt;25km)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700">
              Assessed Assets / Trees / Structures (INR) — Sec 29
            </label>
            <input
              type="number"
              step="10000"
              value={calcInput.assetsValue}
              onChange={(e) =>
                setCalcInput({ ...calcInput, assetsValue: Number(e.target.value) })
              }
              className="w-full mt-1 border border-slate-300 rounded p-2 text-xs font-mono"
            />
            <div className="text-[10px] text-slate-400 mt-0.5">
              Evaluated by PWD Buildings and Forest Department experts
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700">Sec 11 Notice Date</label>
              <input
                type="date"
                value={calcInput.section11Date}
                onChange={(e) => setCalcInput({ ...calcInput, section11Date: e.target.value })}
                className="w-full mt-1 border border-slate-300 rounded p-2 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700">Award Pronouncement</label>
              <input
                type="date"
                value={calcInput.awardDate}
                onChange={(e) => setCalcInput({ ...calcInput, awardDate: e.target.value })}
                className="w-full mt-1 border border-slate-300 rounded p-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Real-time Math Breakdown Result (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between text-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h3 className="font-bold text-gov-navy uppercase tracking-wider text-[11px]">
                Statutory Computation Breakdown
              </h3>
              <span className="font-mono text-xs text-gov-green font-semibold">
                Days Elapsed: {liveResult.daysBetweenSec11AndAward}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded">
                <div>
                  <div className="font-semibold text-slate-800">1. Base Market Value of Land</div>
                  <div className="text-[11px] text-slate-500">
                    {formatINR(calcInput.baseRatePerAcre)} × {calcInput.areaAcres} Acres
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-800">
                  {formatINR(liveResult.marketValueLand)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded">
                <div>
                  <div className="font-semibold text-slate-800">
                    2. Multiplied Market Value (Sec 26(2))
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Base Value × {liveResult.ruralMultiplier}x factor
                  </div>
                </div>
                <div className="font-mono font-bold text-slate-800">
                  {formatINR(liveResult.multipliedMarketValue)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded">
                <div>
                  <div className="font-semibold text-slate-800">3. Assets, Trees & Structures (Sec 29)</div>
                  <div className="text-[11px] text-slate-500">Enumerated field survey valuation</div>
                </div>
                <div className="font-mono font-bold text-slate-800">
                  {formatINR(liveResult.assetsValue)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-blue-50/60 rounded border border-blue-100">
                <div>
                  <div className="font-semibold text-blue-900">
                    4. 100% Statutory Solatium (Sec 30(1))
                  </div>
                  <div className="text-[11px] text-blue-700">
                    100% on Multiplied Land Value + Assets
                  </div>
                </div>
                <div className="font-mono font-bold text-blue-900">
                  {formatINR(liveResult.solatiumAmount)}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-amber-50/60 rounded border border-amber-100">
                <div>
                  <div className="font-semibold text-amber-900">
                    5. Additional 12% p.a. Interest (Sec 30(3))
                  </div>
                  <div className="text-[11px] text-amber-700">
                    From Sec 11 date to Award date ({liveResult.daysBetweenSec11AndAward} days)
                  </div>
                </div>
                <div className="font-mono font-bold text-amber-900">
                  {formatINR(liveResult.additionalInterestAmount)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gov-navy text-white rounded-lg flex items-center justify-between">
            <div>
              <div className="text-[10px] text-gov-saffron font-bold uppercase tracking-wider">
                Total Statutory Award Payable
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono">
                {formatINR(liveResult.totalAwardAmount)}
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-300">
              Ready for Collector Approval & PFMS DBT
            </div>
          </div>
        </div>
      </div>

      {/* Table of Approved Awards */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 overflow-x-auto">
        <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider mb-3">
          Formalized & Approved Statutory Awards ({awardedParcels.length} Records)
        </h3>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Khasra No</th>
              <th>Village / Project</th>
              <th>Area</th>
              <th>Owner Name</th>
              <th>Base Rate</th>
              <th>100% Solatium</th>
              <th>12% Interest</th>
              <th>Total Award</th>
              <th>Collector Approval</th>
            </tr>
          </thead>
          <tbody>
            {awardedParcels.map((p: any) => {
              const a = p.valuationAward;
              return (
                <tr key={p.id}>
                  <td className="font-mono font-bold text-gov-navy">{p.khasraNumber}</td>
                  <td>
                    {p.village} ({p.project?.code})
                  </td>
                  <td>{p.areaAcres} Acres</td>
                  <td>{p.ownerName}</td>
                  <td className="font-mono">{formatINR(a.baseRatePerAcre)}</td>
                  <td className="font-mono text-blue-700">{formatINR(a.solatiumAmount)}</td>
                  <td className="font-mono text-amber-700">{formatINR(a.additionalInterestAmount)}</td>
                  <td className="font-mono font-bold text-gov-navy">{formatINR(a.totalAwardAmount)}</td>
                  <td>
                    <span className="gov-badge bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Formalize Award Modal */}
      {isAwardModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gov-navy mb-1">
              Formalize Award under Section 26-30
            </h3>
            <p className="text-slate-500 mb-4">
              Signs and freezes statutory compensation calculations for the selected parcel.
            </p>

            <form onSubmit={handleCreateAwardSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Land Parcel *</label>
                <select
                  required
                  value={selectedParcelId}
                  onChange={(e) => setSelectedParcelId(e.target.value)}
                  className="w-full mt-1 border border-slate-300 rounded p-2 bg-white"
                >
                  <option value="">-- Choose Parcel --</option>
                  {unawardedParcels.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      Khasra {p.khasraNumber} ({p.village}) - {p.ownerName} ({p.areaAcres} Acres)
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 p-3 rounded border text-[11px] space-y-1">
                <div className="font-semibold text-slate-700">Calculated Award Summary:</div>
                <div className="flex justify-between">
                  <span>Base Rate:</span>
                  <span className="font-mono">{formatINR(calcInput.baseRatePerAcre)} / Acre</span>
                </div>
                <div className="flex justify-between">
                  <span>100% Solatium (Sec 30(1)):</span>
                  <span className="font-mono">{formatINR(liveResult.solatiumAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>12% Interest (Sec 30(3)):</span>
                  <span className="font-mono">{formatINR(liveResult.additionalInterestAmount)}</span>
                </div>
                <div className="flex justify-between font-bold text-gov-navy pt-1 border-t border-slate-200">
                  <span>Total Award:</span>
                  <span className="font-mono">{formatINR(liveResult.totalAwardAmount)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAwardModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAwardMutation.isPending}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white font-semibold rounded shadow"
                >
                  {createAwardMutation.isPending ? 'Processing...' : 'Approve & Freeze Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AwardsPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-xs text-slate-500">
          Loading Statutory Valuation & Award Engine...
        </div>
      }
    >
      <AwardsContent />
    </Suspense>
  );
}

