import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCw, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  CheckCircle2, 
  Lock, 
  Unlock, 
  Sparkles, 
  PlusCircle, 
  Building2, 
  Scale, 
  ShieldCheck, 
  TrendingUp, 
  Coins,
  Clock 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BalanceChangeRecord } from '../types';

interface BalanceLedgerPassbookProps {
  onSelectTransaction?: (txnId: string) => void;
}

export const BalanceLedgerPassbook: React.FC<BalanceLedgerPassbookProps> = ({ onSelectTransaction }) => {
  const { 
    currentUser, 
    balanceChanges, 
    fetchBalanceChanges, 
    topUpWallet, 
    simulateTrade, 
    addToast 
  } = useApp();

  const [loading, setLoading] = useState(false);
  const [filterScope, setFilterScope] = useState<'my' | 'all'>('my');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('50000');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    fetchBalanceChanges();
  }, [fetchBalanceChanges]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchBalanceChanges();
    setLoading(false);
  };

  const handleQuickTopUp = async (amount: number) => {
    await topUpWallet(amount);
    setTopUpModalOpen(false);
  };

  const handleSimulateTradeDeal = async () => {
    setIsSimulating(true);
    try {
      await simulateTrade({
        crop: 'Organic Soybean',
        quantityQuintals: 65,
        pricePerQuintal: 4850,
        autoRelease: false,
      });
    } finally {
      setIsSimulating(false);
    }
  };

  // Filter balance records
  const filteredRecords = balanceChanges.filter((record) => {
    const recordAmount = record.amount ?? (record as any).change ?? 0;
    // Scope filter
    if (filterScope === 'my' && currentUser && record.userId !== currentUser.id) {
      return false;
    }

    // Type filter
    if (filterType === 'credits') {
      if (recordAmount <= 0) return false;
    } else if (filterType === 'debits') {
      if (recordAmount >= 0) return false;
    } else if (filterType === 'escrow') {
      if (record.type !== 'escrow_lock' && record.type !== 'escrow_release') {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = record.userName.toLowerCase().includes(q);
      const matchDesc = record.description.toLowerCase().includes(q);
      const matchTxn = record.transactionId?.toLowerCase().includes(q);
      const matchType = record.type.toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchTxn && !matchType) return false;
    }

    return true;
  });

  // Analytics for user
  const myRecords = balanceChanges.filter((r) => currentUser && r.userId === currentUser.id);
  const totalInflow = myRecords
    .map(r => r.amount ?? (r as any).change ?? 0)
    .filter(amt => amt > 0)
    .reduce((acc, amt) => acc + amt, 0);
  const totalOutflow = myRecords
    .map(r => r.amount ?? (r as any).change ?? 0)
    .filter(amt => amt < 0)
    .reduce((acc, amt) => acc + Math.abs(amt), 0);

  const exportCSV = () => {
    const headers = ['Timestamp', 'Record ID', 'User', 'Role', 'Type', 'Description', 'Previous Balance', 'Change', 'New Balance', 'Transaction ID'];
    const rows = filteredRecords.map((r) => {
      const rAmount = r.amount ?? (r as any).change ?? 0;
      const rTime = r.createdAt ?? (r as any).timestamp ?? new Date().toISOString();
      return [
        new Date(rTime).toLocaleString('en-IN'),
        r.id,
        r.userName,
        r.userRole,
        r.type,
        `"${r.description.replace(/"/g, '""')}"`,
        r.previousBalance,
        rAmount,
        r.newBalance,
        r.transactionId || '',
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FasalFlow_Passbook_Statement_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast({
      type: 'success',
      title: 'Passbook CSV Exported',
      message: `${filteredRecords.length} balance entries exported successfully.`,
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Wallet Summary Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl relative overflow-hidden">
        {/* Background glow decorative */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    {currentUser?.name}'s Mandi Passbook
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    {currentUser?.role || 'Verified User'}
                  </span>
                </div>
                <p className="text-xs text-emerald-200/70">
                  Double-entry digital ledger • Real-time audit trail of all trade debits, credits, and escrow releases
                </p>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-[11px] text-emerald-300 font-semibold uppercase tracking-wider block">
                  Available Wallet Balance
                </span>
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight font-mono">
                  ₹{(currentUser?.walletBalance || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="border-l border-emerald-800/60 pl-4 space-y-0.5">
                <div className="text-[11px] text-slate-300">
                  Total Credited Inflows: <strong className="text-emerald-400 font-mono">+₹{totalInflow.toLocaleString('en-IN')}</strong>
                </div>
                <div className="text-[11px] text-slate-300">
                  Total Settled Outflows: <strong className="text-rose-400 font-mono">-₹{totalOutflow.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Fast Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-top-up-wallet"
              onClick={() => setTopUpModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg hover:shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Instant Wallet Top-Up</span>
            </button>

            <button
              id="btn-simulate-trade-balance-change"
              onClick={handleSimulateTradeDeal}
              disabled={isSimulating}
              className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold text-xs border border-emerald-500/30 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95"
              title="Executes a test transaction to view instant balance changes and audit logs"
            >
              <Sparkles className={`w-4 h-4 text-emerald-400 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Processing Deal...' : 'Simulate Trade & Balance Delta'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          {/* Scope Selector: My Account vs Full Ledger */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-bold">
            <button
              id="btn-scope-my-passbook"
              onClick={() => setFilterScope('my')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterScope === 'my'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Balance Statements ({myRecords.length})
            </button>
            <button
              id="btn-scope-all-ledger"
              onClick={() => setFilterScope('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterScope === 'all'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Marketplace Audit Trail ({balanceChanges.length})
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              id="btn-export-passbook-csv"
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center space-x-1 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by transaction ID, user name, or crop memo..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {[
              { id: 'all', label: 'All' },
              { id: 'credits', label: 'Credits (+)' },
              { id: 'debits', label: 'Debits (-)' },
              { id: 'escrow', label: 'Escrow' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  filterType === tab.id
                    ? 'bg-emerald-800 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Passbook Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecords.length === 0 ? (
          <div className="py-16 text-center p-8 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">No balance change records match the filters</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Every time a deal is agreed, escrow is locked, or payment is released, a verified balance change entry will appear here.
            </p>
            <button
              onClick={handleSimulateTradeDeal}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 transition-colors inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate a Trade Deal Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Account / Party</th>
                  <th className="py-3.5 px-4">Event & Memo</th>
                  <th className="py-3.5 px-4 text-right">Previous Balance</th>
                  <th className="py-3.5 px-4 text-right">Balance Change</th>
                  <th className="py-3.5 px-4 text-right">New Balance</th>
                  <th className="py-3.5 px-4 text-center">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredRecords.map((record) => {
                  const recordAmount = record.amount ?? (record as any).change ?? 0;
                  const recordTime = record.createdAt ?? (record as any).timestamp ?? new Date().toISOString();
                  const isCredit = recordAmount > 0;
                  const isLock = record.type === 'escrow_lock';
                  const isRelease = record.type === 'escrow_release';
                  const isMe = currentUser?.id === record.userId;

                  return (
                    <tr 
                      key={record.id}
                      className={`hover:bg-slate-50/90 transition-colors ${
                        isMe ? 'bg-emerald-50/30' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                        <div>{new Date(recordTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div className="text-[10px] text-slate-400">{new Date(recordTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>

                      {/* User / Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-1.5">
                          <span className={`font-bold ${isMe ? 'text-emerald-900' : 'text-slate-800'}`}>
                            {record.userName}
                          </span>
                          {isMe && (
                            <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">{record.userRole}</span>
                      </td>

                      {/* Description & Transaction Link */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="text-slate-800 font-medium leading-snug line-clamp-2">
                          {record.description}
                        </p>
                        {record.transactionId && (
                          <div className="flex items-center space-x-1.5 mt-1">
                            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                              Ref: {record.transactionId}
                            </span>
                            {onSelectTransaction && (
                              <button
                                onClick={() => onSelectTransaction(record.transactionId!)}
                                className="text-[10px] text-slate-500 hover:text-emerald-700 underline"
                              >
                                View Deal
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Previous Balance */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-500 text-xs">
                        ₹{record.previousBalance.toLocaleString('en-IN')}
                      </td>

                      {/* Balance Change (Delta) */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className={`inline-flex items-center space-x-1 font-black font-mono text-sm px-2 py-0.5 rounded-lg ${
                          isCredit 
                            ? 'bg-emerald-100/80 text-emerald-800' 
                            : 'bg-rose-100/80 text-rose-800'
                        }`}>
                          {isCredit ? (
                            <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 stroke-[3]" />
                          )}
                          <span>
                            {isCredit ? '+' : '-'}₹{Math.abs(recordAmount).toLocaleString('en-IN')}
                          </span>
                        </div>
                      </td>

                      {/* New Running Balance */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-xs">
                        ₹{record.newBalance.toLocaleString('en-IN')}
                      </td>

                      {/* Audit Status */}
                      <td className="py-3.5 px-4 text-center">
                        {record.paymentStatus === 'in_progress' || record.description.toLowerCase().includes('in progress') ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            <span>In Progress</span>
                          </span>
                        ) : (
                          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isLock
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : isRelease || isCredit
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Audited</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top-up Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Instant Wallet Top-Up</h3>
                  <p className="text-xs text-slate-500">Fund your account to place escrow deposits</p>
                </div>
              </div>
              <button 
                onClick={() => setTopUpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Select Amount (INR)
              </label>

              <div className="grid grid-cols-3 gap-2">
                {['10000', '50000', '200000'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold font-mono transition-colors border ${
                      topUpAmount === amt
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    ₹{parseInt(amt).toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div className="relative mt-2">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500 text-sm">₹</span>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Enter custom amount"
                  className="w-full pl-8 pr-3 py-2.5 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between">
                <span>Current Balance:</span>
                <span className="font-mono font-bold text-slate-800">₹{(currentUser?.walletBalance || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>After Credit:</span>
                <span className="font-mono font-bold text-emerald-700">
                  ₹{((currentUser?.walletBalance || 0) + (parseInt(topUpAmount) || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setTopUpModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleQuickTopUp(parseInt(topUpAmount) || 10000)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                Proceed with UPI
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
