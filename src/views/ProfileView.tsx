import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  User, 
  ShieldCheck, 
  Star, 
  Award, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  Building2,
  CreditCard,
  ReceiptText,
  Lock,
  ArrowRight,
  Save,
  Wallet,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { updateUserProfileApi, fetchTransactionsApi } from '../services/api';
import { TransactionRecord } from '../types';
import { printTradeReceipt } from '../utils/printReceipt';
import { Printer } from 'lucide-react';

interface ProfileViewProps {
  setCurrentTab?: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { currentUser, setCurrentUser, setAuthModalOpen, logout, addToast } = useApp();
  const [recentTxns, setRecentTxns] = useState<TransactionRecord[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [saving, setSaving] = useState(false);

  // Bank & UPI Edit Form State
  const [upiId, setUpiId] = useState(currentUser?.upiId || '');
  const [bankAccountNumber, setBankAccountNumber] = useState(currentUser?.bankAccountNumber || '');
  const [ifscCode, setIfscCode] = useState(currentUser?.ifscCode || '');
  const [bankName, setBankName] = useState(currentUser?.bankName || '');
  const [village, setVillage] = useState(currentUser?.village || '');
  const [isKyc, setIsKyc] = useState(currentUser?.isKycVerified || false);

  useEffect(() => {
    if (currentUser) {
      setUpiId(currentUser.upiId || '');
      setBankAccountNumber(currentUser.bankAccountNumber || '');
      setIfscCode(currentUser.ifscCode || '');
      setBankName(currentUser.bankName || '');
      setVillage(currentUser.village || '');
      setIsKyc(currentUser.isKycVerified || false);

      loadRecentTransactions(currentUser.id);
    }
  }, [currentUser]);

  const loadRecentTransactions = async (userId: string) => {
    setLoadingTxns(true);
    try {
      const data = await fetchTransactionsApi({ userId });
      setRecentTxns(data.slice(0, 4));
    } catch (e) {
      console.warn('Could not load user transactions:', e);
    } finally {
      setLoadingTxns(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Sign In Required</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 leading-relaxed">
            Please verify your mobile number with OTP to access your farmer/buyer trader profile, bank settlement accounts, and past consignments.
          </p>
        </div>
        <button
          onClick={() => setAuthModalOpen(true)}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02] cursor-pointer"
        >
          Sign In with Mobile OTP
        </button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateUserProfileApi(currentUser.id, {
        upiId,
        bankAccountNumber,
        ifscCode,
        bankName,
        village,
        isKycVerified: isKyc,
      });

      setCurrentUser(updated);
      addToast({
        type: 'success',
        title: 'Backend Profile Synced',
        message: 'Banking, UPI, and KYC details updated securely in database.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-black text-3xl flex items-center justify-center shadow-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-slate-900">{currentUser.name}</h1>
                {currentUser.isKycVerified && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1 border border-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{t('profile.kycStatus', 'Aadhaar KYC Verified')}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 capitalize font-medium">
                {currentUser.role} • {currentUser.district}, {currentUser.state}
              </p>
              <div className="flex items-center space-x-3 mt-2 text-xs text-slate-600">
                <span className="flex items-center text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" />
                  {currentUser.rating} {t('profile.traderRating', 'Trader Rating')}
                </span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{t('profile.trustScore', 'Trust Score')}: {currentUser.trustScore}/100</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            {currentUser.walletBalance !== undefined && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-right w-full sm:w-auto">
                <div className="text-[10px] uppercase font-bold text-emerald-700 flex items-center justify-end space-x-1">
                  <Wallet className="w-3 h-3" />
                  <span>{t('profile.walletBalance', 'Escrow & Wallet Balance')}</span>
                </div>
                <div className="text-lg font-black text-emerald-950 mt-0.5">
                  ₹{currentUser.walletBalance.toLocaleString('en-IN')}
                </div>
              </div>
            )}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex-1 sm:flex-initial cursor-pointer"
              >
                {t('profile.switchRole', 'Switch Role')}
              </button>
              <button
                onClick={logout}
                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                title="Log out of session"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Banking & Identity Details Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Contact & Banking Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-slate-900">
                {t('profile.bankDetails', 'Direct Payout Bank & UPI Details')}
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">{t('profile.persistedBackend', 'Auto-persisted in backend')}</span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.upiId', 'UPI ID (GPay / PhonePe / BHIM)')}
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. yourname@sbi"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.bankName', 'Bank Name')}
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="e.g. State Bank of India"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.accountNumber', 'Bank Account Number')}
                </label>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value)}
                  placeholder="e.g. 34892019382"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.ifsc', 'IFSC Code')}
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001234"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('profile.district', 'Village / Local APMC Yard')}
                </label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="e.g. Dhoki"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center space-x-2 text-xs font-bold text-slate-700 cursor-pointer p-2 bg-slate-50 border border-slate-200 rounded-xl">
                  <input
                    type="checkbox"
                    checked={isKyc}
                    onChange={(e) => setIsKyc(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span>{t('profile.kycCheckbox', 'Aadhaar KYC Verification Verified')}</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? t('profile.saving', 'Saving...') : t('profile.saveChanges', 'Save & Update Details')}</span>
              </button>
            </div>

          </form>

          {/* Platform Policy Summary */}
          <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
              <span className="font-bold text-emerald-900">{t('profile.directSettlement', 'Direct Bank Settlement: 2% Flat')}</span>
              <p className="text-emerald-700 text-[11px]">{t('profile.directSettlementDesc', 'Payouts are credited directly to your registered bank account via RTGS/NEFT.')}</p>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 space-y-1">
              <span className="font-bold text-blue-900">{t('profile.escrowGuarantee', 'e-NAM Escrow Guarantee')}</span>
              <p className="text-blue-700 text-[11px]">{t('profile.escrowGuaranteeDesc', 'Buyer funds are held in secure escrow until physical quality check passes.')}</p>
            </div>
          </div>

        </div>

        {/* Right Sidebar: Recent Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <ReceiptText className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">{t('dashboard.recentTrades', 'Recent Deals')}</h3>
              </div>
              {setCurrentTab && (
                <button
                  onClick={() => setCurrentTab('transactions')}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-0.5 cursor-pointer"
                >
                  <span>{t('dashboard.viewAllTrades', 'View All')}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {loadingTxns ? (
                <div className="py-8 text-center text-xs text-slate-400">{t('profile.loadingLedger', 'Loading ledger...')}</div>
              ) : recentTxns.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">{t('profile.noTransactions', 'No recorded transactions yet.')}</div>
              ) : (
                recentTxns.map((txn) => (
                  <div key={txn.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900">{txn.crop || txn.type}</strong>
                      <span className="font-bold text-slate-900">₹{txn.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{txn.invoiceNumber}</span>
                      <div className="flex items-center space-x-2">
                        <span className="capitalize font-semibold text-emerald-700">{txn.status.replace('_', ' ')}</span>
                        <button
                          onClick={() => printTradeReceipt(txn)}
                          className="p-1 rounded-md bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 cursor-pointer"
                          title={t('transactions.downloadReceipt', 'Print Receipt')}
                        >
                          <Printer className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {setCurrentTab && (
            <button
              onClick={() => setCurrentTab('transactions')}
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors text-center cursor-pointer"
            >
              {t('transactions.title', 'Open Full Transaction Ledger')}
            </button>
          )}

        </div>

      </div>

    </div>
  );
};

export default ProfileView;
