import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  FileCheck2, 
  Scale, 
  Truck, 
  ArrowRight, 
  X, 
  AlertCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import { TransactionRecord, TradeFormalitiesItem } from '../types';
import { useApp } from '../context/AppContext';

interface FormalitiesPaymentProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionRecord | null;
  onUpdateTransaction?: (updated: TransactionRecord) => void;
}

const DEFAULT_FORMALITIES: TradeFormalitiesItem[] = [
  {
    id: 'quality_assay',
    label: 'Lab Quality Assay & Moisture Inspection Certificate (<10% Moisture)',
    completed: true,
    completedAt: 'Just now',
    verifiedBy: 'APMC Grader #402',
  },
  {
    id: 'weighbridge_slip',
    label: 'Certified Weighbridge Scale Gate Slip & Quantity Audit',
    completed: true,
    completedAt: 'Just now',
    verifiedBy: 'Digital Scale #2',
  },
  {
    id: 'enam_contract',
    label: 'Digital e-NAM Sales Agreement & Direct Farmer Contract',
    completed: true,
    completedAt: 'Just now',
    verifiedBy: 'e-NAM Gateway',
  },
  {
    id: 'gate_pass',
    label: 'Produce Dispatch Gate Pass & Haulage Waybill',
    completed: false,
  },
];

export const FormalitiesPaymentProgressModal: React.FC<FormalitiesPaymentProgressModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdateTransaction,
}) => {
  if (!isOpen || !transaction) return null;

  const { addToast, updateTransactionStatus, refreshData } = useApp();
  const [formalities, setFormalities] = useState<TradeFormalitiesItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (transaction) {
      setFormalities(
        transaction.formalitiesList && transaction.formalitiesList.length > 0
          ? transaction.formalitiesList
          : DEFAULT_FORMALITIES
      );
    }
  }, [transaction?.id]);

  const allFormalitiesChecked = formalities.every((f) => f.completed);
  const completedCount = formalities.filter((f) => f.completed).length;

  const toggleFormality = (id: string) => {
    setFormalities((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.completed;
          return {
            ...item,
            completed: nextState,
            completedAt: nextState ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
          };
        }
        return item;
      })
    );
  };

  const handleProceedPaymentInProgress = async () => {
    setIsSubmitting(true);
    try {
      // Advance status to 'in_transit' with payment in progress
      const bankRef = transaction.clearingBankRef || `RTGS-eNAM-MH-${Math.floor(100000 + Math.random() * 900000)}`;
      const note = `Formalities completed (${completedCount}/${formalities.length}). Payment in progress via RTGS Ref #${bankRef}. Produce dispatch & haulage authorized.`;
      
      const updated = await updateTransactionStatus(
        transaction.id, 
        'in_transit', 
        note
      );

      if (updated) {
        // Enforce payment status in progress
        updated.paymentStatus = 'in_progress';
        updated.formalitiesCompleted = true;
        updated.formalitiesList = formalities;
        updated.clearingBankRef = bankRef;
        updated.estimatedSettlementTime = '15-30 mins (e-NAM Bank Pipeline)';
        
        if (onUpdateTransaction) onUpdateTransaction(updated);
        await refreshData();

        addToast({
          type: 'success',
          title: 'Deal Advanced under Payment in Progress!',
          message: `Formalities verified. Produce dispatch allowed. Bank clearing ref #${bankRef}.`,
        });
      }
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not advance deal status.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeSettlement = async () => {
    setIsSubmitting(true);
    try {
      const updated = await updateTransactionStatus(
        transaction.id, 
        'completed', 
        'Bank RTGS settlement verified. Escrow payout credited to seller wallet.'
      );
      if (updated) {
        updated.paymentStatus = 'completed';
        updated.formalitiesCompleted = true;
        if (onUpdateTransaction) onUpdateTransaction(updated);
        await refreshData();

        addToast({
          type: 'success',
          title: 'Payment Clearing Complete!',
          message: `₹${(updated.farmerPayout || 0).toLocaleString('en-IN')} successfully credited to seller.`,
        });
      }
      onClose();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Settlement Failed',
        message: err.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPaymentInProgress = transaction.paymentStatus === 'in_progress' || transaction.status === 'in_transit';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <FileCheck2 className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[10px] font-mono font-bold uppercase tracking-wider">
                  APMC Rule #4B Formalities Clearance
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-[10px] font-mono font-bold">
                  {transaction.invoiceNumber}
                </span>
              </div>
              <h2 className="text-xl font-bold mt-1">
                Formalities & Payment in Progress Control
              </h2>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">

          {/* Deal Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <p className="text-slate-500 font-medium">Crop & Lot</p>
              <p className="font-bold text-slate-900 mt-0.5">{transaction.quantityQuintals || 0}q {transaction.crop}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Total Deal Value</p>
              <p className="font-extrabold text-emerald-700 mt-0.5">₹{(transaction.amount || 0).toLocaleString('en-IN')}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Seller (Farmer/FPO)</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{transaction.sellerName}</p>
            </div>
            <div>
              <p className="text-slate-500 font-medium">Buyer</p>
              <p className="font-bold text-slate-900 mt-0.5 truncate">{transaction.buyerName}</p>
            </div>
          </div>

          {/* Live Payment Progress Status Widget */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="relative flex h-3 h-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                </span>
                <h4 className="text-sm font-bold text-amber-900">
                  Payment Clearing status: {isPaymentInProgress ? 'Payment In Progress (e-NAM Bank Gateway)' : 'Formalities Pending Verification'}
                </h4>
              </div>
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-900">
                {transaction.clearingBankRef || `RTGS-MH-${Math.floor(100000 + Math.random() * 900000)}`}
              </span>
            </div>

            <p className="text-xs text-amber-800/90 leading-relaxed">
              <strong>e-NAM Mandi Guideline:</strong> Once quality assay, weighbridge scale slip, and sales formalities are completed, the buyer/seller can proceed with produce haulage and dispatch without waiting for final bank clearing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                <span className="text-slate-500 block">Bank Settlement Window</span>
                <span className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 inline" />
                  <span>{transaction.estimatedSettlementTime || '15-30 Mins (RTGS)'}</span>
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                <span className="text-slate-500 block">Escrow Lock Status</span>
                <span className="font-bold text-emerald-800 flex items-center space-x-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                  <span>100% Funds Secured</span>
                </span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/80">
                <span className="text-slate-500 block">Dispatch Authorization</span>
                <span className="font-bold text-blue-800 flex items-center space-x-1 mt-0.5">
                  <Truck className="w-3.5 h-3.5 text-blue-600 inline" />
                  <span>{completedCount >= 3 ? 'APPROVED' : 'Pending Formalities'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Formalities Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                <span>Trade Formalities & Audit Checklist ({completedCount}/{formalities.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setFormalities(prev => prev.map(item => ({ ...item, completed: true, completedAt: 'Verified' })))}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold hover:underline"
              >
                Mark All Verified
              </button>
            </div>

            <div className="space-y-2.5">
              {formalities.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleFormality(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3 ${
                    item.completed
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    item.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                  }`}>
                    {item.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-bold ${item.completed ? 'text-emerald-950' : 'text-slate-800'}`}>
                      {item.label}
                    </p>
                    {item.completed && (
                      <p className="text-[11px] text-emerald-700/80 mt-0.5 font-mono">
                        Verified {item.completedAt || 'Just now'} {item.verifiedBy ? `• ${item.verifiedBy}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {completedCount < 3 ? (
              <span className="text-amber-700 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 inline" />
                <span>Verify at least 3 mandatory formalities to proceed.</span>
              </span>
            ) : (
              <span className="text-emerald-700 font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 inline" />
                <span>Formalities completed! Deal can proceed with payment in progress.</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-all flex-1 sm:flex-none"
            >
              Close
            </button>

            {/* Complete Bank Clearing Instant (Sandbox testing) */}
            {isPaymentInProgress && (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalizeSettlement}
                className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 flex-1 sm:flex-none"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Finalize Bank Settlement</span>
              </button>
            )}

            {/* Primary Proceed Action */}
            <button
              type="button"
              disabled={isSubmitting || completedCount < 3}
              onClick={handleProceedPaymentInProgress}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold text-white transition-all shadow-md flex items-center justify-center space-x-2 flex-1 sm:flex-none ${
                completedCount >= 3 && !isSubmitting
                  ? 'bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-500 hover:to-emerald-600 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Deal...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4 text-white" />
                  <span>Proceed Deal (Payment in Progress)</span>
                  <ArrowRight className="w-4 h-4 ml-1 text-amber-200" />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
