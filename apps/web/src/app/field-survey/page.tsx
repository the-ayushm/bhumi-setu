'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import {
  Smartphone,
  MapPin,
  TreeDeciduous,
  Home,
  CheckCircle2,
  Camera,
  Navigation,
  Send,
  UserCheck,
  ArrowRight,
  Calculator,
} from 'lucide-react';

function FieldSurveyContent() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const initialParcelId = searchParams.get('parcelId') || '';

  const [selectedParcelId, setSelectedParcelId] = useState(initialParcelId);
  const [surveyData, setSurveyData] = useState({
    treesCount: 0,
    structuresCount: 0,
    fieldNotes: '',
    verifiedLatitude: 18.3542,
    verifiedLongitude: 73.8567,
  });
  const [gpsStatus, setGpsStatus] = useState<string>('Ready to acquire GPS');
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);

  const { data: parcelsData, isLoading } = useQuery({
    queryKey: ['parcels-for-survey'],
    queryFn: () => fetchApi('/parcels'),
  });

  const parcels = parcelsData?.data || [];
  const selectedParcel =
    parcels.find((p: any) => p.id === (selectedParcelId || initialParcelId)) || parcels[0];

  // Auto-fill parcel attributes when parcel selection changes
  useEffect(() => {
    if (selectedParcel) {
      if (!selectedParcelId) {
        setSelectedParcelId(selectedParcel.id);
      }
      setSurveyData({
        treesCount: selectedParcel.treesCount || 0,
        structuresCount: selectedParcel.structuresCount || 0,
        fieldNotes:
          selectedParcel.fieldNotes ||
          `Joint inspection completed with Village Patwari for Khasra ${selectedParcel.khasraNumber}.`,
        verifiedLatitude: selectedParcel.latitude || 18.3542,
        verifiedLongitude: selectedParcel.longitude || 73.8567,
      });
    }
  }, [selectedParcel?.id]);

  const updateSurveyMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      fetchApi(`/parcels/${id}/field-survey`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parcels-for-survey'] });
      queryClient.invalidateQueries({ queryKey: ['parcels'] });
      setIsSubmittedSuccess(true);
    },
    onError: (err: any) => {
      alert(`Error submitting survey: ${err.message}`);
    },
  });


  const handleAcquireGPS = () => {
    if ('geolocation' in navigator) {
      setGpsStatus('Acquiring satellite lock...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setSurveyData((prev) => ({
            ...prev,
            verifiedLatitude: pos.coords.latitude,
            verifiedLongitude: pos.coords.longitude,
          }));
          setGpsStatus(`Locked (Accuracy: ±${Math.round(pos.coords.accuracy)}m)`);
        },
        (err) => {
          setGpsStatus('GPS permission denied / using simulated coordinates');
        }
      );
    } else {
      setGpsStatus('Geolocation not supported by device');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const idToUpdate = selectedParcelId || (parcels.length > 0 ? parcels[0].id : null);
    if (!idToUpdate) {
      alert('Please select a parcel.');
      return;
    }

    updateSurveyMutation.mutate({
      id: idToUpdate,
      data: {
        treesCount: Number(surveyData.treesCount),
        structuresCount: Number(surveyData.structuresCount),
        fieldNotes: surveyData.fieldNotes,
        verifiedLatitude: Number(surveyData.verifiedLatitude),
        verifiedLongitude: Number(surveyData.verifiedLongitude),
      },
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      {/* Mobile-First Header */}
      <div className="bg-gov-navy text-white p-5 rounded-xl shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-gov-saffron" />
            <span className="text-xs font-bold text-gov-saffron uppercase tracking-wide">
              Mobile Field Inspection App
            </span>
          </div>
          <h2 className="text-lg font-bold mt-1">Revenue Inspector / Amin Field Desk</h2>
          <div className="text-[11px] text-slate-300 mt-0.5">
            Logged in: {user?.name} ({user?.role})
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-gov-saffron" />
        </div>
      </div>

      {/* Inspection Form */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm text-xs space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Select Surveyed Cadastral Parcel *
            </label>
            <select
              value={selectedParcelId || (selectedParcel ? selectedParcel.id : '')}
              onChange={(e) => setSelectedParcelId(e.target.value)}
              className="w-full border border-slate-300 rounded p-2.5 bg-white text-xs font-semibold text-gov-navy focus:ring-1 focus:ring-gov-navy"
            >
              {parcels.map((p: any) => (
                <option key={p.id} value={p.id}>
                  Khasra {p.khasraNumber} — Village {p.village} ({p.ownerName})
                </option>
              ))}
            </select>
          </div>

          {selectedParcel && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
              <div className="text-slate-500 font-semibold uppercase tracking-wider">
                Parcel Details:
              </div>
              <div>
                <strong>Recorded Owner:</strong> {selectedParcel.ownerName}
              </div>
              <div>
                <strong>Jurisdiction:</strong> {selectedParcel.village}, {selectedParcel.tehsil}
              </div>
              <div>
                <strong>Total Extent:</strong> {selectedParcel.areaAcres} Acres ({selectedParcel.landType})
              </div>
            </div>
          )}

          {/* GPS Coordinates Capture */}
          <div className="bg-blue-50/60 p-3.5 rounded-lg border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-blue-600" />
                Geo-Tagging (GPS Coordinates)
              </span>
              <button
                type="button"
                onClick={handleAcquireGPS}
                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1"
              >
                <span>Acquire GPS</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Latitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={surveyData.verifiedLatitude}
                  onChange={(e) =>
                    setSurveyData({ ...surveyData, verifiedLatitude: Number(e.target.value) })
                  }
                  className="w-full mt-0.5 border border-slate-300 rounded p-1.5 font-mono bg-white"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-500">Longitude:</span>
                <input
                  type="number"
                  step="0.0001"
                  value={surveyData.verifiedLongitude}
                  onChange={(e) =>
                    setSurveyData({ ...surveyData, verifiedLongitude: Number(e.target.value) })
                  }
                  className="w-full mt-0.5 border border-slate-300 rounded p-1.5 font-mono bg-white"
                />
              </div>
            </div>
            <div className="text-[10px] text-blue-700 font-medium">{gpsStatus}</div>
          </div>

          {/* Asset Enumeration */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <label className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                <TreeDeciduous className="w-4 h-4 text-gov-green" />
                Trees Count
              </label>
              <input
                type="number"
                min="0"
                value={surveyData.treesCount}
                onChange={(e) =>
                  setSurveyData({ ...surveyData, treesCount: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded p-2 text-sm font-bold bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Fruit & timber trees</span>
            </div>

            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <label className="font-bold text-slate-700 flex items-center gap-1 mb-1">
                <Home className="w-4 h-4 text-blue-600" />
                Structures Count
              </label>
              <input
                type="number"
                min="0"
                value={surveyData.structuresCount}
                onChange={(e) =>
                  setSurveyData({ ...surveyData, structuresCount: Number(e.target.value) })
                }
                className="w-full border border-slate-300 rounded p-2 text-sm font-bold bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Pucca / kachha / wells</span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Field Surveyor Remarks & Panch Nama Reference
            </label>
            <textarea
              rows={3}
              value={surveyData.fieldNotes}
              onChange={(e) => setSurveyData({ ...surveyData, fieldNotes: e.target.value })}
              placeholder="Record joint measurement observations, tree species, well depth..."
              className="w-full border border-slate-300 rounded p-2 focus:ring-1 focus:ring-gov-navy"
            />
          </div>

          {isSubmittedSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-gov-green" />
                <span>Inspection Memo Certified & Saved to Cadastre!</span>
              </div>
              <p className="text-emerald-700 text-[11px]">
                Khasra {selectedParcel?.khasraNumber} status updated to <strong>SURVEYED</strong>. You can now proceed to calculate the statutory compensation award under Section 26-30.
              </p>
              <Link
                href={`/awards?parcelId=${selectedParcel?.id}`}
                className="mt-2 inline-flex items-center gap-2 bg-gov-green hover:bg-gov-green-dark text-white font-semibold px-4 py-2 rounded shadow transition-colors"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Proceed to Formulate Award (Sec 26-30)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={updateSurveyMutation.isPending}
            className="w-full py-3 bg-gov-navy hover:bg-gov-navy-light text-white font-bold rounded-lg shadow flex items-center justify-center gap-2 text-xs transition-colors"
          >
            <Send className="w-4 h-4 text-gov-saffron" />
            <span>
              {updateSurveyMutation.isPending
                ? 'Submitting Inspection Memo...'
                : 'Upload & Certify Field Survey Memo'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default function FieldSurveyPage() {
  return (
    <Suspense
      fallback={
        <div className="text-center py-16 text-xs text-slate-500">
          Loading Mobile Field Inspection Desk...
        </div>
      }
    >
      <FieldSurveyContent />
    </Suspense>
  );
}

