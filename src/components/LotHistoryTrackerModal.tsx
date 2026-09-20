import React, { useState, useEffect } from 'react';
import { 
  History, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Truck, 
  ArrowRight, 
  FileText, 
  X, 
  Coins, 
  Scale, 
  Receipt, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  Tag, 
  UserCheck,
  Building,
  Check,
  Send,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { fetchLotHistoryApi, addLotEventApi } from '../services/api';
import { LotWithHistory, LotTransactionEvent, LotEventType, UserRole } from '../types';

interface LotHistoryTrackerModalProps {
  lotId: string | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: UserRole | 'system';
  currentUserId?: string;
  currentUserName?: string;
  onEventAdded?: () => void;
}

export const LotHistoryTrackerModal: React.FC<LotHistoryTrackerModalProps> = ({
  lotId,
  isOpen,
  onClose,
  currentUserRole = 'farmer',
  currentUserId = 'user-farmer-1',
  currentUserName = 'Ramesh Patil',
  onEventAdded,
}) => {
  const [historyData, setHistoryData] = useState<LotWithHistory | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'transactions' | 'offers' | 'add_event'>('timeline');
  const [filterEventType, setFilterEventType] = useState<string>('all');

  // Form state for adding custom event
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventDesc, setNewEventDesc] = useState<string>('');
  const [newEventType, setNewEventType] = useState<LotEventType>('quality_verified');
  const [submittingEvent, setSubmittingEvent] = useState<boolean>(false);
  const [eventSuccessMsg, setEventSuccessMsg] = useState<string | null>(null);

  const loadHistory = async () => {
    if (!lotId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchLotHistoryApi(lotId);
      setHistoryData(data);
    } catch (err: any) {
      console.error('Failed to load lot history:', err);
      setError(err.message || 'Failed to load lot transaction history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && lotId) {
      loadHistory();
      setActiveTab('timeline');
      setEventSuccessMsg(null);
    }
  }, [isOpen, lotId]);

  if (!isOpen || !lotId) return null;

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lotId || !newEventTitle || !newEventDesc) return;
    try {
      setSubmittingEvent(true);
      await addLotEventApi(lotId, {
        title: newEventTitle,
        description: newEventDesc,
        eventType: newEventType,
        actorId: currentUserId,
        actorName: currentUserName,
        actorRole: (currentUserRole || 'farmer') as (UserRole | 'system'),
      });
      setNewEventTitle('');
      setNewEventDesc('');
      setEventSuccessMsg('Milestone recorded in backend audit history successfully!');
      setTimeout(() => setEventSuccessMsg(null), 4000);
      await loadHistory();
      if (onEventAdded) onEventAdded();
      setActiveTab('timeline');
    } catch (err: any) {
      setError('Failed to add event: ' + err.message);
    } finally {
      setSubmittingEvent(false);
    }
  };

  const getEventBadge = (type: LotEventType) => {
    switch (type) {
      case 'lot_created':
        return { bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Tag, label: 'Lot Listed' };
      case 'offer_received':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Coins, label: 'Bid Placed' };
      case 'offer_accepted':
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2, label: 'Deal Accepted' };
      case 'offer_countered':
        return { bg: 'bg-sky-100 text-sky-800 border-sky-200', icon: SlidersHorizontal, label: 'Counter-Offer' };
      case 'offer_rejected':
        return { bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: X, label: 'Offer Declined' };
      case 'escrow_locked':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200', icon: Lock, label: '100% Escrow Vault' };
      case 'transport_assigned':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Truck, label: 'Transport Reserved' };
      case 'dispatched_in_transit':
        return { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200', icon: Truck, label: 'In Transit' };
      case 'quality_verified':
        return { bg: 'bg-teal-100 text-teal-800 border-teal-200', icon: Scale, label: 'Quality Sign-Off' };
      case 'escrow_released':
        return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Receipt, label: 'Settlement Released' };
      case 'escrow_refunded':
        return { bg: 'bg-amber-100 text-amber-900 border-amber-300', icon: Coins, label: 'Escrow Refunded' };
      default:
        return { bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: FileText, label: 'Audit Milestone' };
    }
  };

  const filteredEvents = historyData?.events?.filter(e => {
    if (filterEventType === 'all') return true;
    return e.eventType === filterEventType;
  }) || [];

  const lifecycleStages = [
    { key: 'listed', label: '1. Listed' },
    { key: 'negotiating', label: '2. Bidding' },
    { key: 'escrow_locked', label: '3. Escrow Locked' },
    { key: 'in_transit', label: '4. Transit' },
    { key: 'settled', label: '5. Settled' },
  ];

  const currentStep = historyData?.summary.currentLifecycleStep || 'listed';
  const getStageIndex = (stage: string) => {
    switch (stage) {
      case 'listed': return 0;
      case 'negotiating': return 1;
      case 'escrow_locked': return 2;
      case 'in_transit': return 3;
      case 'settled': return 4;
      case 'refunded': return 2;
      default: return 0;
    }
  };
  const activeStageIdx = getStageIndex(currentStep);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div 
        id="lot-history-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base sm:text-lg font-bold">Lot Transaction Data History</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-700">
                  Backend Audited
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {historyData ? `${historyData.crop} (${historyData.variety}) • ID: ${historyData.id}` : 'Loading historical trace...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadHistory}
              disabled={loading}
              title="Refresh from Database"
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading / Error States */}
        {loading && !historyData && (
          <div className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
            <p className="text-sm font-semibold text-slate-600">Retrieving complete transaction & audit history from server...</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {historyData && (
          <>
            {/* Summary Banner */}
            <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-4">
              {/* Lifecycle Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                  <span className="text-slate-500 uppercase tracking-wider text-[11px]">Transaction Lifecycle Progress</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold capitalize ${
                    historyData.summary.isFullySettled
                      ? 'bg-emerald-100 text-emerald-800'
                      : historyData.summary.currentLifecycleStep === 'escrow_locked'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    Current: {historyData.summary.currentLifecycleStep.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {lifecycleStages.map((stage, idx) => {
                    const isPassed = idx <= activeStageIdx;
                    const isCurrent = idx === activeStageIdx;
                    return (
                      <div key={stage.key} className="space-y-1">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            isPassed ? 'bg-emerald-600' : 'bg-slate-200'
                          } ${isCurrent ? 'ring-2 ring-emerald-400 ring-offset-1' : ''}`}
                        />
                        <p className={`text-[10px] font-bold text-center truncate ${
                          isPassed ? 'text-slate-900' : 'text-slate-400'
                        }`}>
                          {stage.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Lot Quantity & Asking</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {historyData.quantityQuintals} q @ ₹{historyData.askingPricePerQuintal.toLocaleString('en-IN')}/q
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Total: ₹{historyData.baseTotal.toLocaleString('en-IN')}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Escrow Locked</p>
                  <p className="text-sm font-black text-purple-700 mt-0.5">
                    ₹{historyData.summary.totalEscrowLocked.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-purple-600 mt-0.5">e-NAM Vault Guarantee</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Net Farmer Payout</p>
                  <p className="text-sm font-black text-emerald-700 mt-0.5">
                    ₹{historyData.summary.totalPayoutReleased.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">
                    {historyData.summary.isFullySettled ? 'Credited to Wallet' : 'Pending Verification'}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200">
                  <p className="text-[11px] font-semibold text-slate-500">Marketplace Bids</p>
                  <p className="text-sm font-black text-slate-900 mt-0.5">
                    {historyData.summary.totalOffersReceived} Offers
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    High: {historyData.summary.highestBidPrice ? `₹${historyData.summary.highestBidPrice.toLocaleString('en-IN')}/q` : 'None'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="px-5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex space-x-1 sm:space-x-4">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'timeline'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Audit Timeline ({historyData.events.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('transactions')}
                  className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'transactions'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Escrow Deals ({historyData.transactions.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('offers')}
                  className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'offers'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Bids & Offers ({historyData.offers.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('add_event')}
                  className={`py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center space-x-1.5 transition-colors ${
                    activeTab === 'add_event'
                      ? 'border-emerald-600 text-emerald-700'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Event</span>
                </button>
              </div>

              {activeTab === 'timeline' && (
                <div className="hidden sm:flex items-center space-x-2 py-2">
                  <span className="text-[11px] text-slate-400 font-semibold">Filter:</span>
                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-semibold text-slate-700"
                  >
                    <option value="all">All Events</option>
                    <option value="lot_created">Lot Published</option>
                    <option value="offer_received">Bids Received</option>
                    <option value="offer_accepted">Deals Accepted</option>
                    <option value="escrow_locked">Escrow Locked</option>
                    <option value="transport_assigned">Transport Reserved</option>
                    <option value="dispatched_in_transit">In Transit</option>
                    <option value="quality_verified">Quality Sign-Off</option>
                    <option value="escrow_released">Settlement Released</option>
                  </select>
                </div>
              )}
            </div>

            {/* Tab Body */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50">
              
              {/* TAB 1: TIMELINE */}
              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                      No events matching selected filter.
                    </div>
                  ) : (
                    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                      {filteredEvents.map((evt, idx) => {
                        const badge = getEventBadge(evt.eventType);
                        const BadgeIcon = badge.icon;
                        const eventDate = new Date(evt.timestamp);

                        return (
                          <div key={evt.id || idx} className="relative group">
                            {/* Dot Icon on line */}
                            <div className={`absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full border-2 border-white shadow-xs flex items-center justify-center ${badge.bg}`}>
                              <BadgeIcon className="w-3 h-3" />
                            </div>

                            {/* Event Card */}
                            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:border-slate-300 transition-all space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{evt.title}</h4>
                                </div>

                                <span className="text-[11px] text-slate-400 flex items-center space-x-1 font-mono">
                                  <Clock className="w-3 h-3" />
                                  <span>{eventDate.toLocaleDateString()} {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 leading-relaxed">
                                {evt.description}
                              </p>

                              {/* Actor & Counterparty Details */}
                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                                {evt.actorName && (
                                  <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                                    <UserCheck className="w-3 h-3 text-slate-500" />
                                    <span>By: {evt.actorName} ({evt.actorRole})</span>
                                  </span>
                                )}

                                {evt.counterpartyName && (
                                  <span className="inline-flex items-center space-x-1 bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-700">
                                    <ArrowRight className="w-3 h-3 text-slate-400" />
                                    <span>Party: {evt.counterpartyName}</span>
                                  </span>
                                )}

                                {evt.amount && (
                                  <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold border border-emerald-200">
                                    <Coins className="w-3 h-3" />
                                    <span>₹{evt.amount.toLocaleString('en-IN')}</span>
                                  </span>
                                )}

                                {evt.metadata?.invoiceNumber && (
                                  <span className="inline-flex items-center space-x-1 bg-purple-50 text-purple-800 px-2 py-0.5 rounded font-mono font-semibold border border-purple-200">
                                    <FileText className="w-3 h-3" />
                                    <span>{evt.metadata.invoiceNumber}</span>
                                  </span>
                                )}
                              </div>

                              {evt.balanceImpactSummary && (
                                <div className="p-2 rounded bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 font-medium">
                                  <strong>Balance Ledger Impact:</strong> {evt.balanceImpactSummary}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: LINKED ESCROW TRANSACTIONS */}
              {activeTab === 'transactions' && (
                <div className="space-y-4">
                  {historyData.transactions.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                      No escrow contracts or financial transactions locked for this lot yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyData.transactions.map((txn) => (
                        <div key={txn.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-bold text-slate-900">{txn.id}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  txn.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : txn.status === 'escrow_locked'
                                    ? 'bg-purple-100 text-purple-800'
                                    : txn.status === 'refunded'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {txn.status.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Invoice: <span className="font-mono font-semibold text-slate-700">{txn.invoiceNumber}</span> • {new Date(txn.createdAt).toLocaleDateString()}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-slate-400">Total Transaction Amount</p>
                              <p className="text-base font-black text-slate-900">₹{txn.amount.toLocaleString('en-IN')}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            <div className="p-2.5 bg-slate-50 rounded-lg">
                              <p className="text-[11px] text-slate-500 font-medium">Buyer (Locked in Escrow)</p>
                              <p className="font-bold text-slate-900">{txn.buyerName}</p>
                              <p className="text-[10px] text-purple-700 font-semibold mt-0.5">
                                Debited: ₹{txn.buyerTotal.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-lg">
                              <p className="text-[11px] text-slate-500 font-medium">Farmer / Seller (Guaranteed)</p>
                              <p className="font-bold text-slate-900">{txn.sellerName}</p>
                              <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">
                                Net Payout: ₹{txn.farmerPayout.toLocaleString('en-IN')}
                              </p>
                            </div>

                            <div className="p-2.5 bg-slate-50 rounded-lg">
                              <p className="text-[11px] text-slate-500 font-medium">Payment Channel</p>
                              <p className="font-bold text-slate-900">{txn.paymentMethod}</p>
                              <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">{txn.paymentRef}</p>
                            </div>
                          </div>

                          {txn.notes && (
                            <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2 rounded">
                              "{txn.notes}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: LINKED OFFERS & BIDS */}
              {activeTab === 'offers' && (
                <div className="space-y-4">
                  {historyData.offers.length === 0 ? (
                    <div className="text-center py-10 bg-white rounded-xl border border-slate-200 text-slate-400 text-xs">
                      No bids received yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historyData.offers.map((offer) => (
                        <div key={offer.id} className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">{offer.buyerName}</span>
                              <span className="text-slate-400">({offer.buyerDistrict})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                offer.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : offer.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800'
                                  : offer.status === 'countered'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {offer.status}
                              </span>
                            </div>

                            <p className="text-slate-600 mt-1">
                              Offer Price: <strong className="text-emerald-700 font-black">₹{offer.offeredPricePerQuintal}/q</strong> for {offer.quantityQuintals} q (₹{offer.totalAmount.toLocaleString('en-IN')})
                            </p>

                            {offer.notes && <p className="text-slate-500 italic text-[11px] mt-0.5">"{offer.notes}"</p>}
                          </div>

                          <span className="text-[11px] text-slate-400 font-mono self-end sm:self-auto">
                            {new Date(offer.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: ADD AUDIT / VERIFICATION EVENT */}
              {activeTab === 'add_event' && (
                <form onSubmit={handleAddEvent} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Record Backend Lifecycle Milestone</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Append quality check notes, assayer certificates, weighbridge receipts, or dispute settlements to this lot's permanent ledger.
                    </p>
                  </div>

                  {eventSuccessMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center space-x-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{eventSuccessMsg}</span>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Milestone Type</label>
                      <select
                        value={newEventType}
                        onChange={(e) => setNewEventType(e.target.value as LotEventType)}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-800"
                      >
                        <option value="quality_verified">Quality & Moisture Verified (Assayer Sign-Off)</option>
                        <option value="dispatched_in_transit">Logistics Gate Pass / Dispatched</option>
                        <option value="custom_note">General Operational Audit Note</option>
                        <option value="price_revised">Price / Quantity Revision</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Milestone Title</label>
                      <input
                        type="text"
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        placeholder="e.g. Weighbridge Gate Pass Verified (65.2q net)"
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Detailed Description & Audit Reference</label>
                      <textarea
                        rows={3}
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        placeholder="Enter moisture readings, weighbridge ticket number, dock inspector name, or terms agreed..."
                        required
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('timeline')}
                      className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={submittingEvent || !newEventTitle || !newEventDesc}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-xs flex items-center space-x-1.5"
                    >
                      {submittingEvent ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Database...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Save Event to History</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>

            {/* Footer Bar */}
            <div className="p-4 bg-white border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>All transactions and events are permanently logged in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">fasalflow_db.json</code></span>
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold self-end sm:self-auto"
              >
                Close Audit View
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
