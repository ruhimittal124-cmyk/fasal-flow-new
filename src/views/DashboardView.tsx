import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  Clock, 
  CheckCircle,
  PlusCircle,
  Calendar,
  Sparkles,
  Boxes
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, CartesianGrid } from 'recharts';
import { useApp } from '../context/AppContext';
import { predictCropPrice } from '../services/api';
import { PricePredictionResult } from '../types';

interface DashboardViewProps {
  setCurrentTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { lots, offers, currentUser } = useApp();
  const [selectedCrop, setSelectedCrop] = useState('Soybean');
  const [prediction, setPrediction] = useState<PricePredictionResult | null>(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Total volume calculations
  const totalQuintals = lots.reduce((acc, l) => acc + l.quantityQuintals, 0);
  const totalValue = lots.reduce((acc, l) => acc + l.baseTotal, 0);
  const activeOffers = offers.filter(o => o.status === 'pending').length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;

  useEffect(() => {
    async function loadForecast() {
      setLoadingPrediction(true);
      try {
        const result = await predictCropPrice(selectedCrop, currentUser?.district || 'Osmanabad');
        setPrediction(result);
      } catch (err) {
        console.warn('Forecast unavailable, using baseline');
      } finally {
        setLoadingPrediction(false);
      }
    }
    loadForecast();
  }, [selectedCrop, currentUser?.district]);

  // Chart data for lot distributions
  const cropDistribution = [
    { name: t('crops.Soybean', 'Soybean'), quintals: lots.filter(l => l.crop === 'Soybean').reduce((a, b) => a + b.quantityQuintals, 0) },
    { name: t('crops.Tur', 'Tur'), quintals: lots.filter(l => l.crop === 'Tur').reduce((a, b) => a + b.quantityQuintals, 0) },
    { name: t('crops.Onion', 'Onion'), quintals: lots.filter(l => l.crop === 'Onion').reduce((a, b) => a + b.quantityQuintals, 0) },
    { name: t('crops.Cotton', 'Cotton'), quintals: lots.filter(l => l.crop === 'Cotton').reduce((a, b) => a + b.quantityQuintals, 0) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('dashboard.title', 'Marketplace Analytics & AI Forecast')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('dashboard.subtitle', 'Real-time crop volumes, dynamic APMC trends, and predictive prices')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setCurrentTab('aggregation')}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-xs flex items-center space-x-1.5 transition-colors"
          >
            <Boxes className="w-4 h-4 text-emerald-300" />
            <span>{t('nav.fpoPooling', 'FPO Crop Pooling')}</span>
          </button>
          <button
            onClick={() => setCurrentTab('transactions')}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            {t('nav.passbookEscrow', 'Passbook & Escrow')}
          </button>
          <button
            onClick={() => setCurrentTab('create-lot')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-sm flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('dashboard.sellProduceBtn', 'List New Crop Lot')}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dashboard.totalVolume', 'Total Volume Traded')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalQuintals} <span className="text-xs font-normal text-slate-500">{t('common.quintal', 'Quintals')}</span></p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center">
            <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2%
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dashboard.grossValue', 'Market Value')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">₹{(totalValue / 100000).toFixed(2)} <span className="text-xs font-normal text-slate-500">Lakhs</span></p>
          <p className="text-[11px] text-slate-500 mt-1">{lots.length} {t('dashboard.totalLots', 'Total Lots Listed')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dashboard.activeBids', 'Live Offers Pending')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{activeOffers}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">{t('myLots.receivedOffers', 'Awaiting seller acceptance')}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {t('dashboard.acceptedDeals', 'Completed Deals')}
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{acceptedOffers}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% Escrow secured</p>
        </div>
      </div>

      {/* AI Price Prediction Curve & Recommendation */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-slate-900 text-base sm:text-lg">
                {t('dashboard.aiForecaster', 'AI 7-Day Price Forecast & Advisory')}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                Gemini Economics Model
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {t('dashboard.forecast7Days', 'Predicted APMC price trajectory based on arrivals, mill demand, and historical trends')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-semibold text-slate-600">
              {t('dashboard.selectCommodity', 'Select Crop')}:
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Soybean">{t('crops.Soybean', 'Soybean')}</option>
              <option value="Tur">{t('crops.Tur', 'Tur (Arhar)')}</option>
              <option value="Cotton">{t('crops.Cotton', 'Cotton')}</option>
              <option value="Onion">{t('crops.Onion', 'Onion')}</option>
              <option value="Wheat">{t('crops.Wheat', 'Wheat')}</option>
              <option value="Gram">{t('crops.Gram', 'Chana')}</option>
            </select>
          </div>
        </div>

        {prediction && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left: Key advice card */}
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${
                prediction.recommendation === 'SELL NOW' 
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : prediction.recommendation === 'HOLD'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-sky-50 border-sky-200 text-sky-950'
              }`}>
                <span className="text-[11px] uppercase font-extrabold tracking-wider text-slate-500">
                  {t('dashboard.recommendedAction', 'Recommendation')}
                </span>
                <p className="text-2xl font-black mt-1">{prediction.recommendation}</p>
                <div className="mt-2 text-xs space-y-1">
                  <p><strong>{t('mandiPrices.modalRate', 'Current Avg')}:</strong> ₹{prediction.currentAvgPrice}/quintal</p>
                  <p><strong>{t('dashboard.forecast7Days', '7-Day Projected')}:</strong> ₹{prediction.forecastPrice7Days}/quintal ({prediction.predictedChangePercent > 0 ? `+${prediction.predictedChangePercent}%` : `${prediction.predictedChangePercent}%`})</p>
                  <p><strong>Confidence:</strong> {prediction.confidenceScore}%</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <p className="font-semibold text-slate-800">📊 {t('dashboard.marketSentiment', 'Market Drivers')}:</p>
                <p>{prediction.trendReasoning}</p>
                <p className="text-slate-500 pt-1 border-t border-slate-200"><strong>{t('mandiPrices.arrivals', 'Arrivals')}:</strong> {prediction.mandiArrivalTrend}</p>
              </div>
            </div>

            {/* Right: Chart Area */}
            <div className="lg:col-span-2 h-[260px]">
              <p className="text-xs font-bold text-slate-700 mb-2">30-Day Historical Trend + 7-Day Forecast Price (₹/Quintal)</p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prediction.historicalChartData}>
                  <defs>
                    <linearGradient id="actualPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="forecastPriceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${value}/q`, 'Price']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="actualPrice" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#actualPriceGrad)" name="Historical Rate" />
                  <Area type="monotone" dataKey="forecastPrice" stroke="#0284c7" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastPriceGrad)" name="AI Forecast" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

          </div>
        )}
      </div>

      {/* Commodity Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-4">
            {t('dashboard.volumeDistribution', 'Volume Listed by Commodity (Quintals)')}
          </h3>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  formatter={(val: any) => [`${val} Quintals`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="quintals" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2">
              {t('myLots.receivedOffers', 'Recent Platform Offers')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">Real-time buyer negotiation bids across Maharashtra</p>
            <div className="space-y-3">
              {offers.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-900">{o.crop} ({o.quantityQuintals}q)</p>
                    <p className="text-slate-500">{o.buyerName} • {o.buyerDistrict}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-extrabold text-emerald-700 text-sm">₹{o.offeredPricePerQuintal}/q</p>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                      o.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('my-lots')}
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
          >
            {t('nav.myLots', 'Manage All Offers in My Lots')} →
          </button>
        </div>
      </div>

    </div>
  );
};

export default DashboardView;
