import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Lock, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Wallet, 
  ExternalLink 
} from 'lucide-react';

interface BalanceDeltaNotificationProps {
  onOpenPassbook?: () => void;
}

export const BalanceDeltaNotification: React.FC<BalanceDeltaNotificationProps> = ({ onOpenPassbook }) => {
  const { lastBalanceAlert, dismissBalanceAlert } = useApp();

  if (!lastBalanceAlert) return null;

  const isCredit = lastBalanceAlert.type === 'credit' || lastBalanceAlert.type === 'escrow_release' || lastBalanceAlert.type === 'payout';
  const isLock = lastBalanceAlert.type === 'escrow_lock';
  const isRefund = lastBalanceAlert.type === 'refund';

  return (
    <div 
      id="balance-change-notification-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full sm:w-[420px] bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl rounded-2xl p-4 text-white animate-in slide-in-from-bottom-5 duration-300 ring-1 ring-white/10"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
            isCredit 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : isLock 
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
              : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
          }`}>
            {isCredit ? (
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            ) : isLock ? (
              <Lock className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <RefreshCw className="w-4 h-4 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">
                {isCredit ? 'Wallet Credited' : isLock ? 'Escrow Locked (Debited)' : isRefund ? 'Escrow Refunded' : 'Balance Updated'}
              </h4>
              <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-full border ${
                isCredit 
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800' 
                  : isLock 
                  ? 'bg-amber-950 text-amber-300 border-amber-800' 
                  : 'bg-sky-950 text-sky-300 border-sky-800'
              }`}>
                {lastBalanceAlert.type.replace('_', ' ')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
              For {lastBalanceAlert.userName}
            </p>
          </div>
        </div>

        <button
          id="btn-dismiss-balance-alert"
          onClick={dismissBalanceAlert}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Amount & Running Balance Diff Box */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3 space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-400 font-medium">Transaction Amount:</span>
          <span className={`text-base font-black tracking-tight ${
            isCredit ? 'text-emerald-400' : isLock ? 'text-amber-400' : 'text-sky-400'
          }`}>
            {isCredit ? '+' : '-'}₹{Math.abs(lastBalanceAlert.amount).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">Previous</span>
            <span className="font-mono text-slate-300 font-semibold">₹{lastBalanceAlert.previousBalance.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center text-slate-600 px-2">
            ➔
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase text-slate-500 font-semibold block">New Balance</span>
            <span className="font-mono text-emerald-300 font-bold text-sm">₹{lastBalanceAlert.newBalance.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 line-clamp-2 mb-3 leading-relaxed">
        {lastBalanceAlert.description}
      </p>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <span className="text-[10px] text-slate-500">
          Double-entry audited • {new Date(lastBalanceAlert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>

        {onOpenPassbook && (
          <button
            id="btn-view-passbook-from-alert"
            onClick={() => {
              onOpenPassbook();
              dismissBalanceAlert();
            }}
            className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-800/50 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>View Passbook</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
