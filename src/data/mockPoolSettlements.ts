import { PoolSettlementBatch } from '../types';

export const MOCK_POOL_BATCHES: PoolSettlementBatch[] = [
  {
    id: 'POOL-MAHA-ONION-3000',
    title: '3-Farmer Lasalgaon Red Onion Pool (Batch #882)',
    crop: 'Onion',
    variety: 'Nashik Red Garwa',
    fpoName: 'Sahyadri Farmers Producer Hub (Nashik)',
    buyerName: 'Godrej Agro & Metro Cash-Carry (Mumbai Hub)',
    finalPoolUnitPrice: 24.0, // ₹24 / kg
    totalAcceptedKg: 3000,
    totalLogisticsCost: 6000, // ₹6,000 total freight & handling
    unitLogisticsCost: 2.0, // ₹2 / kg
    totalStorageCost: 0,
    unitStorageCost: 0.0,
    status: 'settled',
    createdAt: '2026-09-10T08:00:00.000Z',
    settlementDate: '2026-09-12T16:30:00.000Z',
    contractId: 'AGMARK-POOL-CTR-2026-0941',
    escrowTotalAmount: 72000,
    participants: [
      {
        farmerId: 'farmer-a',
        farmerName: 'Farmer A (Dnyaneshwar Shinde)',
        phone: '+91 94231 66778',
        district: 'Nashik (Lasalgaon)',
        upiOrBank: 'dnyaneshwar@sbi (SBI Lasalgaon - A/C **4419)',
        acceptedKg: 1000,
        gradeFactor: 1.0,
        gradeFactorReason: 'Conforms to Grade A (45-60mm bulb diameter, sound skin)',
        allocatedLogistics: 2000, // 1,000 kg × ₹2/kg
        allocatedStorage: 0,
        deductions: [
          {
            id: 'ded-1',
            title: 'Agreed 1% Quality Refraction (Excess Field Moisture)',
            type: 'moisture_excess',
            percentage: 1.0,
            rupeeAmount: 240, // 1% of Gross ₹24,000
            evidence: {
              reportId: 'NABL-QC-LAS-2026-0912',
              labName: 'NABL Agriscan Digital QC Lab (Lasalgaon APMC)',
              testDate: '12-Sep-2026 11:20 AM',
              testedMetric: 'Surface & Neck Moisture Assay',
              measuredValue: '15.1% Moisture Content',
              agreedBaseline: 'Standard Grade Baseline <= 14.0%',
              inspectorName: 'Er. Sachin Kulkarni (Certified Assayer #MH-881)',
              contractClause: 'Schedule B, Clause 3.1: Measured excess moisture between 1.0%–2.0% triggers an agreed 1.0% price deduction based on digital moisture meter reading.',
              opticalScore: 'NIR Spectrometry Surface Reflectance: 87.4%',
              photoDescription: 'Sample Lot #A-1002 Optical tray capture showing minor damp neck ring'
            }
          }
        ],
        incentives: [
          {
            id: 'inc-1',
            title: 'Batch Sorting Compliance Incentive',
            rupeeAmount: 150,
            reason: 'Delivered in pre-graded 50kg aerated mesh bags as per Buyer Specs'
          }
        ],
        preAdjustmentNet: 22000, // 1,000 × (24 - 2)
        finalPayout: 21910, // 22,000 - 240 + 150
        payoutStatus: 'settled',
        payoutRef: 'HDFC-NEFT-992011448'
      },
      {
        farmerId: 'farmer-b',
        farmerName: 'Farmer B (Kailas Bhalerao)',
        phone: '+91 98224 88771',
        district: 'Nashik (Yeola)',
        upiOrBank: 'kailas.b@hdfcbank (HDFC Yeola - A/C **8812)',
        acceptedKg: 1200,
        gradeFactor: 1.0,
        gradeFactorReason: 'Standard Grade A specification verified',
        allocatedLogistics: 2400, // 1,200 kg × ₹2/kg
        allocatedStorage: 0,
        deductions: [],
        incentives: [
          {
            id: 'inc-2',
            title: 'High Bulk Density Incentive',
            rupeeAmount: 180,
            reason: 'Zero sorting rejection with dry curing ratio above 92%'
          }
        ],
        preAdjustmentNet: 26400, // 1,200 × (24 - 2)
        finalPayout: 26580, // 26,400 + 180
        payoutStatus: 'settled',
        payoutRef: 'HDFC-NEFT-992011449'
      },
      {
        farmerId: 'farmer-c',
        farmerName: 'Farmer C (Sunil Thakare)',
        phone: '+91 97650 33214',
        district: 'Nashik (Pimpalgaon)',
        upiOrBank: 'sunilthakare@icici (ICICI Pimpalgaon - A/C **3109)',
        acceptedKg: 800,
        gradeFactor: 0.98, // Minor size variation
        gradeFactorReason: 'Grade A- (Contains 12% bulbs < 40mm, agreed 0.98 factor)',
        allocatedLogistics: 1600, // 800 kg × ₹2/kg
        allocatedStorage: 0,
        deductions: [
          {
            id: 'ded-3',
            title: 'Agreed 0.5% Dust & Foreign Matter Sorting Charge',
            type: 'foreign_matter',
            percentage: 0.5,
            rupeeAmount: 94.08,
            evidence: {
              reportId: 'NABL-QC-LAS-2026-0914',
              labName: 'NABL Agriscan Digital QC Lab (Lasalgaon APMC)',
              testDate: '12-Sep-2026 11:45 AM',
              testedMetric: 'Foreign Dry Soil / Inert Matter',
              measuredValue: '1.2% Inert Soil Clods',
              agreedBaseline: 'Standard Tolerance <= 0.5%',
              inspectorName: 'Er. Sachin Kulkarni (Certified Assayer #MH-881)',
              contractClause: 'Schedule B, Clause 2.4: Foreign matter in excess of 0.5% will be deducted at 0.5% net value for automated rotary brushing.',
              opticalScore: 'Digital Sieve Scan Purity: 98.8%',
              photoDescription: 'Tray image showing minor dry soil clods in batch #C-800'
            }
          }
        ],
        incentives: [],
        preAdjustmentNet: 17216, // 800 × 24 × 0.98 - 1600 = 18816 - 1600 = 17216
        finalPayout: 17121.92,
        payoutStatus: 'settled',
        payoutRef: 'HDFC-NEFT-992011450'
      }
    ]
  },
  {
    id: 'POOL-MARATH-SOY-6000',
    title: '4-Farmer Dharashiv Yellow Soybean Pool (Batch #904)',
    crop: 'Soybean',
    variety: 'JS-335 Yellow',
    fpoName: 'Marathwada Krishi Farmer Producer Co.',
    buyerName: 'Ganesh Agro Processing & Solvent Extraction Mill',
    finalPoolUnitPrice: 48.5, // ₹48.50 / kg (₹4,850 / quintal)
    totalAcceptedKg: 6000,
    totalLogisticsCost: 9000, // ₹9,000 total freight (₹1.50 / kg)
    unitLogisticsCost: 1.5,
    totalStorageCost: 1800, // ₹1,800 warehouse assaying & holding (₹0.30 / kg)
    unitStorageCost: 0.3,
    status: 'before_lock',
    createdAt: '2026-09-13T02:00:00.000Z',
    contractId: 'AGMARK-POOL-CTR-2026-0988',
    escrowTotalAmount: 291000,
    participants: [
      {
        farmerId: 'f-soy-1',
        farmerName: 'Ramesh Patil',
        phone: '+91 98221 44550',
        district: 'Dharashiv (Osmanabad)',
        upiOrBank: 'rameshpatil@sbi (SBI Dharashiv - A/C **1902)',
        acceptedKg: 2000,
        gradeFactor: 1.02, // High oil content premium (19.4% oil)
        gradeFactorReason: 'Grade A+ Certified High Oil Content (19.4% vs 18.0% baseline)',
        allocatedLogistics: 3000,
        allocatedStorage: 600,
        deductions: [],
        incentives: [
          {
            id: 'inc-soy-1',
            title: 'High Protein Content Incentive',
            rupeeAmount: 800,
            reason: 'NABL Certified Protein Content 38.6% (Standard: 36%)'
          }
        ],
        preAdjustmentNet: 95340, // 2000 × (48.50 × 1.02 - 1.50 - 0.30) = 2000 × (49.47 - 1.80) = 95340
        finalPayout: 96140,
        payoutStatus: 'escrow_ready'
      },
      {
        farmerId: 'f-soy-2',
        farmerName: 'Vikas Jagtap',
        phone: '+91 98501 22345',
        district: 'Dharashiv (Kallam)',
        upiOrBank: 'vikas.jagtap@bom (Bank of Maharashtra - A/C **6610)',
        acceptedKg: 1500,
        gradeFactor: 1.0,
        gradeFactorReason: 'Standard Grade A specification',
        allocatedLogistics: 2250,
        allocatedStorage: 450,
        deductions: [
          {
            id: 'ded-soy-2',
            title: 'Agreed 0.8% Moisture Excess Deduction',
            type: 'moisture_excess',
            percentage: 0.8,
            rupeeAmount: 582,
            evidence: {
              reportId: 'NABL-QC-OSM-2026-0913',
              labName: 'Marathwada Central Grain Quality Testing Lab',
              testDate: '13-Sep-2026 09:10 AM',
              testedMetric: 'Grain Moisture by Halogen Analyzer',
              measuredValue: '12.8% Moisture',
              agreedBaseline: 'Max Contract Moisture: 12.0%',
              inspectorName: 'Dr. Anita Joshi (Senior QC Chemist)',
              contractClause: 'Soybean Trade Agreement Clause 5.1: Moisture over 12% incurs pro-rata 0.8% price deduction for aeration drying.',
              opticalScore: 'Purity Index: 99.2%',
              photoDescription: 'Infrared moisture scan printout attached'
            }
          }
        ],
        incentives: [],
        preAdjustmentNet: 70050, // 1500 × (48.50 - 1.80) = 70050
        finalPayout: 69468,
        payoutStatus: 'escrow_ready'
      },
      {
        farmerId: 'f-soy-3',
        farmerName: 'Anil Deshmukh',
        phone: '+91 94220 99441',
        district: 'Latur (Ausa)',
        upiOrBank: 'anild@hdfcbank (HDFC Ausa - A/C **7721)',
        acceptedKg: 2500,
        gradeFactor: 1.0,
        gradeFactorReason: 'Standard Grade A specification',
        allocatedLogistics: 3750,
        allocatedStorage: 750,
        deductions: [],
        incentives: [
          {
            id: 'inc-soy-3',
            title: 'Early Pooling & Palletization Incentive',
            rupeeAmount: 500,
            reason: 'Delivered directly on wooden pallets'
          }
        ],
        preAdjustmentNet: 116750, // 2500 × (48.50 - 1.80) = 116750
        finalPayout: 117250,
        payoutStatus: 'escrow_ready'
      }
    ]
  }
];
