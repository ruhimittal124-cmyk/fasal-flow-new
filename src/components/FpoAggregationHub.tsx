import React, { useState } from 'react';
import { 
  Boxes, 
  QrCode, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  Building2, 
  Truck, 
  Printer, 
  FileText, 
  Download, 
  PlusCircle, 
  Search, 
  Eye, 
  ExternalLink, 
  Scale, 
  Award, 
  Lock, 
  Unlock, 
  ArrowRight, 
  HelpCircle, 
  Sparkles, 
  TrendingUp, 
  Banknote, 
  Check, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  UserCheck, 
  FileSpreadsheet,
  RefreshCw,
  Info,
  Warehouse,
  Percent,
  Sliders,
  DollarSign,
  ShoppingBag,
  Filter,
  Tag
} from 'lucide-react';
import { MOCK_AGGREGATED_POOLS } from '../data/mockAggregationPools';
import { 
  AggregatedCropPool, 
  AggregationLotPassport, 
  BuyerDemandBid, 
  CropType, 
  CropGrade 
} from '../types';
import { 
  printLotPassport, 
  printDigitalContract, 
  printWarehouseReceipt, 
  printPoolSettlementSlip 
} from '../utils/printReceipt';
import { useApp } from '../context/AppContext';
import { useTranslation } from 'react-i18next';
import { BuyAggregatedLotModal, BuyableLotOption } from './BuyAggregatedLotModal';

export const FpoAggregationHub: React.FC = () => {
  const { t } = useTranslation();
  const { addToast, currentUser } = useApp();
  const [pools, setPools] = useState<AggregatedCropPool[]>(MOCK_AGGREGATED_POOLS);
  const [activePoolId, setActivePoolId] = useState<string>(MOCK_AGGREGATED_POOLS[0].id);
  const [currentStage, setCurrentStage] = useState<number>(1);
  
  // View mode switcher: Default to 'buyer_lots' for buyers so they see only lot options to choose to buy!
  const [viewMode, setViewMode] = useState<'buyer_lots' | 'fpo_admin'>('buyer_lots');

  // Buyer Lot Purchase Modal & Filter state
  const [selectedLotForPurchase, setSelectedLotForPurchase] = useState<BuyableLotOption | null>(null);
  const [buyerSearchQuery, setBuyerSearchQuery] = useState('');
  const [buyerCropFilter, setBuyerCropFilter] = useState<string>('all');
  const [buyerGradeFilter, setBuyerGradeFilter] = useState<string>('all');
  const [buyerSortBy, setBuyerSortBy] = useState<'price_asc' | 'price_desc' | 'qty_desc'>('price_asc');

  // Modals & inspect states
  const [activeLotModal, setActiveLotModal] = useState<AggregationLotPassport | null>(null);
  const [activeBidExplainModal, setActiveBidExplainModal] = useState<BuyerDemandBid | null>(null);
  const [isRegisteringLot, setIsRegisteringLot] = useState(false);

  // New lot form state
  const [newFarmerName, setNewFarmerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newVillage, setNewVillage] = useState('');
  const [newQuantityQtl, setNewQuantityQtl] = useState(10);
  const [newMoisture, setNewMoisture] = useState(11.5);
  const [newHarvestDate, setNewHarvestDate] = useState('2026-09-12');
  const [hasConsent, setHasConsent] = useState(false);
  const [labReportType, setLabReportType] = useState<'none' | 'FSSAI' | 'ICAR' | 'NABL'>('NABL');

  const activePool = pools.find(p => p.id === activePoolId) || pools[0];

  const handleRegisterLot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsent) {
      addToast('Farmer consent is mandatory to register an aggregated lot.', 'error');
      return;
    }
    if (!newFarmerName || !newPhone || !newVillage) {
      addToast('Please fill in all mandatory farmer and village fields.', 'error');
      return;
    }

    const newLotId = `LOT-${activePool.crop.substring(0, 2).toUpperCase()}-${String(activePool.lots.length + 1).padStart(3, '0')}`;
    const newLot: AggregationLotPassport = {
      lotId: newLotId,
      farmerId: `farmer-${Date.now()}`,
      farmerName: newFarmerName,
      farmerPhone: newPhone,
      village: newVillage,
      district: 'Nashik',
      crop: activePool.crop,
      variety: activePool.variety,
      harvestDate: newHarvestDate,
      quantityQuintals: Number(newQuantityQtl),
      quantityKg: Number(newQuantityQtl) * 100,
      declaredGrade: activePool.targetGrade,
      declaredMoisture: Number(newMoisture),
      declaredForeignMatter: 0.8,
      gpsLocation: {
        lat: 20.1711 + (Math.random() - 0.5) * 0.1,
        lng: 73.9872 + (Math.random() - 0.5) * 0.1,
        address: `${newVillage}, ${activePool.fpoName}`
      },
      expectedPickupDate: '2026-09-16',
      farmerConsentGiven: true,
      farmerConsentTimestamp: new Date().toISOString(),
      qrCodeData: `FASALFLOW:LOT:${newLotId}:${newFarmerName.replace(' ', '_')}:${Number(newQuantityQtl) * 100}KG:${activePool.crop.toUpperCase()}`,
      photos: [
        'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
      ],
      testReportAttached: labReportType !== 'none' ? {
        labName: labReportType === 'FSSAI' ? 'FSSAI Notified Food Laboratory, Pune' : 'NABL Accredited Quality Testing Facility',
        reportNo: `${labReportType}/MH/2026/${Math.floor(1000 + Math.random() * 9000)}`,
        testDate: newHarvestDate,
        accreditationType: labReportType === 'FSSAI' ? 'FSSAI_Notified' : 'NABL_Certified',
        parameters: [
          { name: 'Moisture Content', value: `${newMoisture}%`, standardLimit: `Max ${activePool.moistureToleranceMax}%`, pass: Number(newMoisture) <= activePool.moistureToleranceMax },
          { name: 'Foreign Matter', value: '0.8%', standardLimit: `Max ${activePool.defectToleranceMax}%`, pass: true },
          { name: 'Grade Classification', value: activePool.targetGrade, standardLimit: 'FAQ Export Standard', pass: true }
        ]
      } : undefined,
      fieldChecklist: {
        weighedKg: Number(newQuantityQtl) * 100,
        weighmentSlipNo: `WB-AUTO-${Math.floor(1000 + Math.random() * 9000)}`,
        visualInspectionOk: true,
        foreignMatterObserved: 0.8,
        inspectorAgent: 'FPO Field Officer (Field App)',
        checkedAt: new Date().toISOString()
      },
      status: 'pooled'
    };

    const updatedPools = pools.map(p => {
      if (p.id === activePool.id) {
        return {
          ...p,
          currentQuantityQuintals: p.currentQuantityQuintals + Number(newQuantityQtl),
          lots: [...p.lots, newLot]
        };
      }
      return p;
    });

    setPools(updatedPools);
    setIsRegisteringLot(false);
    setNewFarmerName('');
    setNewPhone('');
    setNewVillage('');
    setHasConsent(false);
    addToast(`Lot ${newLotId} created and pooled successfully!`, 'success');
  };

  const handleWithdrawLot = (lotId: string) => {
    if (activePool.status === 'locked' || activePool.status === 'contracted' || activePool.status === 'settled') {
      addToast('Cannot withdraw: Pool is already locked under digital contract.', 'error');
      return;
    }

    const updatedPools = pools.map(p => {
      if (p.id === activePool.id) {
        const lotToRemove = p.lots.find(l => l.lotId === lotId);
        const removedQtl = lotToRemove ? lotToRemove.quantityQuintals : 0;
        return {
          ...p,
          currentQuantityQuintals: Math.max(0, p.currentQuantityQuintals - removedQtl),
          lots: p.lots.filter(l => l.lotId !== lotId)
        };
      }
      return p;
    });

    setPools(updatedPools);
    addToast(`Lot ${lotId} withdrawn from pool. Farmer retains private produce.`, 'info');
  };

  const handleLockPool = () => {
    if (activePool.status !== 'open') {
      addToast('Pool is already locked or contracted.', 'info');
      return;
    }

    const updatedPools = pools.map(p => {
      if (p.id === activePool.id) {
        return {
          ...p,
          status: 'locked' as const,
          lockedAt: new Date().toISOString()
        };
      }
      return p;
    });

    setPools(updatedPools);
    addToast(`Pool ${activePool.code} locked! Member lots are now committed to digital contracting.`, 'success');
    setCurrentStage(5); // Move to contract stage
  };

  const stages = [
    { num: 1, title: t('aggregation.s1Title'), desc: t('aggregation.s1Desc') },
    { num: 2, title: t('aggregation.s2Title'), desc: t('aggregation.s2Desc') },
    { num: 3, title: t('aggregation.s3Title'), desc: t('aggregation.s3Desc') },
    { num: 4, title: t('aggregation.s4Title'), desc: t('aggregation.s4Desc') },
    { num: 5, title: t('aggregation.s5Title'), desc: t('aggregation.s5Desc') },
    { num: 6, title: t('aggregation.s6Title'), desc: t('aggregation.s6Desc') },
    { num: 7, title: t('aggregation.s7Title'), desc: t('aggregation.s7Desc') }
  ];

  // Generate buyable lot options for buyers to choose to buy
  const buyableLotOptions: BuyableLotOption[] = [];

  pools.forEach(pool => {
    const basePriceQtl = pool.crop === 'Onion' ? 2400 : pool.crop === 'Soybean' ? 4850 : 10400;

    // Aggregated Pool Bulk Option
    buyableLotOptions.push({
      id: `bulk-${pool.id}`,
      type: 'pool',
      lotCode: pool.code,
      title: pool.title,
      fpoName: pool.fpoName,
      crop: pool.crop,
      variety: pool.variety,
      grade: pool.targetGrade,
      availableQuantityQtl: pool.currentQuantityQuintals,
      availableQuantityKg: pool.currentQuantityQuintals * 100,
      unitPricePerQtl: basePriceQtl,
      unitPricePerKg: basePriceQtl / 100,
      totalValue: pool.currentQuantityQuintals * basePriceQtl,
      moisturePercent: pool.moistureToleranceMax,
      defectPercent: pool.defectToleranceMax,
      labReportName: 'NABL Accredited FPO Quality Assaying Hub',
      labAccreditation: 'NABL_Certified',
      hubLocation: pool.hubLocation,
      village: 'FPO Packhouse Hub',
      district: pool.hubLocation.includes('Nashik') ? 'Nashik' : 'Latur',
      photo: pool.crop === 'Onion' 
        ? 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
        : 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80',
      sellerId: 'user-fpo-1',
      sellerName: pool.fpoName
    });

    // Member Lots
    pool.lots.forEach(lot => {
      buyableLotOptions.push({
        id: lot.lotId,
        type: 'lot',
        lotCode: lot.lotId,
        title: `${lot.crop} ${lot.variety} (${lot.farmerName})`,
        fpoName: pool.fpoName,
        crop: lot.crop,
        variety: lot.variety,
        grade: lot.declaredGrade,
        availableQuantityQtl: lot.quantityQuintals,
        availableQuantityKg: lot.quantityKg,
        unitPricePerQtl: basePriceQtl,
        unitPricePerKg: basePriceQtl / 100,
        totalValue: lot.quantityQuintals * basePriceQtl,
        moisturePercent: lot.labAssaying?.measuredMoisture || lot.declaredMoisture,
        defectPercent: lot.declaredForeignMatter,
        labReportName: lot.labAssaying?.labName || lot.testReportAttached?.labName || 'FSSAI Notified Assaying Lab',
        labAccreditation: lot.testReportAttached?.accreditationType || 'NABL_Certified',
        hubLocation: pool.hubLocation,
        village: lot.village,
        district: lot.district,
        photo: lot.photos[0],
        sellerId: lot.farmerId,
        sellerName: lot.farmerName
      });
    });
  });

  const filteredBuyableLots = buyableLotOptions.filter(lot => {
    const q = buyerSearchQuery.toLowerCase();
    const matchesSearch = 
      !q || 
      lot.lotCode.toLowerCase().includes(q) ||
      lot.fpoName.toLowerCase().includes(q) ||
      lot.crop.toLowerCase().includes(q) ||
      lot.variety.toLowerCase().includes(q) ||
      lot.district.toLowerCase().includes(q) ||
      lot.village.toLowerCase().includes(q) ||
      lot.sellerName.toLowerCase().includes(q);

    const matchesCrop = buyerCropFilter === 'all' || lot.crop.toLowerCase() === buyerCropFilter.toLowerCase();
    const matchesGrade = buyerGradeFilter === 'all' || lot.grade === buyerGradeFilter;

    return matchesSearch && matchesCrop && matchesGrade;
  }).sort((a, b) => {
    if (buyerSortBy === 'price_asc') return a.unitPricePerQtl - b.unitPricePerQtl;
    if (buyerSortBy === 'price_desc') return b.unitPricePerQtl - a.unitPricePerQtl;
    if (buyerSortBy === 'qty_desc') return b.availableQuantityQtl - a.availableQuantityQtl;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & View Switcher */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
            <ShoppingBag className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                {t('aggregation.buyerMarketplace')}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('aggregation.escrowGuaranteed')}</span>
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
              {t('aggregation.availableLotsTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('aggregation.availableLotsSubtitle')}
            </p>
          </div>
        </div>

        {/* Mode Switcher Pill */}
        <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setViewMode('buyer_lots')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'buyer_lots'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('aggregation.buyerLotsOption')}</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('fpo_admin')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${
              viewMode === 'fpo_admin'
                ? 'bg-emerald-600 text-white shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>{t('aggregation.workflowStages')}</span>
          </button>
        </div>
      </div>

      {/* RENDER BUYER LOT CATALOG IF VIEWMODE IS BUYER_LOTS */}
      {viewMode === 'buyer_lots' ? (
        <div className="space-y-6">
          {/* Filters & Search Header */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('aggregation.searchLotsPlaceholder')}
                  value={buyerSearchQuery}
                  onChange={(e) => setBuyerSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                {/* Crop Filter */}
                <select
                  value={buyerCropFilter}
                  onChange={(e) => setBuyerCropFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('common.all') || 'All Crops'}</option>
                  <option value="Onion">{t('crops.Onion', 'Onion')}</option>
                  <option value="Soybean">{t('crops.Soybean', 'Soybean')}</option>
                  <option value="Tur">{t('crops.Tur', 'Tur')}</option>
                </select>

                {/* Grade Filter */}
                <select
                  value={buyerGradeFilter}
                  onChange={(e) => setBuyerGradeFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">{t('aggregation.allGrades')}</option>
                  <option value="Grade A">{t('aggregation.gradeA')}</option>
                  <option value="Grade B">{t('aggregation.gradeB')}</option>
                </select>

                {/* Sort By */}
                <select
                  value={buyerSortBy}
                  onChange={(e: any) => setBuyerSortBy(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="price_asc">{t('aggregation.sortPriceAsc')}</option>
                  <option value="price_desc">{t('aggregation.sortPriceDesc')}</option>
                  <option value="qty_desc">{t('aggregation.sortQtyDesc')}</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs border-t border-slate-100 pt-3">
              <span className="text-slate-500 font-semibold">
                {t('aggregation.showingLotsCount', { count: filteredBuyableLots.length })}
              </span>
              <span className="text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200 flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('aggregation.verifiedAssays')}</span>
              </span>
            </div>
          </div>

          {/* Lot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBuyableLots.map((lot) => (
              <div
                key={lot.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Header */}
                  <div className="h-44 bg-slate-100 relative overflow-hidden">
                    {lot.photo ? (
                      <img
                        src={lot.photo}
                        alt={lot.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Boxes className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-900/80 text-white backdrop-blur-xs border border-white/20 uppercase tracking-wider">
                        {lot.lotCode}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500 text-white shadow-xs flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3" />
                        <span>{lot.grade}</span>
                      </span>
                    </div>

                    {/* FPO Name overlay */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">{t('aggregation.producerFpo')}</span>
                      <h4 className="font-extrabold text-sm truncate">{lot.fpoName}</h4>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h3 className="font-black text-slate-900 text-base leading-tight">{lot.title}</h3>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{lot.village}, {lot.district}</span>
                      </p>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('aggregation.availableQtl')}</span>
                        <strong className="text-slate-900 text-sm font-black">{lot.availableQuantityQtl} Qtl</strong>
                        <span className="text-[9px] text-slate-400 block">({lot.availableQuantityKg.toLocaleString('en-IN')} kg)</span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">{t('aggregation.unitRate')}</span>
                        <strong className="text-emerald-700 text-sm font-black">₹{lot.unitPricePerQtl.toLocaleString('en-IN')}/Qtl</strong>
                        <span className="text-[9px] text-slate-500 block">₹{lot.unitPricePerKg.toFixed(2)}/kg</span>
                      </div>
                    </div>

                    {/* Quality Specs */}
                    <div className="space-y-1.5 text-[11px] bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('aggregation.assayMoisture')}:</span>
                        <strong className="text-emerald-800 font-bold">{lot.moisturePercent}% (Passed)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">{t('aggregation.foreignMatter')}:</span>
                        <strong className="text-slate-800">{lot.defectPercent}% FM</strong>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 pt-1 border-t border-emerald-100">
                        <span>{t('aggregation.assayingLab')}:</span>
                        <span className="font-semibold text-slate-700 truncate max-w-[160px]">{lot.labReportName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-5 pt-0 border-t border-slate-100 mt-2">
                  <div className="flex items-center justify-between mb-3 pt-3">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">{t('aggregation.totalLotValue')}</span>
                      <strong className="text-slate-900 font-black text-base">₹{lot.totalValue.toLocaleString('en-IN')}</strong>
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-lg">
                      {t('aggregation.exFpoHub')}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedLotForPurchase(lot)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{t('aggregation.chooseBuyLot')}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* FPO 7-Stage Workflow */
        <div className="space-y-8">
          {/* Hero Banner with Pool Selector */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-700/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center space-x-1.5">
                <Boxes className="w-3.5 h-3.5" />
                <span>{t('aggregation.engineBadge')}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {t('aggregation.identityRetained')}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
              {t('aggregation.hubTitle')}
            </h1>
            <p className="text-sm text-emerald-100/80 max-w-3xl mt-1.5 leading-relaxed">
              {t('aggregation.hubSubtitle')}
            </p>
          </div>

          {/* Pool Switcher */}
          <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-800/80 backdrop-blur-xs min-w-[280px]">
            <label className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block mb-1.5">
              {t('aggregation.activePool')}
            </label>
            <select
              value={activePoolId}
              onChange={(e) => setActivePoolId(e.target.value)}
              className="w-full bg-emerald-900/90 text-white border border-emerald-700 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              {pools.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code} • {p.crop} ({p.currentQuantityQuintals}/{p.targetQuantityQuintals} Qtl)
                </option>
              ))}
            </select>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-800/60 text-[11px] text-emerald-300">
              <span>Status: <strong className="uppercase text-white">{activePool.status.replace('_', ' ')}</strong></span>
              <span className="font-mono font-bold text-emerald-400">{t('aggregation.membersPooled', { count: activePool.lots.length })}</span>
            </div>
          </div>
        </div>

        {/* 7-Stage Interactive Stepper */}
        <div className="mt-8 pt-6 border-t border-emerald-800/80">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {stages.map((st) => {
              const isCurrent = currentStage === st.num;
              const isDone = currentStage > st.num;
              return (
                <button
                  key={st.num}
                  onClick={() => setCurrentStage(st.num)}
                  className={`p-3 rounded-xl text-left transition-all relative ${
                    isCurrent
                      ? 'bg-white text-slate-900 shadow-lg font-bold scale-[1.02]'
                      : isDone
                      ? 'bg-emerald-800/70 text-emerald-100 hover:bg-emerald-800'
                      : 'bg-emerald-950/40 text-emerald-300/70 hover:bg-emerald-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isCurrent ? 'bg-emerald-600 text-white' : 'bg-emerald-900/80 text-emerald-200'
                    }`}>
                      Stage 0{st.num}
                    </span>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </div>
                  <div className="text-xs font-bold truncate">{st.title}</div>
                  <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? 'text-slate-500' : 'text-emerald-300/60'}`}>
                    {st.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stage-Specific Content Views */}

      {/* ========================================================================= */}
      {/* STAGE 1: INDIVIDUAL LOT REGISTRATION & QR PASSPORT */}
      {/* ========================================================================= */}
      {currentStage === 1 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center space-x-2">
                <QrCode className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">{t('aggregation.s1Title')}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('aggregation.s1Desc')}
              </p>
            </div>
            <button
              onClick={() => setIsRegisteringLot(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('aggregation.registerNewLot')}</span>
            </button>
          </div>

          {/* Register Modal */}
          {isRegisteringLot && (
            <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    +
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{t('aggregation.createMemberPassport')}</h3>
                    <p className="text-xs text-slate-500">Pooling into {activePool.title}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsRegisteringLot(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  ✕ {t('common.close') || 'Close'}
                </button>
              </div>

              <form onSubmit={handleRegisterLot} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.farmerFullName')} *</label>
                    <input
                      type="text"
                      required
                      value={newFarmerName}
                      onChange={(e) => setNewFarmerName(e.target.value)}
                      placeholder="e.g. Dnyaneshwar Shinde"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.farmerPhone')} *</label>
                    <input
                      type="tel"
                      required
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="+91 98221 00000"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.villageBlock')} *</label>
                    <input
                      type="text"
                      required
                      value={newVillage}
                      onChange={(e) => setNewVillage(e.target.value)}
                      placeholder="e.g. Niphad, Nashik"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.harvestQuantity')} (Quintals) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="0.5"
                      value={newQuantityQtl}
                      onChange={(e) => setNewQuantityQtl(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">{newQuantityQtl * 100} Kilograms</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.declaredMoisture')} (%) *</label>
                    <input
                      type="number"
                      required
                      min="5"
                      max="30"
                      step="0.1"
                      value={newMoisture}
                      onChange={(e) => setNewMoisture(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold"
                    />
                    <span className="text-[10px] text-emerald-600 mt-0.5 block">Pool Max: {activePool.moistureToleranceMax}%</span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.harvestDate')} *</label>
                    <input
                      type="date"
                      required
                      value={newHarvestDate}
                      onChange={(e) => setNewHarvestDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">{t('aggregation.accreditedLabReport')}</label>
                    <select
                      value={labReportType}
                      onChange={(e: any) => setLabReportType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-semibold"
                    >
                      <option value="NABL">NABL Certified Agmark Lab</option>
                      <option value="FSSAI">FSSAI Notified Food Lab</option>
                      <option value="ICAR">ICAR Research Facility</option>
                      <option value="none">Visual Field Score Only</option>
                    </select>
                    <span className="text-[10px] text-slate-400 mt-0.5 block">High-risk parameter validation</span>
                  </div>
                </div>

                {/* Farmer Consent Checkbox */}
                <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="farmer-consent-check"
                    checked={hasConsent}
                    onChange={(e) => setHasConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="farmer-consent-check" className="text-[11px] text-emerald-950 font-medium cursor-pointer">
                    <strong>{t('aggregation.digitalConsent')}:</strong> {t('aggregation.digitalConsentDesc')}
                  </label>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRegisteringLot(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    {t('common.cancel') || 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs flex items-center space-x-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>{t('aggregation.generateQrPassport')}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Member Lot Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePool.lots.map((lot) => (
              <div key={lot.lotId} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-emerald-300 transition-all">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                      {lot.lotId}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-1">{lot.farmerName}</h3>
                    <p className="text-[11px] text-slate-400 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{lot.village}, {lot.district}</span>
                    </p>
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(lot.qrCodeData)}`}
                    alt="QR"
                    className="w-14 h-14 border border-slate-200 rounded-lg p-1 bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{t('aggregation.netHarvest')}</span>
                    <strong className="text-slate-900 font-black">{lot.quantityQuintals} Qtl ({lot.quantityKg} kg)</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{t('aggregation.moistureDefect')}</span>
                    <strong className="text-slate-800">{lot.declaredMoisture}% • {lot.declaredForeignMatter}% FM</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{t('aggregation.harvestDate')}</span>
                    <span className="text-slate-700 font-medium">{lot.harvestDate}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-semibold">{t('aggregation.consentStatus')}</span>
                    <span className="text-emerald-700 font-bold flex items-center space-x-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{t('aggregation.signed')}</span>
                    </span>
                  </div>
                </div>

                {lot.testReportAttached && (
                  <div className="bg-blue-50/80 p-2.5 rounded-xl border border-blue-100 text-[11px] flex items-center justify-between">
                    <div>
                      <span className="font-bold text-blue-900 block">🔬 {lot.testReportAttached.accreditationType.replace('_', ' ')}</span>
                      <span className="text-[10px] text-blue-700">Cert: {lot.testReportAttached.reportNo}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-200/70 text-blue-800 font-bold text-[10px]">
                      Verified
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => printLotPassport(lot, activePool.fpoName)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t('aggregation.printPassportBtn')}</span>
                  </button>

                  {activePool.status === 'open' && (
                    <button
                      onClick={() => handleWithdrawLot(lot.lotId)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700"
                    >
                      {t('aggregation.withdrawLotBtn')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: POOL RULES & TOLERANCE THRESHOLDS */}
      {/* ========================================================================= */}
      {currentStage === 2 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage2Title')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('aggregation.stage2Subtitle')}
                </p>
              </div>

              {activePool.status === 'open' ? (
                <button
                  onClick={handleLockPool}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Lock className="w-4 h-4" />
                  <span>{t('aggregation.lockPoolBtn')}</span>
                </button>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('aggregation.poolLockedBadge')}</span>
                </span>
              )}
            </div>

            {/* Rule Parameters Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Target Aggregation Target</span>
                <p className="text-xl font-black text-slate-900">{activePool.targetQuantityQuintals} Quintals</p>
                <p className="text-[11px] text-emerald-600 font-semibold">{activePool.currentQuantityQuintals} Qtl Currently Pooled ({Math.round((activePool.currentQuantityQuintals / activePool.targetQuantityQuintals) * 100)}%)</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Collection Radius</span>
                <p className="text-xl font-black text-slate-900">{activePool.collectionRadiusKm} km Radius</p>
                <p className="text-[11px] text-slate-500">Hub: {activePool.hubLocation}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quality Tolerances</span>
                <p className="text-xl font-black text-slate-900">Max {activePool.moistureToleranceMax}% Moist</p>
                <p className="text-[11px] text-slate-500">Foreign Matter &lt; {activePool.defectToleranceMax}%</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Cost Allocation Rule</span>
                <p className="text-sm font-black text-slate-900">Pro-Rata Per kg</p>
                <p className="text-[10px] text-emerald-700 font-mono">Shared Freight ÷ Total Pool kg</p>
              </div>
            </div>

            {/* Explicit Cost Allocation Rule Explainer */}
            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                <Info className="w-4 h-4 text-emerald-700" />
                <span>Transparent Cost-Allocation Rule</span>
              </div>
              <p className="text-emerald-800 leading-relaxed font-mono">
                {activePool.costAllocationRule}
              </p>
              <p className="text-[11px] text-emerald-700">
                Rule is legally binding: Farmers who bring produce under the quality tolerance are guaranteed net parity with zero opaque cuts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: QUALITY HARMONISATION (TWO-STEP PROCESS) */}
      {/* ========================================================================= */}
      {currentStage === 3 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage3Title')}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('aggregation.s3Desc')}
              </p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {activePool.lots.map((lot) => (
                <div key={lot.lotId} className="p-5 space-y-4 hover:bg-slate-50/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">
                        {lot.lotId}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900">{lot.farmerName} • {lot.quantityQuintals} Quintals ({lot.quantityKg} kg)</h4>
                        <p className="text-xs text-slate-400">Sample ID: {lot.labAssaying?.sampleId || 'Pending Assaying'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        lot.labAssaying?.decision === 'PASSED' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : lot.labAssaying?.decision === 'CONDITIONAL_ACCEPT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {lot.labAssaying?.decision ? `Assay: ${lot.labAssaying.decision}` : 'Field Verified'}
                      </span>
                    </div>
                  </div>

                  {/* Two Steps Comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {/* Step A */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Step A: Field Weighment & Checklist</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Calibrated Scale Net:</span>
                          <strong className="text-slate-900">{lot.fieldChecklist?.weighedKg || lot.quantityKg} kg</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Weighbridge Slip:</span>
                          <strong className="font-mono text-slate-700">{lot.fieldChecklist?.weighmentSlipNo || 'WB-NSK-8812'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Field Officer:</span>
                          <span className="text-slate-700">{lot.fieldChecklist?.inspectorAgent || 'FPO Agent #401'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Step B */}
                    <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-2">
                      <div className="font-bold text-blue-900 flex items-center space-x-1.5 text-[11px] uppercase tracking-wider">
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>Step B: Accredited Lab Assaying</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Lab Facility:</span>
                          <strong className="text-blue-950 truncate max-w-[200px]">{lot.labAssaying?.labName || 'FSSAI Notified Lab Pune'}</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Measured Moisture:</span>
                          <strong className="text-blue-950 font-mono">{lot.labAssaying?.measuredMoisture || lot.declaredMoisture}%</strong>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Chain of Custody:</span>
                          <span className="text-[10px] text-blue-800 font-mono truncate max-w-[190px]" title={lot.labAssaying?.chainOfCustodyTracking}>
                            {lot.labAssaying?.chainOfCustodyTracking || 'Agent -> Barcode Box -> Courier'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {lot.labAssaying?.deductionReason && (
                    <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Assay Decision Rule Triggered:</strong> {lot.labAssaying.deductionReason}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 4: BUYER DISCOVERY & EXPLAINABLE MULTI-CRITERIA SCORING */}
      {/* ========================================================================= */}
      {currentStage === 4 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage4Title')}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('aggregation.s4Desc')}
              </p>
            </div>

            {/* Buyer Bids Cards */}
            <div className="space-y-4">
              {activePool.buyerDemandOffers.map((bid) => {
                const isSelected = activePool.selectedBidId === bid.bidId;
                return (
                  <div
                    key={bid.bidId}
                    className={`p-5 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30 shadow-md ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            bid.explainableScore.rank === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            RANK #{bid.explainableScore.rank}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                            {bid.paymentTerms}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                            GSTIN: {bid.gstin}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{bid.companyName}</h3>
                        <p className="text-xs text-slate-500">
                          {bid.deliveryCondition} • Distance: {bid.distanceKm} km • Historical Dispute Rate: {bid.historicalDisputeRate}%
                        </p>
                      </div>

                      {/* Financials & Score */}
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">Headline Bid</span>
                          <div className="text-xl font-black text-slate-900">₹{bid.offeredPricePerKg.toFixed(2)}/kg</div>
                          <span className="text-[11px] text-emerald-700 font-semibold">₹{bid.offeredPricePerQuintal}/Quintal</span>
                        </div>

                        <div className="bg-slate-100 p-3 rounded-xl text-center min-w-[90px]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Score</span>
                          <span className="text-xl font-black text-emerald-700">{bid.explainableScore.totalScore}</span>
                          <span className="text-[9px] text-slate-400 block">/ 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Explainable Rationale Banner */}
                    <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Explainable Decision Rationale:</strong> {bid.explainableScore.rankingRationale}
                      </div>
                    </div>

                    {/* Score Matrix Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3 pt-3 border-t border-slate-100 text-[10px]">
                      <div>
                        <span className="text-slate-400 block">Net Realisation</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${bid.explainableScore.netRealisationScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 mt-0.5 block">{bid.explainableScore.netRealisationScore}/100</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block">Buyer Verification</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${bid.explainableScore.buyerVerificationScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 mt-0.5 block">{bid.explainableScore.buyerVerificationScore}/100</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block">Payment Security</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${bid.explainableScore.paymentSecurityScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 mt-0.5 block">{bid.explainableScore.paymentSecurityScore}/100</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block">Delivery Feasibility</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full" style={{ width: `${bid.explainableScore.deliveryFeasibilityScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 mt-0.5 block">{bid.explainableScore.deliveryFeasibilityScore}/100</span>
                      </div>

                      <div>
                        <span className="text-slate-400 block">Rejection Risk Resistance</span>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${bid.explainableScore.rejectionRiskScore}%` }}></div>
                        </div>
                        <span className="font-bold text-slate-700 mt-0.5 block">{bid.explainableScore.rejectionRiskScore}/100</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 5: POOL LOCK & DIGITAL CONTRACT */}
      {/* ========================================================================= */}
      {currentStage === 5 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage5Title')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('aggregation.s5Desc')}
                </p>
              </div>

              {activePool.contract && (
                <button
                  onClick={() => printDigitalContract(activePool.contract!)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Formal Legal Contract</span>
                </button>
              )}
            </div>

            {activePool.contract ? (
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6 text-xs">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Legally Executed Contract
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{activePool.contract.contractNumber}</h3>
                    <p className="text-slate-500">Executed on {new Date(activePool.contract.executedAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 font-bold text-[10px] uppercase">Total Contract Value</span>
                    <div className="text-xl font-black text-emerald-700">₹{activePool.contract.totalContractValue.toLocaleString('en-IN')}</div>
                    <span className="text-[11px] text-slate-500">{activePool.contract.agreedTotalKg.toLocaleString('en-IN')} kg @ ₹{activePool.contract.lockedUnitPricePerKg}/kg</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-700">Contractual Pricing Formula:</span>
                    <div className="p-3 bg-emerald-50 text-emerald-900 font-mono rounded-xl border border-emerald-200 font-bold">
                      {activePool.contract.pricingFormula}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-slate-700">Sampling & Assaying Standard:</span>
                    <div className="p-3 bg-white text-slate-800 rounded-xl border border-slate-200">
                      <strong>{activePool.contract.samplingStandard}</strong><br />
                      <span className="text-slate-500 text-[11px]">{activePool.contract.gradeToleranceClause}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions & Milestones */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-500">Deduction Penalty Schedule</h4>
                    <div className="divide-y divide-slate-100">
                      {activePool.contract.deductionSchedule.map((d, i) => (
                        <div key={i} className="py-2 flex justify-between">
                          <span className="text-slate-700">{d.condition}</span>
                          <strong className="text-rose-600">{d.penaltyPercent}% penalty</strong>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-slate-900 uppercase text-[11px] text-slate-500">Escrow Payment Milestones</h4>
                    <div className="divide-y divide-slate-100">
                      {activePool.contract.paymentMilestones.map((m, i) => (
                        <div key={i} className="py-2 flex justify-between items-center">
                          <span className="text-slate-700">{m.milestone}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-500 text-[11px]">
                  <strong>Dispute & Arbitration Protocol:</strong> {activePool.contract.disputeProcess}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Lock className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="font-bold text-slate-700">No contract executed yet</p>
                <p className="text-xs">Lock pool under Stage 2 to issue the digital aggregation contract.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 6: PICKUP, STORAGE (WDRA & e-NWR) & DELIVERY */}
      {/* ========================================================================= */}
      {currentStage === 6 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Warehouse className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage6Title')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('aggregation.s6Desc')}
                </p>
              </div>

              {activePool.warehouseReceipt && (
                <button
                  onClick={() => printWarehouseReceipt(activePool.warehouseReceipt!)}
                  className="px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print WDRA e-NWR Certificate</span>
                </button>
              )}
            </div>

            {/* Dispatch & Weighment Card */}
            {activePool.dispatchManifest && (
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h4 className="font-bold text-slate-900">Dispatch Manifest #{activePool.dispatchManifest.manifestId}</h4>
                      <p className="text-slate-500">Vehicle: {activePool.dispatchManifest.vehicleNumber} ({activePool.dispatchManifest.driverName})</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 uppercase">
                    Status: {activePool.dispatchManifest.status}
                  </span>
                </div>

                {/* Dual Weighment Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Origin Weighbridge</span>
                    <strong className="text-base text-slate-900 block font-black mt-1">
                      {activePool.dispatchManifest.originWeighment.netKg.toLocaleString()} kg Net
                    </strong>
                    <span className="text-[10px] text-slate-500">Gross: {activePool.dispatchManifest.originWeighment.grossKg} kg • Tare: {activePool.dispatchManifest.originWeighment.tareKg} kg</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Destination Weighbridge</span>
                    <strong className="text-base text-slate-900 block font-black mt-1">
                      {activePool.dispatchManifest.destinationWeighment?.netKg.toLocaleString() || 'In Transit'} kg Net
                    </strong>
                    <span className="text-[10px] text-slate-500">Slip #{activePool.dispatchManifest.destinationWeighment?.slipNo || '-'}</span>
                  </div>

                  <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                    <span className="text-[10px] text-emerald-700 uppercase font-bold block">Transit Shrinkage</span>
                    <strong className="text-base text-emerald-950 block font-black mt-1">
                      {activePool.dispatchManifest.transitShrinkageKg || 0} kg ({activePool.dispatchManifest.shrinkagePercent || 0}%)
                    </strong>
                    <span className="text-[10px] text-emerald-700">Allowable Ceiling: {activePool.dispatchManifest.allowableShrinkageLimit}% (Compliant)</span>
                  </div>
                </div>
              </div>
            )}

            {/* WDRA e-NWR Certificate Box */}
            {activePool.warehouseReceipt && (
              <div className="bg-blue-950 text-white p-6 rounded-2xl border border-blue-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/80 pb-3">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                      WDRA Electronic Negotiable Warehouse Receipt (e-NWR)
                    </span>
                    <h3 className="text-base font-black mt-1">{activePool.warehouseReceipt.eNwrNumber}</h3>
                    <p className="text-xs text-blue-200/70">Repository: <strong>{activePool.warehouseReceipt.repositoryName} (National E-Repository)</strong></p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-blue-300 uppercase font-bold">Pledgeable Bank Collateral Value</span>
                    <div className="text-2xl font-black text-emerald-400">₹{activePool.warehouseReceipt.pledgeableCollateralValue.toLocaleString('en-IN')}</div>
                    <span className="text-[11px] text-blue-200/70">90% Advance Collateral Eligible</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-blue-100">
                  <div>
                    <span className="text-blue-300 block font-semibold text-[10px] uppercase">Warehouse Facility</span>
                    <strong>{activePool.warehouseReceipt.warehouseName}</strong>
                    <p className="text-blue-300 text-[11px] mt-0.5">WDRA Reg: {activePool.warehouseReceipt.wdraRegistrationNo}</p>
                  </div>
                  <div>
                    <span className="text-blue-300 block font-semibold text-[10px] uppercase">Stored Commodity & Grade</span>
                    <strong>{activePool.warehouseReceipt.storedQuantityQuintals} Qtl ({activePool.warehouseReceipt.storedQuantityKg} kg) • {activePool.warehouseReceipt.commodityGradeAssigned}</strong>
                    <p className="text-blue-300 text-[11px] mt-0.5">Valid Storage Through: {activePool.warehouseReceipt.validUntil}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 7: MEMBER-LEVEL RECONCILIATION & PASSBOOK PAYOUT */}
      {/* ========================================================================= */}
      {currentStage === 7 && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">{t('aggregation.stage7Title')}</h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('aggregation.s7Desc')}
                </p>
              </div>

              {activePool.settlementBatch && (
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">{t('aggregation.totalLotValue')}</span>
                  <span className="text-xl font-black text-slate-900">₹{activePool.settlementBatch.escrowTotalAmount.toLocaleString('en-IN')}</span>
                </div>
              )}
            </div>

            {/* Formula Banner */}
            <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 text-xs font-mono space-y-1">
              <span className="font-bold text-emerald-950 uppercase text-[10px]">{t('aggregation.statutoryFormula')}</span>
              <p className="text-emerald-900 font-bold text-xs sm:text-sm leading-relaxed">
                payout_i = (accepted kg_i × final pool unit price × grade factor_i) − allocated logistics_i − allocated storage_i − contractually agreed deductions_i + eligible incentives
              </p>
            </div>

            {/* Member Payouts Table */}
            {activePool.settlementBatch && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase">
                      <th className="p-3">{t('aggregation.farmerMember')}</th>
                      <th className="p-3 text-right">{t('aggregation.acceptedKg')}</th>
                      <th className="p-3 text-right">{t('aggregation.grossAmount')}</th>
                      <th className="p-3 text-right">{t('aggregation.logistics')}</th>
                      <th className="p-3 text-right">{t('aggregation.deductions')}</th>
                      <th className="p-3 text-right">{t('aggregation.incentives')}</th>
                      <th className="p-3 text-right">{t('aggregation.netPayout')}</th>
                      <th className="p-3 text-right">{t('aggregation.slipReceipt')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {activePool.settlementBatch.participants.map((pt) => (
                      <tr key={pt.farmerId} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3">
                          <strong className="text-slate-900 block">{pt.farmerName}</strong>
                          <span className="text-[10px] text-slate-400">{pt.upiOrBank}</span>
                        </td>
                        <td className="p-3 text-right font-bold">{pt.acceptedKg.toLocaleString()} kg</td>
                        <td className="p-3 text-right">₹{(pt.acceptedKg * activePool.settlementBatch!.finalPoolUnitPrice).toLocaleString()}</td>
                        <td className="p-3 text-right text-rose-600 font-semibold">-₹{pt.allocatedLogistics.toLocaleString()}</td>
                        <td className="p-3 text-right text-rose-600 font-semibold">
                          {pt.deductions.length > 0 ? (
                            <span title={pt.deductions[0].title}>
                              -₹{pt.deductions.reduce((a, b) => a + b.rupeeAmount, 0).toLocaleString()}
                            </span>
                          ) : (
                            '₹0'
                          )}
                        </td>
                        <td className="p-3 text-right text-emerald-600 font-semibold">
                          {pt.incentives.length > 0 ? (
                            `+₹${pt.incentives.reduce((a, b) => a + b.rupeeAmount, 0).toLocaleString()}`
                          ) : (
                            '₹0'
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-sm text-emerald-800">
                          ₹{pt.finalPayout.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => printPoolSettlementSlip(activePool.settlementBatch!, pt)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 inline-flex items-center space-x-1"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Slip</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      )}

      {/* Buy Aggregated Lot Modal */}
      {selectedLotForPurchase && (
        <BuyAggregatedLotModal
          isOpen={true}
          onClose={() => setSelectedLotForPurchase(null)}
          lot={selectedLotForPurchase}
        />
      )}
    </div>
  );
};
