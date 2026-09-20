import React from 'react';
import { Ban, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface BlockConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBlock: () => void;
  targetUser: {
    id: string;
    name: string;
    role?: string;
  };
}

export const BlockConfirmationModal: React.FC<BlockConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmBlock,
  targetUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div 
        id="block-confirmation-modal"
        className="bg-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <Ban className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Block {targetUser.name}?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
              Block this user? You won't receive messages from them anymore, and they will not be able to send you offers or messages.
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-medium text-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>What happens next:</span>
            </div>
            <p className="text-[11px] text-slate-500">• Future incoming messages will be blocked.</p>
            <p className="text-[11px] text-slate-500">• You can unblock this user anytime from Profile Settings.</p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="confirm-block-user-btn"
              type="button"
              onClick={() => {
                onConfirmBlock();
                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Block User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
