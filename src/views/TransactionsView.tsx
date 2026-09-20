import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ReceiptText, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  Building2, 
  User, 
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Printer,
  Sparkles,
  Lock,
  Unlock,
  CreditCard,
  Banknote,
  Calculator,
  Scale,
  Wallet,
  RotateCcw,
  History
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { fetchTransactionsApi } from '../services/api';
import { TransactionRecord, TransactionStatus, TransactionType } from '../types';
import { printTradeReceipt } from '../utils/printReceipt';
import { PoolSettlementEngine } from '../components/PoolSettlementEngine';
import { BalanceLedgerPassbook } from '../components/BalanceLedgerPassbook';
import { LotHistoryTrackerModal } from '../components/LotHistoryTrackerModal';
import { FormalitiesPaymentProgressModal } from '../components/FormalitiesPaymentProgressModal';
import { FileCheck2 } from 'lucide-react';

interface TransactionsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { currentUser, addToast, updateTransactionStatus } = useApp();
  const [activeSection, setActiveSection] = useState<'passbook' | 'deals' | 'pool_settlement'>('passbook');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeInvoice, setActiveInvoice] = useState<TransactionRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedLotForHistory, setSelectedLotForHistory] = useState<string | null>(null);
  const [selectedTxnForFormalities, setSelectedTxnForFormalities] = useState<TransactionRecord | null>(null);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactionsApi({
        userId: currentUser?.id,
        type: selectedType !== 'all' ? selectedType : undefined,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
      });
      setTransactions(data);
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [currentUser?.id, selectedType, selectedStatus]);

  const handleReleaseEscrow = async (txnId: string) => {
    setUpdatingId(txnId);
    try {
      const updated = await updateTransactionStatus(txnId, 'completed', 'Escrow payout released to seller bank account.');
      if (updated) {
        setTransactions(prev => prev.map(t => t.id === txnId ? updated : t));
        if (activeInvoice?.id === txnId) {
          setActiveInvoice(updated);
        }
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Payout Failed',
        message: err.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRefundEscrow = async (txnId: string) => {
    setUpdatingId(txnId);
    try {
      const updated = await updateTransactionStatus(txnId, 'refunded', '100% Escrow refunded back to buyer due to mutual cancellation.');
      if (updated) {
        setTransactions(prev => prev.map(t => t.id === txnId ? updated : t));
        if (activeInvoice?.id === txnId) {
          setActiveInvoice(updated);
        }
      }
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Refund Failed',
        message: err.message,
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // KPIs
  const totalVolumeTraded = transactions
    .filter(t => t.status === 'completed' || t.status === 'escrow_locked')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const activeEscrowAmount = transactions
    .filter(t => t.status === 'escrow_locked')
    .reduce((acc, t) => acc + (t.amount || 0), 0);

  const totalFeeSavings = transactions
    .filter(t => t.status === 'completed')
    .reduce((acc, t) => acc + (t.amount * 0.06), 0); // saved vs standard 8% middlemen arhat

  const completedCount = transactions.filter(t => t.status === 'completed').length;

  const filteredTransactions = transactions.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      t.id.toLowerCase().includes(q) ||
      t.invoiceNumber.toLowerCase().includes(q) ||
      (t.crop && t.crop.toLowerCase().includes(q)) ||
      t.sellerName.toLowerCase().includes(q) ||
      t.buyerName.toLowerCase().includes(q) ||
      t.paymentRef.toLowerCase().includes(q) ||
      (t.clearingBankRef && t.clearingBankRef.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedStatus === 'in_progress') {
      return t.paymentStatus === 'in_progress' || t.status === 'in_transit';
    }

    if (selectedStatus !== 'all') {
      return t.status === selectedStatus;
    }

    return true;
  });

  const getStatusBadge = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed & Settled</span>
          </span>
        );
      case 'escrow_locked':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center space-x-1">
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Escrow Locked (100% Safe)</span>
          </span>
        );
      case 'in_transit':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>In Haulage Transit</span>
          </span>
        );
      case 'refunded':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center space-x-1">
            <RotateCcw className="w-3 h-3" />
            <span>Escrow Refunded</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleSelectTxnFromPassbook = (txnId: string) => {
    const found = transactions.find(t => t.id === txnId);
    if (found) {
      setActiveInvoice(found);
    } else {
      setActiveSection('deals');
      setSearchQuery(txnId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ReceiptText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{t('transactions.title', 'Trade Settlements & Balance Passbook')}</h1>
              <p className="text-xs text-slate-500">
                {t('transactions.subtitle', 'Audited balance ledger, live transaction debits & credits, escrow releases, and transparent settlement formulas')}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            id="btn-refresh-transactions"
            onClick={loadTransactions}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Ledger</span>
          </button>
          <button
            onClick={() => setCurrentTab('aggregation')}
            className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition-all"
          >
            <span>FPO Pool Hub</span>
          </button>
          <button
            onClick={() => setCurrentTab('browse-lots')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all"
          >
            New Trade Deal
          </button>
        </div>
      </div>

      {/* Main Section Navigation Switcher */}
      <div className="flex items-center space-x-2 bg-slate-200/80 p-1.5 rounded-2xl border border-slate-300/80 max-w-2xl">
        <button
          id="tab-btn-passbook"
          onClick={() => setActiveSection('passbook')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeSection === 'passbook'
              ? 'bg-white text-emerald-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-600" />
          <span>Live Balance Passbook</span>
          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-extrabold">
            ₹{(currentUser?.walletBalance || 0).toLocaleString('en-IN')}
          </span>
        </button>

        <button
          id="tab-btn-deals"
          onClick={() => setActiveSection('deals')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeSection === 'deals'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ReceiptText className="w-4 h-4 text-emerald-600" />
          <span>Deals & Escrow Contracts ({transactions.length})</span>
        </button>

        <button
          id="tab-btn-pool-formula"
          onClick={() => setActiveSection('pool_settlement')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
            activeSection === 'pool_settlement'
              ? 'bg-white text-emerald-900 shadow-sm border border-emerald-300 font-extrabold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calculator className="w-4 h-4 text-emerald-600" />
          <span>Pool Settlement</span>
        </button>
      </div>

      {/* Conditional Rendering Based on Active Section */}
      {activeSection === 'pool_settlement' ? (
        <PoolSettlementEngine />
      ) : activeSection === 'passbook' ? (
        <BalanceLedgerPassbook onSelectTransaction={handleSelectTxnFromPassbook} />
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Volume Traded</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">₹{totalVolumeTraded.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">{completedCount} Completed Settlements</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Escrow Protection</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-blue-900">₹{activeEscrowAmount.toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-blue-600 font-semibold">100% Guaranteed Until Quality Verified</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Middleman Savings</span>
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-teal-900">₹{Math.round(totalFeeSavings).toLocaleString('en-IN')}</p>
              <p className="text-[11px] text-teal-600 font-semibold">Saved vs 8% traditional APMC cuts</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Flat Platform Fee</span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900">2% Flat</p>
              <p className="text-[11px] text-slate-500 font-medium">1% Seller + 1% Buyer • No hidden costs</p>
            </div>

          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search invoice number, crop, counterparty, or ref..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="all">All Transaction Types</option>
                <option value="trade_deal">Direct Harvest Trade Deals</option>
                <option value="transport_fare">Transport Haulage Fares</option>
                <option value="escrow_deposit">Escrow Deposits</option>
              </select>
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
              >
                <option value="all">All Settlement Statuses</option>
                <option value="in_progress">Payments In Progress (e-NAM RTGS)</option>
                <option value="completed">Completed & Payout Released</option>
                <option value="escrow_locked">Escrow Locked</option>
                <option value="in_transit">In Transit</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

          </div>

          {/* Transaction Table / List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
                <p className="text-sm font-semibold text-slate-600">Loading Transaction Ledger...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-16 text-center p-8 space-y-2">
                <ReceiptText className="w-10 h-10 mx-auto text-slate-300" />
                <p className="font-bold text-slate-800">No transactions found</p>
                <p className="text-xs text-slate-500">Your deal settlements and escrow receipts will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3.5 px-4">Transaction / Invoice</th>
                      <th className="py-3.5 px-4">Commodity / Details</th>
                      <th className="py-3.5 px-4">Counterparties</th>
                      <th className="py-3.5 px-4">Settlement & Payout</th>
                      <th className="py-3.5 px-4">Balance Impact (Audited)</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredTransactions.map((txn) => {
                      const isSeller = currentUser?.id === txn.sellerId;
                      const isBuyer = currentUser?.id === txn.buyerId;

                      return (
                        <tr key={txn.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-4">
                            <div className="font-bold text-slate-900 font-mono">{txn.id}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">{txn.invoiceNumber}</div>
                            <div className="text-[10px] text-slate-400 mt-1">{new Date(txn.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          </td>

                          <td className="py-4 px-4">
                            {txn.crop ? (
                              <div>
                                <span className="font-bold text-slate-900">{txn.crop}</span>
                                <p className="text-[11px] text-slate-500">{txn.quantityQuintals} Quintals @ ₹{txn.pricePerQuintal}/q</p>
                                {txn.pickupDistrict && (
                                  <p className="text-[10px] text-slate-400 mt-0.5">{txn.pickupDistrict} → {txn.dropDistrict}</p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="font-bold text-slate-800 capitalize">{txn.type.replace('_', ' ')}</span>
                                <p className="text-[11px] text-slate-500">{txn.notes}</p>
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Buyer:</span>
                                <span className="font-semibold text-slate-800">{txn.buyerName}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Seller:</span>
                                <span className="font-semibold text-slate-800">{txn.sellerName}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4">
                            <div className="font-black text-slate-900 text-sm">₹{txn.amount.toLocaleString('en-IN')}</div>
                            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
                              Farmer Net: ₹{txn.farmerPayout.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[9px] text-slate-400">
                              Fee: ₹{txn.platformFee.toLocaleString('en-IN')} (2%)
                            </div>
                          </td>

                          {/* Balance Impact Column */}
                          <td className="py-4 px-4">
                            {txn.balanceImpact ? (
                              <div className="space-y-1 bg-slate-50 p-2 rounded-xl border border-slate-200/80 text-[10px] font-mono">
                                {txn.balanceImpact.buyer && (
                                  <div className="flex items-center justify-between gap-1 text-rose-700 font-bold">
                                    <span>Buyer:</span>
                                    <span>-₹{Math.abs(txn.balanceImpact.buyer.change).toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {txn.balanceImpact.seller && (
                                  <div className="flex items-center justify-between gap-1 text-emerald-700 font-bold">
                                    <span>Seller:</span>
                                    <span>+₹{txn.balanceImpact.seller.change.toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">₹{txn.amount.toLocaleString('en-IN')} debited</span>
                            )}
                          </td>

                          <td className="py-4 px-4 space-y-1">
                            {getStatusBadge(txn.status)}
                            {(txn.paymentStatus === 'in_progress' || txn.status === 'in_transit') && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1 animate-pulse">
                                <Clock className="w-3 h-3 text-amber-700" />
                                <span>Payment In Progress</span>
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedTxnForFormalities(txn)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-xs inline-flex items-center space-x-1"
                              title="Verify trade formalities & check payment in progress clearing status"
                            >
                              <FileCheck2 className="w-3.5 h-3.5 text-amber-200" />
                              <span>Formalities & Progress</span>
                            </button>

                            {txn.status === 'escrow_locked' && (
                              <>
                                <button
                                  id={`btn-release-escrow-${txn.id}`}
                                  onClick={() => handleReleaseEscrow(txn.id)}
                                  disabled={updatingId === txn.id}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs inline-flex items-center space-x-1"
                                  title="Releases escrow payout and immediately credits seller wallet balance"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>{updatingId === txn.id ? 'Releasing...' : 'Release Payout'}</span>
                                </button>

                                <button
                                  id={`btn-refund-escrow-${txn.id}`}
                                  onClick={() => handleRefundEscrow(txn.id)}
                                  disabled={updatingId === txn.id}
                                  className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold text-[11px] border border-purple-200"
                                  title="Refund escrow back to buyer"
                                >
                                  Refund
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => printTradeReceipt(txn)}
                              className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200 inline-flex items-center space-x-1"
                              title="Instant Print Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>

                            {txn.lotId && (
                              <button
                                onClick={() => setSelectedLotForHistory(txn.lotId!)}
                                className="px-2 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-[11px] border border-blue-200 inline-flex items-center space-x-1"
                                title="View Lot Lifecycle & Audit Trail"
                              >
                                <History className="w-3.5 h-3.5" />
                                <span>Lot Trail</span>
                              </button>
                            )}

                            <button
                              onClick={() => setActiveInvoice(txn)}
                              className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] border border-slate-200"
                            >
                              Invoice
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Invoice / Settlement Receipt Modal */}
      {activeInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div id="printable-receipt-modal" className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Invoice Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl text-slate-900">Fasal<span className="text-emerald-600">Flow</span> Tax Invoice</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    e-NAM Mandi Compliant
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">Invoice Ref: <strong>{activeInvoice.invoiceNumber}</strong> • Txn ID: {activeInvoice.id}</p>
              </div>
              <button 
                onClick={() => setActiveInvoice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold no-print"
              >
                ✕
              </button>
            </div>

            {/* Parties Info */}
            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Seller / Consignor</span>
                <p className="font-bold text-slate-900 mt-1">{activeInvoice.sellerName}</p>
                <p className="text-slate-500">District: {activeInvoice.pickupDistrict || 'Osmanabad'}</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Buyer / Consignee</span>
                <p className="font-bold text-slate-900 mt-1">{activeInvoice.buyerName}</p>
                <p className="text-slate-500">District: {activeInvoice.dropDistrict || 'Latur'}</p>
              </div>
            </div>

            {/* Itemized Breakdown Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Qty (Qtl)</th>
                    <th className="p-3 text-right">Rate/Qtl</th>
                    <th className="p-3 text-right">Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  <tr>
                    <td className="p-3">
                      <strong>{activeInvoice.crop || 'Commodity Batch'}</strong> - Direct Farmgate Trade
                    </td>
                    <td className="p-3 text-right">{activeInvoice.quantityQuintals || '-'}</td>
                    <td className="p-3 text-right">₹{activeInvoice.pricePerQuintal?.toLocaleString('en-IN') || '-'}</td>
                    <td className="p-3 text-right font-bold">₹{activeInvoice.amount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50/50 text-[11px] text-slate-600">
                    <td colSpan={3} className="p-3">FasalFlow Transparent Platform Service Fee (2% Flat)</td>
                    <td className="p-3 text-right font-bold">₹{activeInvoice.platformFee.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-emerald-50 text-emerald-900 font-bold">
                    <td colSpan={3} className="p-3">Net Farmer Payout (Direct Bank Transfer)</td>
                    <td className="p-3 text-right font-black text-sm">₹{activeInvoice.farmerPayout.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Real-Time Balance Changes Audit Box */}
            {activeInvoice.balanceImpact && (
              <div className="p-4 bg-emerald-950/90 text-white rounded-xl border border-emerald-800 text-xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-slate-100">Double-Entry Balance Audit Recorded</span>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-800 text-emerald-300 font-bold">
                    Immutable Ledger
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  {activeInvoice.balanceImpact.buyer && (
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Buyer Impact ({activeInvoice.balanceImpact.buyer.userName})</span>
                      <div className="font-mono text-rose-400 font-bold text-sm mt-0.5">
                        -₹{Math.abs(activeInvoice.balanceImpact.buyer.change).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        ₹{activeInvoice.balanceImpact.buyer.previousBalance.toLocaleString('en-IN')} ➔ ₹{activeInvoice.balanceImpact.buyer.newBalance.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {activeInvoice.balanceImpact.seller && (
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Seller Impact ({activeInvoice.balanceImpact.seller.userName})</span>
                      <div className="font-mono text-emerald-400 font-bold text-sm mt-0.5">
                        +₹{activeInvoice.balanceImpact.seller.change.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        ₹{activeInvoice.balanceImpact.seller.previousBalance.toLocaleString('en-IN')} ➔ ₹{activeInvoice.balanceImpact.seller.newBalance.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Escrow & Payment Details */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Channel</span>
                <strong className="text-slate-800">{activeInvoice.paymentMethod}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank / UPI Reference</span>
                <strong className="text-slate-800 font-mono">{activeInvoice.paymentRef}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Settlement Status</span>
                <div>{getStatusBadge(activeInvoice.status)}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 no-print">
              <div className="text-[11px] text-slate-400">
                Official e-NAM & APMC Tax Invoice Clearing
              </div>
              <div className="flex items-center space-x-2">
                {activeInvoice.lotId && (
                  <button
                    onClick={() => setSelectedLotForHistory(activeInvoice.lotId!)}
                    className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center space-x-1.5 border border-blue-200 transition-colors"
                    title="View Complete Lot History & Lifecycle Trail"
                  >
                    <History className="w-3.5 h-3.5 text-blue-600" />
                    <span>View Lot History</span>
                  </button>
                )}

                <button
                  onClick={() => printTradeReceipt(activeInvoice)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Official Receipt</span>
                </button>
                <button
                  onClick={() => setActiveInvoice(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Lot History & Audit Tracker Modal */}
      <LotHistoryTrackerModal
        lotId={selectedLotForHistory}
        isOpen={!!selectedLotForHistory}
        onClose={() => setSelectedLotForHistory(null)}
        currentUserRole={currentUser?.role}
        currentUserId={currentUser?.id}
        currentUserName={currentUser?.name}
      />

      {/* Formalities & Payment in Progress Control Modal */}
      <FormalitiesPaymentProgressModal
        isOpen={!!selectedTxnForFormalities}
        onClose={() => setSelectedTxnForFormalities(null)}
        transaction={selectedTxnForFormalities}
        onUpdateTransaction={(updated) => {
          setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
          setSelectedTxnForFormalities(updated);
        }}
      />

    </div>
  );
};
