import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertOctagon, 
  X, 
  Wallet, 
  ArrowRight, 
  ShieldAlert, 
  CreditCard, 
  CheckCircle2, 
  Building2, 
  Lock, 
  Smartphone, 
  HelpCircle,
  RefreshCw,
  UserCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface InsufficientBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionTitle: string;
  transactionType?: 'trade_deal' | 'transport_fare' | 'escrow_lock' | 'general';
  requiredAmount: number;
  currentBalance: number;
  shortfall: number;
  payerName?: string;
  payerRole?: string;
  payerId?: string;
  crop?: string;
  quantityQuintals?: number;
  offerId?: string;
  onRetry?: () => void;
}

export const InsufficientBalanceModal: React.FC<InsufficientBalanceModalProps> = ({
  isOpen,
  onClose,
  transactionTitle,
  transactionType = 'trade_deal',
  requiredAmount,
  currentBalance,
  shortfall,
  payerName,
  payerRole = 'buyer',
  payerId,
  crop,
  quantityQuintals,
  offerId,
  onRetry,
}) => {
  const { currentUser, setCurrentUser, availableUsers, topUpWallet, addToast, refreshData } = useApp();

  const isCurrentPayer = !payerId || payerId === currentUser?.id || (currentUser?.role === 'buyer' && payerRole === 'buyer');
  
  // Custom Top-Up state
  const [topUpAmount, setTopUpAmount] = useState<number>(Math.max(1000, shortfall || 0));
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'enam_rtgs'>('upi');
  const [isProcessingTopUp, setIsProcessingTopUp] = useState<boolean>(false);
  const [topUpSuccess, setTopUpSuccess] = useState<boolean>(false);
  const [newWalletBalance, setNewWalletBalance] = useState<number | null>(null);

  if (!isOpen) return null;

  const actualShortfall = Math.max(0, shortfall || (requiredAmount - currentBalance));

  const handleTopUpAndResolve = async () => {
    if (topUpAmount <= 0) return;
    setIsProcessingTopUp(true);
    try {
      const targetUserId = payerId || currentUser?.id || 'user-buyer-1';
      const methodLabel = paymentMethod === 'upi' 
        ? 'UPI Instant (BHIM / PhonePe / GPay)' 
        : paymentMethod === 'enam_rtgs' 
          ? 'APMC e-NAM RTGS Escrow Deposit' 
          : 'Net Banking IMPS Virtual Account';

      await topUpWallet(topUpAmount, methodLabel);
      await refreshData();

      const updatedUser = availableUsers.find(u => u.id === targetUserId);
      const updatedBal = (currentBalance || 0) + topUpAmount;
      setNewWalletBalance(updatedUser?.walletBalance ?? updatedBal);
      setTopUpSuccess(true);

      addToast({
        type: 'success',
        title: 'Wallet Funded Successfully',
        message: `₹${topUpAmount.toLocaleString('en-IN')} deposited into wallet via ${methodLabel}.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Top-Up Failed',
        message: err.message || 'Unable to complete wallet deposit. Please try again.',
      });
    } finally {
      setIsProcessingTopUp(false);
    }
  };

  const handleSwitchToPayerAndTopUp = (targetUser: any) => {
    setCurrentUser(targetUser);
    localStorage.setItem('fasalflow_user', JSON.stringify(targetUser));
    addToast({
      type: 'info',
      title: 'Profile Switched for Demo',
      message: `Switched active session to ${targetUser.name} (${targetUser.role.toUpperCase()}). You can now deposit funds directly.`,
    });
  };

  const handleExecuteRetry = () => {
    onClose();
    if (onRetry) {
      setTimeout(() => {
        onRetry();
      }, 200);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-rose-950 text-white p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0 text-rose-400 shadow-inner">
                <AlertOctagon className="w-6 h-6 animate-pulse" />
              </div>
              <div className="pr-6">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-400/30 text-rose-300 text-[11px] font-bold uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Transaction Stopped</span>
                </div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Insufficient Wallet Balance
                </h2>
                <p className="text-xs text-rose-200/90 mt-0.5">
                  अपर्याप्त शेष • Settlement halted to prevent unpaid liability
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-5">
            
            {/* Context Notice */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
              <div className="font-bold flex items-center space-x-1.5 text-rose-950">
                <span>Attempted Action:</span>
                <span className="font-mono px-2 py-0.5 rounded-md bg-white border border-rose-200 text-slate-800">
                  {transactionTitle || 'Trade Escrow Deposit'}
                </span>
              </div>
              <p className="text-rose-800 leading-relaxed text-[11px]">
                Under standard e-NAM and APMC clearing rules, agricultural trade deals require <strong>100% verified escrow funding</strong> before contracts can be locked or finalized. 
                Because available funds do not cover the clearing total, <strong>this transaction has been automatically aborted and no money has been deducted</strong>.
              </p>
            </div>

            {/* Financial Metrics Comparative Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Required Amount */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Required Amount</p>
                <p className="text-lg font-black text-slate-900 font-mono mt-0.5">
                  ₹{requiredAmount.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">100% Escrow + APMC Fee</p>
              </div>

              {/* Current Available Balance */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Available Balance</p>
                <p className="text-lg font-bold text-slate-700 font-mono mt-0.5">
                  ₹{currentBalance.toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {payerName ? `${payerName.split(' ')[0]}'s Wallet` : 'Current Wallet'}
                </p>
              </div>

              {/* Shortfall Deficit */}
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-center">
                <p className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Deficit Shortfall</p>
                <p className="text-lg font-black text-rose-600 font-mono mt-0.5">
                  -₹{actualShortfall.toLocaleString('en-IN')}
                </p>
                <span className="inline-block px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-rose-200 text-rose-800 mt-0.5">
                  Top-Up Needed
                </span>
              </div>
            </div>

            {/* Detailed Ledger Breakdown */}
            <div className="bg-slate-50/70 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600">
                <span>Designated Payer:</span>
                <span className="font-semibold text-slate-900">
                  {payerName || currentUser?.name} ({payerRole ? payerRole.toUpperCase() : 'BUYER'})
                </span>
              </div>
              {crop && quantityQuintals && (
                <div className="flex justify-between text-slate-600">
                  <span>Commodity Lot:</span>
                  <span className="font-semibold text-slate-900">
                    {quantityQuintals} Quintals • {crop}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Minimum Deposit to Resume:</span>
                <span className="font-bold font-mono text-emerald-700">
                  ₹{actualShortfall.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* If Top-Up Was Completed in this modal */}
            {topUpSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <p className="font-bold text-sm">
                    Wallet Funded! New Balance: ₹{(newWalletBalance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <p className="text-xs text-emerald-800">
                  You now have sufficient funds to complete the escrow lock. Click the button below to resume the transaction.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={handleExecuteRetry}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Proceed with Transaction Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-white border border-emerald-300 text-emerald-800 font-semibold text-xs hover:bg-emerald-100/50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : isCurrentPayer ? (
              /* Quick Top-Up Engine for Active Payer */
              <div className="space-y-3 pt-1 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <Wallet className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Instant Wallet Top-Up</span>
                  </label>
                  <span className="text-[11px] text-slate-500">Fast e-NAM Clearing</span>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTopUpAmount(actualShortfall)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      topUpAmount === actualShortfall
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                    }`}
                  >
                    Exact Shortfall (₹{actualShortfall.toLocaleString('en-IN')})
                  </button>

                  {[50000, 100000, 200000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                        topUpAmount === amt
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      +₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>

                {/* Custom Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={topUpAmount || ''}
                    onChange={(e) => setTopUpAmount(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="Enter deposit amount"
                    min={1}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Payment Gateway Options */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-[10px] block leading-tight">UPI Instant</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('enam_rtgs')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'enam_rtgs'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <span className="text-[10px] block leading-tight">e-NAM RTGS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      paymentMethod === 'netbanking'
                        ? 'border-emerald-600 bg-emerald-50/80 text-emerald-900 font-bold ring-1 ring-emerald-500'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    <span className="text-[10px] block leading-tight">Net Banking</span>
                  </button>
                </div>

                {/* Primary Action Button */}
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={handleTopUpAndResolve}
                    disabled={isProcessingTopUp || topUpAmount < actualShortfall}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    {isProcessingTopUp ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processing Deposit...</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-3.5 h-3.5" />
                        <span>Deposit ₹{topUpAmount.toLocaleString('en-IN')} to Wallet</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                {topUpAmount < actualShortfall && (
                  <p className="text-[11px] text-rose-600 font-medium text-center">
                    * Deposit amount must be at least ₹{actualShortfall.toLocaleString('en-IN')} to cover this transaction.
                  </p>
                )}
              </div>
            ) : (
              /* If Current User is Seller / Third Party trying to accept offer from an unfunded buyer */
              <div className="space-y-3 pt-1 border-t border-slate-200">
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                  <p className="font-bold flex items-center space-x-1">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Buyer Action Required</span>
                  </p>
                  <p className="text-amber-800 leading-relaxed text-[11px]">
                    The buyer <strong>{payerName || 'Shree Ganesh Agro Processing'}</strong> must add 
                    at least <strong>₹{actualShortfall.toLocaleString('en-IN')}</strong> to their wallet before this deal can be accepted into Escrow. 
                    This ensures you are guaranteed payment when your crop is delivered.
                  </p>
                </div>

                {/* Quick sandbox switch if buyer exists in availableUsers */}
                {(() => {
                  const targetBuyer = availableUsers.find(u => u.id === payerId || (payerRole === 'buyer' && u.role === 'buyer'));
                  if (!targetBuyer) return null;

                  return (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-bold text-slate-900">Sandbox Switch:</p>
                          <p className="text-[11px] text-slate-500">Switch to {targetBuyer.name} to fund their wallet</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSwitchToPayerAndTopUp(targetBuyer)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors"
                      >
                        Switch Role
                      </button>
                    </div>
                  );
                })()}

                <div className="flex items-center space-x-2 pt-2">
                  <button
                    onClick={() => {
                      addToast({
                        type: 'info',
                        title: 'SMS Payment Prompt Sent',
                        message: `Automated payment reminder sent to ${payerName || 'buyer'}'s registered phone for ₹${actualShortfall.toLocaleString('en-IN')}.`,
                      });
                      onClose();
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-sm flex items-center justify-center space-x-1.5 transition-colors"
                  >
                    <span>Send Top-Up Prompt to Buyer</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Footer Trust Indicator */}
            <div className="pt-2 flex items-center justify-center space-x-2 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>e-NAM Regulated Escrow Security • Zero Unauthorized Debits</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
