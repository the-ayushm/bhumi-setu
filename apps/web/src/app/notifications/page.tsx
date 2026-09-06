'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Scroll,
  PlusCircle,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Newspaper,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { NotificationSection, UserRole } from '@sih/shared';

export default function NotificationsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSection, setSelectedSection] = useState('');
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    projectId: '',
    section: NotificationSection.SECTION_11_PRELIMINARY,
    gazetteNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    newspaperLocal1: '',
    newspaperLocal2: '',
    documentUrl: '',
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => fetchApi('/projects'),
  });

  const { data: notifsData, isLoading } = useQuery({
    queryKey: ['notifications', selectedSection],
    queryFn: () => {
      const params = new URLSearchParams();
      if (selectedSection) params.append('section', selectedSection);
      return fetchApi(`/notifications?${params.toString()}`);
    },
  });

  const publishMutation = useMutation({
    mutationFn: (newNotif: any) =>
      fetchApi('/notifications', {
        method: 'POST',
        body: JSON.stringify(newNotif),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsPublishModalOpen(false);
      alert('Statutory Gazette Notification published and registered successfully!');
    },
    onError: (err: any) => {
      alert(`Error publishing notification: ${err.message}`);
    },
  });

  const objectionMutation = useMutation({
    mutationFn: ({ id, resolved }: { id: string; resolved: boolean }) =>
      fetchApi(`/notifications/${id}/objections`, {
        method: 'POST',
        body: JSON.stringify({ resolved }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    publishMutation.mutate(formData);
  };

  const projects = projectsData?.data || [];
  const notifications = notifsData?.data || [];

  const canPublish =
    user?.role === UserRole.NATIONAL_ADMIN ||
    user?.role === UserRole.STATE_NODAL_OFFICER ||
    user?.role === UserRole.DISTRICT_COLLECTOR;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gov-navy flex items-center gap-2">
            <Scroll className="w-6 h-6 text-gov-navy" />
            Statutory Gazette Notifications & Section 15 Objections
          </h2>
          <p className="text-xs text-slate-500">
            Official publication registry under Section 4 (SIA), Section 11 (Preliminary), and Section 19 (Declaration)
          </p>
        </div>

        {canPublish && (
          <button
            onClick={() => {
              if (projects.length > 0 && !formData.projectId) {
                setFormData((prev) => ({ ...prev, projectId: projects[0].id }));
              }
              setIsPublishModalOpen(true);
            }}
            className="bg-gov-saffron hover:bg-gov-saffron-dark text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Publish Gazette Notification</span>
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Filter Section:</span>
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 bg-white text-slate-700 focus:outline-none"
          >
            <option value="">All Statutory Sections</option>
            <option value="SECTION_4_SIA">Section 4 — SIA Study</option>
            <option value="SECTION_11_PRELIMINARY">Section 11 — Preliminary Notification</option>
            <option value="SECTION_19_DECLARATION">Section 19 — Declaration of Acquisition</option>
          </select>
        </div>

        <div className="text-slate-500 font-mono text-[11px]">
          Showing {notifications.length} Gazette Orders
        </div>
      </div>

      {/* Notifications Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading Official Gazettes...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-8 text-center text-xs text-slate-500 rounded border">
            No gazette notifications found.
          </div>
        ) : (
          notifications.map((n: any) => (
            <div
              key={n.id}
              className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`gov-badge ${
                      n.section === 'SECTION_19_DECLARATION'
                        ? 'bg-purple-100 text-purple-800'
                        : n.section === 'SECTION_11_PRELIMINARY'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {n.section.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono text-xs font-bold text-gov-navy">
                    Gazette Reg: {n.gazetteNumber}
                  </span>
                </div>

                <div className="text-sm font-bold text-gov-navy">
                  {n.project?.name} ({n.project?.code})
                </div>

                <div className="text-xs text-slate-600 flex flex-wrap items-center gap-3">
                  <span>
                    <strong>Issue Date:</strong> {new Date(n.issueDate).toLocaleDateString('en-IN')}
                  </span>
                  {n.expiryDate && (
                    <span>
                      <strong>Objection Closes:</strong>{' '}
                      {new Date(n.expiryDate).toLocaleDateString('en-IN')}
                    </span>
                  )}
                  <span>
                    <strong>Jurisdiction:</strong> {n.project?.district}, {n.project?.state}
                  </span>
                </div>

                {(n.newspaperLocal1 || n.newspaperLocal2) && (
                  <div className="text-[11px] text-slate-500 flex items-center gap-2 pt-1">
                    <Newspaper className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Published in Vernacular Press: {[n.newspaperLocal1, n.newspaperLocal2].filter(Boolean).join(' & ')}
                    </span>
                  </div>
                )}
              </div>

              {/* Objections Panel & PDF Link */}
              <div className="flex flex-col sm:items-end gap-3 border-t md:border-t-0 pt-3 md:pt-0">
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700 min-w-[200px]">
                  <div className="font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Section 15 Objections:</span>
                    <span className="font-bold text-gov-navy">{n.objectionsCount} Filed</span>
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>Resolved by Collector:</span>
                    <span className="font-semibold text-gov-green">{n.objectionsResolved}</span>
                  </div>

                  {user?.role === UserRole.DISTRICT_COLLECTOR && (
                    <div className="mt-2 flex gap-1.5">
                      <button
                        onClick={() => objectionMutation.mutate({ id: n.id, resolved: false })}
                        className="text-[10px] bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded font-medium"
                      >
                        + Add Objection
                      </button>
                      <button
                        onClick={() => objectionMutation.mutate({ id: n.id, resolved: true })}
                        className="text-[10px] bg-gov-green hover:bg-gov-green-dark text-white px-2 py-0.5 rounded font-medium"
                      >
                        ✓ Mark Resolved
                      </button>
                    </div>
                  )}
                </div>

                {n.documentUrl && (
                  <a
                    href={n.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-gov-navy hover:text-gov-saffron flex items-center gap-1.5"
                  >
                    <span>Download Official Gazette Copy (PDF)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Publish Notification Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl text-xs max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-gov-navy mb-1">
              Issue Official Statutory Gazette Notification
            </h3>
            <p className="text-slate-500 mb-4">
              Simulates e-Gazette registration and newspaper publication recording.
            </p>

            <form onSubmit={handlePublishSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700">Select Project *</label>
                <select
                  required
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Section Type *</label>
                  <select
                    value={formData.section}
                    onChange={(e) =>
                      setFormData({ ...formData, section: e.target.value as NotificationSection })
                    }
                    className="w-full mt-1 border border-slate-300 rounded p-2 bg-white"
                  >
                    <option value="SECTION_4_SIA">Section 4 (SIA)</option>
                    <option value="SECTION_11_PRELIMINARY">Section 11 (Preliminary)</option>
                    <option value="SECTION_19_DECLARATION">Section 19 (Declaration)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700">Gazette No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DL-(N)/04/0021/2024"
                    value={formData.gazetteNumber}
                    onChange={(e) => setFormData({ ...formData, gazetteNumber: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Expiry / Objection End</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700">Local Newspaper 1</label>
                  <input
                    type="text"
                    placeholder="e.g. Sakal Daily"
                    value={formData.newspaperLocal1}
                    onChange={(e) => setFormData({ ...formData, newspaperLocal1: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Local Newspaper 2</label>
                  <input
                    type="text"
                    placeholder="e.g. Lokmat"
                    value={formData.newspaperLocal2}
                    onChange={(e) => setFormData({ ...formData, newspaperLocal2: e.target.value })}
                    className="w-full mt-1 border border-slate-300 rounded p-2"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishMutation.isPending}
                  className="px-4 py-2 bg-gov-navy hover:bg-gov-navy-light text-white font-semibold rounded shadow"
                >
                  {publishMutation.isPending ? 'Publishing...' : 'Confirm Publication'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
