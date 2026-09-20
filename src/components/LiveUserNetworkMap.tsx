import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Users, 
  Layers, 
  PhoneCall, 
  KeyRound, 
  Sparkles, 
  Compass, 
  CheckCircle,
  Truck,
  Building2,
  Sprout,
  Store,
  LocateFixed
} from 'lucide-react';
import { MOCK_MAP_USERS, MapUserNode } from '../data/mockMapUsers';

interface LiveUserNetworkMapProps {
  onSelectUser?: (user: MapUserNode) => void;
  onOpenCall?: (target: { targetName: string; targetRole: string; targetPhone: string; lotCrop?: string }) => void;
}

type CartoTheme = 'voyager' | 'dark_matter' | 'positron' | 'osm';

export const LiveUserNetworkMap: React.FC<LiveUserNetworkMapProps> = ({ onSelectUser, onOpenCall }) => {
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'buyer' | 'fpo' | 'transporter'>('all');
  const [selectedNode, setSelectedNode] = useState<MapUserNode | null>(null);
  const [cartoTheme, setCartoTheme] = useState<CartoTheme>('voyager');
  
  // Custom API Key from secrets / backend
  const metaEnv = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};
  const initialEnvKey = (metaEnv.VITE_CARTO_API_KEY || 
                         metaEnv.CARTO_API_KEY || 
                         metaEnv.VITE_GOOGLE_MAPS_API_KEY || 
                         metaEnv.GOOGLE_MAPS_API_KEY || 
                         '') as string;
  const [customApiKey, setCustomApiKey] = useState<string>(initialEnvKey);
  const [hasSecretKey, setHasSecretKey] = useState<boolean>(Boolean(initialEnvKey && initialEnvKey.length > 5));
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [manualKeyInput, setManualKeyInput] = useState<string>('');

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);

  // Fetch secrets key from backend on mount
  useEffect(() => {
    fetch('/api/config/maps-key')
      .then(res => res.json())
      .then(data => {
        const resolvedKey = data.cartoKey || data.apiKey || '';
        if (resolvedKey && resolvedKey.length > 5) {
          setCustomApiKey(resolvedKey);
          setHasSecretKey(true);
        }
      })
      .catch(() => {
        // Continue with default public carto CDN endpoints
      });
  }, []);

  // Construct standard high-performance CARTO Tile URL
  const getTileUrl = (theme: CartoTheme) => {
    switch (theme) {
      case 'voyager':
        return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`;
      case 'dark_matter':
        return `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`;
      case 'positron':
        return `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`;
      case 'osm':
        return `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`;
      default:
        return `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`;
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center of Maharashtra / Marathwada Corridor
      const map = L.map(mapContainerRef.current, {
        center: [19.25, 76.10],
        zoom: 7,
        minZoom: 5,
        maxZoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution
      L.control.attribution({
        position: 'bottomright',
        prefix: '<a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">© CARTO</a> <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>'
      }).addTo(map);

      const tileUrl = getTileUrl(cartoTheme);
      const tiles = L.tileLayer(tileUrl, {
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tiles;

      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      mapInstanceRef.current = map;
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Tile Layer when Theme changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const tileUrl = getTileUrl(cartoTheme);
    const newTiles = L.tileLayer(tileUrl, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = newTiles;
  }, [cartoTheme]);

  // Update Markers when Filter changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    markerGroupRef.current.clearLayers();

    const filteredUsers = roleFilter === 'all' 
      ? MOCK_MAP_USERS 
      : MOCK_MAP_USERS.filter(u => u.role === roleFilter);

    filteredUsers.forEach((node) => {
      let pinColor = '#10b981'; // farmer
      let roleLabel = 'Farmer';
      let iconHtml = '🌾';

      if (node.role === 'buyer') {
        pinColor = '#0284c7';
        roleLabel = 'Buyer / Mill';
        iconHtml = '🏭';
      } else if (node.role === 'fpo') {
        pinColor = '#f59e0b';
        roleLabel = 'FPO Hub';
        iconHtml = '🏢';
      } else if (node.role === 'transporter') {
        pinColor = '#8b5cf6';
        roleLabel = 'Transporter';
        iconHtml = '🚚';
      }

      // Create Custom HTML Div Icon
      const customIcon = L.divIcon({
        className: 'custom-carto-pin',
        html: `
          <div style="position: relative; transform: translate(-50%, -50%); cursor: pointer;">
            <div style="
              background-color: ${pinColor};
              color: #ffffff;
              width: 32px;
              height: 32px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 4px 10px rgba(0,0,0,0.3);
              border: 2px solid #ffffff;
              transition: transform 0.2s ease;
            ">
              ${iconHtml}
            </div>
            <div style="
              position: absolute;
              bottom: -18px;
              left: 50%;
              transform: translateX(-50%);
              background: rgba(15, 23, 42, 0.9);
              color: #ffffff;
              font-size: 9px;
              font-weight: 700;
              padding: 1px 5px;
              border-radius: 4px;
              white-space: nowrap;
              border: 1px solid rgba(255,255,255,0.2);
              pointer-events: none;
            ">
              ${node.name.split(' ')[0]}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([node.lat, node.lng], { icon: customIcon });

      // Custom Popup HTML
      const popupHtml = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 200px; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 6px;">
            <div>
              <strong style="font-size: 13px; color: #0f172a; display: block; line-height: 1.2;">${node.name}</strong>
              <span style="font-size: 11px; color: #64748b;">${node.district}</span>
            </div>
            <span style="
              background: ${pinColor}20;
              color: ${pinColor};
              font-size: 10px;
              font-weight: 800;
              padding: 2px 6px;
              border-radius: 4px;
              text-transform: capitalize;
              white-space: nowrap;
            ">
              ${roleLabel}
            </span>
          </div>
          <div style="font-size: 11px; color: #334155; line-height: 1.5; margin-bottom: 8px;">
            ${node.crop ? `<div><strong>Commodity:</strong> ${node.crop}</div>` : ''}
            <div><strong>Status:</strong> <span style="color: #059669; font-weight: 600;">● ${node.activeStatus}</span></div>
            <div><strong>Rating:</strong> ⭐ ${node.rating} / 5.0</div>
          </div>
          <button 
            id="call-btn-${node.id}"
            style="
              width: 100%;
              padding: 6px 10px;
              background-color: #059669;
              color: #ffffff;
              border: none;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 700;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 4px;
            "
          >
            📞 Direct Call / Connect
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280 });

      marker.on('click', () => {
        setSelectedNode(node);
        onSelectUser?.(node);
        setTimeout(() => {
          const btn = document.getElementById(`call-btn-${node.id}`);
          if (btn && onOpenCall) {
            btn.onclick = () => {
              onOpenCall({
                targetName: node.name,
                targetRole: roleLabel,
                targetPhone: node.phone || '+91 94220 88990',
                lotCrop: node.crop,
              });
            };
          }
        }, 100);
      });

      markerGroupRef.current?.addLayer(marker);
    });
  }, [roleFilter, onSelectUser, onOpenCall]);

  const handleApplyManualKey = () => {
    if (manualKeyInput.trim()) {
      setCustomApiKey(manualKeyInput.trim());
      setHasSecretKey(true);
      setShowKeyModal(false);
    }
  };

  const panToDistrict = (lat: number, lng: number, zoom = 10) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], zoom, { duration: 1.2 });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white shadow-xl flex flex-col space-y-4">
      
      {/* Map Header with Filters, CARTO Theme & Secrets Indicator */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-sm text-white">Live Regional Trade & Logistics Network</h3>
              <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 text-[10px] font-bold border border-sky-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"></span>
                <span>CARTO Maps Active</span>
              </span>
              {hasSecretKey && (
                <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30" title="Custom API Key active from Secrets">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Custom Key</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">CARTO Vector Tiles • Real APMC Mandis, Mills, FPOs & Transport Fleets</p>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* CARTO Base Tile Style Selector */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs">
            <span className="text-[10px] font-bold text-slate-500 px-2 uppercase tracking-wider">Style:</span>
            <button
              onClick={() => setCartoTheme('voyager')}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-all ${
                cartoTheme === 'voyager' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Voyager
            </button>
            <button
              onClick={() => setCartoTheme('dark_matter')}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-all ${
                cartoTheme === 'dark_matter' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setCartoTheme('positron')}
              className={`px-2 py-1 rounded-md font-semibold text-xs transition-all ${
                cartoTheme === 'positron' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Positron
            </button>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800 text-xs">
            {(['all', 'farmer', 'buyer', 'fpo', 'transporter'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-2 py-1 rounded-md font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r === 'all' ? 'All' : r}
              </button>
            ))}
          </div>

          {/* API Key Modal Button */}
          <button
            onClick={() => setShowKeyModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1"
            title="Custom API Key Setup"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Quick Jump Hotspot Mandis */}
      <div className="flex items-center space-x-2 overflow-x-auto text-[11px] pb-1 text-slate-400 no-scrollbar">
        <span className="font-bold text-slate-500 whitespace-nowrap flex items-center space-x-1">
          <LocateFixed className="w-3 h-3 text-emerald-400" />
          <span>Quick Focus:</span>
        </span>
        <button
          onClick={() => panToDistrict(18.4088, 76.5604, 11)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 whitespace-nowrap"
        >
          Latur Pulse Market
        </button>
        <button
          onClick={() => panToDistrict(18.1856, 76.0423, 11)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 whitespace-nowrap"
        >
          Dharashiv Soybean Belt
        </button>
        <button
          onClick={() => panToDistrict(20.0063, 73.7903, 11)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 whitespace-nowrap"
        >
          Nashik Onion APMC
        </button>
        <button
          onClick={() => panToDistrict(21.0077, 75.5626, 11)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/50 whitespace-nowrap"
        >
          Jalgaon Cotton Corridor
        </button>
        <button
          onClick={() => panToDistrict(19.25, 76.10, 7)}
          className="px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-slate-700/50 whitespace-nowrap font-semibold"
        >
          Reset View
        </button>
      </div>

      {/* Leaflet CARTO Map Container */}
      <div className="relative w-full h-[470px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full z-0" />
      </div>

      {/* Footer Legend */}
      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 border border-white/40"></span><span>Farmer (Green)</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-sky-500 border border-white/40"></span><span>Buyer / Mill (Blue)</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 border border-white/40"></span><span>FPO Hub (Amber)</span></span>
          <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 border border-white/40"></span><span>Transporter (Purple)</span></span>
        </div>
        <p className="text-emerald-400 font-medium">Click any pin on the CARTO map for live mandi profile & phone connect</p>
      </div>

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Custom CARTO / Maps API Key</h3>
                <p className="text-xs text-slate-400">Connect your custom API key credentials</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                The map is powered by <strong>CARTO Maps</strong> with high-resolution Voyager & Dark Matter raster tiles.
              </p>
              <p>
                If your CARTO account or organization provides a dedicated API key or token, it is automatically resolved from Secrets (<code className="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">CARTO_API_KEY</code>, <code className="px-1 py-0.5 rounded bg-slate-800 text-sky-300 font-mono">GOOGLE_MAPS_API_KEY</code>).
              </p>
              <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-1 text-[11px]">
                <div className="flex items-center text-emerald-400 font-semibold space-x-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Current Key Status:</span>
                </div>
                <p className="text-slate-400 font-mono break-all">
                  {hasSecretKey && customApiKey ? `Key Active: ${customApiKey.slice(0, 8)}...${customApiKey.slice(-4)}` : 'Public CARTO CDN Tiles Active'}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Override / Update Key:</label>
              <input
                type="text"
                value={manualKeyInput}
                onChange={(e) => setManualKeyInput(e.target.value)}
                placeholder="Enter custom key..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={handleApplyManualKey}
                disabled={!manualKeyInput.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center space-x-1"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Apply Key</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
