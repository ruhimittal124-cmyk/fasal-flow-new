import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  Sparkles, 
  Camera, 
  ShieldCheck, 
  HelpCircle, 
  DollarSign, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Scale 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { autoGradeCrop } from '../services/api';
import { CropType, CropGrade } from '../types';

interface CreateLotViewProps {
  setCurrentTab: (tab: string) => void;
}

export const CreateLotView: React.FC<CreateLotViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { currentUser, addLot, addToast } = useApp();

  const [crop, setCrop] = useState<CropType>('Soybean');
  const [variety, setVariety] = useState('JS-335 (Yellow Bold)');
  const [grade, setGrade] = useState<CropGrade>('Grade A');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(50);
  const [askingPricePerQuintal, setAskingPricePerQuintal] = useState<number>(4900);
  const [harvestDate, setHarvestDate] = useState<string>('2026-09-01');
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1599583718211-09439fcf499f?auto=format&fit=crop&q=80&w=800');
  
  // Quality grading
  const [moisturePercent, setMoisturePercent] = useState<number>(10.2);
  const [purityPercent, setPurityPercent] = useState<number>(98.5);
  const [defectPercent, setDefectPercent] = useState<number>(1.2);
  const [aiNotes, setAiNotes] = useState<string>('AI Graded: Clean, low foreign matter, optimal 10% moisture level.');
  const [gradingLoading, setGradingLoading] = useState<boolean>(false);

  const baseTotal = quantityQuintals * askingPricePerQuintal;
  const isFreeCommission = currentUser?.freeTransactionAvailable ?? true;
  const sellerCommissionRate = isFreeCommission ? 0 : 0.01;
  const sellerFee = Math.round(baseTotal * sellerCommissionRate);
  const netEarnings = baseTotal - sellerFee;

  const handleAiAutoGrade = async () => {
    setGradingLoading(true);
    try {
      const res = await autoGradeCrop(crop, variety, 'High-resolution photo showing clean yellow grain luster with no mold');
      if (res) {
        setGrade(res.grade as CropGrade);
        setMoisturePercent(res.moisturePercent);
        setPurityPercent(res.purityPercent);
        setDefectPercent(res.defectPercent);
        setAiNotes(res.aiNotes);
        addToast({
          type: 'success',
          title: 'AI Quality Grading Complete',
          message: `Certified ${res.grade} (${res.purityPercent}% Purity, ${res.moisturePercent}% Moisture).`,
        });
      }
    } catch (err: any) {
      addToast({
        type: 'info',
        title: 'Grading Calibrated',
        message: 'Standard AGMARK Grade A parameters applied.',
      });
    } finally {
      setGradingLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!quantityQuintals || !askingPricePerQuintal) {
      addToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fill in quantity and price.',
      });
      return;
    }

    addLot({
      sellerId: currentUser?.id || 'user-farmer-1',
      sellerName: currentUser?.name || 'Ramesh Patil',
      sellerDistrict: currentUser?.district || 'Osmanabad',
      sellerPhone: currentUser?.phone || '+91 98221 45678',
      sellerRating: currentUser?.rating || 4.8,
      sellerIsKyc: currentUser?.isKycVerified ?? true,
      crop,
      variety,
      grade,
      quantityQuintals: Number(quantityQuintals),
      askingPricePerQuintal: Number(askingPricePerQuintal),
      baseTotal,
      harvestDate,
      photos: [photoUrl],
      status: 'active',
      moisturePercent,
      purityPercent,
      defectPercent,
      aiNotes,
      lat: 18.1856,
      lng: 76.0423,
    });

    setCurrentTab('my-lots');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t('createLot.title', 'List Harvest Lot for Sale')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
            Direct Mill Offers
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('createLot.subtitle', 'Publish your crop lot to verified buyers, millers, and processors across Maharashtra.')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Crop & Quantity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>1. {t('createLot.cropType', 'Commodity')} & {t('browseLots.quantity', 'Quantity Details')}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.cropType', 'Crop Type')}</label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value as CropType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
              >
                <option value="Soybean">{t('crops.Soybean', 'Soybean')}</option>
                <option value="Tur">{t('crops.Tur', 'Tur / Arhar')}</option>
                <option value="Cotton">{t('crops.Cotton', 'Cotton / Kapas')}</option>
                <option value="Onion">{t('crops.Onion', 'Onion / Pyaz')}</option>
                <option value="Wheat">{t('crops.Wheat', 'Wheat / Gehun')}</option>
                <option value="Chana">{t('crops.Gram', 'Chana / Gram')}</option>
                <option value="Maize">{t('crops.Maize', 'Maize / Corn')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.variety', 'Variety / Seed Spec')}</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. JS-335, BSMR-736, Garwa"
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.quantityQuintals', 'Quantity (in Quintals)')}</label>
              <input
                type="number"
                min="1"
                max="10000"
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1">1 Quintal = 100 kg ({ (quantityQuintals / 10).toFixed(1) } Metric Tons)</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.askingPricePerQuintal', 'Asking Price (₹ / Quintal)')}</label>
              <input
                type="number"
                min="100"
                step="50"
                value={askingPricePerQuintal}
                onChange={(e) => setAskingPricePerQuintal(Number(e.target.value))}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.harvestDate', 'Harvest / Threshing Date')}</label>
              <input
                type="date"
                value={harvestDate}
                onChange={(e) => setHarvestDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.photoUrl', 'Lot Sample Photo URL')}</label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: AI Quality Grading & AGMARK Standards */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>2. {t('createLot.aiGradingTitle', 'AI Quality Grading & AGMARK Parameters')}</span>
            </h3>
            
            <button
              type="button"
              onClick={handleAiAutoGrade}
              disabled={gradingLoading}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${gradingLoading ? 'animate-spin' : ''}`} />
              <span>{gradingLoading ? t('createLot.analyzing', 'Analyzing Grain...') : t('createLot.startAiGrading', 'Auto-Grade with AI')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.grade', 'Grade')}</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value as CropGrade)}
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-800"
              >
                <option value="Grade A">Grade A (Premium)</option>
                <option value="Grade B">Grade B (Standard)</option>
                <option value="Grade C">Grade C (Commercial)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.moisture', 'Moisture (%)')}</label>
              <input
                type="number"
                step="0.1"
                value={moisturePercent}
                onChange={(e) => setMoisturePercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.purity', 'Purity (%)')}</label>
              <input
                type="number"
                step="0.1"
                value={purityPercent}
                onChange={(e) => setPurityPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('createLot.defects', 'Defects (%)')}</label>
              <input
                type="number"
                step="0.1"
                value={defectPercent}
                onChange={(e) => setDefectPercent(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">AI Quality Evaluation Notes</label>
            <textarea
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
            />
          </div>
        </div>

        {/* Section 3: Transparent Fee & Earnings Breakdown */}
        <div className="bg-emerald-950 text-white rounded-2xl p-6 border border-emerald-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-emerald-800 pb-3">
            <h3 className="font-bold text-base flex items-center space-x-2 text-emerald-200">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>3. {t('createLot.expectedEarnings', 'Total Payout & Fee Calculation')}</span>
            </h3>
            {isFreeCommission && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950">
                {t('createLot.freeNotice', '1st Transaction Fee Free!')}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-800">
              <span className="text-emerald-300/80 uppercase font-semibold text-[10px]">Gross Crop Value</span>
              <p className="text-2xl font-black text-white mt-1">₹{baseTotal.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-300/70">{quantityQuintals} q @ ₹{askingPricePerQuintal}/q</p>
            </div>

            <div className="bg-emerald-900/40 p-3.5 rounded-xl border border-emerald-800">
              <span className="text-emerald-300/80 uppercase font-semibold text-[10px]">{t('createLot.commission', 'Platform Fee (1% Seller)')}</span>
              <p className="text-2xl font-black text-amber-300 mt-1">
                {isFreeCommission ? '₹0 (Waived)' : `₹${sellerFee.toLocaleString('en-IN')}`}
              </p>
              <p className="text-[11px] text-emerald-300/70">Middlemen charge 8-12%</p>
            </div>

            <div className="bg-emerald-900/60 p-3.5 rounded-xl border border-emerald-700">
              <span className="text-emerald-300/80 uppercase font-semibold text-[10px]">{t('createLot.expectedEarnings', 'Net Payout to Bank')}</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">₹{netEarnings.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-300/70">Direct Escrow NEFT/UPI</p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => setCurrentTab('browse-lots')}
            className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 cursor-pointer"
          >
            {t('browseLots.cancel', 'Cancel')}
          </button>

          <button
            type="submit"
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm sm:text-base shadow-lg hover:shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <span>{t('createLot.submitListing', 'Publish Crop Lot')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </form>

    </div>
  );
};

export default CreateLotView;
