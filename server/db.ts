import fs from 'fs';
import path from 'path';
import { 
  User, 
  CropLot, 
  Offer, 
  Transporter, 
  CropType, 
  CropGrade, 
  PartyBalanceImpact, 
  BalanceChangeRecord,
  LotTransactionEvent,
  LotEventType,
  LotWithHistory,
  UserRole
} from '../src/types';

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
  formalitiesList?: Array<{ id: string; label: string; completed: boolean; completedAt?: string; verifiedBy?: string }>;
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

export interface DatabaseSchema {
  users: User[];
  transactions: TransactionRecord[];
  lots: CropLot[];
  offers: Offer[];
  transporters: Transporter[];
  transportBookings: TransportBooking[];
  balanceChanges: BalanceChangeRecord[];
  lotEvents: LotTransactionEvent[];
  version: string;
  lastUpdated: string;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'fasalflow_db.json');

// Initial seed data
const SEED_USERS: User[] = [
  {
    id: 'user-farmer-1',
    name: 'Ramesh Patil',
    phone: '+91 98221 45678',
    email: 'ramesh.patil@fasalflow.in',
    role: 'farmer',
    district: 'Osmanabad',
    state: 'Maharashtra',
    village: 'Dhoki',
    isKycVerified: true,
    rating: 4.8,
    memberSince: 'March 2024',
    trustScore: 94,
    freeTransactionAvailable: true,
    upiId: 'ramesh.patil@sbi',
    bankAccountNumber: '34892019382',
    ifscCode: 'SBIN0001234',
    bankName: 'State Bank of India',
    walletBalance: 321750,
  },
  {
    id: 'user-buyer-1',
    name: 'Shree Ganesh Agro Processing',
    phone: '+91 94220 88990',
    email: 'procurement@ganeshagro.com',
    role: 'buyer',
    district: 'Latur',
    state: 'Maharashtra',
    village: 'MIDC Latur',
    isKycVerified: true,
    rating: 4.9,
    memberSince: 'January 2024',
    trustScore: 98,
    upiId: 'ganeshagro@icici',
    bankAccountNumber: '918230192847',
    ifscCode: 'ICIC0000412',
    bankName: 'ICICI Bank Latur',
    walletBalance: 1250000,
  },
  {
    id: 'user-fpo-1',
    name: 'Marathwada Krishi Vikas FPO',
    phone: '+91 98811 22334',
    email: 'info@krishivikasfpo.org',
    role: 'fpo',
    district: 'Solapur',
    state: 'Maharashtra',
    village: 'Barshi',
    isKycVerified: true,
    rating: 4.7,
    memberSince: 'Feb 2024',
    trustScore: 92,
    upiId: 'krishivikas@hdfcbank',
    bankAccountNumber: '501002394819',
    ifscCode: 'HDFC0001890',
    bankName: 'HDFC Bank Solapur',
    walletBalance: 780000,
  },
  {
    id: 'user-farmer-2',
    name: 'Dnyaneshwar Shinde',
    phone: '+91 97654 32109',
    email: 'dnyaneshwar.shinde@fasalflow.in',
    role: 'farmer',
    district: 'Nashik',
    state: 'Maharashtra',
    village: 'Lasalgaon',
    isKycVerified: true,
    rating: 4.6,
    memberSince: 'April 2024',
    trustScore: 91,
    upiId: 'shinde.farm@ybl',
    bankAccountNumber: '20194839201',
    ifscCode: 'MAHB0000214',
    bankName: 'Bank of Maharashtra',
    walletBalance: 480000,
  },
];

const SEED_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'TXN-2026-9812',
    type: 'trade_deal',
    status: 'completed',
    amount: 1248000,
    lotId: 'lot-102',
    crop: 'Tur',
    quantityQuintals: 120,
    pricePerQuintal: 10400,
    sellerId: 'user-fpo-1',
    sellerName: 'Marathwada Krishi Vikas FPO',
    buyerId: 'user-buyer-1',
    buyerName: 'Shree Ganesh Agro Processing',
    transporterId: 'trans-2',
    transporterName: 'Maratha Freight Carriers',
    platformFee: 24960, // 2% flat
    farmerPayout: 1235520, // 99%
    buyerTotal: 1260480, // 101%
    paymentMethod: 'Escrow Net Banking (e-NAM Clearing)',
    paymentRef: 'UPI-REF-902183920192',
    invoiceNumber: 'INV-MH-2026-0089',
    createdAt: '2026-09-03T08:30:00Z',
    completedAt: '2026-09-04T16:45:00Z',
    notes: 'Full payment released after moisture & purity verification at Latur warehouse.',
    pickupDistrict: 'Solapur',
    dropDistrict: 'Latur',
    balanceImpact: {
      buyer: {
        userId: 'user-buyer-1',
        userName: 'Shree Ganesh Agro Processing',
        previousBalance: 2510480,
        change: -1260480,
        newBalance: 1250000,
        status: 'debited',
        timestamp: '2026-09-03T08:30:00Z',
      },
      seller: {
        userId: 'user-fpo-1',
        userName: 'Marathwada Krishi Vikas FPO',
        previousBalance: 0,
        change: 1235520,
        newBalance: 780000,
        status: 'credited',
        timestamp: '2026-09-04T16:45:00Z',
      },
      transporter: {
        userId: 'trans-2',
        userName: 'Maratha Freight Carriers',
        previousBalance: 45000,
        change: 3250,
        newBalance: 48250,
        status: 'credited',
        timestamp: '2026-09-04T16:45:00Z',
      },
    },
  },
  {
    id: 'TXN-2026-9824',
    type: 'trade_deal',
    status: 'escrow_locked',
    amount: 318500,
    lotId: 'lot-101',
    crop: 'Soybean',
    quantityQuintals: 65,
    pricePerQuintal: 4900,
    sellerId: 'user-farmer-1',
    sellerName: 'Ramesh Patil',
    buyerId: 'user-buyer-1',
    buyerName: 'Shree Ganesh Agro Processing',
    transporterId: 'trans-1',
    transporterName: 'Balaji Rural Logistics & Transport',
    platformFee: 6370,
    farmerPayout: 315315,
    buyerTotal: 321685,
    paymentMethod: 'e-NAM RTGS Escrow (Payment Clearing)',
    paymentRef: 'UPI-REF-981029384756',
    invoiceNumber: 'INV-MH-2026-0094',
    createdAt: '2026-09-12T14:10:00Z',
    notes: 'Buyer deposited 100% amount. Quality & Weighbridge formalities completed. RTGS Bank Clearing in progress.',
    pickupDistrict: 'Osmanabad',
    dropDistrict: 'Latur',
    paymentStatus: 'in_progress',
    paymentProgressNotes: 'e-NAM RTGS Clearing Ref #RTGS-MHA-98214 in progress. Produce haulage authorized.',
    clearingBankRef: 'RTGS-eNAM-MHA-98214',
    estimatedSettlementTime: '15 Mins (e-NAM Bank Pipeline)',
    formalitiesCompleted: true,
    formalitiesList: [
      { id: 'quality_assay', label: 'Lab Quality Assay & Moisture Inspection Certificate (<10% Moisture)', completed: true, completedAt: '14:15 PM', verifiedBy: 'APMC Grader #402' },
      { id: 'weighbridge_slip', label: 'Certified Weighbridge Scale Gate Slip & Quantity Audit', completed: true, completedAt: '14:22 PM', verifiedBy: 'Digital Scale #2' },
      { id: 'enam_contract', label: 'Digital e-NAM Sales Agreement & Direct Farmer Contract', completed: true, completedAt: '14:30 PM', verifiedBy: 'e-NAM Gateway' },
      { id: 'gate_pass', label: 'Produce Dispatch Gate Pass & Haulage Waybill', completed: true, completedAt: '14:35 PM', verifiedBy: 'Gate Inspector' },
    ],
    balanceImpact: {
      buyer: {
        userId: 'user-buyer-1',
        userName: 'Shree Ganesh Agro Processing',
        previousBalance: 1571685,
        change: -321685,
        newBalance: 1250000,
        status: 'debited',
        timestamp: '2026-09-12T14:10:00Z',
      },
      seller: {
        userId: 'user-farmer-1',
        userName: 'Ramesh Patil',
        previousBalance: 321750,
        change: 315315,
        newBalance: 637065,
        status: 'pending_escrow',
        timestamp: '2026-09-12T14:10:00Z',
      },
    },
  },
  {
    id: 'TXN-2026-9790',
    type: 'transport_fare',
    status: 'completed',
    amount: 3250,
    lotId: 'lot-102',
    crop: 'Tur',
    quantityQuintals: 120,
    sellerId: 'user-fpo-1',
    sellerName: 'Marathwada Krishi Vikas FPO',
    buyerId: 'user-buyer-1',
    buyerName: 'Shree Ganesh Agro Processing',
    transporterId: 'trans-2',
    transporterName: 'Maratha Freight Carriers',
    platformFee: 0,
    farmerPayout: 3250,
    buyerTotal: 3250,
    paymentMethod: 'Instant Fastag / Fuel Payout',
    paymentRef: 'TRN-REF-4829103948',
    invoiceNumber: 'INV-TR-2026-0038',
    createdAt: '2026-09-03T09:00:00Z',
    completedAt: '2026-09-04T12:00:00Z',
    notes: 'Haulage 75 km from Barshi to Latur APMC Yard.',
    balanceImpact: {
      buyer: {
        userId: 'user-buyer-1',
        userName: 'Shree Ganesh Agro Processing',
        previousBalance: 1253250,
        change: -3250,
        newBalance: 1250000,
        status: 'debited',
        timestamp: '2026-09-03T09:00:00Z',
      },
      transporter: {
        userId: 'trans-2',
        userName: 'Maratha Freight Carriers',
        previousBalance: 41750,
        change: 3250,
        newBalance: 45000,
        status: 'credited',
        timestamp: '2026-09-04T12:00:00Z',
      },
    },
  },
];

const SEED_BALANCE_CHANGES: BalanceChangeRecord[] = [
  {
    id: 'BAL-2026-003',
    transactionId: 'TXN-2026-9824',
    userId: 'user-buyer-1',
    userName: 'Shree Ganesh Agro Processing',
    userRole: 'buyer',
    counterpartyId: 'user-farmer-1',
    counterpartyName: 'Ramesh Patil',
    type: 'escrow_lock',
    amount: -321685,
    previousBalance: 1571685,
    newBalance: 1250000,
    description: '100% Escrow deposit locked for Soybean 65q from Ramesh Patil',
    crop: 'Soybean',
    invoiceNumber: 'INV-MH-2026-0094',
    createdAt: '2026-09-12T14:10:00Z',
  },
  {
    id: 'BAL-2026-002',
    transactionId: 'TXN-2026-9812',
    userId: 'user-fpo-1',
    userName: 'Marathwada Krishi Vikas FPO',
    userRole: 'fpo',
    counterpartyId: 'user-buyer-1',
    counterpartyName: 'Shree Ganesh Agro Processing',
    type: 'payout',
    amount: 1235520,
    previousBalance: 0,
    newBalance: 780000,
    description: 'Escrow payout credited for Tur 120q pool deal after moisture verification',
    crop: 'Tur',
    invoiceNumber: 'INV-MH-2026-0089',
    createdAt: '2026-09-04T16:45:00Z',
  },
  {
    id: 'BAL-2026-001',
    transactionId: 'TXN-2026-9812',
    userId: 'user-buyer-1',
    userName: 'Shree Ganesh Agro Processing',
    userRole: 'buyer',
    counterpartyId: 'user-fpo-1',
    counterpartyName: 'Marathwada Krishi Vikas FPO',
    type: 'debit',
    amount: -1260480,
    previousBalance: 2510480,
    newBalance: 1250000,
    description: 'Payment debited for Tur 120q trade deal (INV-MH-2026-0089)',
    crop: 'Tur',
    invoiceNumber: 'INV-MH-2026-0089',
    createdAt: '2026-09-03T08:30:00Z',
  },
];

const SEED_LOTS: CropLot[] = [
  {
    id: 'lot-101',
    sellerId: 'user-farmer-1',
    sellerName: 'Ramesh Patil',
    sellerDistrict: 'Osmanabad',
    sellerPhone: '+91 98221 45678',
    sellerRating: 4.8,
    sellerIsKyc: true,
    crop: 'Soybean',
    variety: 'JS-335 (Yellow Bold)',
    grade: 'Grade A',
    quantityQuintals: 65,
    askingPricePerQuintal: 4950,
    baseTotal: 321750,
    harvestDate: '2026-08-28',
    photos: [
      'https://images.unsplash.com/photo-1599583718211-09439fcf499f?auto=format&fit=crop&q=80&w=800',
    ],
    status: 'active',
    moisturePercent: 10.1,
    purityPercent: 98.6,
    defectPercent: 1.2,
    aiNotes: 'Graded Grade A: Clean yellow luster, minimal foreign matter, under 11% moisture.',
    createdAt: '2026-09-01T10:30:00Z',
    offersCount: 2,
    bestOfferPrice: 4900,
    lat: 18.1856,
    lng: 76.0423,
  },
  {
    id: 'lot-102',
    sellerId: 'user-fpo-1',
    sellerName: 'Marathwada Krishi Vikas FPO',
    sellerDistrict: 'Solapur',
    sellerPhone: '+91 98811 22334',
    sellerRating: 4.7,
    sellerIsKyc: true,
    crop: 'Tur',
    variety: 'BSMR-736 (Maruti)',
    grade: 'Grade A',
    quantityQuintals: 120,
    askingPricePerQuintal: 10500,
    baseTotal: 1260000,
    harvestDate: '2026-08-20',
    photos: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    ],
    status: 'sold',
    moisturePercent: 9.8,
    purityPercent: 99.1,
    defectPercent: 0.8,
    aiNotes: 'Certified Grade A Pulses: Large uniform grain size, excellent milling ratio.',
    createdAt: '2026-09-02T14:15:00Z',
    offersCount: 3,
    bestOfferPrice: 10400,
    lat: 17.6599,
    lng: 75.9064,
  },
  {
    id: 'lot-103',
    sellerId: 'user-farmer-2',
    sellerName: 'Dnyaneshwar Shinde',
    sellerDistrict: 'Nashik',
    sellerPhone: '+91 97654 32109',
    sellerRating: 4.6,
    sellerIsKyc: true,
    crop: 'Onion',
    variety: 'Nashik Red Garwa',
    grade: 'Grade A',
    quantityQuintals: 200,
    askingPricePerQuintal: 2400,
    baseTotal: 480000,
    harvestDate: '2026-09-03',
    photos: [
      'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800',
    ],
    status: 'active',
    moisturePercent: 12.5,
    purityPercent: 97.8,
    defectPercent: 1.8,
    aiNotes: 'Graded Grade A: Firm bulbs, dry skins, ideal for storage or transit.',
    createdAt: '2026-09-04T09:00:00Z',
    offersCount: 1,
    bestOfferPrice: 2350,
    lat: 20.0063,
    lng: 73.7903,
  },
  {
    id: 'lot-104',
    sellerId: 'user-farmer-3',
    sellerName: 'Vikram Deshmukh',
    sellerDistrict: 'Jalgaon',
    sellerPhone: '+91 99231 66554',
    sellerRating: 4.9,
    sellerIsKyc: true,
    crop: 'Cotton',
    variety: 'Bt Cotton Long Staple',
    grade: 'Grade A',
    quantityQuintals: 80,
    askingPricePerQuintal: 7500,
    baseTotal: 600000,
    harvestDate: '2026-08-30',
    photos: [
      'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&q=80&w=800',
    ],
    status: 'active',
    moisturePercent: 8.4,
    purityPercent: 99.4,
    defectPercent: 0.5,
    aiNotes: 'Grade A Ginning Ready: 29mm staple length, low trash content.',
    createdAt: '2026-09-05T11:45:00Z',
    offersCount: 4,
    bestOfferPrice: 7450,
    lat: 21.0077,
    lng: 75.5626,
  },
];

const SEED_OFFERS: Offer[] = [
  {
    id: 'offer-1',
    lotId: 'lot-101',
    crop: 'Soybean',
    buyerId: 'user-buyer-1',
    buyerName: 'Shree Ganesh Agro Processing',
    buyerDistrict: 'Latur',
    buyerPhone: '+91 94220 88990',
    offeredPricePerQuintal: 4900,
    quantityQuintals: 65,
    totalAmount: 318500,
    status: 'pending',
    createdAt: '2026-09-02T11:00:00Z',
    notes: 'Can arrange farm gate pickup within 24 hours of confirmation.',
  },
  {
    id: 'offer-2',
    lotId: 'lot-101',
    crop: 'Soybean',
    buyerId: 'user-buyer-2',
    buyerName: 'Kisan Solvent Extractions',
    buyerDistrict: 'Solapur',
    buyerPhone: '+91 98230 11223',
    offeredPricePerQuintal: 4850,
    quantityQuintals: 65,
    totalAmount: 315250,
    status: 'pending',
    createdAt: '2026-09-02T13:30:00Z',
  },
  {
    id: 'offer-3',
    lotId: 'lot-102',
    crop: 'Tur',
    buyerId: 'user-buyer-1',
    buyerName: 'Shree Ganesh Agro Processing',
    buyerDistrict: 'Latur',
    buyerPhone: '+91 94220 88990',
    offeredPricePerQuintal: 10400,
    quantityQuintals: 120,
    totalAmount: 1248000,
    status: 'accepted',
    createdAt: '2026-09-03T08:00:00Z',
  },
];

const SEED_TRANSPORTERS: Transporter[] = [
  {
    id: 'trans-1',
    name: 'Balaji Rural Logistics & Transport',
    phone: '+91 98224 55667',
    district: 'Osmanabad',
    vehicleType: 'Small Truck (1-3 tons)',
    capacityTons: 3,
    baseFare: 1200,
    ratePerKm: 28,
    rating: 4.8,
    completedTrips: 142,
    isAvailable: true,
    lat: 18.1856,
    lng: 76.0423,
  },
  {
    id: 'trans-2',
    name: 'Maratha Freight Carriers',
    phone: '+91 94221 33445',
    district: 'Latur',
    vehicleType: 'Large Truck (3-10 tons)',
    capacityTons: 9,
    baseFare: 2500,
    ratePerKm: 42,
    rating: 4.9,
    completedTrips: 310,
    isAvailable: true,
    lat: 18.4088,
    lng: 76.5604,
  },
  {
    id: 'trans-3',
    name: 'Shivaji Agri Express',
    phone: '+91 97650 99887',
    district: 'Solapur',
    vehicleType: 'Mini Truck (up to 1 ton)',
    capacityTons: 1.2,
    baseFare: 650,
    ratePerKm: 18,
    rating: 4.7,
    completedTrips: 89,
    isAvailable: true,
    lat: 17.6599,
    lng: 75.9064,
  },
  {
    id: 'trans-4',
    name: 'Sahyadri Reefer & Heavy Transport',
    phone: '+91 98810 77665',
    district: 'Nashik',
    vehicleType: 'Container (10+ tons)',
    capacityTons: 16,
    baseFare: 5500,
    ratePerKm: 65,
    rating: 4.9,
    completedTrips: 520,
    isAvailable: true,
    lat: 20.0063,
    lng: 73.7903,
  },
];

const SEED_LOT_EVENTS: LotTransactionEvent[] = [
  // LOT 101 - Soybean (Ramesh Patil)
  {
    id: 'LOT-EVT-101-06',
    lotId: 'lot-101',
    transactionId: 'TXN-2026-9824',
    eventType: 'quality_verified',
    title: 'Farmgate Quality & Moisture Verification',
    description: 'Independent assayer certified Grade A specification: 10.1% moisture, 98.6% purity, 1.2% defects. Batch cleared for logistics handover.',
    actorId: 'system',
    actorName: 'FasalFlow Quality Assayer',
    actorRole: 'system',
    metadata: {
      moisturePercent: 10.1,
      grade: 'Grade A',
      location: 'Dhoki Village, Osmanabad',
      invoiceNumber: 'INV-MH-2026-0094',
    },
    timestamp: '2026-09-12T16:00:00Z',
  },
  {
    id: 'LOT-EVT-101-05',
    lotId: 'lot-101',
    transactionId: 'TXN-2026-9824',
    eventType: 'escrow_locked',
    title: '100% Escrow Secured in Vault: ₹3,21,685',
    description: 'Buyer deposited ₹3,21,685 in e-NAM UPI Escrow Vault. Farmer guaranteed net payout of ₹3,15,315 locked under Invoice #INV-MH-2026-0094.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-farmer-1',
    counterpartyName: 'Ramesh Patil',
    amount: 321685,
    quantityQuintals: 65,
    pricePerQuintal: 4900,
    balanceImpactSummary: 'Buyer Wallet debited: -₹3,21,685; Farmer pending escrow: +₹3,15,315',
    metadata: {
      invoiceNumber: 'INV-MH-2026-0094',
      paymentRef: 'UPI-REF-981029384756',
    },
    timestamp: '2026-09-12T14:10:00Z',
  },
  {
    id: 'LOT-EVT-101-04',
    lotId: 'lot-101',
    offerId: 'offer-1',
    eventType: 'offer_accepted',
    title: 'Deal Accepted & Locked at ₹4,900/q',
    description: 'Ramesh Patil accepted purchase offer from Shree Ganesh Agro Processing for all 65 quintals at ₹4,900/q (₹3,18,500 total).',
    actorId: 'user-farmer-1',
    actorName: 'Ramesh Patil',
    actorRole: 'farmer',
    counterpartyId: 'user-buyer-1',
    counterpartyName: 'Shree Ganesh Agro Processing',
    amount: 318500,
    quantityQuintals: 65,
    pricePerQuintal: 4900,
    previousLotStatus: 'active',
    newLotStatus: 'negotiation',
    timestamp: '2026-09-12T14:05:00Z',
  },
  {
    id: 'LOT-EVT-101-03',
    lotId: 'lot-101',
    offerId: 'offer-2',
    eventType: 'offer_received',
    title: 'Bid Placed by Kisan Solvent: ₹4,850/q',
    description: 'Kisan Solvent Extractions submitted a bid for 65 quintals totaling ₹3,15,250.',
    actorId: 'user-buyer-2',
    actorName: 'Kisan Solvent Extractions',
    actorRole: 'buyer',
    counterpartyId: 'user-farmer-1',
    counterpartyName: 'Ramesh Patil',
    amount: 315250,
    quantityQuintals: 65,
    pricePerQuintal: 4850,
    timestamp: '2026-09-02T13:30:00Z',
  },
  {
    id: 'LOT-EVT-101-02',
    lotId: 'lot-101',
    offerId: 'offer-1',
    eventType: 'offer_received',
    title: 'Bid Placed by Shree Ganesh Agro: ₹4,900/q',
    description: 'Shree Ganesh Agro Processing submitted a bid for 65 quintals totaling ₹3,18,500 with farmgate pickup note.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-farmer-1',
    counterpartyName: 'Ramesh Patil',
    amount: 318500,
    quantityQuintals: 65,
    pricePerQuintal: 4900,
    timestamp: '2026-09-02T11:00:00Z',
  },
  {
    id: 'LOT-EVT-101-01',
    lotId: 'lot-101',
    eventType: 'lot_created',
    title: 'Harvest Lot Published: Soybean JS-335',
    description: 'Ramesh Patil listed 65 quintals of Yellow Bold Soybean at asking price of ₹4,950/q. AI assay certified Grade A quality.',
    actorId: 'user-farmer-1',
    actorName: 'Ramesh Patil',
    actorRole: 'farmer',
    amount: 321750,
    quantityQuintals: 65,
    pricePerQuintal: 4950,
    newLotStatus: 'active',
    metadata: {
      grade: 'Grade A',
      moisturePercent: 10.1,
      location: 'Osmanabad, Maharashtra',
    },
    timestamp: '2026-09-01T10:30:00Z',
  },

  // LOT 102 - Tur (Marathwada Krishi Vikas FPO) - COMPLETED / SETTLED DEAL
  {
    id: 'LOT-EVT-102-08',
    lotId: 'lot-102',
    transactionId: 'TXN-2026-9812',
    eventType: 'escrow_released',
    title: 'Escrow Settlement Released: ₹12,35,520',
    description: 'Full net escrow payout of ₹12,35,520 credited to Marathwada Krishi Vikas FPO wallet after buyer quality sign-off. Deal completed successfully.',
    actorId: 'system',
    actorName: 'FasalFlow Escrow Engine',
    actorRole: 'system',
    counterpartyId: 'user-fpo-1',
    counterpartyName: 'Marathwada Krishi Vikas FPO',
    amount: 1235520,
    balanceImpactSummary: 'FPO Wallet credited: +₹12,35,520; Transporter credited: +₹3,250',
    metadata: {
      invoiceNumber: 'INV-MH-2026-0089',
    },
    timestamp: '2026-09-04T16:45:00Z',
  },
  {
    id: 'LOT-EVT-102-07',
    lotId: 'lot-102',
    transactionId: 'TXN-2026-9812',
    eventType: 'quality_verified',
    title: 'Dock Delivery & Quality Verification Approved',
    description: '120 quintals weighed at Latur Dal Mill weighbridge. Lab analysis: 9.8% moisture, 99.1% purity. Buyer approved final release.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-fpo-1',
    counterpartyName: 'Marathwada Krishi Vikas FPO',
    metadata: {
      moisturePercent: 9.8,
      grade: 'Grade A',
      location: 'Latur Industrial Area APMC Yard',
      invoiceNumber: 'INV-MH-2026-0089',
    },
    timestamp: '2026-09-04T14:00:00Z',
  },
  {
    id: 'LOT-EVT-102-06',
    lotId: 'lot-102',
    transactionId: 'TXN-2026-9812',
    eventType: 'dispatched_in_transit',
    title: 'Produce Dispatched & In-Transit',
    description: 'Produce loaded onto Maratha Freight Carriers truck (MH-14-AZ-9988) at Solapur FPO center. e-Waybill generated, GPS tracking active.',
    actorId: 'trans-2',
    actorName: 'Maratha Freight Carriers',
    actorRole: 'transporter',
    quantityQuintals: 120,
    metadata: {
      driverPhone: '+91 94221 33445',
      transporterName: 'Maratha Freight Carriers',
      invoiceNumber: 'INV-MH-2026-0089',
    },
    timestamp: '2026-09-03T11:00:00Z',
  },
  {
    id: 'LOT-EVT-102-05',
    lotId: 'lot-102',
    transactionId: 'TXN-2026-9790',
    eventType: 'transport_assigned',
    title: 'Haulage Truck Booked: Maratha Freight Carriers',
    description: 'Freight haulage booked for 120 quintals from Barshi / Solapur to Latur (75 km). Fare: ₹3,250.',
    actorId: 'trans-2',
    actorName: 'Maratha Freight Carriers',
    actorRole: 'transporter',
    amount: 3250,
    metadata: {
      invoiceNumber: 'INV-TR-2026-0038',
      driverPhone: '+91 94221 33445',
      transporterName: 'Maratha Freight Carriers',
    },
    timestamp: '2026-09-03T09:00:00Z',
  },
  {
    id: 'LOT-EVT-102-04',
    lotId: 'lot-102',
    transactionId: 'TXN-2026-9812',
    eventType: 'escrow_locked',
    title: '100% Escrow Secured in Vault: ₹12,60,480',
    description: 'Buyer deposited ₹12,60,480 in e-NAM UPI Escrow Vault under Invoice #INV-MH-2026-0089. Net farmer/FPO payout ₹12,35,520 secured.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-fpo-1',
    counterpartyName: 'Marathwada Krishi Vikas FPO',
    amount: 1260480,
    quantityQuintals: 120,
    pricePerQuintal: 10400,
    balanceImpactSummary: 'Buyer debited -₹12,60,480; Escrow status locked',
    metadata: {
      invoiceNumber: 'INV-MH-2026-0089',
      paymentRef: 'UPI-REF-1092837465',
    },
    timestamp: '2026-09-03T08:30:00Z',
  },
  {
    id: 'LOT-EVT-102-03',
    lotId: 'lot-102',
    offerId: 'offer-3',
    eventType: 'offer_accepted',
    title: 'Deal Accepted & Locked at ₹10,400/q',
    description: 'FPO accepted offer from Shree Ganesh Agro Processing for 120 quintals at ₹10,400/q (₹12,48,000 total). Lot status marked SOLD.',
    actorId: 'user-fpo-1',
    actorName: 'Marathwada Krishi Vikas FPO',
    actorRole: 'fpo',
    counterpartyId: 'user-buyer-1',
    counterpartyName: 'Shree Ganesh Agro Processing',
    amount: 1248000,
    quantityQuintals: 120,
    pricePerQuintal: 10400,
    previousLotStatus: 'active',
    newLotStatus: 'sold',
    timestamp: '2026-09-03T08:20:00Z',
  },
  {
    id: 'LOT-EVT-102-02',
    lotId: 'lot-102',
    offerId: 'offer-3',
    eventType: 'offer_received',
    title: 'Bid Placed by Shree Ganesh Agro: ₹10,400/q',
    description: 'Shree Ganesh Agro Processing placed bid of ₹10,400/q for 120 quintals totaling ₹12,48,000.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-fpo-1',
    counterpartyName: 'Marathwada Krishi Vikas FPO',
    amount: 1248000,
    quantityQuintals: 120,
    pricePerQuintal: 10400,
    timestamp: '2026-09-03T08:00:00Z',
  },
  {
    id: 'LOT-EVT-102-01',
    lotId: 'lot-102',
    eventType: 'lot_created',
    title: 'Harvest Lot Published: Tur BSMR-736',
    description: 'Marathwada Krishi Vikas FPO listed 120 quintals of Tur at asking price of ₹10,500/q with certified Grade A assay.',
    actorId: 'user-fpo-1',
    actorName: 'Marathwada Krishi Vikas FPO',
    actorRole: 'fpo',
    amount: 1260000,
    quantityQuintals: 120,
    pricePerQuintal: 10500,
    newLotStatus: 'active',
    metadata: {
      grade: 'Grade A',
      moisturePercent: 9.8,
      location: 'Solapur, Maharashtra',
    },
    timestamp: '2026-09-02T14:15:00Z',
  },

  // LOT 103 - Onion (Dnyaneshwar Shinde)
  {
    id: 'LOT-EVT-103-02',
    lotId: 'lot-103',
    eventType: 'offer_received',
    title: 'Bid Received: ₹2,350/q',
    description: 'Wholesale merchant placed bid for 200 quintals at ₹2,350/q totaling ₹4,70,000.',
    actorId: 'user-buyer-2',
    actorName: 'Kisan Solvent Extractions',
    actorRole: 'buyer',
    counterpartyId: 'user-farmer-2',
    counterpartyName: 'Dnyaneshwar Shinde',
    amount: 470000,
    quantityQuintals: 200,
    pricePerQuintal: 2350,
    timestamp: '2026-09-05T10:00:00Z',
  },
  {
    id: 'LOT-EVT-103-01',
    lotId: 'lot-103',
    eventType: 'lot_created',
    title: 'Harvest Lot Published: Onion Nashik Red Garwa',
    description: 'Dnyaneshwar Shinde listed 200 quintals of export-grade Red Onion at ₹2,400/q.',
    actorId: 'user-farmer-2',
    actorName: 'Dnyaneshwar Shinde',
    actorRole: 'farmer',
    amount: 480000,
    quantityQuintals: 200,
    pricePerQuintal: 2400,
    newLotStatus: 'active',
    metadata: {
      grade: 'Grade A',
      moisturePercent: 12.5,
      location: 'Nashik, Maharashtra',
    },
    timestamp: '2026-09-04T09:00:00Z',
  },

  // LOT 104 - Cotton (Vikram Deshmukh)
  {
    id: 'LOT-EVT-104-02',
    lotId: 'lot-104',
    eventType: 'offer_received',
    title: 'Bid Received: ₹7,450/q',
    description: 'Local ginning mill placed bid for 80 quintals of Long Staple Bt Cotton at ₹7,450/q.',
    actorId: 'user-buyer-1',
    actorName: 'Shree Ganesh Agro Processing',
    actorRole: 'buyer',
    counterpartyId: 'user-farmer-3',
    counterpartyName: 'Vikram Deshmukh',
    amount: 596000,
    quantityQuintals: 80,
    pricePerQuintal: 7450,
    timestamp: '2026-09-06T14:20:00Z',
  },
  {
    id: 'LOT-EVT-104-01',
    lotId: 'lot-104',
    eventType: 'lot_created',
    title: 'Harvest Lot Published: Cotton Bt Long Staple',
    description: 'Vikram Deshmukh listed 80 quintals of 29mm staple length Cotton at ₹7,500/q.',
    actorId: 'user-farmer-3',
    actorName: 'Vikram Deshmukh',
    actorRole: 'farmer',
    amount: 600000,
    quantityQuintals: 80,
    pricePerQuintal: 7500,
    newLotStatus: 'active',
    metadata: {
      grade: 'Grade A',
      moisturePercent: 8.4,
      location: 'Jalgaon, Maharashtra',
    },
    timestamp: '2026-09-05T11:45:00Z',
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        console.log(`[Backend DB] Loaded database with ${parsed.users?.length || 0} users, ${parsed.lots?.length || 0} lots & ${parsed.transactions?.length || 0} transactions.`);
        return {
          users: parsed.users || SEED_USERS,
          transactions: parsed.transactions || SEED_TRANSACTIONS,
          lots: parsed.lots || SEED_LOTS,
          offers: parsed.offers || SEED_OFFERS,
          transporters: parsed.transporters || SEED_TRANSPORTERS,
          transportBookings: parsed.transportBookings || [],
          balanceChanges: parsed.balanceChanges && parsed.balanceChanges.length > 0 ? parsed.balanceChanges : SEED_BALANCE_CHANGES,
          lotEvents: parsed.lotEvents && parsed.lotEvents.length > 0 ? parsed.lotEvents : SEED_LOT_EVENTS,
          version: '1.1.0',
          lastUpdated: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.warn('[Backend DB] Error reading DB file, using fresh seed:', err.message);
    }

    const initial: DatabaseSchema = {
      users: SEED_USERS,
      transactions: SEED_TRANSACTIONS,
      lots: SEED_LOTS,
      offers: SEED_OFFERS,
      transporters: SEED_TRANSPORTERS,
      transportBookings: [],
      balanceChanges: SEED_BALANCE_CHANGES,
      lotEvents: SEED_LOT_EVENTS,
      version: '1.1.0',
      lastUpdated: new Date().toISOString(),
    };

    this.saveToDisk(initial);
    return initial;
  }

  private saveToDisk(dataToSave: DatabaseSchema = this.data): void {
    try {
      const dataDir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      dataToSave.lastUpdated = new Date().toISOString();
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err: any) {
      console.error('[Backend DB] Failed to save DB to disk:', err.message);
    }
  }

  // --- Users Operations ---
  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(userData: Partial<User> & { name: string; phone: string; role: User['role'] }): User {
    const newUser: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      phone: userData.phone,
      email: userData.email || '',
      role: userData.role,
      district: userData.district || 'Osmanabad',
      state: userData.state || 'Maharashtra',
      village: userData.village || '',
      isKycVerified: userData.isKycVerified ?? false,
      rating: userData.rating || 5.0,
      memberSince: userData.memberSince || 'Today',
      trustScore: userData.trustScore || 85,
      freeTransactionAvailable: userData.freeTransactionAvailable ?? true,
      upiId: userData.upiId || '',
      bankAccountNumber: userData.bankAccountNumber || '',
      ifscCode: userData.ifscCode || '',
      bankName: userData.bankName || '',
      walletBalance: userData.walletBalance || 0,
    };

    this.data.users.unshift(newUser);
    this.saveToDisk();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;

    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
    };
    this.saveToDisk();
    return this.data.users[index];
  }

  // --- Balance Ledger & Audit Operations ---
  public getBalanceChanges(filter?: { userId?: string; transactionId?: string }): BalanceChangeRecord[] {
    if (!this.data.balanceChanges) {
      this.data.balanceChanges = [...SEED_BALANCE_CHANGES];
    }
    let result = [...this.data.balanceChanges];

    if (filter?.userId) {
      result = result.filter(b => b.userId === filter.userId || b.counterpartyId === filter.userId);
    }
    if (filter?.transactionId) {
      result = result.filter(b => b.transactionId === filter.transactionId);
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public recordBalanceChange(change: Omit<BalanceChangeRecord, 'id' | 'createdAt'>): BalanceChangeRecord {
    if (!this.data.balanceChanges) {
      this.data.balanceChanges = [];
    }
    const newRecord: BalanceChangeRecord = {
      ...change,
      id: `BAL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.balanceChanges.unshift(newRecord);
    this.saveToDisk();
    return newRecord;
  }

  // --- Transactions Operations ---
  public getTransactions(filter?: {
    userId?: string;
    role?: string;
    type?: TransactionType;
    status?: TransactionStatus;
    lotId?: string;
  }): TransactionRecord[] {
    let result = [...this.data.transactions];

    if (filter?.lotId) {
      result = result.filter(t => t.lotId === filter.lotId);
    }
    if (filter?.userId) {
      result = result.filter(t => t.sellerId === filter.userId || t.buyerId === filter.userId || t.transporterId === filter.userId);
    }
    if (filter?.type) {
      result = result.filter(t => t.type === filter.type);
    }
    if (filter?.status) {
      result = result.filter(t => t.status === filter.status);
    }

    // Sort newest first
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getTransactionById(id: string): TransactionRecord | undefined {
    return this.data.transactions.find(t => t.id === id);
  }

  public createTransaction(txn: Omit<TransactionRecord, 'id' | 'createdAt' | 'invoiceNumber'> & { id?: string; createdAt?: string; invoiceNumber?: string; balanceImpact?: PartyBalanceImpact }): TransactionRecord {
    const nextSeq = this.data.transactions.length + 101;
    const txnId = txn.id || `TXN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoiceNumber = txn.invoiceNumber || `INV-MH-${new Date().getFullYear()}-${String(nextSeq).padStart(4, '0')}`;
    const createdAt = txn.createdAt || new Date().toISOString();
    const platformFee = txn.platformFee ?? Math.round(txn.amount * 0.02);
    const farmerPayout = txn.farmerPayout ?? Math.round(txn.amount * 0.99);
    const buyerTotal = txn.buyerTotal ?? Math.round(txn.amount * 1.01);

    const balanceImpact: PartyBalanceImpact = txn.balanceImpact ? { ...txn.balanceImpact } : {};

    // 1. Process Buyer Balance Change:
    // If status is 'escrow_locked' or 'completed', buyer funds are debited from their wallet
    const buyer = this.getUserById(txn.buyerId);
    if (buyer && (txn.status === 'escrow_locked' || txn.status === 'completed')) {
      const buyerPrev = buyer.walletBalance ?? 0;
      const buyerDebited = buyerTotal;

      if (buyerPrev < buyerDebited) {
        const shortfall = buyerDebited - buyerPrev;
        const err: any = new Error(
          `INSUFFICIENT_BALANCE: Buyer ${buyer.name} has wallet balance of ₹${buyerPrev.toLocaleString('en-IN')}, but transaction requires ₹${buyerDebited.toLocaleString('en-IN')}. Shortfall: ₹${shortfall.toLocaleString('en-IN')}.`
        );
        err.code = 'INSUFFICIENT_BALANCE';
        err.requiredAmount = buyerDebited;
        err.currentBalance = buyerPrev;
        err.shortfall = shortfall;
        err.userId = buyer.id;
        err.userName = buyer.name;
        err.userRole = buyer.role;
        throw err;
      }

      const buyerNew = buyerPrev - buyerDebited;
      buyer.walletBalance = buyerNew;

      balanceImpact.buyer = {
        userId: buyer.id,
        userName: buyer.name,
        previousBalance: buyerPrev,
        change: -buyerDebited,
        newBalance: buyerNew,
        status: 'debited',
        timestamp: createdAt,
      };

      this.recordBalanceChange({
        transactionId: txnId,
        userId: buyer.id,
        userName: buyer.name,
        userRole: buyer.role,
        counterpartyId: txn.sellerId,
        counterpartyName: txn.sellerName,
        type: txn.status === 'escrow_locked' ? 'escrow_lock' : 'debit',
        amount: -buyerDebited,
        previousBalance: buyerPrev,
        newBalance: buyerNew,
        description: txn.status === 'escrow_locked'
          ? `100% Escrow deposit locked for ${txn.quantityQuintals || ''}q ${txn.crop || 'produce'} (${invoiceNumber})`
          : `Payment debited for ${txn.quantityQuintals || ''}q ${txn.crop || 'produce'} (${invoiceNumber})`,
        crop: txn.crop,
        invoiceNumber,
      });
    }

    // 2. Process Seller Balance Change:
    // If completed immediately, credit seller. If escrow_locked, record pending escrow release
    const seller = this.getUserById(txn.sellerId);
    if (seller) {
      const sellerPrev = seller.walletBalance ?? 200000;
      if (txn.status === 'completed') {
        const sellerNew = sellerPrev + farmerPayout;
        seller.walletBalance = sellerNew;

        balanceImpact.seller = {
          userId: seller.id,
          userName: seller.name,
          previousBalance: sellerPrev,
          change: farmerPayout,
          newBalance: sellerNew,
          status: 'credited',
          timestamp: createdAt,
        };

        this.recordBalanceChange({
          transactionId: txnId,
          userId: seller.id,
          userName: seller.name,
          userRole: seller.role,
          counterpartyId: txn.buyerId,
          counterpartyName: txn.buyerName,
          type: 'payout',
          amount: farmerPayout,
          previousBalance: sellerPrev,
          newBalance: sellerNew,
          description: `Trade settlement payout credited for ${txn.quantityQuintals || ''}q ${txn.crop || 'produce'} (${invoiceNumber})`,
          crop: txn.crop,
          invoiceNumber,
        });
      } else {
        balanceImpact.seller = {
          userId: seller.id,
          userName: seller.name,
          previousBalance: sellerPrev,
          change: farmerPayout,
          newBalance: sellerPrev + farmerPayout,
          status: 'pending_escrow',
          timestamp: createdAt,
        };
      }
    }

    const newTxn: TransactionRecord = {
      ...txn,
      id: txnId,
      invoiceNumber,
      createdAt,
      platformFee,
      farmerPayout,
      buyerTotal,
      balanceImpact,
    };

    this.data.transactions.unshift(newTxn);
    this.saveToDisk();
    return newTxn;
  }

  public updateTransactionStatus(
    id: string, 
    status: TransactionStatus, 
    notes?: string,
    extraData?: {
      paymentStatus?: 'completed' | 'in_progress' | 'pending';
      paymentProgressNotes?: string;
      clearingBankRef?: string;
      estimatedSettlementTime?: string;
      formalitiesCompleted?: boolean;
      formalitiesList?: any[];
    }
  ): TransactionRecord | null {
    const txn = this.data.transactions.find(t => t.id === id);
    if (!txn) return null;

    const prevStatus = txn.status;
    txn.status = status;
    if (notes) txn.notes = notes;
    const now = new Date().toISOString();

    if (extraData) {
      if (extraData.paymentStatus) txn.paymentStatus = extraData.paymentStatus;
      if (extraData.paymentProgressNotes) txn.paymentProgressNotes = extraData.paymentProgressNotes;
      if (extraData.clearingBankRef) txn.clearingBankRef = extraData.clearingBankRef;
      if (extraData.estimatedSettlementTime) txn.estimatedSettlementTime = extraData.estimatedSettlementTime;
      if (extraData.formalitiesCompleted !== undefined) txn.formalitiesCompleted = extraData.formalitiesCompleted;
      if (extraData.formalitiesList) txn.formalitiesList = extraData.formalitiesList;
    }

    if (status === 'completed') {
      txn.paymentStatus = 'completed';
    } else if (status === 'in_transit' && !txn.paymentStatus) {
      txn.paymentStatus = 'in_progress';
    }

    if (status === 'completed' && !txn.completedAt) {
      txn.completedAt = now;
    }

    // IF STATUS CHANGED TO 'completed' (Escrow payout released to Seller!)
    if (status === 'completed' && prevStatus !== 'completed') {
      const seller = this.getUserById(txn.sellerId);
      if (seller) {
        const sellerPrev = seller.walletBalance ?? 0;
        const sellerNew = sellerPrev + txn.farmerPayout;
        seller.walletBalance = sellerNew;

        if (!txn.balanceImpact) txn.balanceImpact = {};
        txn.balanceImpact.seller = {
          userId: seller.id,
          userName: seller.name,
          previousBalance: sellerPrev,
          change: txn.farmerPayout,
          newBalance: sellerNew,
          status: 'credited',
          timestamp: now,
        };

        this.recordBalanceChange({
          transactionId: txn.id,
          userId: seller.id,
          userName: seller.name,
          userRole: seller.role,
          counterpartyId: txn.buyerId,
          counterpartyName: txn.buyerName,
          type: 'escrow_release',
          amount: txn.farmerPayout,
          previousBalance: sellerPrev,
          newBalance: sellerNew,
          description: `Escrow payout released to wallet for ${txn.quantityQuintals || ''}q ${txn.crop || 'produce'} (${txn.invoiceNumber})`,
          crop: txn.crop,
          invoiceNumber: txn.invoiceNumber,
        });
      }

      // If transporter involved, credit transporter
      if (txn.transporterId) {
        const transporter = this.getUserById(txn.transporterId);
        if (transporter) {
          const fare = 3250;
          const transPrev = transporter.walletBalance ?? 0;
          const transNew = transPrev + fare;
          transporter.walletBalance = transNew;

          if (!txn.balanceImpact) txn.balanceImpact = {};
          txn.balanceImpact.transporter = {
            userId: transporter.id,
            userName: transporter.name,
            previousBalance: transPrev,
            change: fare,
            newBalance: transNew,
            status: 'credited',
            timestamp: now,
          };

          this.recordBalanceChange({
            transactionId: txn.id,
            userId: transporter.id,
            userName: transporter.name,
            userRole: 'transporter',
            counterpartyId: txn.buyerId,
            counterpartyName: txn.buyerName,
            type: 'credit',
            amount: fare,
            previousBalance: transPrev,
            newBalance: transNew,
            description: `Freight haulage fee credited for trip ${txn.invoiceNumber}`,
            crop: txn.crop,
            invoiceNumber: txn.invoiceNumber,
          });
        }
      }
    }

    // IF STATUS CHANGED TO 'refunded' (100% Escrow refunded to Buyer)
    if (status === 'refunded' && prevStatus === 'escrow_locked') {
      const buyer = this.getUserById(txn.buyerId);
      if (buyer) {
        const buyerPrev = buyer.walletBalance ?? 0;
        const buyerNew = buyerPrev + txn.buyerTotal;
        buyer.walletBalance = buyerNew;

        if (!txn.balanceImpact) txn.balanceImpact = {};
        txn.balanceImpact.buyer = {
          userId: buyer.id,
          userName: buyer.name,
          previousBalance: buyerPrev,
          change: txn.buyerTotal,
          newBalance: buyerNew,
          status: 'refunded',
          timestamp: now,
        };

        this.recordBalanceChange({
          transactionId: txn.id,
          userId: buyer.id,
          userName: buyer.name,
          userRole: buyer.role,
          counterpartyId: txn.sellerId,
          counterpartyName: txn.sellerName,
          type: 'refund',
          amount: txn.buyerTotal,
          previousBalance: buyerPrev,
          newBalance: buyerNew,
          description: `Escrow refund credited back for ${txn.invoiceNumber} (Quality rejection / cancellation)`,
          crop: txn.crop,
          invoiceNumber: txn.invoiceNumber,
        });
      }
    }

    // Record lot lifecycle event if transaction is tied to a lot
    if (txn.lotId) {
      if (status === 'completed' && prevStatus !== 'completed') {
        this.recordLotEvent({
          lotId: txn.lotId,
          transactionId: txn.id,
          eventType: 'escrow_released',
          title: `Escrow Settlement Released to Farmer: ₹${txn.farmerPayout.toLocaleString('en-IN')}`,
          description: `Full net payout of ₹${txn.farmerPayout.toLocaleString('en-IN')} credited to ${txn.sellerName}'s wallet (${txn.invoiceNumber}). Quality sign-off confirmed.`,
          actorId: 'system',
          actorName: 'FasalFlow Escrow Engine',
          actorRole: 'system',
          counterpartyId: txn.sellerId,
          counterpartyName: txn.sellerName,
          amount: txn.farmerPayout,
          quantityQuintals: txn.quantityQuintals,
          pricePerQuintal: txn.pricePerQuintal,
          balanceImpactSummary: `Farmer received +₹${txn.farmerPayout.toLocaleString('en-IN')}`,
          metadata: {
            invoiceNumber: txn.invoiceNumber,
          },
        });
      } else if (status === 'refunded' && prevStatus === 'escrow_locked') {
        this.recordLotEvent({
          lotId: txn.lotId,
          transactionId: txn.id,
          eventType: 'escrow_refunded',
          title: `Escrow Refunded to Buyer: ₹${txn.buyerTotal.toLocaleString('en-IN')}`,
          description: `100% Escrow deposit refunded to ${txn.buyerName} for invoice ${txn.invoiceNumber}.`,
          actorId: 'system',
          actorName: 'FasalFlow Escrow Engine',
          actorRole: 'system',
          counterpartyId: txn.buyerId,
          counterpartyName: txn.buyerName,
          amount: txn.buyerTotal,
          quantityQuintals: txn.quantityQuintals,
          balanceImpactSummary: `Buyer refunded +₹${txn.buyerTotal.toLocaleString('en-IN')}`,
          metadata: {
            invoiceNumber: txn.invoiceNumber,
          },
        });
      } else if (status === 'in_transit' && prevStatus !== 'in_transit') {
        this.recordLotEvent({
          lotId: txn.lotId,
          transactionId: txn.id,
          eventType: 'dispatched_in_transit',
          title: `Produce Dispatched & In-Transit`,
          description: `Consignment is in transit with logistics provider to ${txn.dropDistrict || 'destination'}.`,
          actorId: txn.transporterId || 'transporter',
          actorName: txn.transporterName || 'Transporter',
          actorRole: 'transporter',
          metadata: {
            invoiceNumber: txn.invoiceNumber,
          },
        });
      }
    }

    this.saveToDisk();
    return txn;
  }

  // --- Lot Transaction Data History Operations ---
  public getLotEvents(filter?: { lotId?: string; eventType?: string }): LotTransactionEvent[] {
    if (!this.data.lotEvents) {
      this.data.lotEvents = [...SEED_LOT_EVENTS];
    }
    let result = [...this.data.lotEvents];
    if (filter?.lotId) {
      result = result.filter(e => e.lotId === filter.lotId);
    }
    if (filter?.eventType) {
      result = result.filter(e => e.eventType === filter.eventType);
    }
    return result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordLotEvent(event: Omit<LotTransactionEvent, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): LotTransactionEvent {
    if (!this.data.lotEvents) {
      this.data.lotEvents = [];
    }
    const newEvent: LotTransactionEvent = {
      ...event,
      id: event.id || `LOT-EVT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: event.timestamp || new Date().toISOString(),
    };
    this.data.lotEvents.unshift(newEvent);
    this.saveToDisk();
    return newEvent;
  }

  public getLotHistory(lotId: string): LotWithHistory | null {
    const lot = this.getLotById(lotId);
    if (!lot) return null;

    const events = this.getLotEvents({ lotId });
    const transactions = this.data.transactions.filter(t => t.lotId === lotId);
    const offers = this.data.offers.filter(o => o.lotId === lotId);
    const transportBookings = this.data.transportBookings.filter(b => b.lotId === lotId);

    const totalEscrowLocked = transactions
      .filter(t => t.status === 'escrow_locked' || t.status === 'completed')
      .reduce((sum, t) => sum + (t.buyerTotal || t.amount), 0);

    const totalPayoutReleased = transactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.farmerPayout || t.amount), 0);

    const highestBidPrice = offers.reduce((max, o) => Math.max(max, o.offeredPricePerQuintal), 0);

    let currentLifecycleStep: LotWithHistory['summary']['currentLifecycleStep'] = 'listed';
    if (transactions.some(t => t.status === 'refunded')) {
      currentLifecycleStep = 'refunded';
    } else if (transactions.some(t => t.status === 'completed')) {
      currentLifecycleStep = 'settled';
    } else if (transportBookings.some(b => b.status === 'in_transit') || transactions.some(t => t.status === 'in_transit')) {
      currentLifecycleStep = 'in_transit';
    } else if (transactions.some(t => t.status === 'escrow_locked')) {
      currentLifecycleStep = 'escrow_locked';
    } else if (offers.length > 0 || lot.status === 'negotiation') {
      currentLifecycleStep = 'negotiating';
    }

    const isFullySettled = transactions.some(t => t.status === 'completed');

    return {
      ...lot,
      events,
      transactions,
      offers,
      transportBookings,
      summary: {
        totalEscrowLocked,
        totalPayoutReleased,
        totalOffersReceived: offers.length,
        highestBidPrice,
        currentLifecycleStep,
        isFullySettled,
      },
    };
  }

  public addLotEvent(
    lotId: string,
    eventData: {
      eventType?: LotEventType;
      title: string;
      description: string;
      actorId?: string;
      actorName?: string;
      actorRole?: UserRole | 'system';
      amount?: number;
      quantityQuintals?: number;
      pricePerQuintal?: number;
      metadata?: any;
    }
  ): LotTransactionEvent | null {
    const lot = this.getLotById(lotId);
    if (!lot) return null;

    return this.recordLotEvent({
      lotId,
      eventType: eventData.eventType || 'custom_note',
      title: eventData.title,
      description: eventData.description,
      actorId: eventData.actorId || 'system',
      actorName: eventData.actorName || 'Marketplace Verifier',
      actorRole: eventData.actorRole || 'system',
      amount: eventData.amount,
      quantityQuintals: eventData.quantityQuintals,
      pricePerQuintal: eventData.pricePerQuintal,
      metadata: eventData.metadata,
    });
  }

  // --- Crop Lots Operations ---
  public getLots(): CropLot[] {
    return this.data.lots;
  }

  public getLotById(id: string): CropLot | undefined {
    return this.data.lots.find(l => l.id === id);
  }

  public createLot(lot: Omit<CropLot, 'id' | 'createdAt' | 'offersCount'>): CropLot {
    const newLot: CropLot = {
      ...lot,
      id: `lot-${Date.now()}`,
      createdAt: new Date().toISOString(),
      offersCount: 0,
    };
    this.data.lots.unshift(newLot);

    // Record creation event in history
    this.recordLotEvent({
      lotId: newLot.id,
      eventType: 'lot_created',
      title: `Harvest Lot Published: ${newLot.crop} (${newLot.variety || 'Standard'})`,
      description: `${newLot.sellerName} published ${newLot.quantityQuintals} quintals of ${newLot.crop} at asking price of ₹${newLot.askingPricePerQuintal}/q.`,
      actorId: newLot.sellerId,
      actorName: newLot.sellerName,
      actorRole: 'farmer',
      quantityQuintals: newLot.quantityQuintals,
      pricePerQuintal: newLot.askingPricePerQuintal,
      amount: newLot.baseTotal,
      newLotStatus: newLot.status,
      metadata: {
        grade: newLot.grade,
        moisturePercent: newLot.moisturePercent,
        location: newLot.sellerDistrict,
      },
    });

    this.saveToDisk();
    return newLot;
  }

  public updateLot(id: string, updates: Partial<CropLot>): CropLot | null {
    const index = this.data.lots.findIndex(l => l.id === id);
    if (index === -1) return null;

    const prevStatus = this.data.lots[index].status;
    const prevPrice = this.data.lots[index].askingPricePerQuintal;

    this.data.lots[index] = { ...this.data.lots[index], ...updates };

    if (updates.askingPricePerQuintal && updates.askingPricePerQuintal !== prevPrice) {
      this.recordLotEvent({
        lotId: id,
        eventType: 'price_revised',
        title: `Lot Asking Price Revised to ₹${updates.askingPricePerQuintal}/q`,
        description: `Asking price updated from ₹${prevPrice}/q to ₹${updates.askingPricePerQuintal}/q.`,
        actorId: this.data.lots[index].sellerId,
        actorName: this.data.lots[index].sellerName,
        actorRole: 'farmer',
        pricePerQuintal: updates.askingPricePerQuintal,
        quantityQuintals: this.data.lots[index].quantityQuintals,
      });
    }

    if (updates.status && updates.status !== prevStatus) {
      this.recordLotEvent({
        lotId: id,
        eventType: 'status_changed',
        title: `Listing Status Changed: ${updates.status.toUpperCase()}`,
        description: `Status transitioned from ${prevStatus} to ${updates.status}.`,
        actorId: this.data.lots[index].sellerId,
        actorName: this.data.lots[index].sellerName,
        actorRole: 'farmer',
        previousLotStatus: prevStatus,
        newLotStatus: updates.status,
      });
    }

    this.saveToDisk();
    return this.data.lots[index];
  }

  public deleteLot(id: string): boolean {
    const initialLen = this.data.lots.length;
    this.data.lots = this.data.lots.filter(l => l.id !== id);
    if (this.data.lots.length !== initialLen) {
      this.saveToDisk();
      return true;
    }
    return false;
  }

  // --- Offers & Deals Operations ---
  public getOffers(): Offer[] {
    return this.data.offers;
  }

  public createOffer(offerData: Omit<Offer, 'id' | 'createdAt' | 'status'>): Offer {
    const newOffer: Offer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    this.data.offers.unshift(newOffer);

    // Update lot stats
    const lot = this.data.lots.find(l => l.id === offerData.lotId);
    if (lot) {
      lot.offersCount = (lot.offersCount || 0) + 1;
      lot.bestOfferPrice = Math.max(lot.bestOfferPrice || 0, offerData.offeredPricePerQuintal);
    }

    // Record offer received in lot history
    this.recordLotEvent({
      lotId: offerData.lotId,
      offerId: newOffer.id,
      eventType: 'offer_received',
      title: `Bid Placed by ${offerData.buyerName}: ₹${offerData.offeredPricePerQuintal}/q`,
      description: `${offerData.buyerName} (${offerData.buyerDistrict}) submitted an offer for ${offerData.quantityQuintals} quintals totaling ₹${offerData.totalAmount.toLocaleString('en-IN')}.${offerData.notes ? ` Notes: "${offerData.notes}"` : ''}`,
      actorId: offerData.buyerId,
      actorName: offerData.buyerName,
      actorRole: 'buyer',
      counterpartyId: lot?.sellerId,
      counterpartyName: lot?.sellerName,
      quantityQuintals: offerData.quantityQuintals,
      pricePerQuintal: offerData.offeredPricePerQuintal,
      amount: offerData.totalAmount,
    });

    this.saveToDisk();
    return newOffer;
  }

  public acceptOffer(offerId: string): { offer: Offer; transaction: TransactionRecord } | null {
    const offer = this.data.offers.find(o => o.id === offerId);
    if (!offer) return null;

    const buyer = this.getUserById(offer.buyerId);
    const buyerTotal = Math.round(offer.totalAmount * 1.01);
    if (buyer) {
      const buyerBalance = buyer.walletBalance ?? 0;
      if (buyerBalance < buyerTotal) {
        const shortfall = buyerTotal - buyerBalance;
        const err: any = new Error(
          `INSUFFICIENT_BALANCE: Buyer ${buyer.name} has wallet balance of ₹${buyerBalance.toLocaleString('en-IN')}, but accepting this offer requires ₹${buyerTotal.toLocaleString('en-IN')} in escrow. Shortfall: ₹${shortfall.toLocaleString('en-IN')}.`
        );
        err.code = 'INSUFFICIENT_BALANCE';
        err.requiredAmount = buyerTotal;
        err.currentBalance = buyerBalance;
        err.shortfall = shortfall;
        err.userId = buyer.id;
        err.userName = buyer.name;
        err.userRole = buyer.role;
        throw err;
      }
    }

    offer.status = 'accepted';

    // Mark lot sold
    const lot = this.data.lots.find(l => l.id === offer.lotId);
    if (lot) {
      lot.status = 'sold';
    }

    // Automatically generate persistent Escrow Transaction in History!
    const seller = this.data.users.find(u => u.id === lot?.sellerId) || {
      id: lot?.sellerId || 'seller-unknown',
      name: lot?.sellerName || 'Farmer / Seller',
      district: lot?.sellerDistrict || 'Osmanabad',
    };

    const platformFee = Math.round(offer.totalAmount * 0.02);
    const farmerPayout = Math.round(offer.totalAmount * 0.99);

    const newTxn = this.createTransaction({
      type: 'trade_deal',
      status: 'escrow_locked',
      amount: offer.totalAmount,
      lotId: offer.lotId,
      crop: offer.crop,
      quantityQuintals: offer.quantityQuintals,
      pricePerQuintal: offer.offeredPricePerQuintal,
      sellerId: seller.id,
      sellerName: seller.name,
      buyerId: offer.buyerId,
      buyerName: offer.buyerName,
      platformFee,
      farmerPayout,
      buyerTotal,
      paymentMethod: 'e-NAM UPI Escrow Lock',
      paymentRef: `UPI-ESCROW-${Date.now()}`,
      notes: `Trade contract established between ${seller.name} & ${offer.buyerName} for ${offer.quantityQuintals} quintals ${offer.crop}.`,
      pickupDistrict: lot?.sellerDistrict,
      dropDistrict: offer.buyerDistrict,
    });

    // Record offer accepted event
    this.recordLotEvent({
      lotId: offer.lotId,
      offerId: offer.id,
      transactionId: newTxn.id,
      eventType: 'offer_accepted',
      title: `Deal Accepted & Locked at ₹${offer.offeredPricePerQuintal}/q`,
      description: `${seller.name} accepted purchase offer from ${offer.buyerName} for ${offer.quantityQuintals} quintals (₹${offer.totalAmount.toLocaleString('en-IN')}).`,
      actorId: seller.id,
      actorName: seller.name,
      actorRole: 'farmer',
      counterpartyId: offer.buyerId,
      counterpartyName: offer.buyerName,
      amount: offer.totalAmount,
      quantityQuintals: offer.quantityQuintals,
      pricePerQuintal: offer.offeredPricePerQuintal,
      previousLotStatus: 'active',
      newLotStatus: 'sold',
      metadata: {
        invoiceNumber: newTxn.invoiceNumber,
      },
    });

    // Record escrow locked event
    this.recordLotEvent({
      lotId: offer.lotId,
      transactionId: newTxn.id,
      eventType: 'escrow_locked',
      title: `100% Escrow Secured in Vault: ₹${buyerTotal.toLocaleString('en-IN')}`,
      description: `Buyer deposited ₹${buyerTotal.toLocaleString('en-IN')} in e-NAM UPI Escrow Vault. Farmer guaranteed net payout of ₹${farmerPayout.toLocaleString('en-IN')} locked under Invoice #${newTxn.invoiceNumber}.`,
      actorId: offer.buyerId,
      actorName: offer.buyerName,
      actorRole: 'buyer',
      counterpartyId: seller.id,
      counterpartyName: seller.name,
      amount: buyerTotal,
      quantityQuintals: offer.quantityQuintals,
      pricePerQuintal: offer.offeredPricePerQuintal,
      balanceImpactSummary: `Buyer debited -₹${buyerTotal.toLocaleString('en-IN')}; Escrow locked`,
      metadata: {
        invoiceNumber: newTxn.invoiceNumber,
        paymentRef: newTxn.paymentRef,
      },
    });

    this.saveToDisk();
    return { offer, transaction: newTxn };
  }

  public rejectOffer(offerId: string): Offer | null {
    const offer = this.data.offers.find(o => o.id === offerId);
    if (!offer) return null;
    offer.status = 'rejected';

    this.recordLotEvent({
      lotId: offer.lotId,
      offerId: offer.id,
      eventType: 'offer_rejected',
      title: `Offer Declined: ₹${offer.offeredPricePerQuintal}/q`,
      description: `Offer of ₹${offer.offeredPricePerQuintal}/q from ${offer.buyerName} was declined.`,
      actorId: 'seller',
      actorName: 'Seller',
      actorRole: 'farmer',
      counterpartyId: offer.buyerId,
      counterpartyName: offer.buyerName,
    });

    this.saveToDisk();
    return offer;
  }

  public counterOffer(offerId: string, counterPrice: number): Offer | null {
    const offer = this.data.offers.find(o => o.id === offerId);
    if (!offer) return null;
    offer.status = 'countered';
    offer.counterPrice = counterPrice;

    this.recordLotEvent({
      lotId: offer.lotId,
      offerId: offer.id,
      eventType: 'offer_countered',
      title: `Counter-Offer Sent: ₹${counterPrice}/q`,
      description: `Counter-offer of ₹${counterPrice}/q submitted for ${offer.quantityQuintals} quintals to ${offer.buyerName}.`,
      actorId: 'seller',
      actorName: 'Seller',
      actorRole: 'farmer',
      counterpartyId: offer.buyerId,
      counterpartyName: offer.buyerName,
      pricePerQuintal: counterPrice,
      amount: counterPrice * offer.quantityQuintals,
    });

    this.saveToDisk();
    return offer;
  }

  // --- Transporters & Bookings ---
  public getTransporters(): Transporter[] {
    return this.data.transporters;
  }

  public getTransportBookings(userId?: string): TransportBooking[] {
    if (userId) {
      return this.data.transportBookings.filter(b => b.userId === userId);
    }
    return this.data.transportBookings;
  }

  public createTransportBooking(booking: Omit<TransportBooking, 'id' | 'createdAt' | 'status'>): TransportBooking {
    const consignor = this.getUserById(booking.userId);
    if (consignor) {
      const balance = consignor.walletBalance ?? 0;
      if (balance < booking.totalFare) {
        const shortfall = booking.totalFare - balance;
        const err: any = new Error(
          `INSUFFICIENT_BALANCE: Consignor ${consignor.name} has wallet balance of ₹${balance.toLocaleString('en-IN')}, but transport booking requires ₹${booking.totalFare.toLocaleString('en-IN')}. Shortfall: ₹${shortfall.toLocaleString('en-IN')}.`
        );
        err.code = 'INSUFFICIENT_BALANCE';
        err.requiredAmount = booking.totalFare;
        err.currentBalance = balance;
        err.shortfall = shortfall;
        err.userId = consignor.id;
        err.userName = consignor.name;
        err.userRole = consignor.role;
        throw err;
      }
      consignor.walletBalance = balance - booking.totalFare;
    }

    const newBooking: TransportBooking = {
      ...booking,
      id: `TR-BK-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'booked',
    };

    this.data.transportBookings.unshift(newBooking);

    // Also create transport fare transaction record
    this.createTransaction({
      type: 'transport_fare',
      status: 'in_transit',
      amount: booking.totalFare,
      lotId: booking.lotId,
      crop: booking.crop,
      quantityQuintals: booking.quantityQuintals,
      sellerId: booking.userId,
      sellerName: 'Consignor',
      buyerId: booking.transporterId,
      buyerName: booking.transporterName,
      transporterId: booking.transporterId,
      transporterName: booking.transporterName,
      platformFee: 0,
      farmerPayout: booking.totalFare,
      buyerTotal: booking.totalFare,
      paymentMethod: 'Fastag / Direct Bank Settlement',
      paymentRef: `TR-PAY-${Date.now()}`,
      notes: `Transport booking for ${booking.quantityQuintals} quintals ${booking.crop} (${booking.distanceKm} km). Driver: ${booking.driverPhone}`,
      pickupDistrict: booking.pickupLocation,
      dropDistrict: booking.dropLocation,
    });

    if (booking.lotId) {
      this.recordLotEvent({
        lotId: booking.lotId,
        eventType: 'transport_assigned',
        title: `Haulage Truck Booked: ${booking.transporterName}`,
        description: `Freight haulage reserved for ${booking.quantityQuintals} quintals from ${booking.pickupLocation} to ${booking.dropLocation} (${booking.distanceKm} km). Driver: ${booking.driverPhone}. Fare: ₹${booking.totalFare.toLocaleString('en-IN')}`,
        actorId: booking.transporterId,
        actorName: booking.transporterName,
        actorRole: 'transporter',
        amount: booking.totalFare,
        quantityQuintals: booking.quantityQuintals,
        metadata: {
          transporterName: booking.transporterName,
          driverPhone: booking.driverPhone,
        },
      });
    }

    this.saveToDisk();
    return newBooking;
  }
}

export const db = new DatabaseManager();
