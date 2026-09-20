import { AggregatedCropPool } from '../types';

export const MOCK_AGGREGATED_POOLS: AggregatedCropPool[] = [
  {
    id: 'POOL-2024-MH-ON-01',
    code: 'FPO-NSK-ONION-3000KG',
    title: 'Nashik Export Grade Red Onion Aggregation Pool',
    fpoName: 'Sahyadri Krishi Vikas Farmers Producer Co. Ltd.',
    fpoRegistrationNo: 'U01409MH2021PTC358921',
    crop: 'Onion',
    variety: 'Nashik Garva Red (55mm+ Export)',
    targetGrade: 'Grade A',
    targetQuantityQuintals: 30, // 3,000 kg
    currentQuantityQuintals: 30,
    collectionRadiusKm: 25,
    hubLocation: 'Sahyadri Packhouse, Dindori Hub, Nashik',
    cutoffDate: '2026-09-18T18:00:00Z',
    destinationHub: 'APMC Vashi & JNPT Cold Terminal, Navi Mumbai',
    moistureToleranceMax: 12.0,
    defectToleranceMax: 3.0,
    costAllocationRule: 'Pro-Rata Per Accepted kg (Total Common Logistics ₹6,000 ÷ 3,000 kg = ₹2.00/kg)',
    status: 'contracted',
    lockedAt: '2026-09-14T10:30:00Z',
    selectedBidId: 'BID-APMC-VASHI-001',
    lots: [
      {
        lotId: 'LOT-ON-001',
        farmerId: 'farmer-ramesh-01',
        farmerName: 'Ramesh Patil',
        farmerPhone: '+91 98231 44510',
        village: 'Pimpalgaon Baswant',
        district: 'Nashik',
        crop: 'Onion',
        variety: 'Garva Red',
        harvestDate: '2026-09-10',
        quantityQuintals: 10,
        quantityKg: 1000,
        declaredGrade: 'Grade A',
        declaredMoisture: 12.5,
        declaredForeignMatter: 1.0,
        gpsLocation: {
          lat: 20.1711,
          lng: 73.9872,
          address: 'Gat No 142, Pimpalgaon Baswant, Niphad, Nashik'
        },
        expectedPickupDate: '2026-09-14',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-11T09:15:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-ON-001:RAMESH_PATIL:1000KG:ONION:NASHIK',
        photos: [
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'
        ],
        testReportAttached: {
          labName: 'NABL Accredited Regional Agmark Quality Laboratory, Pune',
          reportNo: 'NABL/MH/2026/0984-ON',
          testDate: '2026-09-12',
          accreditationType: 'NABL_Certified',
          parameters: [
            { name: 'Bulb Diameter', value: '56.4 mm', standardLimit: 'Min 55.0 mm', pass: true },
            { name: 'Moisture Content', value: '14.8%', standardLimit: 'Max 12.0%', pass: false },
            { name: 'Foreign Matter', value: '0.8%', standardLimit: 'Max 2.0%', pass: true },
            { name: 'Rot / Sprouting', value: '0.0%', standardLimit: 'Max 1.0%', pass: true }
          ],
          certificateUrl: 'https://agmarknet.gov.in/lab/cert/NABL-MH-2026-0984'
        },
        fieldChecklist: {
          weighedKg: 1000,
          weighmentSlipNo: 'WB-NSK-2026-8812',
          visualInspectionOk: true,
          foreignMatterObserved: 0.8,
          inspectorAgent: 'Sunil Kulkarni (Field Officer #MH-401)',
          checkedAt: '2026-09-14T07:45:00Z'
        },
        labAssaying: {
          sampleId: 'SMP-2026-ON-991',
          chainOfCustodyTracking: 'Field Agent -> Barcode Box #COC-892 -> NABL Pune Courier #BLUEDART-8819 -> Assayer Dr. V. Joshi',
          labName: 'FSSAI Notified & NABL Accredited Food Analysis Lab, Pune',
          accreditationType: 'FSSAI_Notified',
          testDate: '2026-09-13',
          measuredMoisture: 14.8,
          measuredDefect: 0.8,
          decision: 'CONDITIONAL_ACCEPT',
          gradeAssigned: 'Grade A',
          gradeFactor: 1.0,
          deductionReason: 'Moisture 14.8% exceeds pool threshold 12.0%. 1.0% contract moisture shrinkage penalty applied.',
          deductionPercent: 1.0,
          reportLink: 'https://fssai.gov.in/labreports/FSSAI-MH-2026-ON991.pdf'
        },
        status: 'pooled'
      },
      {
        lotId: 'LOT-ON-002',
        farmerId: 'farmer-suresh-02',
        farmerName: 'Suresh Deshmukh',
        farmerPhone: '+91 94222 18902',
        village: 'Lasalgaon',
        district: 'Nashik',
        crop: 'Onion',
        variety: 'Garva Red',
        harvestDate: '2026-09-10',
        quantityQuintals: 10,
        quantityKg: 1000,
        declaredGrade: 'Grade A',
        declaredMoisture: 11.2,
        declaredForeignMatter: 0.5,
        gpsLocation: {
          lat: 20.1456,
          lng: 74.2281,
          address: 'Survey 88/2, Lasalgaon Mandi Road, Niphad, Nashik'
        },
        expectedPickupDate: '2026-09-14',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-11T10:00:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-ON-002:SURESH_DESHMUKH:1000KG:ONION:NASHIK',
        photos: [
          'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=600&q=80'
        ],
        testReportAttached: {
          labName: 'ICAR-DOGR Quality Testing Facility, Rajgurunagar',
          reportNo: 'ICAR/DOGR/2026/4102',
          testDate: '2026-09-12',
          accreditationType: 'ICAR_Accredited',
          parameters: [
            { name: 'Bulb Uniformity Index', value: '94%', standardLimit: 'Min 85%', pass: true },
            { name: 'Moisture Content', value: '11.2%', standardLimit: 'Max 12.0%', pass: true },
            { name: 'Pungency (Pyruvic Acid)', value: '11.4 umol/g', standardLimit: 'Min 9.0 umol/g', pass: true }
          ]
        },
        fieldChecklist: {
          weighedKg: 1000,
          weighmentSlipNo: 'WB-NSK-2026-8813',
          visualInspectionOk: true,
          foreignMatterObserved: 0.5,
          inspectorAgent: 'Sunil Kulkarni (Field Officer #MH-401)',
          checkedAt: '2026-09-14T08:15:00Z'
        },
        labAssaying: {
          sampleId: 'SMP-2026-ON-992',
          chainOfCustodyTracking: 'Field Agent -> Barcode Box #COC-893 -> NABL Pune Courier -> Assayer Dr. V. Joshi',
          labName: 'FSSAI Notified & NABL Accredited Food Analysis Lab, Pune',
          accreditationType: 'FSSAI_Notified',
          testDate: '2026-09-13',
          measuredMoisture: 11.2,
          measuredDefect: 0.4,
          decision: 'PASSED',
          gradeAssigned: 'Grade A',
          gradeFactor: 1.0,
          reportLink: 'https://fssai.gov.in/labreports/FSSAI-MH-2026-ON992.pdf'
        },
        status: 'pooled'
      },
      {
        lotId: 'LOT-ON-003',
        farmerId: 'farmer-anita-03',
        farmerName: 'Anita Shinde',
        farmerPhone: '+91 97654 33211',
        village: 'Chandwad',
        district: 'Nashik',
        crop: 'Onion',
        variety: 'Garva Red',
        harvestDate: '2026-09-09',
        quantityQuintals: 10,
        quantityKg: 1000,
        declaredGrade: 'Grade A',
        declaredMoisture: 11.8,
        declaredForeignMatter: 0.6,
        gpsLocation: {
          lat: 20.3274,
          lng: 74.2411,
          address: 'Kisan Vasti, Post Rahud, Chandwad, Nashik'
        },
        expectedPickupDate: '2026-09-14',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-11T11:20:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-ON-003:ANITA_SHINDE:1000KG:ONION:NASHIK',
        photos: [
          'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80'
        ],
        fieldChecklist: {
          weighedKg: 1000,
          weighmentSlipNo: 'WB-NSK-2026-8814',
          visualInspectionOk: true,
          foreignMatterObserved: 0.6,
          inspectorAgent: 'Sunil Kulkarni (Field Officer #MH-401)',
          checkedAt: '2026-09-14T08:50:00Z'
        },
        labAssaying: {
          sampleId: 'SMP-2026-ON-993',
          chainOfCustodyTracking: 'Field Agent -> Barcode Box #COC-894 -> NABL Pune Courier -> Assayer Dr. V. Joshi',
          labName: 'FSSAI Notified & NABL Accredited Food Analysis Lab, Pune',
          accreditationType: 'FSSAI_Notified',
          testDate: '2026-09-13',
          measuredMoisture: 11.8,
          measuredDefect: 0.5,
          decision: 'PASSED',
          gradeAssigned: 'Grade A',
          gradeFactor: 1.0,
          reportLink: 'https://fssai.gov.in/labreports/FSSAI-MH-2026-ON993.pdf'
        },
        status: 'pooled'
      }
    ],
    buyerDemandOffers: [
      {
        bidId: 'BID-APMC-VASHI-001',
        buyerId: 'buyer-vashi-exports',
        buyerName: 'MahaAgro Export Consortium Ltd.',
        companyName: 'MahaAgro Global Foods LLP',
        gstin: '27AABCM8921N1Z5',
        kycStatus: 'e_nam_verified',
        crop: 'Onion',
        gradeRequested: 'Grade A',
        offeredPricePerQuintal: 2400, // ₹24.00/kg
        offeredPricePerKg: 24.0,
        quantityRequiredQuintals: 30,
        deliveryCondition: 'Ex-FPO Hub',
        paymentTerms: '100% RBI Escrow',
        paymentSecurityType: 'escrow_locked',
        inspectionRules: 'Assaying by FSSAI Notified Lab at FPO Hub before dispatch. Moisture ceiling 12.0%.',
        historicalDisputeRate: 0.2, // 0.2% dispute rate
        onTimePaymentScore: 99,
        expectedRejectionRisk: 0.8,
        distanceKm: 185,
        explainableScore: {
          totalScore: 96.4,
          netRealisationScore: 95.0,
          buyerVerificationScore: 99.0,
          paymentSecurityScore: 100.0,
          deliveryFeasibilityScore: 94.0,
          rejectionRiskScore: 94.0,
          rank: 1,
          rankingRationale: 'Ranked #1: Highest Net Realisation (₹22.00/kg net of ₹2 freight), 100% Escrow deposit locked, 0.2% dispute history, Ex-FPO Hub pickup.'
        }
      },
      {
        bidId: 'BID-MUMBAI-RETAIL-002',
        buyerId: 'buyer-quick-fresh',
        buyerName: 'QuickMart Fresh Retail Pvt. Ltd.',
        companyName: 'QuickMart Retail India Ltd.',
        gstin: '27AABCR4412K1Z9',
        kycStatus: 'gst_verified',
        crop: 'Onion',
        gradeRequested: 'Grade A',
        offeredPricePerQuintal: 2480, // ₹24.80/kg - Higher headline price!
        offeredPricePerKg: 24.8,
        quantityRequiredQuintals: 30,
        deliveryCondition: 'CIF Buyer Mandi',
        paymentTerms: 'Post-delivery 15 Days Credit',
        paymentSecurityType: 'unsecured',
        inspectionRules: 'Inspection at Buyer Central Warehouse. Subject to 48hr sorting rejection.',
        historicalDisputeRate: 8.5, // 8.5% dispute rate
        onTimePaymentScore: 78,
        expectedRejectionRisk: 9.4,
        distanceKm: 210,
        explainableScore: {
          totalScore: 71.2,
          netRealisationScore: 89.0,
          buyerVerificationScore: 82.0,
          paymentSecurityScore: 40.0, // Low payment security!
          deliveryFeasibilityScore: 75.0,
          rejectionRiskScore: 70.0,
          rank: 2,
          rankingRationale: 'Ranked #2 (Behind #1 despite higher headline price ₹24.80): Demands 15-day unsecured credit, high rejection risk (9.4%), CIF delivery cost ₹3.50/kg reduces net return.'
        }
      },
      {
        bidId: 'BID-SURAT-TRADERS-003',
        buyerId: 'buyer-guj-traders',
        buyerName: 'Surat Agritech Wholesalers',
        companyName: 'Surat Mandi Traders Co.',
        gstin: '24AAACT7721L1Z2',
        kycStatus: 'gst_verified',
        crop: 'Onion',
        gradeRequested: 'Grade A',
        offeredPricePerQuintal: 2350,
        offeredPricePerKg: 23.5,
        quantityRequiredQuintals: 25,
        deliveryCondition: 'Ex-FPO Hub',
        paymentTerms: '30% Advance + 70% T+1 Delivery',
        paymentSecurityType: 'bank_guarantee',
        inspectionRules: 'Visual check at pickup. Certified weighbridge weight.',
        historicalDisputeRate: 2.1,
        onTimePaymentScore: 91,
        expectedRejectionRisk: 2.0,
        distanceKm: 240,
        explainableScore: {
          totalScore: 86.8,
          netRealisationScore: 88.0,
          buyerVerificationScore: 89.0,
          paymentSecurityScore: 85.0,
          deliveryFeasibilityScore: 86.0,
          rejectionRiskScore: 86.0,
          rank: 3,
          rankingRationale: 'Ranked #3: Reliable bank guarantee terms and Ex-FPO pickup, but lower headline bid (₹23.50/kg) and partial lot capacity (25 Qtl vs 30 Qtl pool).'
        }
      }
    ],
    contract: {
      contractNumber: 'AGR-FPO-NSK-2026-ON08',
      poolId: 'POOL-2024-MH-ON-01',
      fpoName: 'Sahyadri Krishi Vikas Farmers Producer Co. Ltd.',
      buyerName: 'MahaAgro Export Consortium Ltd.',
      executedAt: '2026-09-14T11:00:00Z',
      pricingFormula: 'Payout_i = (Accepted kg_i × ₹24.00 × Grade Factor_i) − Allocated Logistics_i − Allocated Storage_i − Deductions_i + Incentives_i',
      lockedUnitPricePerKg: 24.0,
      agreedTotalKg: 3000,
      totalContractValue: 72000,
      gradeToleranceClause: 'BIS/IS 4333 compliant sampling. Max moisture 12.0%. Penalty of 1.0% per 1% moisture excess above 12.0%.',
      samplingStandard: 'Bureau of Indian Standards IS 4333 (Part 1 to 5) / Agmark Grading Rules 2020',
      weighmentSource: 'APMC Certified Electronic Weighbridge #WB-NSK-2026-8812 (Gross & Tare calibrated)',
      deductionSchedule: [
        { condition: 'Moisture > 12.0% and <= 15.0%', penaltyPercent: 1.0, rupeeImpactEstimate: 220 },
        { condition: 'Foreign Matter > 2.0%', penaltyPercent: 2.0, rupeeImpactEstimate: 0 },
        { condition: 'Rot/Sprouting > 1.0%', penaltyPercent: 5.0, rupeeImpactEstimate: 0 }
      ],
      pickupWindow: {
        start: '2026-09-14T08:00:00Z',
        end: '2026-09-14T18:00:00Z'
      },
      deliveryWindow: {
        start: '2026-09-15T06:00:00Z',
        end: '2026-09-15T14:00:00Z'
      },
      cancellationPenaltyClause: 'Defaulting party liable to 5% liquidated damages held in escrow as per e-NAM Rule 14B.',
      paymentMilestones: [
        { milestone: '100% Total Escrow Fund Lock (₹72,000) with Escrow Trustee Bank', percent: 100, status: 'escrowed' },
        { milestone: 'Dispatch Weighment Verification (40% advance payout released to FPO pool account)', percent: 40, status: 'escrowed' },
        { milestone: 'Final Lab Assay Clearance & Delivery Gate Acceptance (60% member passbook settlement)', percent: 60, status: 'escrowed' }
      ],
      disputeProcess: 'Arbitration under Indian Arbitration & Conciliation Act 1996 through e-NAM / APMC Disputes Tribunal, Nashik Bench.',
      contractHash: '0x8f2a991bce447101ad499120bc76aa23e981'
    },
    dispatchManifest: {
      manifestId: 'MNF-2026-NSK-8819',
      poolId: 'POOL-2024-MH-ON-01',
      vehicleNumber: 'MH-15-EG-4491',
      driverName: 'Balasaheb Shinde',
      driverPhone: '+91 98901 22345',
      originHub: 'Sahyadri Packhouse, Dindori, Nashik',
      destinationLocation: 'APMC Vashi Cold Storage Bay 4, Navi Mumbai',
      originWeighment: {
        grossKg: 7850,
        tareKg: 4850,
        netKg: 3000,
        slipNo: 'WB-NSK-2026-8812',
        timestamp: '2026-09-14T09:30:00Z'
      },
      destinationWeighment: {
        grossKg: 7842,
        tareKg: 4850,
        netKg: 2992,
        slipNo: 'WB-VSH-2026-1104',
        timestamp: '2026-09-15T07:15:00Z'
      },
      transitShrinkageKg: 8,
      shrinkagePercent: 0.27, // within 0.5% tolerance
      allowableShrinkageLimit: 0.5,
      scannedLotIds: ['LOT-ON-001', 'LOT-ON-002', 'LOT-ON-003'],
      dispatchPhotos: [
        'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=600&q=80'
      ],
      status: 'delivered'
    },
    warehouseReceipt: {
      eNwrNumber: 'eNWR-NeRL-2026-MH-ON-88910',
      repositoryName: 'NeRL',
      warehouseName: 'Maharashtra State Warehousing Corp (MSWC) Cold Storage Unit #3, Nashik',
      wdraRegistrationNo: 'WDRA/REG/MH/2019/04481',
      storageHubLocation: 'MSWC Hub, MIDC Ambad, Nashik',
      checkInTimestamp: '2026-09-14T10:00:00Z',
      storedQuantityQuintals: 30,
      storedQuantityKg: 3000,
      pledgeableCollateralValue: 64800, // 90% of contract value
      commodityGradeAssigned: 'FAQ Grade A Export Onion',
      validUntil: '2026-12-14',
      insurancePolicyNo: 'NIC-AGRI-WAREHOUSE-99120-2026',
      warehouseManagerSignature: 'Prakash G. Sonawane (MSWC Superintendent)'
    },
    settlementBatch: {
      id: 'SETTLE-2024-MH-ON-01',
      title: 'Audited Onion Pool Settlement Slip Batch #01',
      crop: 'Onion',
      variety: 'Garva Red (55mm+)',
      fpoName: 'Sahyadri Krishi Vikas Farmers Producer Co. Ltd.',
      buyerName: 'MahaAgro Export Consortium Ltd.',
      finalPoolUnitPrice: 24.0, // ₹24/kg
      totalAcceptedKg: 3000,
      totalLogisticsCost: 6000,
      unitLogisticsCost: 2.0, // ₹2/kg
      totalStorageCost: 0,
      unitStorageCost: 0,
      status: 'settled',
      createdAt: '2026-09-14T09:00:00Z',
      settlementDate: '2026-09-15T10:00:00Z',
      contractId: 'AGR-FPO-NSK-2026-ON08',
      escrowTotalAmount: 72000,
      participants: [
        {
          farmerId: 'farmer-ramesh-01',
          farmerName: 'Ramesh Patil',
          phone: '+91 98231 44510',
          district: 'Nashik',
          upiOrBank: 'rameshpatil@sbi / A/C **4921',
          acceptedKg: 1000,
          gradeFactor: 1.0,
          gradeFactorReason: 'Grade A Export standard bulb size (>55mm)',
          allocatedLogistics: 2000, // 1000kg * 2/kg
          allocatedStorage: 0,
          preAdjustmentNet: 22000, // 1000 * (24 - 2)
          deductions: [
            {
              id: 'DED-MOIST-001',
              title: 'Moisture Adjustment (1.0% on gross proceeds)',
              type: 'moisture_excess',
              percentage: 1.0,
              rupeeAmount: 220,
              evidence: {
                reportId: 'NABL/MH/2026/0984-ON',
                labName: 'FSSAI Notified & NABL Accredited Food Analysis Lab, Pune',
                testDate: '2026-09-13',
                testedMetric: 'Moisture Content (%)',
                measuredValue: '14.8%',
                agreedBaseline: 'Max 12.0% (Clause 4.2)',
                inspectorName: 'Dr. V. Joshi (Senior Food Assayer #NABL-984)',
                contractClause: 'Clause 4.2: 1% deduction applies for moisture between 12.1% and 15.0%',
                opticalScore: '94.2% visual purity',
                photoDescription: 'Slightly high moisture skin observed in bulk lot sampling.'
              }
            }
          ],
          incentives: [],
          finalPayout: 21780, // 22,000 - 220
          payoutStatus: 'settled',
          payoutRef: 'UPI-RBI-SETTLE-881920-PATIL'
        },
        {
          farmerId: 'farmer-suresh-02',
          farmerName: 'Suresh Deshmukh',
          phone: '+91 94222 18902',
          district: 'Nashik',
          upiOrBank: 'sureshdesh@hdfc / A/C **1190',
          acceptedKg: 1000,
          gradeFactor: 1.0,
          gradeFactorReason: 'Grade A standard, premium pungency & cure',
          allocatedLogistics: 2000,
          allocatedStorage: 0,
          preAdjustmentNet: 22000,
          deductions: [],
          incentives: [
            {
              id: 'INC-ZERO-DEFECT',
              title: 'Zero Defect & Optimal Moisture Premium',
              rupeeAmount: 200,
              reason: 'Moisture tested 11.2% (under 12% ceiling) with 0% rot'
            }
          ],
          finalPayout: 22200, // 22,000 + 200
          payoutStatus: 'settled',
          payoutRef: 'UPI-RBI-SETTLE-881921-SURESH'
        },
        {
          farmerId: 'farmer-anita-03',
          farmerName: 'Anita Shinde',
          phone: '+91 97654 33211',
          district: 'Nashik',
          upiOrBank: 'anitashinde@icici / A/C **7742',
          acceptedKg: 1000,
          gradeFactor: 1.0,
          gradeFactorReason: 'Grade A standard export quality',
          allocatedLogistics: 2000,
          allocatedStorage: 0,
          preAdjustmentNet: 22000,
          deductions: [],
          incentives: [],
          finalPayout: 22000,
          payoutStatus: 'settled',
          payoutRef: 'UPI-RBI-SETTLE-881922-ANITA'
        }
      ]
    }
  },
  {
    id: 'POOL-2024-MH-SB-02',
    code: 'FPO-LATUR-SOYBEAN-120Q',
    title: 'Latur Premium Yellow Soybean Aggregation Pool (High Oil)',
    fpoName: 'Marathwada Kisan Vikas Agro Producer Co. Ltd.',
    fpoRegistrationNo: 'U01111MH2020PTC345612',
    crop: 'Soybean',
    variety: 'JS-335 (Certified FAQ High Oil)',
    targetGrade: 'Grade A',
    targetQuantityQuintals: 120, // 12,000 kg
    currentQuantityQuintals: 120,
    collectionRadiusKm: 35,
    hubLocation: 'Latur Central Warehouse Hub, MIDC Latur',
    cutoffDate: '2026-09-22T17:00:00Z',
    destinationHub: 'Solapur Edible Oil Solvent Plant & Mandi',
    moistureToleranceMax: 10.0,
    defectToleranceMax: 2.0,
    costAllocationRule: 'Pro-Rata Per Accepted kg (Total Common Logistics ₹14,400 ÷ 12,000 kg = ₹1.20/kg)',
    status: 'open',
    lots: [
      {
        lotId: 'LOT-SB-001',
        farmerId: 'farmer-vikram-04',
        farmerName: 'Vikram Gaikwad',
        farmerPhone: '+91 99211 44552',
        village: 'Ausa',
        district: 'Latur',
        crop: 'Soybean',
        variety: 'JS-335',
        harvestDate: '2026-09-11',
        quantityQuintals: 40,
        quantityKg: 4000,
        declaredGrade: 'Grade A',
        declaredMoisture: 9.8,
        declaredForeignMatter: 1.2,
        gpsLocation: {
          lat: 18.2519,
          lng: 76.5029,
          address: 'Gat No 201, Ausa Road, Latur'
        },
        expectedPickupDate: '2026-09-17',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-12T14:30:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-SB-001:VIKRAM_GAIKWAD:4000KG:SOYBEAN:LATUR',
        photos: [
          'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
        ],
        testReportAttached: {
          labName: 'ICAR-Indian Institute of Soybean Research (IISR) Certified Assaying Lab, Indore',
          reportNo: 'ICAR-IISR-2026-SOY-4412',
          testDate: '2026-09-12',
          accreditationType: 'ICAR_Accredited',
          parameters: [
            { name: 'Oil Content (%)', value: '19.4%', standardLimit: 'Min 18.0%', pass: true },
            { name: 'Protein Content (%)', value: '40.2%', standardLimit: 'Min 38.0%', pass: true },
            { name: 'Moisture (%)', value: '9.8%', standardLimit: 'Max 10.0%', pass: true },
            { name: 'Foreign Matter (%)', value: '1.2%', standardLimit: 'Max 2.0%', pass: true }
          ]
        },
        fieldChecklist: {
          weighedKg: 4000,
          weighmentSlipNo: 'WB-LTR-2026-1120',
          visualInspectionOk: true,
          foreignMatterObserved: 1.2,
          inspectorAgent: 'Mahesh Jadhav (#MH-LTR-19)',
          checkedAt: '2026-09-13T09:00:00Z'
        },
        status: 'pooled'
      },
      {
        lotId: 'LOT-SB-002',
        farmerId: 'farmer-pramod-05',
        farmerName: 'Pramod Shinde',
        farmerPhone: '+91 98229 88123',
        village: 'Renapur',
        district: 'Latur',
        crop: 'Soybean',
        variety: 'JS-335',
        harvestDate: '2026-09-11',
        quantityQuintals: 50,
        quantityKg: 5000,
        declaredGrade: 'Grade A',
        declaredMoisture: 9.5,
        declaredForeignMatter: 0.9,
        gpsLocation: {
          lat: 18.5284,
          lng: 76.6214,
          address: 'Kisan Complex, Renapur, Latur'
        },
        expectedPickupDate: '2026-09-17',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-12T16:00:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-SB-002:PRAMOD_SHINDE:5000KG:SOYBEAN:LATUR',
        photos: [
          'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
        ],
        status: 'pooled'
      },
      {
        lotId: 'LOT-SB-003',
        farmerId: 'farmer-santosh-06',
        farmerName: 'Santosh Kadam',
        farmerPhone: '+91 97631 77621',
        village: 'Nilanga',
        district: 'Latur',
        crop: 'Soybean',
        variety: 'JS-335',
        harvestDate: '2026-09-10',
        quantityQuintals: 30,
        quantityKg: 3000,
        declaredGrade: 'Grade A',
        declaredMoisture: 10.0,
        declaredForeignMatter: 1.1,
        gpsLocation: {
          lat: 18.1189,
          lng: 76.7584,
          address: 'Main Road, Nilanga, Latur'
        },
        expectedPickupDate: '2026-09-17',
        farmerConsentGiven: true,
        farmerConsentTimestamp: '2026-09-12T17:15:00Z',
        qrCodeData: 'FASALFLOW:LOT:LOT-SB-003:SANTOSH_KADAM:3000KG:SOYBEAN:LATUR',
        photos: [
          'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80'
        ],
        status: 'pooled'
      }
    ],
    buyerDemandOffers: [
      {
        bidId: 'BID-SOLAPUR-SOLVENT-01',
        buyerId: 'buyer-solapur-oils',
        buyerName: 'Solapur Agro Solvents & Edible Oils Ltd.',
        companyName: 'Solapur Agro Industries Corp',
        gstin: '27AABCS9912D1Z8',
        kycStatus: 'e_nam_verified',
        crop: 'Soybean',
        gradeRequested: 'Grade A',
        offeredPricePerQuintal: 4850, // ₹48.50/kg
        offeredPricePerKg: 48.5,
        quantityRequiredQuintals: 120,
        deliveryCondition: 'Ex-FPO Hub',
        paymentTerms: '100% RBI Escrow',
        paymentSecurityType: 'escrow_locked',
        inspectionRules: 'Assaying by FSSAI Notified Lab at FPO Hub. Minimum 18.5% oil content benchmark.',
        historicalDisputeRate: 0.1,
        onTimePaymentScore: 98,
        expectedRejectionRisk: 0.5,
        distanceKm: 120,
        explainableScore: {
          totalScore: 97.2,
          netRealisationScore: 96.0,
          buyerVerificationScore: 99.0,
          paymentSecurityScore: 100.0,
          deliveryFeasibilityScore: 95.0,
          rejectionRiskScore: 96.0,
          rank: 1,
          rankingRationale: 'Ranked #1: Highest Net Realisation (₹47.30/kg net of ₹1.20 freight), 100% Escrow deposit locked, Ex-FPO Hub collection, 0.1% dispute history.'
        }
      },
      {
        bidId: 'BID-LATUR-LOCAL-OIL-02',
        buyerId: 'buyer-latur-crushers',
        buyerName: 'Marathwada Oil Extraction Mill',
        companyName: 'Marathwada Oil Millers Ltd',
        gstin: '27AABCM3312R1Z3',
        kycStatus: 'gst_verified',
        crop: 'Soybean',
        gradeRequested: 'Grade A',
        offeredPricePerQuintal: 4900, // ₹49.00/kg - Higher headline bid!
        offeredPricePerKg: 49.0,
        quantityRequiredQuintals: 120,
        deliveryCondition: 'CIF Buyer Mandi',
        paymentTerms: '30% Advance + 70% T+1 Delivery',
        paymentSecurityType: 'bank_guarantee',
        inspectionRules: 'Destination weighment and quality sampling at mill silo.',
        historicalDisputeRate: 4.8,
        onTimePaymentScore: 84,
        expectedRejectionRisk: 5.2,
        distanceKm: 45,
        explainableScore: {
          totalScore: 84.5,
          netRealisationScore: 91.0,
          buyerVerificationScore: 88.0,
          paymentSecurityScore: 80.0,
          deliveryFeasibilityScore: 90.0,
          rejectionRiskScore: 74.0,
          rank: 2,
          rankingRationale: 'Ranked #2: Higher headline bid (₹49/kg) but buyer reserves quality penalty deductions at destination silo with 5.2% rejection risk history.'
        }
      }
    ],
    warehouseReceipt: {
      eNwrNumber: 'eNWR-CCRL-2026-MH-SB-11920',
      repositoryName: 'CCRL',
      warehouseName: 'Central Warehousing Corporation (CWC) Agro Terminal, Latur',
      wdraRegistrationNo: 'WDRA/REG/MH/2018/01992',
      storageHubLocation: 'CWC Complex, Plot 14, MIDC Latur',
      checkInTimestamp: '2026-09-13T11:00:00Z',
      storedQuantityQuintals: 120,
      storedQuantityKg: 12000,
      pledgeableCollateralValue: 523800, // 90% of contract
      commodityGradeAssigned: 'Grade A FAQ Yellow Soybean',
      validUntil: '2027-03-31',
      insurancePolicyNo: 'UIIC-CWC-AGRO-2026-4401',
      warehouseManagerSignature: 'D. K. Shrivastava (CWC Warehouse Manager)'
    }
  }
];
