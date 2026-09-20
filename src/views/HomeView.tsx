import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  Bot, 
  ArrowRight, 
  Sparkles, 
  Scale, 
  Coins, 
  PhoneCall
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchMandiRates, fetchMandiStatus } from '../services/api';
import { MandiRecord } from '../types';
import { LiveUserNetworkMap } from '../components/LiveUserNetworkMap';
import { LanguageSelector } from '../components/LanguageSelector';

interface HomeViewProps {
  setCurrentTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setCurrentTab }) => {
  const { t, i18n } = useTranslation();
  const { setIsFasalMitraOpen, lots, openCallModal } = useApp();

  const [topMandiRates, setTopMandiRates] = useState<MandiRecord[]>([]);
  const [mandiStatus, setMandiStatus] = useState<any>(null);
  const [loadingRates, setLoadingRates] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [rates, status] = await Promise.all([
          fetchMandiRates(),
          fetchMandiStatus(),
        ]);
        setTopMandiRates(rates.slice(0, 6));
        setMandiStatus(status);
      } catch (e) {
        console.warn('Using baseline mandi rates');
      } finally {
        setLoadingRates(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-emerald-950 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-emerald-800">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
            <span>{t('hero.tagline', 'DIRECT CROPS • ZERO EXPLOITATION • AI PRICE FORECASTS')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {t('hero.title', 'Connecting Indian Farmers Directly with Buyers & Logistics')}
          </h1>

          <p className="text-base sm:text-lg text-emerald-100/80 max-w-2xl mx-auto font-normal leading-relaxed">
            {t('hero.subtitle', 'Transparent 2% flat platform fee. Live AGMARKNET APMC mandi prices. AI quality grading and instant direct payments.')}
          </p>

          {/* Quick Language Switch Banner on Hero */}
          <div className="flex items-center justify-center pt-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-900/60 border border-emerald-700/60 px-3.5 py-1.5 rounded-full backdrop-blur-sm">
              <span className="text-xs text-emerald-200 font-medium">
                {t('language.current', 'Language')}:
              </span>
              <span className="text-xs font-bold text-white uppercase bg-emerald-700/80 px-2 py-0.5 rounded">
                {i18n.language}
              </span>
              <LanguageSelector variant="navbar" />
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              id="hero-btn-create-lot"
              onClick={() => setCurrentTab('create-lot')}
              className="px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm sm:text-base shadow-lg hover:shadow-emerald-400/20 transition-all flex items-center space-x-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sprout className="w-5 h-5 text-emerald-900" />
              <span>{t('hero.ctaCreateLot', 'Sell Your Produce')}</span>
              <ArrowRight className="w-4 h-4 text-emerald-900" />
            </button>

            <button
              id="hero-btn-browse-lots"
              onClick={() => setCurrentTab('browse-lots')}
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm sm:text-base border border-slate-700 shadow-md transition-all flex items-center space-x-2"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>{t('hero.ctaBrowse', 'Explore Active Lots')} ({lots.length})</span>
            </button>

            <button
              id="hero-btn-ai-mitra"
              onClick={() => setIsFasalMitraOpen(true)}
              className="px-5 py-3.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-semibold text-sm border border-emerald-600/40 transition-all flex items-center space-x-2"
            >
              <Bot className="w-5 h-5 text-emerald-400" />
              <span>{t('hero.askMitra', 'Ask Fasal Mitra AI')}</span>
            </button>
          </div>

          {/* Highlight metrics */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-emerald-800/60 text-left">
            <div className="bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-700/40">
              <p className="text-2xl font-black text-white">{t('hero.flatFee', '2% Flat')}</p>
              <p className="text-xs text-emerald-300/80">{t('hero.flatFeeDesc', '1% Seller + 1% Buyer (1st Deal Free)')}</p>
            </div>
            <div className="bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-700/40">
              <p className="text-2xl font-black text-white">{t('hero.mandisCount', '24 APMCs')}</p>
              <p className="text-xs text-emerald-300/80">{t('hero.mandisCountDesc', 'Maharashtra Mandi Live Feed')}</p>
            </div>
            <div className="bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-700/40">
              <p className="text-2xl font-black text-white">{t('hero.aiGrading', 'AI Grading')}</p>
              <p className="text-xs text-emerald-300/80">{t('hero.aiGradingDesc', 'Certified AGMARK Moisture & Purity')}</p>
            </div>
            <div className="bg-emerald-900/30 p-3.5 rounded-xl border border-emerald-700/40">
              <p className="text-2xl font-black text-white">{t('hero.directPickup', 'Direct Pickup')}</p>
              <p className="text-xs text-emerald-300/80">{t('hero.directPickupDesc', 'Doorstep Logistics & Verified Trucks')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Live Mandi Ticker / Top Prices */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {t('highlights.title', "Today's Live Mandi Highlights")}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {t('highlights.badge', 'Agmarknet Feed')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('highlights.subtitle', 'Real-time benchmark modal prices across primary Maharashtra APMC yards')}
              </p>
            </div>
            <button
              onClick={() => setCurrentTab('mandi-prices')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
            >
              <span>{t('highlights.viewAll', 'View All 24 Mandis')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMandiRates.map((mandi) => (
              <div
                key={mandi.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{mandi.district}</span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-tight mt-0.5">{mandi.mandiName}</h4>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-bold">
                      {mandi.crop}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline space-x-2">
                    <span className="text-2xl font-black text-emerald-700">₹{mandi.pricePerQuintal.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-slate-500">{t('highlights.perQuintal', '/ quintal')}</span>
                    <span className={`text-xs font-bold ${mandi.changePercent >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                      {mandi.changePercent >= 0 ? `+${mandi.changePercent}%` : `${mandi.changePercent}%`}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
                    <span>{t('highlights.range', 'Range')}: ₹{mandi.minPrice} - ₹{mandi.maxPrice}</span>
                    <span>{t('highlights.arrivals', 'Arrivals')}: {mandi.arrivalVolumeTons} T</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{t('highlights.updated', 'Updated')}: {mandi.lastUpdated}</span>
                  <button
                    onClick={() => setCurrentTab('browse-lots')}
                    className="text-emerald-700 font-bold hover:underline"
                  >
                    {t('highlights.matchLots', 'Match Lots →')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Live Network Visual Map */}
        <section className="space-y-4">
          <LiveUserNetworkMap onOpenCall={openCallModal} />
        </section>

        {/* 3 Core Value Pillars */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Scale className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('pillars.zeroCommission', 'Zero Commission Exploitation')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('pillars.zeroCommissionDesc', 'Traditional middlemen charge up to 8-12% in hidden arhatiya cuts and transport markups. Fasal Flow maintains a transparent flat 2% total fee, with your first transaction 100% free.')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('pillars.aiTrends', 'AI Price Trends & Grading')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('pillars.aiTrendsDesc', 'Know whether to sell today or hold for 5 days with predictive mandi volume analytics. Auto-grade grain quality from phone photos in seconds according to AGMARK specifications.')}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {t('pillars.integratedLogistics', 'Integrated Rural Logistics')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {t('pillars.integratedLogisticsDesc', 'Book vetted rural mini trucks and container haulers with instant per-km pricing. Eliminate transport uncertainty with live corridor tracking and escrow payment security.')}
            </p>
          </div>
        </section>

        {/* Banner CTA */}
        <section className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-black">
              {t('ctaBanner.title', 'Ready to list your harvest lot?')}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              {t('ctaBanner.subtitle', 'Join thousands of farmers across Maharashtra getting direct mill offers and higher margins.')}
            </p>
          </div>
          <button
            onClick={() => setCurrentTab('create-lot')}
            className="px-6 py-3 rounded-xl bg-white text-emerald-950 font-extrabold text-sm shadow-md hover:bg-emerald-50 transition-all whitespace-nowrap cursor-pointer"
          >
            {t('ctaBanner.button', 'Create Free Listing Now')}
          </button>
        </section>

      </div>
    </div>
  );
};
