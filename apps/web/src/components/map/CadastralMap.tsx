'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface CadastralMapProps {
  parcels: any[];
  selectedParcelId: string | null;
  onSelectParcel: (parcel: any) => void;
}

export default function CadastralMap({
  parcels,
  selectedParcelId,
  onSelectParcel,
}: CadastralMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Western India (Pune Corridor)
      const map = L.map(mapContainerRef.current).setView([18.355, 73.86], 12);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors | Survey of India / MoRD',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    if (markersGroup) {
      markersGroup.clearLayers();

      const bounds = L.latLngBounds([]);

      parcels.forEach((p) => {
        if (!p.latitude || !p.longitude) return;

        const isSelected = p.id === selectedParcelId;

        // Custom Government Cadastral Marker icon
        const color =
          p.status === 'DISBURSED'
            ? '#137547'
            : p.status === 'VALUATION_DONE' || p.status === 'AWARD_APPROVED'
            ? '#2563EB'
            : p.status === 'LITIGATION_STAY'
            ? '#DC2626'
            : p.status === 'POSSESSION_TAKEN'
            ? '#7C3AED'
            : '#D97706';

        const customHtml = `
          <div style="
            background-color: ${color};
            color: white;
            padding: 3px 6px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid ${isSelected ? '#FF6F00' : 'white'};
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            <span>Khasra ${p.khasraNumber}</span>
          </div>
        `;

        const icon = L.divIcon({
          html: customHtml,
          className: 'cadastral-div-icon',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        const marker = L.marker([p.latitude, p.longitude], { icon });

        marker.on('click', () => {
          onSelectParcel(p);
        });

        // Add a representative polygon around the parcel
        const offset = 0.0012;
        const poly = L.polygon(
          [
            [p.latitude - offset, p.longitude - offset],
            [p.latitude + offset, p.longitude - offset],
            [p.latitude + offset, p.longitude + offset],
            [p.latitude - offset, p.longitude + offset],
          ],
          {
            color: isSelected ? '#FF6F00' : color,
            fillColor: color,
            fillOpacity: isSelected ? 0.45 : 0.2,
            weight: isSelected ? 3 : 1.5,
          }
        );

        poly.on('click', () => {
          onSelectParcel(p);
        });

        poly.addTo(markersGroup);
        marker.addTo(markersGroup);
        bounds.extend([p.latitude, p.longitude]);
      });

      if (parcels.length > 0 && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [parcels, selectedParcelId]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-lg overflow-hidden border border-slate-300 shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-md shadow border border-slate-200 text-[11px] space-y-1">
        <div className="font-bold text-gov-navy mb-1.5 uppercase tracking-wide text-[10px]">
          Cadastral Status Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-700" />
          <span>PFMS Disbursed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-600" />
          <span>Award Formulated</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-600" />
          <span>Surveyed / Valuation Done</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-600" />
          <span>Litigation Stay / Disputed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-purple-700" />
          <span>Sec 38 Possession Taken</span>
        </div>
      </div>
    </div>
  );
}
