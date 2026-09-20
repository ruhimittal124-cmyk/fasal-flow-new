import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Boxes, 
  Calculator, 
  Scale, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { FpoAggregationHub } from '../components/FpoAggregationHub';
import { PoolSettlementEngine } from '../components/PoolSettlementEngine';

interface AggregationPoolingViewProps {
  setCurrentTab: (tab: string) => void;
}

export const AggregationPoolingView: React.FC<AggregationPoolingViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'7_stage_workflow' | 'settlement_formula'>('7_stage_workflow');

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tab Switcher */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider flex items-center space-x-1">
              <Boxes className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('aggregation.fpoPortal')}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {t('aggregation.enamCompliant')}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
            {t('aggregation.portalTitle')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('aggregation.portalSubtitle')}
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setActiveSubTab('7_stage_workflow')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === '7_stage_workflow'
                ? 'bg-white text-emerald-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4 text-emerald-600" />
            <span>{t('aggregation.workflowHubTab')}</span>
          </button>

          <button
            onClick={() => setActiveSubTab('settlement_formula')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              activeSubTab === 'settlement_formula'
                ? 'bg-white text-emerald-900 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>{t('aggregation.settlementAuditorTab')}</span>
          </button>
        </div>
      </div>

      {/* Main Tab Render */}
      {activeSubTab === '7_stage_workflow' ? (
        <FpoAggregationHub />
      ) : (
        <PoolSettlementEngine />
      )}
    </div>
  );
};
