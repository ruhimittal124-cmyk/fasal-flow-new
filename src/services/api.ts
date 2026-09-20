import { 
  MandiRecord, 
  PricePredictionResult, 
  TransportFareResult, 
  User, 
  TransactionRecord, 
  CropLot, 
  Offer, 
  TransportBooking, 
  BalanceChangeRecord,
  LotWithHistory,
  LotTransactionEvent
} from '../types';

// Agmarknet & Mandi Rates
export async function fetchMandiRates(crop?: string, district?: string): Promise<MandiRecord[]> {
  const params = new URLSearchParams();
  if (crop && crop !== 'All') params.append('crop', crop);
  if (district && district !== 'All') params.append('district', district);
  
  const res = await fetch(`/api/mandi-rates?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch mandi rates');
  return res.json();
}

export async function syncMandiRates(apiKey?: string) {
  const res = await fetch('/api/mandi-rates/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiKey }),
  });
  if (!res.ok) throw new Error('Failed to sync mandi rates');
  return res.json();
}

export async function fetchMandiStatus() {
  const res = await fetch('/api/mandi-rates/status');
  if (!res.ok) throw new Error('Failed to fetch mandi status');
  return res.json();
}

export async function importMandiData(data: string | any[]) {
  const res = await fetch('/api/mandi-rates/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  return res.json();
}

// AI Price Prediction & Auto-grading
export async function predictCropPrice(crop: string, district: string): Promise<PricePredictionResult> {
  const res = await fetch('/api/ai/predict-price', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop, district }),
  });
  if (!res.ok) throw new Error('Failed to predict crop price');
  return res.json();
}

export async function autoGradeCrop(crop: string, variety: string, photoDescription?: string) {
  const res = await fetch('/api/ai/auto-grade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ crop, variety, photoDescription }),
  });
  if (!res.ok) throw new Error('Failed to auto-grade crop');
  return res.json();
}

// Transport
export async function calculateTransportFare(params: {
  distanceKm: number;
  crop?: string;
  quantityQuintals?: number;
  vehicleType?: string;
  hasTempControl?: boolean;
  isFirstTransaction?: boolean;
}): Promise<TransportFareResult> {
  const res = await fetch('/api/transport/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to calculate transport fare');
  return res.json();
}

export async function fetchTransportBookings(userId?: string): Promise<TransportBooking[]> {
  const url = userId ? `/api/transport/bookings?userId=${userId}` : '/api/transport/bookings';
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch transport bookings');
  return res.json();
}

export async function createTransportBookingApi(booking: Omit<TransportBooking, 'id' | 'createdAt' | 'status'>): Promise<TransportBooking> {
  const res = await fetch('/api/transport/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || errorData.error || 'Failed to create transport booking');
    err.code = errorData.code;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

// Users Backend API
export async function fetchUsersApi(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchUserProfileApi(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) throw new Error('Failed to fetch user profile');
  return res.json();
}

export async function updateUserProfileApi(id: string, updates: Partial<User>): Promise<User> {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update profile');
  return res.json();
}

export async function fetchUserDashboardApi(id: string): Promise<any> {
  const res = await fetch(`/api/users/${id}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch user dashboard');
  return res.json();
}

// Transactions Backend API
export async function fetchTransactionsApi(params?: { userId?: string; type?: string; status?: string }): Promise<TransactionRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.type) searchParams.append('type', params.type);
  if (params?.status) searchParams.append('status', params.status);

  const res = await fetch(`/api/transactions?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
}

export async function fetchTransactionByIdApi(id: string): Promise<TransactionRecord> {
  const res = await fetch(`/api/transactions/${id}`);
  if (!res.ok) throw new Error('Failed to fetch transaction details');
  return res.json();
}

export async function createTransactionApi(data: any): Promise<TransactionRecord> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || errorData.error || 'Failed to create transaction');
    err.code = errorData.code;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

export async function updateTransactionStatusApi(
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
): Promise<TransactionRecord> {
  const res = await fetch(`/api/transactions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, notes, ...extraData }),
  });
  if (!res.ok) throw new Error('Failed to update transaction status');
  return res.json();
}

// Balance Changes & Double-Entry Ledger API
export async function fetchBalanceChangesApi(params?: { userId?: string; transactionId?: string }): Promise<BalanceChangeRecord[]> {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.append('userId', params.userId);
  if (params?.transactionId) searchParams.append('transactionId', params.transactionId);

  const res = await fetch(`/api/balance-changes?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch balance changes');
  return res.json();
}

export async function topUpWalletApi(userId: string, amount: number, paymentMethod?: string): Promise<{ success: boolean; user: User; balanceRecord: BalanceChangeRecord }> {
  const res = await fetch('/api/wallet/topup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, paymentMethod }),
  });
  if (!res.ok) throw new Error('Failed to top up wallet');
  return res.json();
}

export async function simulateTradeApi(params: {
  sellerId?: string;
  buyerId?: string;
  crop?: string;
  quantityQuintals?: number;
  pricePerQuintal?: number;
  autoRelease?: boolean;
}): Promise<{
  success: boolean;
  transaction: TransactionRecord;
  seller: User;
  buyer: User;
  balanceChanges: BalanceChangeRecord[];
}> {
  const res = await fetch('/api/wallet/simulate-trade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || errorData.error || 'Failed to simulate trade deal');
    err.code = errorData.code;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

// Lots Backend API
export async function fetchLotsApi(): Promise<CropLot[]> {
  const res = await fetch('/api/lots');
  if (!res.ok) throw new Error('Failed to fetch lots');
  return res.json();
}

export async function createLotApi(lot: Omit<CropLot, 'id' | 'createdAt' | 'offersCount'>): Promise<CropLot> {
  const res = await fetch('/api/lots', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(lot),
  });
  if (!res.ok) throw new Error('Failed to create lot');
  return res.json();
}

export async function deleteLotApi(id: string): Promise<void> {
  const res = await fetch(`/api/lots/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete lot');
}

// Offers Backend API
export async function fetchOffersApi(): Promise<Offer[]> {
  const res = await fetch('/api/offers');
  if (!res.ok) throw new Error('Failed to fetch offers');
  return res.json();
}

export async function createOfferApi(offer: Omit<Offer, 'id' | 'createdAt' | 'status'>): Promise<Offer> {
  const res = await fetch('/api/offers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(offer),
  });
  if (!res.ok) throw new Error('Failed to create offer');
  return res.json();
}

export async function acceptOfferApi(id: string): Promise<{ offer: Offer; transaction: TransactionRecord }> {
  const res = await fetch(`/api/offers/${id}/accept`, { method: 'POST' });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const err: any = new Error(errorData.message || errorData.error || 'Failed to accept offer');
    err.code = errorData.code;
    err.data = errorData;
    throw err;
  }
  return res.json();
}

export async function rejectOfferApi(id: string): Promise<Offer> {
  const res = await fetch(`/api/offers/${id}/reject`, { method: 'POST' });
  if (!res.ok) throw new Error('Failed to reject offer');
  return res.json();
}

export async function counterOfferApi(id: string, counterPrice: number): Promise<Offer> {
  const res = await fetch(`/api/offers/${id}/counter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ counterPrice }),
  });
  if (!res.ok) throw new Error('Failed to counter offer');
  return res.json();
}

// Fasal Mitra Chatbot
export async function sendFasalMitraMessage(
  message: string,
  language: string,
  userContext?: any,
  appData?: any
): Promise<{ reply: string; intent: string; entities: any }> {
  const res = await fetch('/api/fasal-mitra', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language, userContext, appData }),
  });
  if (!res.ok) throw new Error('Fasal Mitra service error');
  return res.json();
}

// Lot History & Lifecycle Tracking Backend API
export async function fetchLotHistoryApi(lotId: string): Promise<LotWithHistory> {
  const res = await fetch(`/api/lots/${lotId}/history`);
  if (!res.ok) throw new Error(`Failed to fetch history for lot ${lotId}`);
  return res.json();
}

export async function fetchLotEventsApi(lotId?: string, eventType?: string): Promise<LotTransactionEvent[]> {
  const params = new URLSearchParams();
  if (lotId) params.append('lotId', lotId);
  if (eventType) params.append('eventType', eventType);
  const res = await fetch(`/api/lot-events?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch lot events');
  return res.json();
}

export async function addLotEventApi(lotId: string, eventData: Partial<LotTransactionEvent>): Promise<{ success: boolean; event: LotTransactionEvent }> {
  const res = await fetch(`/api/lots/${lotId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  if (!res.ok) throw new Error('Failed to record lot event');
  return res.json();
}
