'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  FolderGit2,
  PlusCircle,
  Search,
  Filter,
  AlertTriangle,
  ArrowRight,
  Building,
  MapPin,
  Layers,
  IndianRupee,
  Clock,
} from 'lucide-react';
import { UserRole, Sector } from '@sih/shared';

export default function ProjectsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    sector: Sector.HIGHWAYS,
    requisitioningAgency: 'National Highways Authority of India (NHAI)',
    state: 'Maharashtra',
    district: 'Pune',
    totalAreaHectares: 150.0,
    estimatedBudgetCr: 1200.0,
    compensationBudgetCr: 450.0,
  });

  const { data: projectsData, isLoading } = useQuery({
    queryKey: ['projects', search, selectedSector, selectedState],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedSector) params.append('sector', selectedSector);
      if (selectedState) params.append('state', selectedState);
      return fetchApi(`/projects?${params.toString()}`);
    },
  });

  const createMutation = useMutation({
    mutationFn: (newProject: any) =>
      fetchApi('/projects', {
        method: 'POST',
        body: JSON.stringify(newProject),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsCreateModalOpen(false);
      alert('Project proposal submitted successfully under Section 3(e) / Rules!');
    },
    onError: (err: any) => {
      alert(`Error submitting proposal: ${err.message}`);
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      totalAreaHectares: Number(formData.totalAreaHectares),
      estimatedBudgetCr: Number(formData.estimatedBudgetCr),
      compensationBudgetCr: Number(formData.compensationBudgetCr),
    });
  };

  const projects = projectsData?.data || [];

  const canCreate =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.REQUISITIONING_AGENCY;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <FolderGit2 className="w-6 h-6 text-gov-navy" />
            National Land Acquisition Projects Portfolio
          </h2>
          <p className="text-xs text-slate-500">
            Digital tracking of gazetted proposals, preliminary notices, awards, and possession
          </p>
        </div>

        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Requisition Proposal</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by project name, code, district, or agency..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Infrastructure Sectors</option>
            {Object.values(Sector).map((sec) => (
              <option key={sec} value={sec}>
                {sec.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="text-xs border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Bihar">Bihar</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Gujarat">Gujarat</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-xs text-slate-500">
          Loading National Projects Repository...
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-slate-200">
          <p className="text-slate-500 text-sm">No land acquisition projects match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((proj: any) => {
            const isHighRisk = proj.riskLevel === 'CRITICAL' || proj.riskLevel === 'HIGH';

            return (
              <div
                key={proj.id}
                className={`bg-white rounded-lg border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                  isHighRisk ? 'border-red-300 border-l-4 border-l-red-600' : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {proj.code}
                    </span>
                    <span
                      className={`gov-badge ${
                        proj.riskLevel === 'CRITICAL'
                          ? 'bg-red-100 text-red-800'
                          : proj.riskLevel === 'HIGH'
                          ? 'bg-orange-100 text-orange-800'
                          : proj.riskLevel === 'MEDIUM'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {proj.riskLevel} RISK (SCORE {proj.riskScore})
                    </span>
                  </div>

                  <Link href={`/projects/${proj.id}`} className="hover:text-gov-navy-light">
                    <h3 className="text-base font-bold text-gov-navy leading-snug line-clamp-2">
                      {proj.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] text-slate-600 bg-slate-50 p-3 rounded">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{proj.requisitioningAgency}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {proj.district}, {proj.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>{proj.totalAreaHectares} Hectares</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
                      <span>₹{proj.compensationBudgetCr} Cr Compensation</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gov-saffron-dark">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{proj.currentStage.replace(/_/g, ' ')}</span>
                  </div>

                  <Link
                    href={`/projects/${proj.id}`}
                    className="text-xs font-bold text-gov-navy hover:text-gov-navy-light flex items-center gap-1"
                  >
                    <span>View Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Requisition Proposal Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gov-navy mb-1">
              Submit Land Acquisition Requisition Proposal
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Initiates Stage 1 Requisition under RFCTLARR Act 2013 rules.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Project Title *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. NH-48 6-Lane Expansion Corridor"
                  className="w-full mt-1 border border-slate-300 rounded p-2 focus:ring-1 focus:ring-gov-navy"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Project Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. NHAI-MAH-EXP-2024"
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Sector *</label>
                  <select
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value as Sector })}
                    className="w-full mt-1 border border-slate-300 rounded p-2 bg-white"
                  >
                    {Object.values(Sector).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Requisitioning Agency *</label>
                <input
                  type="text"
                  required
                  value={formData.requisitioningAgency}
                  onChange={(e) => setFormData({ ...formData, requisitioningAgency: e.target.value })}
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">District *</label>
                  <input
                    type="text"
                    required
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Area (Hectares) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.totalAreaHectares}
                    onChange={(e) => setFormData({ ...formData, totalAreaHectares: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Total Budget (Cr) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.estimatedBudgetCr}
                    onChange={(e) => setFormData({ ...formData, estimatedBudgetCr: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Comp. Budget (Cr) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.compensationBudgetCr}
                    onChange={(e) => setFormData({ ...formData, compensationBudgetCr: Number(e.target.value) })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Detailed Scope & Purpose *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe corridor alignment, public purpose justification under Section 2(1)..."
                  className="w-full mt-1 border border-slate-300 rounded p-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white font-semibold rounded shadow"
                >
                  {createMutation.isPending ? 'Submitting...' : 'Register Proposal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
