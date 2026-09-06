'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  Home,
  CheckCircle2,
  Clock,
  HeartHandshake,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  Coins,
  Truck,
} from 'lucide-react';
import { UserRole, HousingEntitlementStatus, OverallRRStatus } from '@sih/shared';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function RRMonitoringPage() {
  return (
    <RoleGuard routePath="/rr-monitoring">
      <RRMonitoringContent />
    </RoleGuard>
  );
}

function RRMonitoringContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isAddFamilyModalOpen, setIsAddFamilyModalOpen] = useState(false);

  const [familyForm, setFamilyForm] = useState({
    projectId: '',
    familyHeadName: '',
    category: 'OBC',
    membersCount: 4,
    isLosingHomestead: true,
    isLosingLivelihood: true,
    housingEntitlementStatus: HousingEntitlementStatus.PENDING,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects'),
  });

  const { data: familiesData, isLoading } = useQuery({
    queryKey: ['rr-families', selectedProjectId],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedProjectId) params.append('projectId', selectedProjectId);
      return fetchApi(`/rr/families?${params.toString()}`);
    },
  });

  const updateEntitlementMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchApi(`/rr/families/${id}/entitlement`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rr-families'] });
    },
  });

  const addFamilyMutation = useMutation({
    mutationFn: (newFamily: any) =>
      fetchApi('/rr/families', {
        method: 'POST',
        body: JSON.stringify(newFamily),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rr-families'] });
      setIsAddFamilyModalOpen(false);
      alert('Affected family registered in R&R Census!');
    },
  });

  const projects = projectsData?.data || [];
  const families = familiesData?.data || [];

  const totalFamilies = families.length;
  const housingAllottedCount = families.filter(
    (f: any) => f.housingEntitlementStatus === 'ALLOTTED_PUCCA_HOUSE'
  ).length;
  const subsistenceGrantDisbursedCount = families.filter((f: any) => f.subsistenceGrantPaid).length;
  const resettlementAllowanceCount = families.filter(
    (f: any) => f.resettlementAllowancePaid
  ).length;

  const complianceScore =
    totalFamilies > 0
      ? Math.round(
          ((housingAllottedCount + subsistenceGrantDisbursedCount + resettlementAllowanceCount) /
            (totalFamilies * 3)) *
            100
        )
      : 100;

  const canEdit =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.DISTRICT_COLLECTOR ||
    user?.role === UserRole.LAND_ACQUISITION_OFFICER;

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Users className="w-6 h-6 text-gov-navy" />
            Rehabilitation & Resettlement (R&R) Monitoring
          </h2>
          <p className="text-xs text-slate-500">
            Enforcing Second Schedule statutory entitlements for displaced and affected families
          </p>
        </div>

        {canEdit && (
          <button
            onClick={() => {
              if (projects.length > 0 && !familyForm.projectId) {
                setFamilyForm((prev) => ({ ...prev, projectId: projects[0].id }));
              }
              setIsAddFamilyModalOpen(true);
            }}
            className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Family to R&R Census</span>
          </button>
        )}
      </div>

      {/* R&R Compliance Scorecard */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-gov-navy">
          <div className="text-xs font-semibold text-slate-500 uppercase">Affected Families</div>
          <div className="text-2xl font-bold text-gov-navy mt-1">{totalFamilies}</div>
          <div className="text-[11px] text-slate-400 mt-1">Second Schedule Census</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-blue-600">
          <div className="text-xs font-semibold text-slate-500 uppercase">Housing Allotted</div>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            {housingAllottedCount} / {families.filter((f: any) => f.isLosingHomestead).length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Pucca House (Min 50 sq.m.)</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-emerald-600">
          <div className="text-xs font-semibold text-slate-500 uppercase">Subsistence Grants</div>
          <div className="text-2xl font-bold text-gov-green mt-1">
            {subsistenceGrantDisbursedCount} / {totalFamilies}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">₹3,000/mo × 12 Mos (₹36,000)</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm border-l-4 border-l-purple-600">
          <div className="text-xs font-semibold text-slate-500 uppercase">R&R Compliance Index</div>
          <div className="text-2xl font-bold text-purple-700 mt-1">{complianceScore}%</div>
          <div className="text-[11px] text-slate-400 mt-1">Statutory Entitlement Score</div>
        </div>
      </div>

      {/* Families Census Schedule Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 overflow-x-auto">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
            Displaced & Affected Families Census Registry ({families.length} Records)
          </h3>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none max-w-[240px] truncate"
          >
            <option value="">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>

        <table className="gov-table">
          <thead>
            <tr>
              <th>Family Head</th>
              <th>Category</th>
              <th>Members</th>
              <th>Impact Profile</th>
              <th>Housing Entitlement</th>
              <th>Subsistence Grant (₹36k)</th>
              <th>Resettlement Allowance (₹50k)</th>
              <th>R&R Status</th>
            </tr>
          </thead>
          <tbody>
            {families.map((f: any) => (
              <tr key={f.id}>
                <td className="font-bold text-gov-navy">{f.familyHeadName}</td>
                <td>
                  <span className="gov-badge bg-slate-100 text-slate-800">{f.category}</span>
                </td>
                <td>{f.membersCount}</td>
                <td className="text-[11px]">
                  {f.isLosingHomestead && (
                    <span className="text-red-700 block">• Losing Homestead</span>
                  )}
                  {f.isLosingLivelihood && (
                    <span className="text-amber-700 block">• Losing Livelihood</span>
                  )}
                  {!f.isLosingHomestead && !f.isLosingLivelihood && (
                    <span className="text-slate-400">Partial Land Impact</span>
                  )}
                </td>
                <td>
                  <span
                    className={`gov-badge ${
                      f.housingEntitlementStatus === 'ALLOTTED_PUCCA_HOUSE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : f.housingEntitlementStatus === 'GRANT_IN_LIEU_INR_150000'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {f.housingEntitlementStatus.replace(/_/g, ' ')}
                  </span>
                  {canEdit && f.housingEntitlementStatus === 'PENDING' && (
                    <button
                      onClick={() =>
                        updateEntitlementMutation.mutate({
                          id: f.id,
                          data: { housingEntitlementStatus: 'ALLOTTED_PUCCA_HOUSE' },
                        })
                      }
                      className="text-[10px] block mt-1 text-blue-600 hover:underline font-semibold"
                    >
                      + Allot Pucca House
                    </button>
                  )}
                </td>
                <td>
                  {f.subsistenceGrantPaid ? (
                    <span className="gov-badge bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  ) : (
                    <div>
                      <span className="gov-badge bg-amber-100 text-amber-800">Pending</span>
                      {canEdit && (
                        <button
                          onClick={() =>
                            updateEntitlementMutation.mutate({
                              id: f.id,
                              data: { subsistenceGrantPaid: true },
                            })
                          }
                          className="text-[10px] block mt-1 text-gov-green hover:underline font-semibold"
                        >
                          Disburse ₹36k &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  {f.resettlementAllowancePaid ? (
                    <span className="gov-badge bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                      <CheckCircle2 className="w-3 h-3" />
                      Paid
                    </span>
                  ) : (
                    <div>
                      <span className="gov-badge bg-amber-100 text-amber-800">Pending</span>
                      {canEdit && (
                        <button
                          onClick={() =>
                            updateEntitlementMutation.mutate({
                              id: f.id,
                              data: { resettlementAllowancePaid: true },
                            })
                          }
                          className="text-[10px] block mt-1 text-gov-green hover:underline font-semibold"
                        >
                          Disburse ₹50k &rarr;
                        </button>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <span className="font-mono text-xs font-bold text-gov-navy">
                    {f.overallRRStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Family Modal */}
      {isAddFamilyModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl text-xs">
            <h3 className="text-base font-bold text-gov-navy mb-1">
              Add Affected Family (Section 16 Census)
            </h3>
            <p className="text-slate-500 mb-4">
              Registers family in Administrator R&R Scheme under RFCTLARR Act 2013.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                addFamilyMutation.mutate(familyForm);
              }}
              className="space-y-3"
            >
              <div>
                <label className="font-semibold text-slate-700">Select Project *</label>
                <select
                  required
                  value={familyForm.projectId}
                  onChange={(e) => setFamilyForm({ ...familyForm, projectId: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded p-2 bg-white"
                >
                  <option value="">-- Choose Project --</option>
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Family Head Full Name *</label>
                <input
                  type="text"
                  required
                  value={familyForm.familyHeadName}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, familyHeadName: e.target.value })
                  }
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Social Category</label>
                  <select
                    value={familyForm.category}
                    onChange={(e) => setFamilyForm({ ...familyForm, category: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="GENERAL">General</option>
                    <option value="BPL">BPL</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Members Count</label>
                  <input
                    type="number"
                    min="1"
                    value={familyForm.membersCount}
                    onChange={(e) =>
                      setFamilyForm({ ...familyForm, membersCount: Number(e.target.value) })
                    }
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={familyForm.isLosingHomestead}
                    onChange={(e) =>
                      setFamilyForm({ ...familyForm, isLosingHomestead: e.target.checked })
                    }
                    className="rounded text-gov-navy focus:ring-gov-navy"
                  />
                  <span>Family is Losing Homestead (Pucca House required)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={familyForm.isLosingLivelihood}
                    onChange={(e) =>
                      setFamilyForm({ ...familyForm, isLosingLivelihood: e.target.checked })
                    }
                    className="rounded text-gov-navy focus:ring-gov-navy"
                  />
                  <span>Family is Losing Primary Rural Livelihood</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddFamilyModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addFamilyMutation.isPending}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white font-semibold rounded shadow"
                >
                  {addFamilyMutation.isPending ? 'Saving...' : 'Register in Census'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
