import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';
import { CropLot, Offer, Transporter, User, SupportedLanguage, BalanceChangeRecord, TransactionRecord, InsufficientBalanceDialogData } from '../types';
import { MOCK_USERS, MOCK_LOTS, MOCK_OFFERS, MOCK_TRANSPORTERS } from '../data/mockData';
import { 
  fetchLotsApi, 
  createLotApi, 
  deleteLotApi, 
  fetchOffersApi, 
  createOfferApi, 
  acceptOfferApi, 
  rejectOfferApi, 
  counterOfferApi,
  fetchUsersApi,
  updateUserProfileApi,
  fetchTransactionsApi,
  updateTransactionStatusApi,
  fetchBalanceChangesApi,
  topUpWalletApi,
  simulateTradeApi,
} from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export interface BalanceDeltaAlert {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  previousBalance: number;
  newBalance: number;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release' | 'refund' | 'payout';
  description: string;
  timestamp: string;
}

export interface CallModalInfo {
  isOpen: boolean;
  targetName: string;
  targetRole: string;
  targetPhone: string;
  lotCrop?: string;
  lotGrade?: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  availableUsers: User[];
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  lots: CropLot[];
  refreshData: () => Promise<void>;
  addLot: (lot: Omit<CropLot, 'id' | 'createdAt' | 'offersCount'>) => Promise<void>;
  deleteLot: (id: string) => Promise<void>;
  offers: Offer[];
  createOffer: (offer: Omit<Offer, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  acceptOffer: (id: string) => Promise<void>;
  rejectOffer: (id: string) => Promise<void>;
  counterOffer: (id: string, counterPrice: number) => Promise<void>;
  transporters: Transporter[];
  // Transactions & Balance Ledger
  transactions: TransactionRecord[];
  balanceChanges: BalanceChangeRecord[];
  fetchBalanceChanges: () => Promise<BalanceChangeRecord[]>;
  fetchTransactions: () => Promise<TransactionRecord[]>;
  updateTransactionStatus: (
    id: string, 
    status: string, 
    notes?: string,
    extraData?: {
      paymentStatus?: 'completed' | 'in_progress' | 'pending';
      paymentProgressNotes?: string;
      clearingBankRef?: string;
      estimatedSettlementTime?: string;
      formalitiesCompleted?: boolean;
      formalitiesList?: any[];
    }
  ) => Promise<TransactionRecord | null>;
  topUpWallet: (amount: number, paymentMethod?: string) => Promise<void>;
  simulateTrade: (params?: { crop?: string; quantityQuintals?: number; pricePerQuintal?: number; autoRelease?: boolean }) => Promise<any>;
  lastBalanceAlert: BalanceDeltaAlert | null;
  dismissBalanceAlert: () => void;
  triggerBalanceAlert: (alert: BalanceDeltaAlert) => void;
  insufficientBalanceDialog: InsufficientBalanceDialogData;
  openInsufficientBalanceDialog: (data: Omit<InsufficientBalanceDialogData, 'isOpen'>) => void;
  closeInsufficientBalanceDialog: () => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  logout: () => void;
  callModal: CallModalInfo;
  openCallModal: (info: Omit<CallModalInfo, 'isOpen'>) => void;
  closeCallModal: () => void;
  isFasalMitraOpen: boolean;
  setIsFasalMitraOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  addToast: (toastOrTitle: Omit<ToastMessage, 'id'> | string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const saved = localStorage.getItem('fasalflow_user');
    return saved ? JSON.parse(saved) : MOCK_USERS[0];
  });

  const [availableUsers, setAvailableUsers] = useState<User[]>(MOCK_USERS);

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem('fasalflow_lang') || localStorage.getItem('i18nextLng');
    return (saved as SupportedLanguage) || (i18n.language?.split('-')[0] as SupportedLanguage) || 'en';
  });

  // Sync AppContext state whenever i18n fires languageChanged
  useEffect(() => {
    const onLanguageChanged = (lng: string) => {
      const code = (lng.split('-')[0] as SupportedLanguage) || 'en';
      console.log('🔄 [AppContext] Received languageChanged event from i18n:', lng, '-> normalized code:', code);
      setLanguageState(code);
    };

    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, []);

  const [lots, setLots] = useState<CropLot[]>(MOCK_LOTS);
  const [offers, setOffers] = useState<Offer[]>(MOCK_OFFERS);
  const [transporters] = useState<Transporter[]>(MOCK_TRANSPORTERS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [balanceChanges, setBalanceChanges] = useState<BalanceChangeRecord[]>([]);
  const [lastBalanceAlert, setLastBalanceAlert] = useState<BalanceDeltaAlert | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isFasalMitraOpen, setIsFasalMitraOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [callModal, setCallModal] = useState<CallModalInfo>({
    isOpen: false,
    targetName: '',
    targetRole: '',
    targetPhone: '',
  });

  const [insufficientBalanceDialog, setInsufficientBalanceDialog] = useState<InsufficientBalanceDialogData>({
    isOpen: false,
    transactionTitle: '',
    requiredAmount: 0,
    currentBalance: 0,
    shortfall: 0,
  });

  const openInsufficientBalanceDialog = (data: Omit<InsufficientBalanceDialogData, 'isOpen'>) => {
    setInsufficientBalanceDialog({
      ...data,
      isOpen: true,
    });
  };

  const closeInsufficientBalanceDialog = () => {
    setInsufficientBalanceDialog((prev) => ({ ...prev, isOpen: false }));
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user) {
      localStorage.setItem('fasalflow_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('fasalflow_user');
    }
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('fasalflow_user');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out of your session.',
    });
  };

  const setLanguage = (lang: SupportedLanguage) => {
    console.log('🔄 [AppContext] setLanguage invoked with:', lang);
    setLanguageState(lang);
    localStorage.setItem('fasalflow_lang', lang);
    localStorage.setItem('i18nextLng', lang);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang).then(() => {
        console.log('✅ [AppContext] i18n.changeLanguage successfully synced to:', lang);
      }).catch((err) => {
        console.error('❌ [AppContext] i18n.changeLanguage failed:', err);
      });
    }
  };

  const dismissBalanceAlert = () => setLastBalanceAlert(null);
  const triggerBalanceAlert = (alert: BalanceDeltaAlert) => {
    setLastBalanceAlert(alert);
    // Auto-dismiss after 7 seconds
    setTimeout(() => {
      setLastBalanceAlert((current) => (current?.id === alert.id ? null : current));
    }, 7000);
  };

  const fetchBalanceChanges = useCallback(async (): Promise<BalanceChangeRecord[]> => {
    try {
      const data = await fetchBalanceChangesApi();
      setBalanceChanges(data);
      return data;
    } catch (err) {
      console.warn('Failed to fetch balance changes:', err);
      return [];
    }
  }, []);

  const fetchTransactions = useCallback(async (): Promise<TransactionRecord[]> => {
    try {
      const data = await fetchTransactionsApi();
      setTransactions(data);
      return data;
    } catch (err) {
      console.warn('Failed to fetch transactions:', err);
      return [];
    }
  }, []);

  const refreshData = useCallback(async () => {
    try {
      const [backendLots, backendOffers, backendUsers, backendTxns, backendBalances] = await Promise.allSettled([
        fetchLotsApi(),
        fetchOffersApi(),
        fetchUsersApi(),
        fetchTransactionsApi(),
        fetchBalanceChangesApi(),
      ]);

      if (backendLots.status === 'fulfilled' && backendLots.value) {
        setLots(backendLots.value);
      }
      if (backendOffers.status === 'fulfilled' && backendOffers.value) {
        setOffers(backendOffers.value);
      }
      if (backendTxns.status === 'fulfilled' && backendTxns.value) {
        setTransactions(backendTxns.value);
      }
      if (backendBalances.status === 'fulfilled' && backendBalances.value) {
        setBalanceChanges(backendBalances.value);
      }
      if (backendUsers.status === 'fulfilled' && backendUsers.value?.length > 0) {
        setAvailableUsers(backendUsers.value);
        if (currentUser) {
          const freshCurrent = backendUsers.value.find((u: User) => u.id === currentUser.id);
          if (freshCurrent) {
            setCurrentUserState(freshCurrent);
          }
        }
      }
    } catch (err) {
      console.warn('Backend sync fallback to cached state:', err);
    }
  }, [currentUser]);

  // Sync with backend on mount
  useEffect(() => {
    refreshData();
  }, []);

  const addToast = (
    toastOrTitle: Omit<ToastMessage, 'id'> | string,
    type?: 'success' | 'error' | 'info' | 'warning'
  ) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    const toastObj: ToastMessage = typeof toastOrTitle === 'string'
      ? { id, title: toastOrTitle, type: type || 'info' }
      : { ...toastOrTitle, id };
    setToasts((prev) => [...prev, toastObj]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openCallModal = (info: Omit<CallModalInfo, 'isOpen'>) => {
    setCallModal({ ...info, isOpen: true });
  };

  const closeCallModal = () => {
    setCallModal((prev) => ({ ...prev, isOpen: false }));
  };

  const addLot = async (lotData: Omit<CropLot, 'id' | 'createdAt' | 'offersCount'>) => {
    try {
      const newLot = await createLotApi(lotData);
      setLots((prev) => [newLot, ...prev]);
      addToast({
        type: 'success',
        title: 'Lot Published to Database',
        message: `${newLot.crop} (${newLot.quantityQuintals} quintals) is now live in the marketplace backend.`,
      });
    } catch (err: any) {
      console.error('Failed to save lot to backend:', err);
      const fallbackLot: CropLot = {
        ...lotData,
        id: `lot-${Date.now()}`,
        createdAt: new Date().toISOString(),
        offersCount: 0,
      };
      setLots((prev) => [fallbackLot, ...prev]);
      addToast({
        type: 'success',
        title: 'Lot Published',
        message: `${fallbackLot.crop} is live.`,
      });
    }
  };

  const deleteLot = async (id: string) => {
    try {
      await deleteLotApi(id);
      setLots((prev) => prev.filter((l) => l.id !== id));
      addToast({
        type: 'info',
        title: 'Lot Deleted from Backend',
        message: 'The lot has been removed from marketplace listings.',
      });
    } catch (err: any) {
      setLots((prev) => prev.filter((l) => l.id !== id));
    }
  };

  const createOffer = async (offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>) => {
    try {
      const newOffer = await createOfferApi(offerData);
      setOffers((prev) => [newOffer, ...prev]);

      setLots((prev) =>
        prev.map((lot) => {
          if (lot.id === offerData.lotId) {
            const currentBest = lot.bestOfferPrice || 0;
            return {
              ...lot,
              offersCount: lot.offersCount + 1,
              bestOfferPrice: Math.max(currentBest, offerData.offeredPricePerQuintal),
            };
          }
          return lot;
        })
      );

      addToast({
        type: 'success',
        title: 'Offer Sent to Farmer',
        message: `Your bid of ₹${offerData.offeredPricePerQuintal}/quintal was stored in the backend and notified to seller.`,
      });
    } catch (err: any) {
      console.error('Failed to create offer in backend:', err);
    }
  };

  const acceptOffer = async (id: string) => {
    const offer = offers.find((o) => o.id === id);
    if (offer) {
      const buyer = availableUsers.find((u) => u.id === offer.buyerId);
      const buyerTotal = Math.round(offer.totalAmount * 1.01);
      const buyerBal = buyer?.walletBalance ?? 0;

      if (buyerBal < buyerTotal) {
        const shortfall = buyerTotal - buyerBal;
        openInsufficientBalanceDialog({
          transactionTitle: `Escrow Lock for ${offer.quantityQuintals}q ${offer.crop}`,
          transactionType: 'trade_deal',
          requiredAmount: buyerTotal,
          currentBalance: buyerBal,
          shortfall,
          payerName: buyer?.name || offer.buyerName,
          payerRole: 'buyer',
          payerId: offer.buyerId,
          crop: offer.crop,
          quantityQuintals: offer.quantityQuintals,
          offerId: offer.id,
          onRetry: () => acceptOffer(id),
        });
        return; // STOP TRANSACTION IMMEDIATELY
      }
    }

    try {
      const result = await acceptOfferApi(id);
      const updatedOffer = result.offer;
      const createdTxn = result.transaction;

      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'accepted' as const } : o))
      );

      setLots((prev) =>
        prev.map((l) => (l.id === updatedOffer.lotId ? { ...l, status: 'sold' as const } : l))
      );

      // Refresh transactions and balances
      await refreshData();

      // Check if current user was impacted by this transaction
      if (createdTxn?.balanceImpact) {
        if (currentUser && createdTxn.balanceImpact.buyer?.userId === currentUser.id) {
          const b = createdTxn.balanceImpact.buyer;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: b.userId,
            userName: b.userName,
            amount: b.change,
            previousBalance: b.previousBalance,
            newBalance: b.newBalance,
            type: 'escrow_lock',
            description: `Escrow Lock: ₹${Math.abs(b.change).toLocaleString('en-IN')} debited for ${createdTxn.quantityQuintals}q ${createdTxn.crop}`,
            timestamp: new Date().toISOString(),
          });
        } else if (currentUser && createdTxn.balanceImpact.seller?.userId === currentUser.id) {
          const s = createdTxn.balanceImpact.seller;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: s.userId,
            userName: s.userName,
            amount: s.change,
            previousBalance: s.previousBalance,
            newBalance: s.newBalance,
            type: 'escrow_release',
            description: `Escrow Guarantee: ₹${s.change.toLocaleString('en-IN')} reserved for payout upon delivery.`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      addToast({
        type: 'success',
        title: 'Deal Finalized & Escrow Locked!',
        message: `Accepted offer of ₹${updatedOffer.offeredPricePerQuintal}/q. Transaction ${createdTxn?.id || ''} created with balance changes recorded.`,
      });
    } catch (err: any) {
      console.error('Failed to accept offer:', err);
      if (err.code === 'INSUFFICIENT_BALANCE' || err.data?.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        const data = err.data || {};
        const buyerTotal = data.requiredAmount || Math.round((offer?.totalAmount || 0) * 1.01);
        const buyerBal = data.currentBalance ?? 0;
        const shortfall = data.shortfall || Math.max(0, buyerTotal - buyerBal);
        
        openInsufficientBalanceDialog({
          transactionTitle: `Escrow Lock for ${offer?.quantityQuintals || ''}q ${offer?.crop || 'produce'}`,
          transactionType: 'trade_deal',
          requiredAmount: buyerTotal,
          currentBalance: buyerBal,
          shortfall,
          payerName: data.userName || offer?.buyerName,
          payerRole: data.userRole || 'buyer',
          payerId: data.userId || offer?.buyerId,
          crop: offer?.crop,
          quantityQuintals: offer?.quantityQuintals,
          offerId: id,
          onRetry: () => acceptOffer(id),
        });
        return; // STOP TRANSACTION IMMEDIATELY
      }

      addToast({
        type: 'error',
        title: 'Transaction Halted',
        message: err.message || 'Could not complete offer acceptance.',
      });
    }
  };

  const rejectOffer = async (id: string) => {
    try {
      await rejectOfferApi(id);
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'rejected' as const } : o))
      );
      addToast({
        type: 'info',
        title: 'Offer Declined',
        message: 'The buyer has been notified.',
      });
    } catch (err: any) {
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'rejected' as const } : o))
      );
    }
  };

  const counterOffer = async (id: string, counterPrice: number) => {
    try {
      await counterOfferApi(id, counterPrice);
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: 'countered' as const, counterPrice } : o
        )
      );
      addToast({
        type: 'info',
        title: 'Counter Offer Sent',
        message: `Counter price of ₹${counterPrice}/q submitted to the buyer.`,
      });
    } catch (err: any) {
      setOffers((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, status: 'countered' as const, counterPrice } : o
        )
      );
    }
  };

  // Transaction Status and Escrow Release
  const updateTransactionStatus = async (
    id: string, 
    status: string, 
    notes?: string,
    extraData?: {
      paymentStatus?: 'completed' | 'in_progress' | 'pending';
      paymentProgressNotes?: string;
      clearingBankRef?: string;
      estimatedSettlementTime?: string;
      formalitiesCompleted?: boolean;
      formalitiesList?: any[];
    }
  ): Promise<TransactionRecord | null> => {
    try {
      const updated = await updateTransactionStatusApi(id, status, notes, extraData);
      await refreshData();

      if (updated.balanceImpact) {
        if (status === 'completed' && updated.balanceImpact.seller) {
          const s = updated.balanceImpact.seller;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: s.userId,
            userName: s.userName,
            amount: s.change,
            previousBalance: s.previousBalance,
            newBalance: s.newBalance,
            type: 'credit',
            description: `Escrow Released! ₹${s.change.toLocaleString('en-IN')} credited to ${s.userName}'s wallet.`,
            timestamp: new Date().toISOString(),
          });
        } else if (status === 'refunded' && updated.balanceImpact.buyer) {
          const b = updated.balanceImpact.buyer;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: b.userId,
            userName: b.userName,
            amount: b.change,
            previousBalance: b.previousBalance,
            newBalance: b.newBalance,
            type: 'refund',
            description: `100% Escrow Refunded: ₹${b.change.toLocaleString('en-IN')} credited back to ${b.userName}.`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      addToast({
        type: 'success',
        title: `Transaction Status: ${status.toUpperCase()}`,
        message: `Ledger updated. Balances recalculated across parties.`,
      });

      return updated;
    } catch (err: any) {
      console.error('Failed to update transaction status:', err);
      addToast({
        type: 'error',
        title: 'Status Update Failed',
        message: err.message,
      });
      return null;
    }
  };

  // Wallet Top-up
  const topUpWallet = async (amount: number, paymentMethod?: string) => {
    if (!currentUser) return;
    try {
      const res = await topUpWalletApi(currentUser.id, amount, paymentMethod || 'UPI Instant Top-Up');
      if (res.success && res.user) {
        setCurrentUserState(res.user);
        setAvailableUsers((prev) =>
          prev.map((u) => (u.id === res.user.id ? res.user : u))
        );
        await refreshData();
        triggerBalanceAlert({
          id: `alert-${Date.now()}`,
          userId: res.user.id,
          userName: res.user.name,
          amount: amount,
          previousBalance: res.balanceRecord.previousBalance,
          newBalance: res.balanceRecord.newBalance,
          type: 'credit',
          description: `Wallet credited with ₹${amount.toLocaleString('en-IN')}`,
          timestamp: new Date().toISOString(),
        });
        addToast({
          type: 'success',
          title: 'Wallet Funded Successfully',
          message: `₹${amount.toLocaleString('en-IN')} added. Current balance: ₹${(res.user.walletBalance ?? 0).toLocaleString('en-IN')}`,
        });
      }
    } catch (err: any) {
      console.error('Topup failed:', err);
      addToast({
        type: 'error',
        title: 'Top-up Failed',
        message: err.message,
      });
      throw err;
    }
  };

  // Quick Simulate Trade
  const simulateTrade = async (params?: { crop?: string; quantityQuintals?: number; pricePerQuintal?: number; autoRelease?: boolean }) => {
    const buyerUser = currentUser?.role === 'buyer' 
      ? currentUser 
      : availableUsers.find((u) => u.role === 'buyer') || currentUser;
    
    const crop = params?.crop || 'Soybean';
    const quantityQuintals = params?.quantityQuintals || 50;
    const pricePerQuintal = params?.pricePerQuintal || 4850;
    const baseAmount = quantityQuintals * pricePerQuintal;
    const requiredAmount = Math.round(baseAmount * 1.01);
    const buyerBal = buyerUser?.walletBalance ?? 0;

    // Check balance before executing
    if (buyerBal < requiredAmount) {
      const shortfall = requiredAmount - buyerBal;
      openInsufficientBalanceDialog({
        transactionTitle: `Simulate Deal: ${quantityQuintals}q ${crop}`,
        transactionType: 'trade_deal',
        requiredAmount,
        currentBalance: buyerBal,
        shortfall,
        payerName: buyerUser?.name,
        payerRole: buyerUser?.role || 'buyer',
        payerId: buyerUser?.id,
        crop,
        quantityQuintals,
        onRetry: () => simulateTrade(params),
      });
      return null; // STOP TRANSACTION
    }

    try {
      const sellerId = currentUser?.role === 'farmer' ? currentUser.id : undefined;
      const buyerId = currentUser?.role === 'buyer' ? currentUser.id : undefined;
      const res = await simulateTradeApi({
        sellerId,
        buyerId,
        crop,
        quantityQuintals,
        pricePerQuintal,
        autoRelease: params?.autoRelease ?? false,
      });

      await refreshData();

      if (res.transaction?.balanceImpact) {
        const impact = res.transaction.balanceImpact;
        if (currentUser && impact.buyer?.userId === currentUser.id) {
          const b = impact.buyer;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: b.userId,
            userName: b.userName,
            amount: b.change,
            previousBalance: b.previousBalance,
            newBalance: b.newBalance,
            type: 'escrow_lock',
            description: `Escrow Lock: ₹${Math.abs(b.change).toLocaleString('en-IN')} debited for ${res.transaction.quantityQuintals}q ${res.transaction.crop}`,
            timestamp: new Date().toISOString(),
          });
        } else if (currentUser && impact.seller?.userId === currentUser.id) {
          const s = impact.seller;
          triggerBalanceAlert({
            id: `alert-${Date.now()}`,
            userId: s.userId,
            userName: s.userName,
            amount: s.change,
            previousBalance: s.previousBalance,
            newBalance: s.newBalance,
            type: s.status === 'credited' ? 'credit' : 'escrow_release',
            description: s.status === 'credited' 
              ? `Instant Payout: ₹${s.change.toLocaleString('en-IN')} credited to wallet!` 
              : `Escrow Deposit: ₹${s.change.toLocaleString('en-IN')} locked for you.`,
            timestamp: new Date().toISOString(),
          });
        }
      }

      addToast({
        type: 'success',
        title: 'New Transaction Processed!',
        message: `Deal ${res.transaction.id} registered with instant double-entry balance updates.`,
      });

      return res;
    } catch (err: any) {
      console.error('Simulation failed:', err);
      if (err.code === 'INSUFFICIENT_BALANCE' || err.data?.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        const data = err.data || {};
        const reqAmt = data.requiredAmount || requiredAmount;
        const curBal = data.currentBalance ?? buyerBal;
        const shortfall = data.shortfall || Math.max(0, reqAmt - curBal);

        openInsufficientBalanceDialog({
          transactionTitle: `Simulate Deal: ${quantityQuintals}q ${crop}`,
          transactionType: 'trade_deal',
          requiredAmount: reqAmt,
          currentBalance: curBal,
          shortfall,
          payerName: data.userName || buyerUser?.name,
          payerRole: data.userRole || buyerUser?.role || 'buyer',
          payerId: data.userId || buyerUser?.id,
          crop,
          quantityQuintals,
          onRetry: () => simulateTrade(params),
        });
        return null; // STOP TRANSACTION
      }

      addToast({
        type: 'error',
        title: 'Simulation Failed',
        message: err.message,
      });
      return null;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        availableUsers,
        language,
        setLanguage,
        lots,
        refreshData,
        addLot,
        deleteLot,
        offers,
        createOffer,
        acceptOffer,
        rejectOffer,
        counterOffer,
        transporters,
        transactions,
        balanceChanges,
        fetchBalanceChanges,
        fetchTransactions,
        updateTransactionStatus,
        topUpWallet,
        simulateTrade,
        lastBalanceAlert,
        dismissBalanceAlert,
        triggerBalanceAlert,
        insufficientBalanceDialog,
        openInsufficientBalanceDialog,
        closeInsufficientBalanceDialog,
        authModalOpen,
        setAuthModalOpen,
        logout,
        callModal,
        openCallModal,
        closeCallModal,
        isFasalMitraOpen,
        setIsFasalMitraOpen,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
