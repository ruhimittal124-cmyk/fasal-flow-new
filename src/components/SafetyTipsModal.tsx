import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  AlertTriangle, 
  CreditCard, 
  Flag, 
  CheckCircle2, 
  X 
} from 'lucide-react';

interface SafetyTipsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
}

export const SafetyTipsModal: React.FC<SafetyTipsModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="safety-tips-modal"
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FasalFlow Buyer & Seller Safety</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Trading Safety Guidelines
          </h2>

          <p className="text-xs text-emerald-100/80 mt-1">
            Essential principles to keep every farmer, trader, and consignment secure.
          </p>
        </div>

        {/* Safety Tips List */}
        <div className="p-6 space-y-4">
          <div className="flex items-start space-x-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950">Don't Share Personal Credentials</h4>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Never share UPI PINs, bank passwords, or one-time SMS verification codes in chat. FasalFlow admins will never ask for your PIN.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-950">Verify Before Payment & Use Escrow</h4>
              <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                Always trade via verified Escrow smart contracts. Do not accept off-platform side-deals or unverified cash promises without Mandi receipts.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 bg-rose-50/80 border border-rose-200 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <Flag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-950">Report Suspicious or Abusive Users</h4>
              <p className="text-[11px] text-rose-800/90 mt-0.5 leading-relaxed">
                Use the top-right <strong className="text-rose-700 font-bold">Report (🚩)</strong> and <strong className="text-slate-700 font-bold">Block (🚫)</strong> buttons if anyone sends threats, deceptive offers, or abusive language.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              id="acknowledge-safety-tips-btn"
              type="button"
              onClick={onAcknowledge}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer hover:shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Understand & Agree</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
