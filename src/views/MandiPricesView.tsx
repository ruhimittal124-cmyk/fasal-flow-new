import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  TrendingUp, 
  Search, 
  Filter, 
  RefreshCw, 
  UploadCloud, 
  MapPin, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Sparkles,
  Info,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Database
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchMandiRates, fetchMandiStatus, syncMandiRates, importMandiData } from '../services/api';
import { MandiRecord } from '../types';

interface MandiPricesViewProps {
  setCurrentTab: (tab: string) => void;
}

export const MandiPricesView: React.FC<MandiPricesViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { addToast } = useApp();
  const [mandiRates, setMandiRates] = useState<MandiRecord[]>([]);
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Filters
  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showApiInfoModal, setShowApiInfoModal] = useState(false);
  const [importPayload, setImportPayload] = useState('');
  const [customApiKey, setCustomApiKey] = useState('579b464db66ec23bdd000001cdc3b564546246a772a26393094f5645');

  const loadRates = async () => {
    setLoading(true);
    try {
      const [rates, st] = await Promise.all([
        fetchMandiRates(selectedCrop, selectedDistrict),
        fetchMandiStatus(),
      ]);
      setMandiRates(rates);
      setStatus(st);
    } catch (err: any) {
      console.error('Error loading mandi data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRates();
  }, [selectedCrop, selectedDistrict]);

  const handleManualSync = async (apiKeyToUse?: string) => {
    setSyncing(true);
    try {
      const res = await syncMandiRates(apiKeyToUse || customApiKey);
      setStatus({
        source: res.source,
        isLive: true,
        lastUpdated: res.lastUpdated,
        recordCount: res.count,
        apiKeyConfigured: true,
        resourceId: '9ef84268-d588-465a-a308-a864a43d0070',
      });
      setMandiRates(res.data);
      addToast({
        type: 'success',
        title: 'Agmarknet Synced',
        message: `Updated ${res.count} records.`,
      });
    } catch (e: any) {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: e.message,
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importPayload.trim()) return;

    try {
      let parsed = [];
      if (importPayload.trim().startsWith('[')) {
        parsed = JSON.parse(importPayload);
      } else {
        const lines = importPayload.trim().split('\n');
        const header = lines[0].split(',').map((h) => h.trim().toLowerCase());
        parsed = lines.slice(1).map((line, idx) => {
          const vals = line.split(',').map((v) => v.trim());
          return {
            id: `imp-${Date.now()}-${idx}`,
            mandiName: vals[0] || 'Imported Mandi',
            district: vals[1] || 'Maharashtra',
            state: 'Maharashtra',
            crop: vals[2] || 'Soybean',
            variety: 'Standard',
            pricePerQuintal: Number(vals[3]) || 4800,
            minPrice: Number(vals[4]) || 4600,
            maxPrice: Number(vals[5]) || 5000,
            arrivalVolumeTons: 120,
            changePercent: 1.5,
            lastUpdated: 'Imported Just Now',
            distanceKm: 25,
          };
        });
      }

      await importMandiData(parsed);
      addToast({
        type: 'success',
        title: 'Data Ingested',
        message: `Successfully loaded ${parsed.length} records into cache.`,
      });
      setShowImportModal(false);
      setImportPayload('');
      loadRates();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Import Failed',
        message: 'Invalid CSV or JSON format: ' + err.message,
      });
    }
  };

  const filteredRates = mandiRates.filter((r) => {
    const matchesSearch =
      r.mandiName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.crop.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {t('mandiPrices.title', 'Agmarknet Live Mandi Rates')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('highlights.badge', 'Data.gov.in Live Official Feed')}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('mandiPrices.subtitle', 'Real-time daily modal auction prices, arrival volumes (Tons), and price fluctuation percentages directly from the Ministry of Agriculture & Farmers Welfare.')}
          </p>
          {status && (
            <div className="text-xs text-slate-500 mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="flex items-center text-emerald-700 font-semibold">
                <Database className="w-3.5 h-3.5 mr-1" />
                Resource: <strong>9ef84268-d588-465a-a308-a864a43d0070</strong>
              </span>
              <span>•</span>
              <span>{t('mandiPrices.activeYards', 'Total Active Mandis')}: <strong>{filteredRates.length}</strong></span>
              <span>•</span>
              <span>{t('mandiPrices.lastSync', 'Last Refreshed')}: {status.lastUpdated ? new Date(status.lastUpdated).toLocaleTimeString() : 'Just now'}</span>
            </div>
          )}
        </div>

        {/* Sync & API Config Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleManualSync()}
            disabled={syncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? t('mandiPrices.syncing', 'Syncing Data.gov.in...') : t('mandiPrices.syncNow', 'Sync Live Agmarknet')}</span>
          </button>

          <button
            onClick={() => setShowApiInfoModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs flex items-center space-x-1.5"
          >
            <KeyRound className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('mandiPrices.apiConfig', 'API Source Details')}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs flex items-center space-x-1.5"
          >
            <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
            <span>{t('mandiPrices.importData', 'Import Data')}</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('mandiPrices.searchPlaceholder', 'Search mandi, market, or district...')}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Crop Filter */}
        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
          >
            <option value="All">{t('mandiPrices.allCrops', 'All Commodities (All Crops)')}</option>
            <option value="Soybean">{t('crops.Soybean', 'Soybean')}</option>
            <option value="Tur">{t('crops.Tur', 'Tur / Arhar')}</option>
            <option value="Cotton">{t('crops.Cotton', 'Cotton / Kapas')}</option>
            <option value="Onion">{t('crops.Onion', 'Onion / Pyaz')}</option>
            <option value="Wheat">{t('crops.Wheat', 'Wheat / Gehun')}</option>
            <option value="Gram">{t('crops.Gram', 'Chana / Gram')}</option>
            <option value="Maize">{t('crops.Maize', 'Maize / Corn')}</option>
          </select>
        </div>

        {/* District Filter */}
        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
          >
            <option value="All">{t('mandiPrices.allDistricts', 'All Districts')}</option>
            <option value="Osmanabad">Osmanabad / Dharashiv</option>
            <option value="Latur">Latur</option>
            <option value="Solapur">Solapur</option>
            <option value="Nashik">Nashik</option>
            <option value="Pune">Pune</option>
            <option value="Jalgaon">Jalgaon</option>
            <option value="Ahmednagar">Ahmednagar</option>
            <option value="Akola">Akola</option>
            <option value="Amravati">Amravati</option>
            <option value="Nanded">Nanded</option>
            <option value="Nagpur">Nagpur</option>
            <option value="Kolhapur">Kolhapur</option>
            <option value="Sangli">Sangli</option>
            <option value="Satara">Satara</option>
            <option value="Aurangabad">Chhatrapati Sambhajinagar</option>
            <option value="Beed">Beed</option>
            <option value="Yavatmal">Yavatmal</option>
          </select>
        </div>

      </div>

      {/* Mandi Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-sm font-semibold text-slate-600">{t('common.loading', 'Loading APMC Mandi Rates from Data.gov.in...')}</p>
        </div>
      ) : filteredRates.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 space-y-2">
          <Info className="w-8 h-8 mx-auto text-slate-400" />
          <p className="font-bold text-slate-800">{t('browseLots.noLotsFound', 'No mandi records matched your filters')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRates.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {rec.district} • {rec.state}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base mt-1.5 leading-snug">
                      {rec.mandiName}
                    </h3>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-black">
                    {rec.crop}
                  </span>
                </div>

                {/* Modal Price Hero */}
                <div className="mt-4 flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-slate-900">₹{rec.pricePerQuintal.toLocaleString('en-IN')}</span>
                  <span className="text-xs text-slate-500 font-medium">{t('highlights.perQuintal', '/ quintal')}</span>
                  <span className={`text-xs font-bold ml-auto flex items-center ${rec.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {rec.changePercent >= 0 ? <ArrowUpRight className="w-4 h-4 mr-0.5" /> : <ArrowDownRight className="w-4 h-4 mr-0.5" />}
                    {rec.changePercent >= 0 ? `+${rec.changePercent}%` : `${rec.changePercent}%`}
                  </span>
                </div>

                {/* Range & Arrival Details */}
                <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('highlights.range', 'Daily Range')}</span>
                    <p className="font-bold text-slate-700">₹{rec.minPrice} - ₹{rec.maxPrice}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('highlights.arrivals', 'Yard Arrivals')}</span>
                    <p className="font-bold text-slate-700">{rec.arrivalVolumeTons} MT</p>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>~{rec.distanceKm} km</span>
                  <span>{rec.lastUpdated}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => setCurrentTab('browse-lots')}
                  className="flex-1 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors text-center"
                >
                  {t('highlights.matchLots', 'Match Lots')}
                </button>
                <button
                  onClick={() => setCurrentTab('create-lot')}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  {t('dashboard.sellProduceBtn', 'List Lot')}
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* API Source & Resource Modal */}
      {showApiInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">{t('mandiPrices.apiConfig', 'API Source Details')}</h3>
              </div>
              <button onClick={() => setShowApiInfoModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            
            <div className="space-y-3 text-xs text-slate-600">
              <p>
                Fasal Flow connects directly to the Open Government Data (OGD) Platform India API managed by the Ministry of Agriculture and Farmers Welfare.
              </p>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400">Endpoint:</span>
                  <p className="text-slate-800 break-all font-semibold">https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070</p>
                </div>
                <div>
                  <span className="text-slate-400">Resource ID:</span>
                  <p className="text-emerald-700 font-bold">9ef84268-d588-465a-a308-a864a43d0070</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowApiInfoModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Bulletin Report Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900">{t('mandiPrices.importData', 'Import Custom Mandi JSON')}</h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleImportSubmit} className="space-y-4">
              <textarea
                value={importPayload}
                onChange={(e) => setImportPayload(e.target.value)}
                placeholder={`mandi,district,crop,price,min_price,max_price\nLatur APMC,Latur,Soybean,4950,4700,5050`}
                rows={6}
                required
                className="w-full p-3 text-xs font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  {t('browseLots.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  {t('common.save', 'Ingest Bulletin')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MandiPricesView;
