'use client';

import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, MapPin, ZoomIn, Eye, ShieldAlert, CheckCircle2, IndianRupee } from 'lucide-react';

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
  const layersGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const parcelLayersMap = useRef<Map<string, { poly: L.Polygon; popup: L.Popup }>>(new Map());

  const [mapType, setMapType] = useState<'satellite' | 'streets'>('satellite');
  const [activeCorridor, setActiveCorridor] = useState<'pune' | 'edfc' | 'all'>('pune');

  // Generate realistic cadastral parcel boundary polygon vertices
  const getParcelPolygonCoordinates = (p: any, index: number): [number, number][] => {
    const lat = p.latitude;
    const lng = p.longitude;
    const area = p.areaAcres || 2.5;

    // Radius factor scaled to acreage
    const rLat = 0.0016 * Math.sqrt(area / 2.0);
    const rLng = 0.0022 * Math.sqrt(area / 2.0);

    // Controlled pseudo-random offset based on khasra number hash for organic field shape
    const seed = (p.khasraNumber?.charCodeAt(0) || 48) + index * 13;
    const skew1 = ((seed % 7) - 3) * 0.0002;
    const skew2 = (((seed * 3) % 7) - 3) * 0.0002;
    const skew3 = (((seed * 5) % 7) - 3) * 0.0002;

    return [
      [lat - rLat + skew1, lng - rLng],
      [lat + rLat * 0.9, lng - rLng + skew2],
      [lat + rLat + skew3, lng + rLng * 0.8],
      [lat + rLat * 0.2, lng + rLng * 1.1],
      [lat - rLat * 0.95, lng + rLng * 0.9],
      [lat - rLat + skew2, lng - rLng * 0.2],
    ];
  };

  // Get status color palette
  const getParcelStyle = (status: string, isSelected: boolean) => {
    let fill = '#10B981'; // Green: Acquired / Disbursed
    let stroke = '#047857';

    if (status === 'LITIGATION_STAY') {
      fill = '#EF4444'; // Red: Problem / Judicial Stay
      stroke = '#B91C1C';
    } else if (status === 'VALUATION_DONE' || status === 'AWARD_APPROVED') {
      fill = '#F59E0B'; // Yellow/Amber: Valuation / In Negotiation
      stroke = '#B45309';
    } else if (status === 'POSSESSION_TAKEN') {
      fill = '#8B5CF6'; // Purple: Final Possession Taken
      stroke = '#6D28D9';
    } else if (status === 'SURVEYED' || status === 'NOTIFIED') {
      fill = '#3B82F6'; // Blue: Preliminary Survey
      stroke = '#1D4ED8';
    }

    if (isSelected) {
      return {
        fillColor: fill,
        fillOpacity: 0.75,
        color: '#F59E0B',
        weight: 4,
        dashArray: undefined,
      };
    }

    return {
      fillColor: fill,
      fillOpacity: 0.5,
      color: stroke,
      weight: 2,
    };
  };

  // Switch Tile Layer (Satellite vs OpenStreetMap)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    if (mapType === 'satellite') {
      tileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Esri, Maxar, Earthstar Geographics | DoLR Cadastral GIS',
          maxZoom: 19,
        }
      ).addTo(map);
    } else {
      tileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors | Survey of India / MoRD',
          maxZoom: 19,
        }
      ).addTo(map);
    }
  }, [mapType]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Pune Western Ring Road Corridor (high density cadastral parcels)
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([18.355, 73.859], 15);

    L.control.zoom({ position: 'topright' }).addTo(map);

    tileLayerRef.current = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        attribution: 'Esri, Maxar | DoLR Cadastral GIS',
        maxZoom: 19,
      }
    ).addTo(map);

    layersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
  }, []);

  // Render Land Parcel Polygons, Badges, and Popups
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layersGroup = layersGroupRef.current;
    if (!map || !layersGroup) return;

    layersGroup.clearLayers();
    parcelLayersMap.current.clear();

    const bounds = L.latLngBounds([]);

    parcels.forEach((p, idx) => {
      if (!p.latitude || !p.longitude) return;

      const isSelected = p.id === selectedParcelId;
      const polyCoords = getParcelPolygonCoordinates(p, idx);
      const style = getParcelStyle(p.status, isSelected);

      // Status Labels & Badges
      const statusText =
        p.status === 'DISBURSED'
          ? 'Acquired (PFMS Disbursed)'
          : p.status === 'LITIGATION_STAY'
          ? 'Litigation Stay / Disputed'
          : p.status === 'POSSESSION_TAKEN'
          ? 'Possession Taken (Sec 38)'
          : p.status === 'VALUATION_DONE'
          ? 'Valuation Done / Processing'
          : 'Surveyed / Notified';

      const statusBadgeColor =
        p.status === 'DISBURSED'
          ? 'bg-emerald-600 text-white'
          : p.status === 'LITIGATION_STAY'
          ? 'bg-red-600 text-white animate-pulse'
          : p.status === 'VALUATION_DONE'
          ? 'bg-amber-500 text-white'
          : 'bg-blue-600 text-white';

      // 1. Create Polygon for the Land Parcel
      const polygon = L.polygon(polyCoords, style);

      // 2. Rich Cadastral Popup (Matching Government Land Information System)
      const approxValuation = (
        ((p.baseRate || 3500000) * (p.areaAcres || 2) * 2) /
        100000
      ).toFixed(1);

      const popupContent = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 0; max-width: 290px;">
          <div style="background: #0f172a; color: white; padding: 10px 12px; border-top-left-radius: 7px; border-top-right-radius: 7px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; color: #f59e0b; font-weight: 700;">Government of India • DoLR</div>
              <div style="font-size: 14px; font-weight: 800;">Khasra / Plot No. ${p.khasraNumber}</div>
            </div>
            <span style="font-size: 10px; font-weight: 700; padding: 3px 7px; border-radius: 4px;" class="${statusBadgeColor}">
              ${p.status === 'DISBURSED' ? 'ACQUIRED' : p.status === 'LITIGATION_STAY' ? 'STAY / RED' : 'IN PROGRESS'}
            </span>
          </div>

          <div style="padding: 10px 12px; background: #ffffff; font-size: 12px; color: #1e293b;">
            <div style="display: grid; grid-template-columns: 1fr; gap: 6px;">
              <div style="border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase;">Recorded Titleholder</span>
                <span style="font-weight: 700; font-size: 13px; color: #0f172a;">${p.ownerName}</span>
              </div>

              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                <div>
                  <span style="color: #64748b; font-size: 10px; display: block;">LAND AREA</span>
                  <span style="font-weight: 700;">${p.areaAcres} Acres</span>
                  <span style="color: #64748b; font-size: 10px;"> (${(p.areaAcres * 0.404686).toFixed(2)} Ha)</span>
                </div>
                <div style="text-align: right;">
                  <span style="color: #64748b; font-size: 10px; display: block;">CATEGORY</span>
                  <span style="font-weight: 600; font-size: 11px;">${p.landType?.replace('_', ' ') || 'RURAL AGRI'}</span>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                <div>
                  <span style="color: #64748b; font-size: 10px; display: block;">LOCATION</span>
                  <span style="font-weight: 600; font-size: 11px;">${p.village || 'Khed Shivapur'}, ${p.tehsil || 'Haveli'}</span>
                </div>
                <div style="text-align: right;">
                  <span style="color: #64748b; font-size: 10px; display: block;">ATTACHED ASSETS</span>
                  <span style="font-weight: 600; font-size: 11px;">🌳 ${p.treesCount || 0} | 🏠 ${p.structuresCount || 0}</span>
                </div>
              </div>

              <div style="background: #f8fafc; padding: 6px 8px; border-radius: 4px; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; color: #475569; font-weight: 600;">Est. Compensation:</span>
                <span style="font-size: 13px; font-weight: 800; color: #047857;">₹${approxValuation} Lakhs</span>
              </div>
            </div>

            <button id="inspect-parcel-btn-${p.id}" style="width: 100%; margin-top: 8px; background: #0f172a; color: white; border: none; padding: 7px 10px; border-radius: 5px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px;">
              <span>View Cadastre Dossier</span> →
            </button>
          </div>
        </div>
      `;

      polygon.bindPopup(popupContent, {
        maxWidth: 300,
        autoPan: true,
        autoPanPadding: [20, 20],
        className: 'cadastral-popup',
      });

      // Hover Tooltip
      polygon.bindTooltip(
        `<strong>Khasra ${p.khasraNumber}</strong> (${p.ownerName})<br/><span style="color: #facc15;">Click to inspect land details</span>`,
        {
          direction: 'top',
          sticky: true,
          className: 'cadastral-tooltip',
        }
      );

      // On Click: Select Parcel & Open Popup
      polygon.on('click', () => {
        onSelectParcel(p);
        polygon.openPopup();
      });

      // Also attach event to button inside popup once opened
      polygon.on('popupopen', () => {
        const btn = document.getElementById(`inspect-parcel-btn-${p.id}`);
        if (btn) {
          btn.onclick = () => onSelectParcel(p);
        }
      });

      // 3. Center Text Label Pin for the Khasra
      const centerLat = p.latitude;
      const centerLng = p.longitude;

      const labelIcon = L.divIcon({
        html: `
          <div style="
            background: ${isSelected ? '#F59E0B' : style.fillColor};
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 5px;
            border-radius: 4px;
            border: 1.5px solid #ffffff;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
            white-space: nowrap;
            text-align: center;
            transform: translate(-50%, -50%);
            display: inline-block;
          ">
            Khasra ${p.khasraNumber}
          </div>
        `,
        className: 'cadastral-label-icon',
        iconSize: [0, 0],
      });

      const labelMarker = L.marker([centerLat, centerLng], { icon: labelIcon });
      labelMarker.on('click', () => {
        onSelectParcel(p);
        polygon.openPopup();
      });

      polygon.addTo(layersGroup);
      labelMarker.addTo(layersGroup);

      parcelLayersMap.current.set(p.id, {
        poly: polygon,
        popup: polygon.getPopup()!,
      });

      bounds.extend(polyCoords);
    });

    // If a parcel is selected programmatically, open its popup & pan to it
    if (selectedParcelId && parcelLayersMap.current.has(selectedParcelId)) {
      const { poly } = parcelLayersMap.current.get(selectedParcelId)!;
      poly.openPopup();
    }
  }, [parcels, selectedParcelId]);

  // Handle Corridor Focus Changes
  const focusCorridor = (corridor: 'pune' | 'edfc' | 'all') => {
    setActiveCorridor(corridor);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (corridor === 'pune') {
      map.flyTo([18.3555, 73.859], 15.5, { duration: 1.2 });
    } else if (corridor === 'edfc') {
      map.flyTo([25.012, 83.515], 15.5, { duration: 1.2 });
    } else {
      const bounds = L.latLngBounds([]);
      parcels.forEach((p) => {
        if (p.latitude && p.longitude) bounds.extend([p.latitude, p.longitude]);
      });
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-slate-300 shadow-md bg-slate-900">
      {/* Top Header Controls Bar (Dedicated header, NEVER overlaps with popups) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-4 py-2.5 border-b border-slate-700 text-xs text-white">
        {/* Left side: GIS View Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Layers className="w-4 h-4" />
            <span>GIS Map Layer:</span>
          </div>

          <div className="flex bg-slate-800 rounded p-0.5 border border-slate-700">
            <button
              onClick={() => setMapType('satellite')}
              className={`px-2.5 py-1 rounded font-medium text-[11px] transition-colors ${
                mapType === 'satellite'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🛰️ Satellite Hybrid
            </button>
            <button
              onClick={() => setMapType('streets')}
              className={`px-2.5 py-1 rounded font-medium text-[11px] transition-colors ${
                mapType === 'streets'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🗺️ Revenue Topo
            </button>
          </div>
        </div>

        {/* Right side: Corridor Zoom Jump Buttons */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Focus Corridor:</span>
          <button
            onClick={() => focusCorridor('pune')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeCorridor === 'pune'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📍 Pune Bypass
          </button>
          <button
            onClick={() => focusCorridor('edfc')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeCorridor === 'edfc'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            📍 EDFC Corridor
          </button>
          <button
            onClick={() => focusCorridor('all')}
            className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-all ${
              activeCorridor === 'all'
                ? 'bg-blue-600 border-blue-400 text-white shadow'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🇮🇳 All India
          </button>
        </div>
      </div>

      {/* Actual Map Canvas Container */}
      <div className="relative w-full h-[520px]">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Cadastral Color Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md p-3 rounded-lg shadow-xl border border-slate-700 text-white text-[11px] space-y-1.5 max-w-[240px]">
          <div className="font-bold text-amber-400 mb-1 uppercase tracking-wider text-[10px] flex items-center justify-between">
            <span>Cadastre Land Status</span>
            <span className="text-slate-400 text-[9px] lowercase font-normal">(tap polygon)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-emerald-500 border border-emerald-300 shadow-sm" />
            <span className="font-medium text-slate-200">
              Green: <span className="text-emerald-400">Acquired / Disbursed</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-amber-400 border border-amber-200 shadow-sm" />
            <span className="font-medium text-slate-200">
              Yellow: <span className="text-amber-300">Valuation / Award</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-red-500 border border-red-300 shadow-sm animate-pulse" />
            <span className="font-medium text-slate-200">
              Red: <span className="text-red-400">Litigation Stay / Disputed</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-purple-500 border border-purple-300 shadow-sm" />
            <span className="font-medium text-slate-200">
              Purple: <span className="text-purple-300">Sec 38 Possession</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}


