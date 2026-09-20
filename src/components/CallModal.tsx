import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Volume2, User, Check, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CallModal: React.FC = () => {
  const { callModal, closeCallModal, addToast } = useApp();
  const [callState, setCallState] = useState<'connecting' | 'connected' | 'ended'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!callModal.isOpen) {
      setCallState('connecting');
      setSeconds(0);
      return;
    }

    const connectTimer = setTimeout(() => {
      setCallState('connected');
    }, 2200);

    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      clearInterval(interval);
    };
  }, [callModal.isOpen]);

  if (!callModal.isOpen) return null;

  const handleEndCall = () => {
    setCallState('ended');
    setTimeout(() => {
      closeCallModal();
      addToast({
        type: 'info',
        title: 'Call Ended',
        message: `Call with ${callModal.targetName} concluded (${Math.floor(seconds / 60)}m ${seconds % 60}s).`,
      });
    }, 600);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full shadow-2xl border border-slate-700 overflow-hidden flex flex-col items-center p-8 relative">
        
        {/* Top security tag */}
        <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-[11px] font-semibold mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fasal Flow Secure Calling</span>
        </div>

        {/* Contact Avatar */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 p-1 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-3xl font-extrabold text-white">
              {callModal.targetName.charAt(0)}
            </div>
          </div>
          {callState === 'connected' && (
            <span className="absolute bottom-0 right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping"></span>
          )}
        </div>

        {/* Name & details */}
        <h3 className="text-xl font-bold text-center text-white mb-1">{callModal.targetName}</h3>
        <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">
          {callModal.targetRole} • {callModal.targetPhone}
        </p>

        {callModal.lotCrop && (
          <p className="text-xs text-emerald-300 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-800 mb-4">
            Discussing: {callModal.lotCrop} {callModal.lotGrade ? `(${callModal.lotGrade})` : ''}
          </p>
        )}

        {/* Status / Timer */}
        <div className="text-sm font-semibold mb-8 text-slate-300">
          {callState === 'connecting' && <span className="animate-pulse text-amber-300">Connecting Secure Line...</span>}
          {callState === 'connected' && <span className="text-emerald-400 font-mono text-base">{formatTime(seconds)}</span>}
          {callState === 'ended' && <span className="text-red-400">Call Disconnected</span>}
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-colors ${
              isMuted ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button
            onClick={handleEndCall}
            className="p-5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform"
          >
            <PhoneOff className="w-7 h-7" />
          </button>

          <button
            onClick={() => {}}
            className="p-4 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200"
          >
            <Volume2 className="w-6 h-6" />
          </button>

        </div>

      </div>
    </div>
  );
};
