import React, { useState } from 'react';
import { 
  Calculator, 
  ShieldCheck, 
  FileText, 
  Printer, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  Warehouse, 
  Award, 
  ExternalLink, 
  ChevronRight, 
  Info, 
  Sliders, 
  HelpCircle, 
  Microscope,
  FileCheck,
  Building2,
  User,
  ArrowRight,
  TrendingUp,
  Percent,
  RefreshCw,
  Sparkles,
  Lock,
  Search
} from 'lucide-react';
import { MOCK_POOL_BATCHES } from '../data/mockPoolSettlements';
import { PoolSettlementBatch, FarmerPoolParticipant, PoolContractDeduction, CropType } from '../types';
import { printPoolSettlementSlip } from '../utils/printReceipt';
import { useApp } from '../context/AppContext';

export const PoolSettlementEngine: React.FC = () => {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<'simulator' | 'settled_slips' | 'governance'>('simulator');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(MOCK_POOL_BATCHES[0].id);
  const [selectedFarmerId, setSelectedFarmerId] = useState<string>('farmer-a');
  const [evidenceModalDeduction, setEvidenceModalDeduction] = useState<{ deduction: PoolContractDeduction; farmerName: string; crop: string } | null>(null);

  // Live Simulator Custom State (Pre-Lock interactive modeling)
  const [simCrop, setSimCrop] = useState<CropType>('Onion');
  const [simPoolKg, setSimPoolKg] = useState<number>(3000);
  const [simBuyerPricePerKg, setSimBuyerPricePerKg] = useState<number>(24);
  const [simTotalLogistics, setSimTotalLogistics] = useState<number>(6000);
  const [simTotalStorage, setSimTotalStorage] = useState<number>(0);

  // Farmer A parameters
  const [farmerAKg, setFarmerAKg] = useState<number>(1000);
  const [farmerAGradeFactor, setFarmerAGradeFactor] = useState<number>(1.0);
  const [applyQualityDeduction, setApplyQualityDeduction] = useState<boolean>(true);
  const [qualityDeductionPct, setQualityDeductionPct] = useState<number>(1.0); // 1%
  const [applyIncentive, setApplyIncentive] = useState<boolean>(false);
  const [incentiveAmount, setIncentiveAmount] = useState<number>(150);

  // Calculated variables for Simulator
  const simUnitLogistics = simPoolKg > 0 ? simTotalLogistics / simPoolKg : 0; // ₹2/kg
  const simUnitStorage = simPoolKg > 0 ? simTotalStorage / simPoolKg : 0;

  // Formula Terms for Farmer A:
  // payout_i = (accepted kg_i × final pool unit price × grade factor_i) − allocated logistics_i − allocated storage_i − deductions_i + incentives
  const farmerAGrossValue = farmerAKg * simBuyerPricePerKg * farmerAGradeFactor;
  const farmerAAllocLogistics = farmerAKg * simUnitLogistics;
  const farmerAAllocStorage = farmerAKg * simUnitStorage;
  const farmerAPreAdjustmentNet = farmerAKg * (simBuyerPricePerKg * farmerAGradeFactor - simUnitLogistics - simUnitStorage);
  
  const farmerADeductionRupees = applyQualityDeduction 
    ? (farmerAGrossValue * (qualityDeductionPct / 100))
    : 0;

  const farmerAIncentiveRupees = applyIncentive ? incentiveAmount : 0;

  const farmerAFinalPayout = farmerAGrossValue - farmerAAllocLogistics - farmerAAllocStorage - farmerADeductionRupees + farmerAIncentiveRupees;

  const activeBatch = MOCK_POOL_BATCHES.find(b => b.id === selectedBatchId) || MOCK_POOL_BATCHES[0];
  const activeParticipant = activeBatch.participants.find(p => p.farmerId === selectedFarmerId) || activeBatch.participants[0];

  const handlePrint = (batch: PoolSettlementBatch, participant: FarmerPoolParticipant) => {
    printPoolSettlementSlip(batch, participant);
    addToast({
      type: 'info',
      title: 'Settlement Slip Generated',
      message: `Print preview generated for ${participant.farmerName} (Batch #${batch.id}).`
    });
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner with Formula Definition */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Transparent Settlement Mandate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Crop Pool Settlement & Transparency Engine
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Deterministic, zero-hidden-fee payout calculation before pool lock and after final settlement. Every rupee deduction requires verifiable laboratory assaying evidence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Interactive Formula Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('settled_slips')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeTab === 'settled_slips'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Audited Settlement Slips</span>
            </button>
          </div>
        </div>

        {/* Mathematical Formula Display Card */}
        <div className="mt-6 bg-slate-950/70 border border-emerald-500/30 rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider font-bold text-emerald-400 flex items-center space-x-1.5">
              <Calculator className="w-3.5 h-3.5" />
              <span>Standard Mandate Settlement Formula (For Farmer i)</span>
            </span>
            <span className="text-[10px] text-slate-400">Section 4.1 APMC e-NAM Transparency Standard</span>
          </div>

          <div className="font-mono text-xs sm:text-sm bg-slate-900/90 p-3.5 rounded-lg text-emerald-300 border border-slate-800 overflow-x-auto whitespace-nowrap leading-relaxed">
            <span className="text-white font-bold">payout_i</span> = (<span className="text-sky-300">accepted kg_i</span> × <span className="text-amber-300">final pool unit price</span> × <span className="text-purple-300">grade factor_i</span>) − <span className="text-rose-400">allocated logistics_i</span> − <span className="text-rose-400">allocated storage_i</span> − <span className="text-orange-400">contractually agreed deductions_i</span> + <span className="text-emerald-400">eligible incentives/adjustments</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-slate-800/80 text-[11px]">
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-sky-400 font-bold block">accepted kg_i</span>
              <span className="text-slate-400 text-[10px]">Net certified weight (kg)</span>
            </div>
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-amber-400 font-bold block">pool unit price</span>
              <span className="text-slate-400 text-[10px]">Buyer contracted price (₹/kg)</span>
            </div>
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-purple-400 font-bold block">grade factor_i</span>
              <span className="text-slate-400 text-[10px]">1.00 (Std) or quality mult.</span>
            </div>
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-rose-400 font-bold block">logistics_i</span>
              <span className="text-slate-400 text-[10px]">Weight pro-rata freight</span>
            </div>
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-orange-400 font-bold block">deductions_i</span>
              <span className="text-slate-400 text-[10px]">Agreed refractions + lab proof</span>
            </div>
            <div className="p-2 rounded bg-slate-900/50 border border-slate-800">
              <span className="text-emerald-400 font-bold block">incentives</span>
              <span className="text-slate-400 text-[10px]">Early aggregation premiums</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Interactive Input Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-base text-slate-900">Live Pool Simulator</h2>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Pre-Pool Lock Mode
                </span>
              </div>

              {/* Quick Presets */}
              <div className="mt-4">
                <label className="text-xs font-bold text-slate-700 block mb-2">Select Working Model Preset:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSimCrop('Onion');
                      setSimPoolKg(3000);
                      setSimBuyerPricePerKg(24);
                      setSimTotalLogistics(6000);
                      setSimTotalStorage(0);
                      setFarmerAKg(1000);
                      setFarmerAGradeFactor(1.0);
                      setApplyQualityDeduction(true);
                      setQualityDeductionPct(1.0);
                      setApplyIncentive(false);
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                      simCrop === 'Onion' && simPoolKg === 3000
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">🧅 3-Farmer Onion Pool</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">3,000 kg @ ₹24/kg, ₹6k Freight</div>
                  </button>

                  <button
                    onClick={() => {
                      setSimCrop('Soybean');
                      setSimPoolKg(6000);
                      setSimBuyerPricePerKg(48.5);
                      setSimTotalLogistics(9000);
                      setSimTotalStorage(1800);
                      setFarmerAKg(2000);
                      setFarmerAGradeFactor(1.02);
                      setApplyQualityDeduction(false);
                      setApplyIncentive(true);
                      setIncentiveAmount(800);
                    }}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all ${
                      simCrop === 'Soybean' && simPoolKg === 6000
                        ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">🌱 4-Farmer Soybean Pool</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">6,000 kg @ ₹48.50/kg, High Oil</div>
                  </button>
                </div>
              </div>

              {/* Pool Level Inputs */}
              <div className="mt-5 space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">1. Collective Pool Terms</h3>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Total Pool Volume:</span>
                    <span className="text-emerald-700 font-bold">{simPoolKg.toLocaleString('en-IN')} kg ({simPoolKg / 100} Quintals)</span>
                  </div>
                  <input
                    type="range"
                    min={1000}
                    max={10000}
                    step={500}
                    value={simPoolKg}
                    onChange={(e) => setSimPoolKg(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Buyer Contract Price:</span>
                    <span className="text-emerald-700 font-bold">₹{simBuyerPricePerKg.toFixed(2)} / kg (₹{(simBuyerPricePerKg * 100).toLocaleString('en-IN')} / Qtl)</span>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    step={1}
                    value={simBuyerPricePerKg}
                    onChange={(e) => setSimBuyerPricePerKg(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Total Freight / Haulage (₹):</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        value={simTotalLogistics}
                        onChange={(e) => setSimTotalLogistics(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Allocated: ₹{simUnitLogistics.toFixed(2)}/kg</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Storage / Assaying Fee (₹):</label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-2 text-xs text-slate-400">₹</span>
                      <input
                        type="number"
                        value={simTotalStorage}
                        onChange={(e) => setSimTotalStorage(Math.max(0, Number(e.target.value)))}
                        className="w-full pl-6 pr-2 py-1.5 text-xs font-bold rounded-lg border border-slate-200 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">Allocated: ₹{simUnitStorage.toFixed(2)}/kg</span>
                  </div>
                </div>
              </div>

              {/* Farmer A Specific Inputs */}
              <div className="mt-6 space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-400">2. Farmer A (Participant i) Contribution</h3>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Accepted Quantity (<code className="text-sky-600">accepted kg_i</code>):</span>
                    <span className="text-sky-700 font-bold">{farmerAKg.toLocaleString('en-IN')} kg ({((farmerAKg / simPoolKg) * 100).toFixed(1)}% of pool)</span>
                  </div>
                  <input
                    type="range"
                    min={200}
                    max={simPoolKg}
                    step={100}
                    value={farmerAKg}
                    onChange={(e) => setFarmerAKg(Number(e.target.value))}
                    className="w-full accent-sky-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Quality Grade Factor (<code className="text-purple-600">grade factor_i</code>):</span>
                    <span className="text-purple-700 font-bold">{farmerAGradeFactor.toFixed(2)}× {farmerAGradeFactor === 1.0 ? '(Within Grade A)' : farmerAGradeFactor > 1 ? '(Premium)' : '(Sub-grade)'}</span>
                  </div>
                  <input
                    type="range"
                    min={0.90}
                    max={1.10}
                    step={0.01}
                    value={farmerAGradeFactor}
                    onChange={(e) => setFarmerAGradeFactor(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                {/* Quality Deduction Toggle */}
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyQualityDeduction}
                        onChange={(e) => setApplyQualityDeduction(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-amber-900">Contractual Quality Deduction</span>
                    </label>
                    {applyQualityDeduction && (
                      <span className="text-xs font-extrabold text-rose-600">
                        - ₹{farmerADeductionRupees.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {applyQualityDeduction && (
                    <div className="pt-2 border-t border-amber-200/60 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-amber-800">
                        <span>Agreed Refraction Percentage:</span>
                        <span className="font-bold">{qualityDeductionPct.toFixed(1)}% of Gross</span>
                      </div>
                      <input
                        type="range"
                        min={0.2}
                        max={5.0}
                        step={0.1}
                        value={qualityDeductionPct}
                        onChange={(e) => setQualityDeductionPct(Number(e.target.value))}
                        className="w-full accent-amber-600 cursor-pointer"
                      />
                      <div className="flex items-center justify-between text-[10px] text-amber-700 bg-white/70 p-2 rounded border border-amber-200">
                        <span className="flex items-center space-x-1">
                          <Microscope className="w-3 h-3 text-amber-600" />
                          <span>Digital Moisture Assay Report #NABL-901</span>
                        </span>
                        <span className="font-semibold text-emerald-700">Proof Attached ✓</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Incentive Toggle */}
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyIncentive}
                        onChange={(e) => setApplyIncentive(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-emerald-900">Eligible Incentive / Bonus</span>
                    </label>
                    {applyIncentive && (
                      <span className="text-xs font-extrabold text-emerald-600">
                        + ₹{farmerAIncentiveRupees.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {applyIncentive && (
                    <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-emerald-800">Early Aggregation Incentive:</span>
                      <input
                        type="number"
                        value={incentiveAmount}
                        onChange={(e) => setIncentiveAmount(Number(e.target.value))}
                        className="w-24 px-2 py-1 text-right font-bold text-xs rounded border border-emerald-300"
                      />
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Right Column: Mathematical Settlement Statement */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-slate-200 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400">Step-by-Step Payout Breakdown</span>
                  <h3 className="text-lg font-extrabold text-slate-900">Settlement Computation for Farmer A</h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold">
                    <Sparkles className="w-3 h-3" />
                    <span>Real-time Dynamic</span>
                  </span>
                </div>
              </div>

              {/* Working Example Focus Card */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="text-xs font-bold text-slate-800 mb-1 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Verification of User Scenario</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Three farmers pool <strong>{simPoolKg.toLocaleString('en-IN')} kg</strong> {simCrop}. Buyer price is <strong>₹{simBuyerPricePerKg}/kg</strong>, freight/handling totals <strong>₹{simTotalLogistics.toLocaleString('en-IN')} (₹{simUnitLogistics.toFixed(2)}/kg)</strong>. Farmer A contributes <strong>{farmerAKg.toLocaleString('en-IN')} kg</strong> within grade.
                </p>
              </div>

              {/* Mathematical Term Rows */}
              <div className="space-y-3">
                
                {/* 1. Gross Crop Value */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <div className="font-bold text-slate-800">
                      1. Gross Crop Realization (<code className="text-sky-700">accepted kg_i × pool price × grade factor_i</code>)
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {farmerAKg.toLocaleString('en-IN')} kg × ₹{simBuyerPricePerKg.toFixed(2)}/kg × {farmerAGradeFactor.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-sm text-slate-900">
                    ₹{farmerAGrossValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* 2. Allocated Freight */}
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                      <Truck className="w-3.5 h-3.5 text-rose-500" />
                      <span>2. Allocated Logistics & Freight (<code className="text-rose-700">allocated logistics_i</code>)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {farmerAKg.toLocaleString('en-IN')} kg × ₹{simUnitLogistics.toFixed(2)}/kg freight allocation
                    </div>
                  </div>
                  <div className="text-right font-extrabold text-sm text-rose-600">
                    - ₹{farmerAAllocLogistics.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* 3. Allocated Storage */}
                {farmerAAllocStorage > 0 && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div>
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                        <Warehouse className="w-3.5 h-3.5 text-rose-500" />
                        <span>3. Allocated Storage & Warehousing (<code className="text-rose-700">allocated storage_i</code>)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {farmerAKg.toLocaleString('en-IN')} kg × ₹{simUnitStorage.toFixed(2)}/kg storage allocation
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-sm text-rose-600">
                      - ₹{farmerAAllocStorage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

                {/* Pre-Adjustment Subtotal Highlight */}
                <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 flex items-center justify-between text-xs font-bold text-emerald-950">
                  <div>
                    <span>Estimated Net Before Agreed Grade/Quality Adjustment:</span>
                    <div className="font-mono text-[11px] text-emerald-700 font-normal mt-0.5">
                      {farmerAKg.toLocaleString('en-IN')} × (₹{simBuyerPricePerKg} − ₹{simUnitLogistics.toFixed(0)}) = ₹{farmerAPreAdjustmentNet.toLocaleString('en-IN')}
                    </div>
                  </div>
                  <span className="text-base font-extrabold text-emerald-800">
                    ₹{farmerAPreAdjustmentNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* 4. Contractual Quality Deduction & Evidence Card */}
                {applyQualityDeduction && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" />
                          <span>4. Contractually Agreed Deduction (<code className="text-amber-900">deductions_i</code>)</span>
                        </span>
                        <span className="text-[11px] text-amber-800 block mt-0.5">
                          Agreed {qualityDeductionPct.toFixed(1)}% quality / moisture refraction based on NABL Lab Certificate
                        </span>
                      </div>
                      <span className="text-base font-extrabold text-rose-600">
                        - ₹{farmerADeductionRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Verifiable Evidence Drawer in Simulator */}
                    <div className="mt-2 pt-2 border-t border-amber-200/80 bg-white/80 p-3 rounded-lg border border-amber-200 text-[11px] text-slate-700 space-y-1.5">
                      <div className="flex items-center justify-between font-bold text-amber-950">
                        <span className="flex items-center space-x-1">
                          <Microscope className="w-3.5 h-3.5 text-amber-600" />
                          <span>Evidence Document: Assaying Report #NABL-QC-LAS-2026-0912</span>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">Verified & Sealed</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600 mt-1">
                        <div><strong>Tested Parameter:</strong> Surface & Neck Moisture (15.1% vs ≤14.0% baseline)</div>
                        <div><strong>Inspector:</strong> Er. S. Kulkarni (#MH-881)</div>
                        <div><strong>Method:</strong> Digital NIR Spectrometry (87.4% Reflectance)</div>
                        <div><strong>Contract Clause:</strong> Schedule B, Clause 3.1 (1.0% Price Refraction)</div>
                      </div>
                      <p className="text-[10px] text-emerald-800 font-medium italic pt-1 border-t border-slate-100">
                        ✓ Rupee deduction of ₹{farmerADeductionRupees.toFixed(2)} is displayed transparently alongside the NABL certified lab assay proof — not just an unexplained lower amount.
                      </p>
                    </div>
                  </div>
                )}

                {/* 5. Eligible Incentive */}
                {applyIncentive && (
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center space-x-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        <span>5. Eligible Incentive / Adjustment (<code className="text-emerald-800">eligible incentives_i</code>)</span>
                      </div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">
                        Early morning collection bonus / palletized handling
                      </div>
                    </div>
                    <div className="text-right font-extrabold text-sm text-emerald-600">
                      + ₹{farmerAIncentiveRupees.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}

              </div>

              {/* Final Net Payout Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-800 to-slate-900 text-white shadow-md border border-emerald-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase font-extrabold text-emerald-300 tracking-wider">Final Net Payout to Farmer A</span>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Direct Escrow Transfer to Verified Bank / UPI
                  </div>
                  <div className="text-[11px] text-emerald-200/80 mt-1 font-mono">
                    Formula payout = {farmerAGrossValue} − {farmerAAllocLogistics} − {farmerAAllocStorage} − {farmerADeductionRupees} + {farmerAIncentiveRupees}
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-3xl font-black text-white tracking-tight">
                    ₹{farmerAFinalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold inline-flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>100% Mathematically Transparent</span>
                  </span>
                </div>
              </div>

              {/* Pool Participants Proportion Table */}
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 mb-2">Pool Proportionality & Other Participants</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                        <th className="pb-2">Participant</th>
                        <th className="pb-2">Accepted (kg)</th>
                        <th className="pb-2">Grade Factor</th>
                        <th className="pb-2">Freight Share</th>
                        <th className="pb-2">Deductions</th>
                        <th className="pb-2 text-right">Net Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr className="bg-sky-50/50 font-semibold text-slate-900">
                        <td className="py-2.5 text-sky-800">Farmer A (Simulated)</td>
                        <td className="py-2.5">{farmerAKg.toLocaleString('en-IN')} kg</td>
                        <td className="py-2.5">{farmerAGradeFactor.toFixed(2)}×</td>
                        <td className="py-2.5 text-rose-600">-₹{farmerAAllocLogistics.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 text-amber-700">{applyQualityDeduction ? `-₹${farmerADeductionRupees.toFixed(0)} (1%)` : '₹0'}</td>
                        <td className="py-2.5 text-right font-extrabold text-emerald-700">₹{farmerAFinalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                      </tr>
                      <tr className="text-slate-700">
                        <td className="py-2.5">Farmer B</td>
                        <td className="py-2.5">1,200 kg</td>
                        <td className="py-2.5">1.00×</td>
                        <td className="py-2.5 text-rose-600">-₹2,400</td>
                        <td className="py-2.5 text-slate-400">₹0</td>
                        <td className="py-2.5 text-right font-bold text-slate-800">₹26,580.00</td>
                      </tr>
                      <tr className="text-slate-700">
                        <td className="py-2.5">Farmer C</td>
                        <td className="py-2.5">800 kg</td>
                        <td className="py-2.5">0.98×</td>
                        <td className="py-2.5 text-rose-600">-₹1,600</td>
                        <td className="py-2.5 text-amber-700">-₹94.08 (0.5%)</td>
                        <td className="py-2.5 text-right font-bold text-slate-800">₹17,121.92</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Audited Settlement Slips (Post Settlement Mode) */}
      {activeTab === 'settled_slips' && (
        <div className="space-y-6">
          
          {/* Batch Selector Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Select Completed Crop Pool Batch:</label>
              <select
                value={selectedBatchId}
                onChange={(e) => {
                  setSelectedBatchId(e.target.value);
                  const b = MOCK_POOL_BATCHES.find(batch => batch.id === e.target.value);
                  if (b && b.participants.length > 0) {
                    setSelectedFarmerId(b.participants[0].farmerId);
                  }
                }}
                className="text-sm font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {MOCK_POOL_BATCHES.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.title} — {b.totalAcceptedKg.toLocaleString('en-IN')} kg {b.crop} (@ ₹{b.finalPoolUnitPrice}/kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Participant:</span>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {activeBatch.participants.map(p => (
                  <button
                    key={p.farmerId}
                    onClick={() => setSelectedFarmerId(p.farmerId)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      selectedFarmerId === p.farmerId
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-950'
                    }`}
                  >
                    {p.farmerName.split(' ')[0]} {p.farmerName.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Detailed Settlement Slip Card */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 space-y-6">
            
            {/* Slip Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-black text-slate-900">Official Settlement Slip</h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold border border-emerald-200">
                    ✓ Verified Post-Settlement
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Batch: <strong>{activeBatch.id}</strong> • Contract Ref: <strong>{activeBatch.contractId}</strong> • FPO: <strong>{activeBatch.fpoName}</strong>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handlePrint(activeBatch, activeParticipant)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Print Settlement Slip</span>
                </button>
              </div>
            </div>

            {/* Parties Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Farmer i (Beneficiary)</div>
                <div className="font-extrabold text-sm text-slate-900">{activeParticipant.farmerName}</div>
                <div className="text-xs text-slate-600">Phone: {activeParticipant.phone} • District: {activeParticipant.district}</div>
                <div className="text-xs text-emerald-700 font-semibold">Account: {activeParticipant.upiOrBank}</div>
                {activeParticipant.payoutRef && (
                  <div className="text-[11px] text-slate-500">Bank UTR / Ref: <code className="text-slate-800 font-bold">{activeParticipant.payoutRef}</code></div>
                )}
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Commodity & Aggregation Pool</div>
                <div className="font-extrabold text-sm text-slate-900">{activeBatch.crop} ({activeBatch.variety})</div>
                <div className="text-xs text-slate-600">Buyer / Offtaker: {activeBatch.buyerName}</div>
                <div className="text-xs text-slate-600">Total Pool Weight: {activeBatch.totalAcceptedKg.toLocaleString('en-IN')} kg</div>
                <div className="text-xs text-emerald-700 font-semibold">Total Escrow Volume: ₹{activeBatch.escrowTotalAmount.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Formula Step Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Formula Term</th>
                    <th className="py-3 px-4">Calculation Basis</th>
                    <th className="py-3 px-4 text-right">Rupee Realization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      1. Accepted Quantity × Pool Price
                      <span className="text-[10px] text-slate-500 block font-normal">(accepted kg_i × final pool unit price)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {activeParticipant.acceptedKg.toLocaleString('en-IN')} kg @ ₹{activeBatch.finalPoolUnitPrice.toFixed(2)} / kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{(activeParticipant.acceptedKg * activeBatch.finalPoolUnitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      2. Quality Grade Factor Multiplier
                      <span className="text-[10px] text-slate-500 block font-normal">(grade factor_i: {activeParticipant.gradeFactorReason})</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      Multiplier: <strong>{activeParticipant.gradeFactor.toFixed(2)}×</strong>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      ₹{(activeParticipant.acceptedKg * activeBatch.finalPoolUnitPrice * activeParticipant.gradeFactor).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (Gross)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      3. Allocated Logistics & Freight
                      <span className="text-[10px] text-slate-500 block font-normal">(allocated logistics_i)</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {activeParticipant.acceptedKg.toLocaleString('en-IN')} kg @ ₹{activeBatch.unitLogisticsCost.toFixed(2)}/kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                      - ₹{activeParticipant.allocatedLogistics.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {activeParticipant.allocatedStorage > 0 && (
                    <tr>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        4. Allocated Storage & Handling
                        <span className="text-[10px] text-slate-500 block font-normal">(allocated storage_i)</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {activeParticipant.acceptedKg.toLocaleString('en-IN')} kg @ ₹{activeBatch.unitStorageCost.toFixed(2)}/kg
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        - ₹{activeParticipant.allocatedStorage.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  )}

                  {/* Subtotal row */}
                  <tr className="bg-emerald-50/70 font-bold">
                    <td className="py-3.5 px-4 text-emerald-950">
                      Estimated Net Before Contract Adjustments
                      <span className="text-[10px] text-emerald-700 block font-normal">Formula Subtotal: accepted kg × (Price − Freight − Storage)</span>
                    </td>
                    <td className="py-3.5 px-4 text-emerald-900">
                      {activeParticipant.acceptedKg} kg × ₹{(activeBatch.finalPoolUnitPrice * activeParticipant.gradeFactor - activeBatch.unitLogisticsCost - activeBatch.unitStorageCost).toFixed(2)}/kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-800 text-sm">
                      ₹{activeParticipant.preAdjustmentNet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>

                  {/* Deductions with View Evidence Button */}
                  {activeParticipant.deductions.map(d => (
                    <tr key={d.id} className="bg-rose-50/30">
                      <td className="py-3.5 px-4 text-rose-950">
                        <div className="font-bold flex items-center space-x-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Agreed Deduction: {d.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block mt-0.5">
                          Contract Clause Ref • Report #{d.evidence.reportId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span>{d.evidence.testedMetric}: <strong>{d.evidence.measuredValue}</strong></span>
                          <button
                            onClick={() => setEvidenceModalDeduction({
                              deduction: d,
                              farmerName: activeParticipant.farmerName,
                              crop: activeBatch.crop
                            })}
                            className="ml-2 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] flex items-center space-x-1 transition-colors"
                          >
                            <Microscope className="w-3 h-3 text-amber-700" />
                            <span>View Assaying Proof</span>
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                        - ₹{d.rupeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}

                  {/* Incentives */}
                  {activeParticipant.incentives.map(inc => (
                    <tr key={inc.id} className="bg-emerald-50/30">
                      <td className="py-3.5 px-4 text-emerald-950 font-bold">
                        <div className="flex items-center space-x-1.5">
                          <Award className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Eligible Incentive: {inc.title}</span>
                        </div>
                        <span className="text-[10px] text-emerald-700 block font-normal mt-0.5">{inc.reason}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">Quality & Handling Bonus</td>
                      <td className="py-3.5 px-4 text-right font-bold text-emerald-600">
                        + ₹{inc.rupeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Total Net Payout & Verification Card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] uppercase font-bold text-emerald-400 tracking-wider block">Final Audited Net Payout</span>
                <div className="text-3xl font-black text-white mt-1">
                  ₹{activeParticipant.finalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Disbursed via Direct Bank Escrow Release ({activeParticipant.payoutStatus.toUpperCase()})
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 text-xs space-y-1">
                <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Proof of Zero Hidden Fees</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Every rupee deducted matches a signed electronic quality assay contract clause. No un-receipted loading, sorting, or middleman fees.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Assaying / Quality Deduction Evidence Modal */}
      {evidenceModalDeduction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 font-bold">
                  <Microscope className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Digital Assaying & Quality Evidence</h3>
                  <p className="text-xs text-slate-500">Report #{evidenceModalDeduction.deduction.evidence.reportId}</p>
                </div>
              </div>
              <button
                onClick={() => setEvidenceModalDeduction(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Evidence Specs Grid */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiary / Lot Contributor:</span>
                  <span className="font-bold text-slate-900">{evidenceModalDeduction.farmerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commodity Batch:</span>
                  <span className="font-bold text-slate-900">{evidenceModalDeduction.crop}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Testing Laboratory:</span>
                  <span className="font-bold text-emerald-700">{evidenceModalDeduction.deduction.evidence.labName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Certified QC Assayer:</span>
                  <span className="font-semibold text-slate-800">{evidenceModalDeduction.deduction.evidence.inspectorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Test Timestamp:</span>
                  <span className="font-semibold text-slate-800">{evidenceModalDeduction.deduction.evidence.testDate}</span>
                </div>
              </div>

              {/* Measurement vs Baseline */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] uppercase font-bold text-rose-700 block">Measured Metric</span>
                  <div className="text-sm font-extrabold text-rose-950 mt-1">
                    {evidenceModalDeduction.deduction.evidence.measuredValue}
                  </div>
                  <span className="text-[10px] text-rose-800 block mt-0.5">{evidenceModalDeduction.deduction.evidence.testedMetric}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Agreed Baseline</span>
                  <div className="text-sm font-extrabold text-emerald-950 mt-1">
                    {evidenceModalDeduction.deduction.evidence.agreedBaseline}
                  </div>
                  <span className="text-[10px] text-emerald-800 block mt-0.5">Standard Contract Baseline</span>
                </div>
              </div>

              {/* Optical Spectrometry / Sieve Scan */}
              {evidenceModalDeduction.deduction.evidence.opticalScore && (
                <div className="p-3 rounded-xl bg-sky-50 border border-sky-200 text-[11px] text-sky-950 flex items-center justify-between">
                  <div>
                    <span className="font-bold block">Assaying Technique:</span>
                    <span>{evidenceModalDeduction.deduction.evidence.opticalScore}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-sky-200/80 font-bold text-[10px] text-sky-900">NIR Calibrated</span>
                </div>
              )}

              {/* Contract Clause */}
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-300 text-amber-950 space-y-1">
                <span className="text-[10px] uppercase font-bold text-amber-800 block">Contractual Justification</span>
                <p className="text-xs italic leading-relaxed">
                  "{evidenceModalDeduction.deduction.evidence.contractClause}"
                </p>
              </div>

              {/* Exact Rupee Impact */}
              <div className="p-3 rounded-xl bg-slate-900 text-white flex items-center justify-between font-bold">
                <span className="text-slate-300">Exact Applied Rupee Deduction:</span>
                <span className="text-rose-400 text-base">- ₹{evidenceModalDeduction.deduction.rupeeAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setEvidenceModalDeduction(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
              >
                Close Evidence Inspector
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
