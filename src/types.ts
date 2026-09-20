export type CropType = 
  | 'Soybean' 
  | 'Cotton' 
  | 'Tur' 
  | 'Wheat' 
  | 'Chana' 
  | 'Maize' 
  | 'Onion' 
  | 'Moong' 
  | 'Groundnut'
  | 'Mustard'
  | 'Paddy'
  | 'Bajra'
  | 'Jowar'
  | 'Tomato'
  | 'Potato'
  | 'Sugarcane'
  | 'Urad'
  | 'Ginger'
  | 'Garlic'
  | 'Chilli';

export type CropGrade = 'Grade A' | 'Grade B' | 'Grade C';

export interface MandiRecord {
  id: string;
  mandiName: string;
  district: string;
  state: string;
  crop: CropType;
  grade: CropGrade;
  pricePerQuintal: number;
  minPrice: number;
  maxPrice: number;
  arrivalVolumeTons: number;
  changePercent: number;
  distanceKm: number;
  lastUpdated: string;
  lat: number;
  lng: number;
}

export type UserRole = 'farmer' | 'buyer' | 'fpo' | 'transporter';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  district: string;
  state: string;
  village?: string;
  isKycVerified: boolean;
  rating: number;
  avatar?: string;
  memberSince: string;
  trustScore: number;
  freeTransactionAvailable?: boolean;
  upiId?: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  bankName?: string;
  walletBalance?: number;
  blockedUserIds?: string[];
  strikes?: number;
  moderationStatus?: 'active' | 'warned' | 'suspended' | 'banned';
  suspendedUntil?: string;
}

export type ReportReason = 
  | 'Spam'
  | 'Harassment'
  | 'Fraud'
  | 'Inappropriate Language'
  | 'Fake Profile'
  | 'Other';

export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';

export interface UserReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reportedUserPhone?: string;
  reporterId: string;
  reporterName: string;
  reporterPhone?: string;
  reason: ReportReason;
  description?: string;
  screenshotUrl?: string;
  timestamp: string;
  status: ReportStatus;
  adminActionTaken?: string;
  resolvedAt?: string;
}

export interface BlockedUserEntry {
  userId: string;
  name: string;
  role?: string;
  phone?: string;
  district?: string;
  blockedAt: string;
}

export interface CropLot {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerDistrict: string;
  sellerPhone?: string;
  sellerRating?: number;
  sellerIsKyc?: boolean;
  crop: CropType;
  variety: string;
  grade: CropGrade;
  quantityQuintals: number;
  askingPricePerQuintal: number;
  baseTotal: number;
  harvestDate: string;
  photos: string[];
  status: 'active' | 'negotiation' | 'sold' | 'expired';
  moisturePercent?: number;
  purityPercent?: number;
  defectPercent?: number;
  aiNotes?: string;
  createdAt: string;
  offersCount: number;
  bestOfferPrice?: number;
  lat?: number;
  lng?: number;
}

export interface Offer {
  id: string;
  lotId: string;
  crop: CropType;
  buyerId: string;
  buyerName: string;
  buyerDistrict: string;
  buyerPhone?: string;
  offeredPricePerQuintal: number;
  quantityQuintals: number;
  totalAmount: number;
  status: 'pending' | 'accepted' | 'rejected' | 'countered';
  counterPrice?: number;
  createdAt: string;
  notes?: string;
}

export interface Transporter {
  id: string;
  name: string;
  phone: string;
  district: string;
  vehicleType: string;
  capacityTons: number;
  baseFare: number;
  ratePerKm: number;
  rating: number;
  completedTrips: number;
  isAvailable: boolean;
  lat?: number;
  lng?: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isAi?: boolean;
  language?: string;
  intent?: string;
  suggestedActions?: string[];
  isDeleted?: boolean;
  deletedAt?: string;
}

export type SupportedLanguage = 
  | 'en' 
  | 'hi' 
  | 'mr' 
  | 'pa' 
  | 'gu' 
  | 'bn' 
  | 'ta' 
  | 'te' 
  | 'kn' 
  | 'ml' 
  | 'or' 
  | 'as' 
  | 'ur' 
  | 'sa' 
  | 'ne' 
  | 'mai' 
  | 'kok' 
  | 'ks' 
  | 'sd' 
  | 'doi' 
  | 'brx' 
  | 'sat' 
  | 'mni';

export interface PricePredictionResult {
  crop: string;
  district: string;
  currentAvgPrice: number;
  forecastPrice7Days: number;
  predictedChangePercent: number;
  recommendation: 'SELL NOW' | 'WAIT 5 DAYS' | 'HOLD';
  confidenceScore: number;
  trendReasoning: string;
  mandiArrivalTrend: string;
  historicalChartData: Array<{ day: string; actualPrice: number; forecastPrice?: number }>;
}

export interface TransportFareResult {
  distanceKm: number;
  baseFare: number;
  distanceCharge: number;
  weightSurcharge: number;
  tempControlCharge: number;
  subtotal: number;
  platformCommission: number;
  sellerCommission: number;
  buyerCommission: number;
  totalAmount: number;
  isFreeCommissionUsed: boolean;
}

export type TransactionType = 
  | 'trade_deal' 
  | 'escrow_deposit' 
  | 'seller_payout' 
  | 'transport_fare' 
  | 'platform_fee'
  | 'refund';

export type TransactionStatus = 
  | 'pending' 
  | 'escrow_locked' 
  | 'in_transit' 
  | 'completed' 
  | 'refunded'
  | 'failed';

export interface PartyBalanceImpact {
  seller?: {
    userId: string;
    userName: string;
    previousBalance: number;
    change: number;
    newBalance: number;
    status: 'credited' | 'pending_escrow';
    timestamp: string;
  };
  buyer?: {
    userId: string;
    userName: string;
    previousBalance: number;
    change: number;
    newBalance: number;
    status: 'debited' | 'refunded';
    timestamp: string;
  };
  transporter?: {
    userId: string;
    userName: string;
    previousBalance: number;
    change: number;
    newBalance: number;
    status: 'credited';
    timestamp: string;
  };
}

export interface BalanceChangeRecord {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  counterpartyId?: string;
  counterpartyName?: string;
  type: 'credit' | 'debit' | 'escrow_lock' | 'escrow_release' | 'refund' | 'payout';
  amount: number;
  previousBalance: number;
  newBalance: number;
  description: string;
  crop?: string;
  invoiceNumber?: string;
  paymentStatus?: 'completed' | 'in_progress' | 'pending';
  createdAt: string;
}

export interface TradeFormalitiesItem {
  id: string;
  label: string;
  completed: boolean;
  completedAt?: string;
  verifiedBy?: string;
}

export interface TransactionRecord {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  lotId?: string;
  crop?: CropType;
  quantityQuintals?: number;
  pricePerQuintal?: number;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  transporterId?: string;
  transporterName?: string;
  platformFee: number;
  farmerPayout: number;
  buyerTotal: number;
  paymentMethod: string;
  paymentRef: string;
  invoiceNumber: string;
  createdAt: string;
  completedAt?: string;
  notes?: string;
  deliveryAddress?: string;
  pickupDistrict?: string;
  dropDistrict?: string;
  balanceImpact?: PartyBalanceImpact;
  paymentStatus?: 'completed' | 'in_progress' | 'pending';
  paymentProgressNotes?: string;
  clearingBankRef?: string;
  estimatedSettlementTime?: string;
  formalitiesCompleted?: boolean;
  formalitiesList?: TradeFormalitiesItem[];
}

export interface TransportBooking {
  id: string;
  lotId?: string;
  userId: string;
  transporterId: string;
  transporterName: string;
  pickupLocation: string;
  dropLocation: string;
  distanceKm: number;
  crop: CropType;
  quantityQuintals: number;
  totalFare: number;
  status: 'booked' | 'in_transit' | 'delivered' | 'cancelled';
  driverPhone: string;
  createdAt: string;
}

export type LotEventType =
  | 'lot_created'            // Lot listed on marketplace
  | 'offer_received'         // Bid submitted by buyer
  | 'offer_countered'        // Farmer countered price
  | 'offer_rejected'         // Offer declined
  | 'offer_accepted'         // Offer accepted by farmer
  | 'escrow_locked'          // 100% Escrow deposit secured in UPI e-NAM vault
  | 'transport_assigned'     // Truck haulage booked for this lot
  | 'dispatched_in_transit'  // Produce dispatched from farmgate / warehouse
  | 'quality_verified'       // Moisture, foreign matter, defect testing at mill/dock
  | 'escrow_released'        // Settlement payout transferred to farmer wallet
  | 'escrow_refunded'        // Refund issued to buyer due to cancellation/rejection
  | 'price_revised'          // Farmer updated asking price or lot details
  | 'status_changed'         // Lot status transition (e.g. active -> negotiation -> sold)
  | 'custom_note';           // Manual audit note / inspection sign-off

export interface LotTransactionEvent {
  id: string;
  lotId: string;
  transactionId?: string;
  offerId?: string;
  eventType: LotEventType;
  title: string;
  description: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole | 'system';
  counterpartyId?: string;
  counterpartyName?: string;
  amount?: number;
  quantityQuintals?: number;
  pricePerQuintal?: number;
  previousLotStatus?: string;
  newLotStatus?: string;
  balanceImpactSummary?: string;
  metadata?: {
    invoiceNumber?: string;
    paymentRef?: string;
    moisturePercent?: number;
    grade?: string;
    transporterName?: string;
    driverPhone?: string;
    disputeReason?: string;
    location?: string;
  };
  timestamp: string;
}

export interface LotWithHistory extends CropLot {
  events: LotTransactionEvent[];
  transactions: TransactionRecord[];
  offers: Offer[];
  transportBookings: TransportBooking[];
  summary: {
    totalEscrowLocked: number;
    totalPayoutReleased: number;
    totalOffersReceived: number;
    highestBidPrice: number;
    currentLifecycleStep: 'listed' | 'negotiating' | 'escrow_locked' | 'in_transit' | 'settled' | 'refunded';
    isFullySettled: boolean;
  };
}

export interface PoolDeductionEvidence {
  reportId: string;
  labName: string;
  testDate: string;
  testedMetric: string;
  measuredValue: string;
  agreedBaseline: string;
  inspectorName: string;
  contractClause: string;
  opticalScore?: string;
  photoDescription?: string;
}

export interface PoolContractDeduction {
  id: string;
  title: string;
  type: 'quality_adjustment' | 'moisture_excess' | 'foreign_matter' | 'packaging' | 'storage_overstay';
  percentage?: number;
  rupeeAmount: number;
  evidence: PoolDeductionEvidence;
}

export interface PoolIncentive {
  id: string;
  title: string;
  rupeeAmount: number;
  reason: string;
}

export interface FarmerPoolParticipant {
  farmerId: string;
  farmerName: string;
  phone: string;
  district: string;
  upiOrBank: string;
  acceptedKg: number;
  gradeFactor: number;
  gradeFactorReason: string;
  allocatedLogistics: number;
  allocatedStorage: number;
  deductions: PoolContractDeduction[];
  incentives: PoolIncentive[];
  preAdjustmentNet: number;
  finalPayout: number;
  payoutStatus: 'settled' | 'escrow_ready' | 'simulated';
  payoutRef?: string;
}

export interface PoolSettlementBatch {
  id: string;
  title: string;
  crop: CropType;
  variety: string;
  fpoName: string;
  buyerName: string;
  finalPoolUnitPrice: number; // in ₹/kg
  totalAcceptedKg: number;
  totalLogisticsCost: number;
  unitLogisticsCost: number; // in ₹/kg
  totalStorageCost: number;
  unitStorageCost: number; // in ₹/kg
  status: 'before_lock' | 'settled' | 'in_verification';
  createdAt: string;
  settlementDate?: string;
  participants: FarmerPoolParticipant[];
  contractId: string;
  escrowTotalAmount: number;
}

// ==========================================
// 7-STAGE FPO CROP AGGREGATION & POOLING SYSTEM
// ==========================================

export interface AggregationLotPassport {
  lotId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  village: string;
  district: string;
  crop: CropType;
  variety: string;
  harvestDate: string;
  quantityQuintals: number;
  quantityKg: number;
  declaredGrade: CropGrade;
  declaredMoisture: number;
  declaredForeignMatter: number;
  gpsLocation: { lat: number; lng: number; address: string };
  expectedPickupDate: string;
  farmerConsentGiven: boolean;
  farmerConsentTimestamp: string;
  qrCodeData: string;
  photos: string[];
  testReportAttached?: {
    labName: string;
    reportNo: string;
    testDate: string;
    accreditationType: 'FSSAI_Notified' | 'ICAR_Accredited' | 'NABL_Certified';
    parameters: Array<{ name: string; value: string; standardLimit: string; pass: boolean }>;
    certificateUrl?: string;
  };
  fieldChecklist?: {
    weighedKg: number;
    weighmentSlipNo: string;
    visualInspectionOk: boolean;
    foreignMatterObserved: number;
    inspectorAgent: string;
    checkedAt: string;
  };
  labAssaying?: {
    sampleId: string;
    chainOfCustodyTracking: string;
    labName: string;
    accreditationType: 'FSSAI_Notified' | 'ICAR_Accredited' | 'NABL_Certified';
    testDate: string;
    measuredMoisture: number;
    measuredDefect: number;
    aflatoxinLevelPpb?: number;
    oilContentPercent?: number;
    decision: 'PASSED' | 'CONDITIONAL_ACCEPT' | 'REJECTED';
    gradeAssigned: CropGrade;
    gradeFactor: number;
    deductionReason?: string;
    deductionPercent?: number;
    reportLink: string;
  };
  status: 'registered' | 'verified_field' | 'lab_tested' | 'pooled' | 'dispatched' | 'settled' | 'withdrawn';
}

export interface BuyerDemandBid {
  bidId: string;
  buyerId: string;
  buyerName: string;
  companyName: string;
  gstin: string;
  kycStatus: 'e_nam_verified' | 'gst_verified' | 'pending';
  crop: CropType;
  gradeRequested: CropGrade;
  offeredPricePerQuintal: number;
  offeredPricePerKg: number;
  quantityRequiredQuintals: number;
  deliveryCondition: 'Ex-FPO Hub' | 'CIF Buyer Mandi' | 'FOB Port';
  paymentTerms: '100% RBI Escrow' | '30% Advance + 70% T+1 Delivery' | 'Post-delivery 15 Days Credit';
  paymentSecurityType: 'escrow_locked' | 'bank_guarantee' | 'unsecured';
  inspectionRules: string;
  historicalDisputeRate: number; // percentage
  onTimePaymentScore: number; // 0-100
  expectedRejectionRisk: number; // percentage
  distanceKm: number;
  explainableScore: {
    totalScore: number;
    netRealisationScore: number;
    buyerVerificationScore: number;
    paymentSecurityScore: number;
    deliveryFeasibilityScore: number;
    rejectionRiskScore: number;
    rank: number;
    rankingRationale: string;
  };
}

export interface DigitalPoolContract {
  contractNumber: string;
  poolId: string;
  fpoName: string;
  buyerName: string;
  executedAt: string;
  pricingFormula: string;
  lockedUnitPricePerKg: number;
  agreedTotalKg: number;
  totalContractValue: number;
  gradeToleranceClause: string;
  samplingStandard: string;
  weighmentSource: string;
  deductionSchedule: Array<{ condition: string; penaltyPercent: number; rupeeImpactEstimate: number }>;
  pickupWindow: { start: string; end: string };
  deliveryWindow: { start: string; end: string };
  cancellationPenaltyClause: string;
  paymentMilestones: Array<{ milestone: string; percent: number; status: 'pending' | 'escrowed' | 'released' }>;
  disputeProcess: string;
  contractHash: string;
}

export interface PoolDispatchManifest {
  manifestId: string;
  poolId: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  originHub: string;
  destinationLocation: string;
  originWeighment: { grossKg: number; tareKg: number; netKg: number; slipNo: string; timestamp: string };
  destinationWeighment?: { grossKg: number; tareKg: number; netKg: number; slipNo: string; timestamp: string };
  transitShrinkageKg?: number;
  shrinkagePercent?: number;
  allowableShrinkageLimit: number;
  scannedLotIds: string[];
  dispatchPhotos: string[];
  status: 'loaded' | 'in_transit' | 'delivered' | 'stored';
}

export interface WdraWarehouseReceipt {
  eNwrNumber: string;
  repositoryName: 'NeRL' | 'CCRL';
  warehouseName: string;
  wdraRegistrationNo: string;
  storageHubLocation: string;
  checkInTimestamp: string;
  storedQuantityQuintals: number;
  storedQuantityKg: number;
  pledgeableCollateralValue: number;
  commodityGradeAssigned: string;
  validUntil: string;
  insurancePolicyNo: string;
  warehouseManagerSignature: string;
}

export interface AggregatedCropPool {
  id: string;
  code: string;
  title: string;
  fpoName: string;
  fpoRegistrationNo: string;
  crop: CropType;
  variety: string;
  targetGrade: CropGrade;
  targetQuantityQuintals: number;
  currentQuantityQuintals: number;
  collectionRadiusKm: number;
  hubLocation: string;
  cutoffDate: string;
  destinationHub: string;
  moistureToleranceMax: number;
  defectToleranceMax: number;
  costAllocationRule: string;
  status: 'open' | 'locked' | 'contracted' | 'in_transit' | 'stored_enwr' | 'settled';
  lockedAt?: string;
  lots: AggregationLotPassport[];
  buyerDemandOffers: BuyerDemandBid[];
  selectedBidId?: string;
  contract?: DigitalPoolContract;
  dispatchManifest?: PoolDispatchManifest;
  warehouseReceipt?: WdraWarehouseReceipt;
  settlementBatch?: PoolSettlementBatch;
}

export interface InsufficientBalanceDialogData {
  isOpen: boolean;
  transactionTitle: string;
  transactionType?: 'trade_deal' | 'transport_fare' | 'escrow_lock' | 'general';
  requiredAmount: number;
  currentBalance: number;
  shortfall: number;
  payerName?: string;
  payerRole?: string;
  payerId?: string;
  crop?: string;
  quantityQuintals?: number;
  offerId?: string;
  onRetry?: () => void;
}

