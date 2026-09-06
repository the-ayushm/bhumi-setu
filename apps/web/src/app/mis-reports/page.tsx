'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import {
  FileSpreadsheet,
  Download,
  History,
  ShieldCheck,
  Search,
  Filter,
  Layers,
  ArrowDownToLine,
  UserCheck,
} from 'lucide-react';
import { formatINR } from '@sih/shared';

export default function MISReportsPage() {
  const [activeTab, setActiveTab] = useState<'mis' | 'audit'>('mis');
  const [misSearch, setMisSearch] = useState('');
  const [misSector, setMisSector] = useState('');
  const [misState, setMisState] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  const { data: misData, isLoading: isMisLoading } = useQuery({
    queryKey: ['mis-report'],
    queryFn: () => fetchApi('/reports/mis'),
  });

  const { data: auditData, isLoading: isAuditLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: () => fetchApi('/audit-logs'),
  });

  const misRows = misData?.data || [];
  const auditLogs = auditData?.data || [];

  // Client-side filtering for MIS Report
  const filteredMisRows = misRows.filter((r: any) => {
    const matchesSearch =
      !misSearch ||
      r.projectName?.toLowerCase().includes(misSearch.toLowerCase()) ||
      r.projectCode?.toLowerCase().includes(misSearch.toLowerCase()) ||
      r.district?.toLowerCase().includes(misSearch.toLowerCase());
    const matchesSector = !misSector || r.sector === misSector;
    const matchesState = !misState || r.state === misState;
    return matchesSearch && matchesSector && matchesState;
  });

  // Client-side filtering for Audit Trail
  const filteredAuditLogs = auditLogs.filter((log: any) => {
    if (!auditSearch) return true;
    const term = auditSearch.toLowerCase();
    return (
      log.action?.toLowerCase().includes(term) ||
      log.userRole?.toLowerCase().includes(term) ||
      log.entityType?.toLowerCase().includes(term) ||
      log.user?.name?.toLowerCase().includes(term)
    );
  });

  const handleDownloadCSV = () => {
    window.open('/api/v1/reports/mis?format=csv', '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-gov-navy" />
            Statutory MIS Reports & Tamper-Evident Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Form-wise reporting, parliamentary questions support, and immutable governance event logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="bg-gov-green hover:bg-gov-green-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Official CSV (Excel)</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('mis')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'mis'
              ? 'border-gov-navy text-gov-navy bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>National MIS Report Table ({filteredMisRows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'border-gov-navy text-gov-navy bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Immutable Audit Trail ({filteredAuditLogs.length})</span>
        </button>
      </div>

      {activeTab === 'mis' ? (
        /* MIS Table View with Filters */
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by project code, name, or district..."
                value={misSearch}
                onChange={(e) => setMisSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={misSector}
                onChange={(e) => setMisSector(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none"
              >
                <option value="">All Sectors</option>
                <option value="HIGHWAYS">Highways</option>
                <option value="RAILWAYS">Railways</option>
                <option value="IRRIGATION">Irrigation</option>
                <option value="INDUSTRIAL_CORRIDOR">Industrial Corridor</option>
              </select>

              <select
                value={misState}
                onChange={(e) => setMisState(e.target.value)}
                className="border border-slate-300 rounded px-3 py-2 bg-white text-slate-700 focus:outline-none"
              >
                <option value="">All States</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Bihar">Bihar</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 overflow-x-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider">
                Land Acquisition Summary Statement ({filteredMisRows.length} of {misRows.length} Projects)
              </h3>
              <span className="text-[11px] text-slate-400">Format Compliant with MoRD Annual Report</span>
            </div>

            <table className="gov-table">
              <thead>
                <tr>
                  <th>Project Code</th>
                  <th>Project Name</th>
                  <th>Sector</th>
                  <th>State / District</th>
                  <th>Agency</th>
                  <th>Stage</th>
                  <th>Area (Ha)</th>
                  <th>Parcels</th>
                  <th>Awarded (Cr)</th>
                  <th>Disbursed (Cr)</th>
                  <th>Risk</th>
                </tr>
              </thead>
              <tbody>
                {filteredMisRows.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-8 text-slate-400">
                      No projects match the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredMisRows.map((r: any) => (
                    <tr key={r.projectCode}>
                      <td className="font-mono font-bold text-gov-navy">{r.projectCode}</td>
                      <td className="font-semibold text-slate-900 max-w-xs truncate">{r.projectName}</td>
                      <td>{r.sector}</td>
                      <td>
                        {r.state} ({r.district})
                      </td>
                      <td className="max-w-[120px] truncate">{r.agency}</td>
                      <td className="text-xs text-gov-saffron-dark font-medium">
                        {r.currentStage.replace(/_/g, ' ')}
                      </td>
                      <td>{r.totalAreaHectares}</td>
                      <td>{r.parcelsCount}</td>
                      <td className="font-mono font-bold text-slate-800">₹{r.awardedAmountCr} Cr</td>
                      <td className="font-mono font-bold text-gov-green">₹{r.disbursedAmountCr} Cr</td>
                      <td>
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
                          {r.riskLevel}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Audit Trail View with Search Filter */
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm flex items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search audit trail by user, action code, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-gov-navy"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              {filteredAuditLogs.length} Verified Events
            </span>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 overflow-x-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-gov-navy uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gov-green" />
                Tamper-Evident Event Log & Non-Repudiation Audit Trail
              </h3>
              <span className="text-[11px] text-slate-400">Cryptographically Recorded Actions</span>
            </div>

            <table className="gov-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Official User</th>
                  <th>Role</th>
                  <th>Action Type</th>
                  <th>Entity Target</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No audit events match the search query.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log: any) => (
                    <tr key={log.id}>
                      <td className="font-mono text-xs">
                        {new Date(log.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td className="font-semibold text-slate-900">
                        {log.user?.name || 'Authorized Official'}
                      </td>
                      <td>
                        <span className="gov-badge bg-slate-100 text-slate-800">{log.userRole}</span>
                      </td>
                      <td className="font-mono text-xs font-bold text-gov-navy">{log.action}</td>
                      <td>
                        <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          {log.entityType} ({log.entityId?.substring(0, 8)}...)
                        </span>
                      </td>
                      <td className="font-mono text-xs text-slate-500">{log.ipAddress}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

