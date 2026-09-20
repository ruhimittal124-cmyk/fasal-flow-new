import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  X, 
  AlertCircle, 
  Scale, 
  Building2, 
  MapPin, 
  Award,
  Wallet,
  Truck,
  ArrowRight,
  FileSpreadsheet
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropType, CropGrade } from '../types';

export interface BuyableLotOption {
  id: string;
  type: 'lot' | 'pool';
  lotCode: string;
  title: string;
  fpoName: string;
  crop: CropType;
  variety: string;
  grade: CropGrade;
  availableQuantityQtl: number;
  availableQuantityKg: number;
  unitPricePerQtl: number;
  unitPricePerKg: number;
  totalValue: number;
  moisturePercent: number;
  defectPercent: number;
  labReportName?: string;
  labAccreditation?: string;
  hubLocation: string;
  village: string;
  district: string;
  photo?: string;
  sellerId: string;
  sellerName: string;
}

interface BuyAggregatedLotModalProps {
  isOpen: boolean;
  onClose: () => void;
  lot: BuyableLotOption | null;
  onSuccess?: () => void;
}

export const BuyAggregatedLotModal: React.FC<BuyAggregatedLotModalProps> = ({
  isOpen,
  onClose,
  lot,
  onSuccess
}) => {
  const { t } = useTranslation();
  const { 
    currentUser, 
    addToast, 
    openInsufficientBalanceDialog, 
    refreshData 
  } = useApp();

  const [selectedQtyQtl, setSelectedQtyQtl] = useState<number>(10);
  const [deliveryType, setDeliveryType] = useState<'ex_hub' | 'cif_mandi'>('ex_hub');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (lot) {
      setSelectedQtyQtl(lot.availableQuantityQtl);
      setAgreedTerms(false);
    }
  }, [lot?.id]);

  if (!isOpen || !lot) return null;

  const freightPerQtl = deliveryType === 'cif_mandi' ? 150 : 0;
  const unitPriceWithFreight = lot.unitPricePerQtl + freightPerQtl;
  const subtotalProduce = unitPriceWithFreight * selectedQtyQtl;
  const platformFee = Math.round(subtotalProduce * 0.01);
  const buyerTotalRequired = subtotalProduce + platformFee;

  const buyerWalletBalance = currentUser?.walletBalance ?? 250000;
  const hasEnoughBalance = buyerWalletBalance >= buyerTotalRequired;
  const shortfall = Math.max(0, buyerTotalRequired - buyerWalletBalance);

  const handleConfirmPurchase = async () => {
    if (!agreedTerms) {
      addToast('Please accept the Escrow protection agreement terms to proceed.', 'error');
      return;
    }

    if (!hasEnoughBalance) {
      openInsufficientBalanceDialog({
        transactionTitle: `Escrow Purchase for ${selectedQtyQtl}q ${lot.crop} (${lot.lotCode})`,
        transactionType: 'trade_deal',
        requiredAmount: buyerTotalRequired,
        currentBalance: buyerWalletBalance,
        shortfall,
        payerName: currentUser?.name || 'Buyer Trader',
        payerRole: 'buyer',
        payerId: currentUser?.id || 'user-buyer-1',
        crop: lot.crop,
        quantityQuintals: selectedQtyQtl,
        onRetry: handleConfirmPurchase
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        type: 'trade_deal',
        status: 'escrow_locked',
        amount: subtotalProduce,
        crop: lot.crop,
        quantityQuintals: selectedQtyQtl,
        pricePerQuintal: unitPriceWithFreight,
        sellerId: lot.sellerId || 'user-fpo-1',
        sellerName: lot.fpoName,
        buyerId: currentUser?.id || 'user-buyer-1',
        buyerName: currentUser?.name || 'Shree Ganesh Agro Processing',
        platformFee,
        farmerPayout: Math.round(subtotalProduce * 0.99),
        buyerTotal: buyerTotalRequired,
        paymentMethod: 'Instant RBI Escrow Guarantee',
        paymentRef: `UPI-ESCROW-${Date.now()}`,
        notes: `Buyer locked 100% escrow funds for FPO aggregated lot ${lot.lotCode} (${lot.crop} ${lot.variety})`,
        pickupDistrict: lot.district,
        dropDistrict: currentUser?.district || 'Latur',
        invoiceNumber: `INV-MH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        paymentStatus: 'in_progress',
        clearingBankRef: `eNAM-RTGS-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedSettlementTime: 'Same Day 16:00 IST',
        formalitiesCompleted: true,
        formalitiesList: [
          { id: 'f1', label: 'NABL Quality & Moisture Assay', completed: true, completedAt: new Date().toISOString(), verifiedBy: 'Agmark Lab' },
          { id: 'f2', label: 'Calibrated Scale Weighbridge Slip', completed: true, completedAt: new Date().toISOString(), verifiedBy: 'APMC Station' },
          { id: 'f3', label: 'e-NAM Digital Sales Agreement', completed: true, completedAt: new Date().toISOString(), verifiedBy: 'e-NAM Gateway' }
        ]
      };

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to create purchase transaction');
      }

      await refreshData();

      addToast(
        `Success! Escrow deposit of ₹${buyerTotalRequired.toLocaleString('en-IN')} locked for Lot ${lot.lotCode}.`,
        'success'
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error buying aggregated lot:', err);
      addToast('Error processing lot purchase. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-emerald-300 hover:text-white bg-emerald-800/50 p-1.5 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-wider flex items-center space-x-1">
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>{t('aggregation.modalBuyTitle', 'FPO Commercial Lot Purchase')}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              100% Escrow Protection
            </span>
          </div>

          <h2 className="text-xl font-black mt-2 tracking-tight flex items-center space-x-2">
            <span>{t('aggregation.buyNow', 'Buy Lot')} {lot.lotCode}</span>
          </h2>
          <p className="text-xs text-emerald-200/80 mt-0.5">
            {lot.fpoName} • {lot.crop} ({lot.variety})
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs">
          {/* Lot Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">{t('aggregation.fpoOperator', 'Producer FPO')}</span>
                <h3 className="font-bold text-slate-900 text-sm">{lot.fpoName}</h3>
                <p className="text-slate-500 text-[11px] flex items-center space-x-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{lot.hubLocation}, {lot.district}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
                {lot.grade}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('aggregation.availableQty', 'Total Qtl')}</span>
                <strong className="text-slate-900 text-sm font-black">{lot.availableQuantityQtl} Qtl</strong>
                <span className="text-[9px] text-slate-400 block">({lot.availableQuantityKg.toLocaleString('en-IN')} kg)</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('browseLots.askingPrice', 'Unit Rate')}</span>
                <strong className="text-emerald-700 text-sm font-black">₹{lot.unitPricePerQtl.toLocaleString('en-IN')}/Qtl</strong>
                <span className="text-[9px] text-slate-500 block">₹{lot.unitPricePerKg.toFixed(2)}/kg</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-semibold uppercase">{t('aggregation.moisture', 'Assay Moisture')}</span>
                <strong className="text-blue-900 text-sm font-bold">{lot.moisturePercent}%</strong>
                <span className="text-[9px] text-emerald-600 font-semibold block">{t('common.verified', 'Passed')}</span>
              </div>
            </div>

            {lot.labReportName && (
              <div className="flex items-center space-x-2 text-[11px] text-blue-900 bg-blue-50/80 px-3 py-2 rounded-xl border border-blue-100">
                <Award className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{t('aggregation.labCertified', 'Verified by')} <strong>{lot.labReportName}</strong></span>
              </div>
            )}
          </div>

          {/* Quantity Selector & Freight Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">{t('aggregation.orderQty', 'Select Purchase Quantity (Quintals)')}</label>
              <input
                type="number"
                min="1"
                max={lot.availableQuantityQtl}
                value={selectedQtyQtl}
                onChange={(e) => setSelectedQtyQtl(Math.min(lot.availableQuantityQtl, Math.max(1, Number(e.target.value))))}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-sm"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Max available in lot: {lot.availableQuantityQtl} Qtl
              </span>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">{t('aggregation.deliveryType', 'Delivery / Haulage Terms')}</label>
              <select
                value={deliveryType}
                onChange={(e: any) => setDeliveryType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-semibold text-xs"
              >
                <option value="ex_hub">{t('aggregation.exHub', 'Ex-FPO Hub (Self Haulage)')}</option>
                <option value="cif_mandi">{t('aggregation.cifMandi', 'CIF Buyer Mandi (+₹150/Qtl Freight)')}</option>
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                {deliveryType === 'ex_hub' ? 'Pickup from FPO Packhouse' : 'Direct delivery to buyer warehouse'}
              </span>
            </div>
          </div>

          {/* Payment & Financial Breakdown */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
            <h4 className="font-bold text-emerald-950 uppercase text-[10px] tracking-wider flex items-center justify-between">
              <span>Financial Calculation</span>
              <span className="text-emerald-700">100% RBI Escrow Protected</span>
            </h4>

            <div className="space-y-1.5 pt-1 text-slate-700">
              <div className="flex justify-between">
                <span>Produce Cost ({selectedQtyQtl} Qtl @ ₹{unitPriceWithFreight.toLocaleString('en-IN')}/Qtl):</span>
                <strong className="text-slate-900">₹{subtotalProduce.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>FasalFlow Escrow Platform Fee (1% Flat):</span>
                <strong>₹{platformFee.toLocaleString('en-IN')}</strong>
              </div>
              <div className="flex justify-between pt-2 border-t border-emerald-200 text-sm font-black text-emerald-950">
                <span>{t('aggregation.totalPrice', 'Total Escrow Deposit Required')}:</span>
                <span className="text-emerald-700">₹{buyerTotalRequired.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Wallet Balance Check */}
            <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between text-xs ${
              hasEnoughBalance 
                ? 'bg-white border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center space-x-2">
                <Wallet className={`w-4 h-4 ${hasEnoughBalance ? 'text-emerald-600' : 'text-rose-600'}`} />
                <div>
                  <span className="block font-medium text-[10px] uppercase text-slate-400">{t('profile.escrowBalance', 'Buyer Wallet Balance')}</span>
                  <strong className="font-bold">₹{buyerWalletBalance.toLocaleString('en-IN')}</strong>
                </div>
              </div>

              {!hasEnoughBalance && (
                <span className="px-2 py-0.5 rounded bg-rose-200/70 text-rose-900 text-[10px] font-bold">
                  Shortfall: ₹{shortfall.toLocaleString('en-IN')}
                </span>
              )}
            </div>
          </div>

          {/* Agreement Checkbox */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-start space-x-3">
            <input
              type="checkbox"
              id="escrow-terms-check"
              checked={agreedTerms}
              onChange={(e) => setAgreedTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="escrow-terms-check" className="text-[11px] text-slate-700 leading-normal cursor-pointer">
              <strong>100% Escrow Guarantee Consent:</strong> {t('aggregation.escrowHoldNotice', 'I authorize FasalFlow to lock funds into zero-risk Escrow account.')}
            </label>
          </div>

          {/* Footer Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
            >
              {t('common.close', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleConfirmPurchase}
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-white shadow-md flex items-center space-x-2 transition-all ${
                hasEnoughBalance 
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmitting ? 'Locking Escrow...' : hasEnoughBalance ? t('aggregation.confirmBuy', 'Confirm & Lock Escrow') : 'Top Up Wallet & Buy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
