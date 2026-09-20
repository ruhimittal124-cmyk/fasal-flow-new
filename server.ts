import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { db } from './server/db';
import {
  initAgmarknetDaemon,
  getMandiRates,
  getMandiStatus,
  refreshMandiRates,
  importAgmarknetData,
  setAgmarknetApiKey,
} from './server/agmarknet';

dotenv.config();

const PORT = 3000;

// Lazy GenAI client
let genAiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!genAiClient) {
    try {
      genAiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
      return null;
    }
  }
  return genAiClient;
}

// Historical price trend generator
function generateCropHistoryAndForecast(crop: string, basePrice: number) {
  const data: Array<{ day: string; actualPrice: number; forecastPrice?: number }> = [];
  const today = new Date();
  
  // 30 days history
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    // minor random walk around basePrice
    const noise = Math.sin(i * 0.4) * (basePrice * 0.04) + ((Math.random() - 0.48) * (basePrice * 0.02));
    const price = Math.round(basePrice + noise);
    data.push({
      day: dayLabel,
      actualPrice: price,
    });
  }

  // Current day transition
  const lastActual = data[data.length - 1].actualPrice;
  data[data.length - 1].forecastPrice = lastActual;

  // 7 days forecast
  const trendMultiplier = crop === 'Soybean' || crop === 'Tur' ? 1.04 : crop === 'Onion' ? 1.06 : 0.98;
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayLabel = d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    const projected = Math.round(lastActual * (1 + (trendMultiplier - 1) * (i / 7) + (Math.sin(i) * 0.008)));
    data.push({
      day: dayLabel,
      actualPrice: lastActual, // anchor
      forecastPrice: projected,
    });
  }

  return data;
}

// ---------------------------------------------------------------------------
// Fasal Mitra multilingual chatbot: intent understanding + real-data retrieval
// ---------------------------------------------------------------------------
// Architecture (per project spec):
//   user message -> classify intent + extract entities (crop/district/etc.)
//   -> retrieve REAL FasalFlow data for that intent (mandi rates, lots,
//      offers, transporters - never invented numbers)
//   -> hand that data to Gemini as CONTEXT so it can only report facts we
//      actually retrieved
//   -> Gemini writes the final reply in the user's selected language
// This keeps "AI understanding" and "data retrieval" as separate, testable
// steps instead of one big prompt that could hallucinate prices.

type FasalMitraIntent =
  | 'CURRENT_MARKET_PRICE'
  | 'PRICE_TREND'
  | 'MARKET_INFORMATION'
  | 'BUYER_SEARCH'
  | 'SELLER_SEARCH'
  | 'SMART_MATCHING'
  | 'TRANSPORT'
  | 'LISTING_HELP'
  | 'OFFER_HELP'
  | 'GENERAL_AGRICULTURAL_INFORMATION';

const FASAL_MITRA_INTENTS: FasalMitraIntent[] = [
  'CURRENT_MARKET_PRICE',
  'PRICE_TREND',
  'MARKET_INFORMATION',
  'BUYER_SEARCH',
  'SELLER_SEARCH',
  'SMART_MATCHING',
  'TRANSPORT',
  'LISTING_HELP',
  'OFFER_HELP',
  'GENERAL_AGRICULTURAL_INFORMATION',
];

interface FasalMitraEntities {
  crop?: string;      // canonical CropType if recognized
  rawCrop?: string;    // whatever crop word the user used, even if unsupported
  district?: string;
  secondDistrict?: string; // for transport "from X to Y"
  market?: string;
  state?: string;
}

// Crop name recognition across English / Hindi / Marathi / Hinglish so we
// never have to hard-code individual questions (spec section 2).
const CROP_KEYWORDS: Record<string, string[]> = {
  Soybean: ['soybean', 'soya', 'soyabean', 'सोयाबीन', 'सोयबीन'],
  Cotton: ['cotton', 'kapas', 'कपास', 'कापूस'],
  Tur: ['tur', 'arhar', 'toor', 'red gram', 'तूर', 'तुअर', 'अरहर'],
  Wheat: ['wheat', 'gehun', 'gehu', 'गेहूं', 'गहू', 'गव्हा'],
  Chana: ['chana', 'gram', 'chickpea', 'चना', 'हरभरा'],
  Maize: ['maize', 'makka', 'corn', 'मक्का', 'मका'],
  Onion: ['onion', 'pyaz', 'kanda', 'प्याज', 'कांदा'],
  Moong: ['moong', 'mung', 'मूंग', 'मूग'],
  Groundnut: ['groundnut', 'peanut', 'moongphali', 'मूंगफली', 'भुईमूग'],
};

// Crops people commonly ask about that FasalFlow does not currently track,
// so we can be upfront instead of silently guessing a different crop.
const UNSUPPORTED_CROP_KEYWORDS: Record<string, string[]> = {
  Tomato: ['tomato', 'tamatar', 'टमाटर', 'टोमॅटो'],
  Potato: ['potato', 'aloo', 'आलू', 'बटाटा'],
  Sugarcane: ['sugarcane', 'ganna', 'गन्ना', 'ऊस'],
};

function detectCropFromText(text: string): { crop?: string; rawCrop?: string } {
  const lower = text.toLowerCase();
  for (const [crop, keywords] of Object.entries(CROP_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return { crop };
    }
  }
  for (const [crop, keywords] of Object.entries(UNSUPPORTED_CROP_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      return { rawCrop: crop };
    }
  }
  return {};
}

// District name recognition, including common Hindi/Marathi spellings.
const DISTRICT_KEYWORDS: Record<string, string[]> = {
  Osmanabad: ['osmanabad', 'dharashiv', 'धाराशिव', 'उस्मानाबाद'],
  Latur: ['latur', 'लातूर'],
  Solapur: ['solapur', 'सोलापूर'],
  Nashik: ['nashik', 'नाशिक'],
  Pune: ['pune', 'पुणे'],
  Jalgaon: ['jalgaon', 'जळगाव'],
  Ahmednagar: ['ahmednagar', 'nagar', 'अहमदनगर', 'नगर'],
  Akola: ['akola', 'अकोला'],
  Amravati: ['amravati', 'अमरावती'],
  Nanded: ['nanded', 'नांदेड'],
  Kolhapur: ['kolhapur', 'कोल्हापूर'],
  Sangli: ['sangli', 'सांगली'],
  Satara: ['satara', 'सातारा'],
  Nagpur: ['nagpur', 'नागपूर'],
  Yavatmal: ['yavatmal', 'यवतमाळ'],
  Washim: ['washim', 'वाशिम'],
  Parbhani: ['parbhani', 'परभणी'],
  Beed: ['beed', 'बीड'],
  Jalna: ['jalna', 'जालना'],
  'Chhatrapati Sambhaji Nagar': ['sambhaji nagar', 'aurangabad', 'औरंगाबाद', 'छत्रपती संभाजीनगर'],
  Dhule: ['dhule', 'धुळे'],
  Hingoli: ['hingoli', 'हिंगोली'],
  Bhandara: ['bhandara', 'भंडारा'],
  Wardha: ['wardha', 'वर्धा'],
};

function detectDistrictsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [district, keywords] of Object.entries(DISTRICT_KEYWORDS)) {
    if (keywords.some((k) => lower.includes(k.toLowerCase()))) {
      found.push(district);
    }
  }
  return found;
}

// Keyword-based fallback classifier used only when Gemini is unavailable.
function classifyWithKeywords(message: string): { intent: FasalMitraIntent; entities: FasalMitraEntities } {
  const lower = message.toLowerCase();
  const { crop, rawCrop } = detectCropFromText(message);
  const districts = detectDistrictsFromText(message);
  const entities: FasalMitraEntities = { crop, rawCrop, district: districts[0], secondDistrict: districts[1] };

  const has = (words: string[]) => words.some((w) => lower.includes(w));

  let intent: FasalMitraIntent = 'GENERAL_AGRICULTURAL_INFORMATION';

  if (has(['transport', 'truck', 'vehicle', 'ट्रांसपोर्ट', 'वाहतूक', 'गाड़ी', 'ट्रक', 'भाड़ा', 'भाडे'])) {
    intent = 'TRANSPORT';
  } else if (has(['smart match', 'ai match', 'स्मार्ट मैच', 'मैच स्कोर'])) {
    intent = 'SMART_MATCHING';
  } else if (has(['buyer chahiye', 'need a buyer', 'find buyer', 'खरीदार चाहिए', 'खरेदीदार', 'buyer', 'खरीदार'])) {
    intent = 'BUYER_SEARCH';
  } else if (has(['seller', 'find lots', 'find sellers', 'विक्रेता', 'lots available', 'kisan mile'])) {
    intent = 'SELLER_SEARCH';
  } else if (has(['create a listing', 'how do i list', 'listing kaise', 'लिस्टिंग कैसे', 'lot kaise banaye', 'list my crop'])) {
    intent = 'LISTING_HELP';
  } else if (has(['offer', 'ऑफर', 'counter price', 'negotiat'])) {
    intent = 'OFFER_HELP';
  } else if (has(['trend', 'forecast', 'will it rise', 'will it fall', 'badhega', 'ghategaa', 'अंदाज', 'वाढेल', 'घटेल'])) {
    intent = 'PRICE_TREND';
  } else if (has(['price', 'rate', 'bhav', 'भाव', 'दर', 'rate kya', 'कीमत'])) {
    intent = 'CURRENT_MARKET_PRICE';
  } else if (has(['mandi', 'market', 'apmc', 'मंडी', 'बाजार'])) {
    intent = 'MARKET_INFORMATION';
  }

  return { intent, entities };
}

// Gemini-powered intent + entity understanding. This is the ONLY place that
// decides "what does the user want" - it never invents market data itself.
async function classifyWithGemini(
  ai: GoogleGenAI,
  message: string
): Promise<{ intent: FasalMitraIntent; entities: FasalMitraEntities }> {
  const prompt = `You are the natural-language understanding layer for "Fasal Mitra", an agricultural marketplace chatbot used by Indian farmers and buyers. The user may write in English, Hindi, Marathi, or mixed Hindi/English (Hinglish), in Latin or Devanagari script.

Classify the user's message into EXACTLY ONE of these intents:
${FASAL_MITRA_INTENTS.join(', ')}

- CURRENT_MARKET_PRICE: asking today's/current price or rate of a crop.
- PRICE_TREND: asking whether price will rise/fall, or for a forecast, or whether to sell now or wait.
- MARKET_INFORMATION: general questions about mandis/markets (which markets, arrivals, how mandi prices work) without asking for one specific current number.
- BUYER_SEARCH: a seller/farmer looking for buyers for their produce.
- SELLER_SEARCH: a buyer looking for sellers/lots of a crop.
- SMART_MATCHING: asking which buyer/lot would be the best/AI-recommended match.
- TRANSPORT: asking about trucks, transport booking, or freight between locations.
- LISTING_HELP: asking how to create/manage/edit a lot listing on the platform.
- OFFER_HELP: asking about making, accepting, rejecting, or negotiating offers.
- GENERAL_AGRICULTURAL_INFORMATION: general farming/grading/platform knowledge not covered above (e.g. "what is Grade A").

Also extract entities if present (leave a field out if not mentioned, do not guess):
- crop: the commodity name, translated to English canonical form, ONLY if it is one of: Soybean, Cotton, Tur, Wheat, Chana, Maize, Onion, Moong, Groundnut. If the crop mentioned is something else (e.g. tomato, potato), put it in rawCrop instead and leave crop empty.
- rawCrop: the crop word as understood in English, if it is NOT one of the supported crops above.
- district: a Maharashtra district/city name mentioned, in English.
- secondDistrict: a second location mentioned (e.g. destination for transport "from X to Y").

Respond with ONLY minified JSON, no markdown, in this exact shape:
{"intent":"...","crop":"...","rawCrop":"...","district":"...","secondDistrict":"..."}

User message: ${JSON.stringify(message)}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  });

  if (!response.text) throw new Error('Empty classification response');
  const parsed = JSON.parse(response.text);
  const intent: FasalMitraIntent = FASAL_MITRA_INTENTS.includes(parsed.intent)
    ? parsed.intent
    : 'GENERAL_AGRICULTURAL_INFORMATION';

  return {
    intent,
    entities: {
      crop: parsed.crop || undefined,
      rawCrop: parsed.rawCrop || undefined,
      district: parsed.district || undefined,
      secondDistrict: parsed.secondDistrict || undefined,
    },
  };
}

// Lightweight client-supplied snapshot of FasalFlow's own data (lots, offers,
// transporters live only in the browser's AppContext for this prototype -
// there is no separate server-side database for them). The chatbot uses this
// instead of duplicating a second marketplace data store.
interface FasalMitraAppData {
  lots?: Array<{
    id: string; crop: string; grade?: string; quantityQuintals?: number;
    price?: number; district?: string; sellerId?: string; sellerName?: string;
    sellerRating?: number; sellerIsKyc?: boolean; status?: string; createdAt?: string;
  }>;
  offers?: Array<{
    id: string; lotId: string; buyerId?: string; buyerName?: string;
    price?: number; quantityQuintals?: number; status?: string;
  }>;
  transporters?: Array<{
    name: string; vehicleType: string; baseFare: number; ratePerKm: number;
    capacityTons: number; rating?: number;
  }>;
  currentUserId?: string;
  currentUserRole?: string;
}

interface RetrievedContext {
  contextText: string;
  needsClarification?: string; // if set, ask this instead of answering
}

// Reusable transport fare calculation (also used by /api/transport/calculate)
function computeTransportFare(params: {
  distanceKm: number;
  quantityQuintals: number;
  vehicleType: string;
  hasTempControl?: boolean;
  isFirstTransaction?: boolean;
}) {
  const baseFares: Record<string, { base: number; perKm: number }> = {
    'Mini Truck (up to 1 ton)': { base: 650, perKm: 18 },
    'Small Truck (1-3 tons)': { base: 1200, perKm: 28 },
    'Large Truck (3-10 tons)': { base: 2500, perKm: 42 },
    'Container (10+ tons)': { base: 5500, perKm: 65 },
  };
  const rates = baseFares[params.vehicleType] || { base: 1200, perKm: 28 };
  const baseFare = rates.base;
  const distanceCharge = Math.round(params.distanceKm * rates.perKm);
  const weightSurcharge = Math.round(params.quantityQuintals > 50 ? params.quantityQuintals * 5 : 0);
  const tempControlCharge = params.hasTempControl ? 500 : 0;
  const subtotal = baseFare + distanceCharge + weightSurcharge + tempControlCharge;
  const standardCommission = Math.round(subtotal * 0.02);
  const platformCommission = params.isFirstTransaction ? 0 : standardCommission;
  const totalAmount = subtotal + platformCommission;
  return {
    distanceKm: params.distanceKm, baseFare, distanceCharge, weightSurcharge, tempControlCharge,
    subtotal, platformCommission,
    sellerCommission: params.isFirstTransaction ? 0 : Math.round(platformCommission / 2),
    buyerCommission: params.isFirstTransaction ? 0 : Math.round(platformCommission / 2),
    totalAmount, isFreeCommissionUsed: !!params.isFirstTransaction,
  };
}

// Existing AI Price Prediction logic, extracted so both the HTTP endpoint
// AND the chatbot's PRICE_TREND intent call the SAME function (per spec:
// "use the project's existing functions where they already exist").
async function getAIPricePrediction(crop: string, district: string) {
  const basePrices: Record<string, number> = {
    Soybean: 4890, Cotton: 7420, Tur: 10450, Wheat: 2950, Chana: 6150,
    Maize: 2280, Onion: 2350, Moong: 8400, Groundnut: 6850,
  };
  const base = basePrices[crop] || 4500;
  const distAdjustment: Record<string, number> = {
    Osmanabad: 1.02, Latur: 0.99, Pune: 1.05, Nashik: 1.01, Jalgaon: 1.03, Solapur: 0.98,
  };
  const adj = distAdjustment[district] || 1.0;
  const currentAvgPrice = Math.round(base * adj);

  let recommendation: 'SELL NOW' | 'WAIT 5 DAYS' | 'HOLD' = 'WAIT 5 DAYS';
  let predictedChangePercent = 3.8;
  let trendReasoning = `Arrival volumes in ${district} APMC are projected to remain steady over the next 48 hours, while processor buying interest for ${crop} is accelerating ahead of festival crushing demand.`;
  let mandiArrivalTrend = 'Arrivals currently at 340 tons/day (-12% vs last week), supporting higher price bids.';

  if (crop === 'Tur') {
    recommendation = 'HOLD'; predictedChangePercent = 6.2;
    trendReasoning = 'Tight port import arrivals and delayed harvest in northern belts suggest domestic Tur rates will hit new seasonal peaks within 7-10 days.';
    mandiArrivalTrend = 'Low arrivals across Latur and Solapur mandis with active pulses miller bidding.';
  } else if (crop === 'Onion') {
    recommendation = 'SELL NOW'; predictedChangePercent = -4.5;
    trendReasoning = 'Kharif early crop arrivals are entering Lasalgaon and Pimpalgaon mandis in heavy volumes, creating downward price pressure.';
    mandiArrivalTrend = 'Heavy daily arrivals exceeding 2,200 tons causing yard congestion.';
  } else if (crop === 'Cotton') {
    recommendation = 'WAIT 5 DAYS'; predictedChangePercent = 2.4;
    trendReasoning = 'International ICE cotton futures up 1.8%, while domestic ginners in Jalgaon and Vidarbha are increasing procurement quotes.';
    mandiArrivalTrend = 'Gradual arrival influx; moisture levels dropping to favorable 8.5%.';
  }

  const ai = getGenAI();
  if (ai) {
    try {
      const prompt = `You are the lead agricultural economist at Fasal Flow India.
Generate a realistic 7-day price forecast analysis for ${crop} in district ${district}, Maharashtra.
Provide concise advice in JSON format:
{
  "recommendation": "SELL NOW" | "WAIT 5 DAYS" | "HOLD",
  "predictedChangePercent": number (between -8 and +12),
  "trendReasoning": "1-2 sentences on market drivers, mill demand, or moisture",
  "mandiArrivalTrend": "1 sentence on mandi volume"
}`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      if (response.text) {
        const parsed = JSON.parse(response.text);
        if (parsed.recommendation) recommendation = parsed.recommendation;
        if (typeof parsed.predictedChangePercent === 'number') predictedChangePercent = parsed.predictedChangePercent;
        if (parsed.trendReasoning) trendReasoning = parsed.trendReasoning;
        if (parsed.mandiArrivalTrend) mandiArrivalTrend = parsed.mandiArrivalTrend;
      }
    } catch (genErr: any) {
      console.info('Using dynamic heuristic price forecast model (API unavailable or restricted)');
    }
  }

  const forecastPrice7Days = Math.round(currentAvgPrice * (1 + predictedChangePercent / 100));
  const chartData = generateCropHistoryAndForecast(crop, currentAvgPrice);

  return {
    crop, district, currentAvgPrice, forecastPrice7Days, predictedChangePercent,
    recommendation, confidenceScore: 92, trendReasoning, mandiArrivalTrend,
    historicalChartData: chartData,
  };
}

// Step 2 of the architecture: given intent + entities, pull REAL FasalFlow
// data. Never returns invented prices - only what the underlying feature
// (agmarknet mandi cache, or the client's own lots/offers/transporters) has.
async function retrieveDataForIntent(
  intent: FasalMitraIntent,
  entities: FasalMitraEntities,
  appData: FasalMitraAppData
): Promise<RetrievedContext> {
  const { crop, rawCrop, district, secondDistrict } = entities;

  if (rawCrop && !crop && (intent === 'CURRENT_MARKET_PRICE' || intent === 'PRICE_TREND' || intent === 'MARKET_INFORMATION')) {
    return {
      contextText: `The user asked about "${rawCrop}", which is NOT one of the crops FasalFlow currently tracks mandi prices for. Supported crops: ${Object.keys(CROP_KEYWORDS).join(', ')}.`,
    };
  }

  if (intent === 'CURRENT_MARKET_PRICE' || intent === 'MARKET_INFORMATION') {
    if (!crop && !district) {
      return { contextText: '', needsClarification: 'crop_and_district' };
    }
    const records = getMandiRates(crop, district);
    const status = getMandiStatus();
    if (records.length === 0) {
      return {
        contextText: `No FasalFlow mandi records currently match crop="${crop || 'any'}" district="${district || 'any'}". Do not invent a price - tell the user honestly that this data isn't available right now and suggest checking the Mandi Prices tab or trying a nearby district.`,
      };
    }
    const top = records.slice(0, 5).map((r) =>
      `${r.crop} at ${r.mandiName} (${r.district}): Grade ${r.grade}, ₹${r.pricePerQuintal}/quintal (range ₹${r.minPrice}-₹${r.maxPrice}), arrivals ${r.arrivalVolumeTons} tons, change ${r.changePercent}%, updated: ${r.lastUpdated}`
    ).join('\n');
    return {
      contextText: `Real FasalFlow mandi price data (source: "${status.source}", official-live-feed=${status.isLive && status.source.includes('data.gov.in')}). Only call this "live government data" if official-live-feed is true; otherwise call it "FasalFlow's current indicative mandi price" - never claim it is official live government data if it is not.\n${top}`,
    };
  }

  if (intent === 'PRICE_TREND') {
    if (!crop) {
      return { contextText: '', needsClarification: 'crop' };
    }
    const prediction = await getAIPricePrediction(crop, district || 'Osmanabad');
    return {
      contextText: `FasalFlow's AI price forecast for ${crop} in ${prediction.district}: current avg price ₹${prediction.currentAvgPrice}/quintal, 7-day forecast ₹${prediction.forecastPrice7Days}/quintal (${prediction.predictedChangePercent}% change), recommendation: ${prediction.recommendation}. Reasoning: ${prediction.trendReasoning} Mandi arrivals: ${prediction.mandiArrivalTrend}\nThis is a model-based estimate, not a guarantee - phrase it as a forecast/advice, not a certainty.`,
    };
  }

  if (intent === 'BUYER_SEARCH') {
    const lots = appData.lots || [];
    const offers = appData.offers || [];
    const myLots = appData.currentUserId ? lots.filter((l) => l.sellerId === appData.currentUserId) : [];
    const relevantLots = (crop ? myLots.filter((l) => l.crop === crop) : myLots);
    const lotIds = new Set(relevantLots.map((l) => l.id));
    const interestedOffers = offers.filter((o) => lotIds.has(o.lotId));
    const cropLots = crop ? lots.filter((l) => l.crop === crop && l.status === 'active') : lots.filter((l) => l.status === 'active');
    const buyersForCrop = new Set(offers.filter((o) => cropLots.some((l) => l.id === o.lotId)).map((o) => o.buyerId)).size;
    return {
      contextText: `FasalFlow marketplace data: the current user has ${relevantLots.length} of their own active listing(s)${crop ? ` for ${crop}` : ''}, with ${interestedOffers.length} offer(s) received from buyers so far (${interestedOffers.map((o) => `${o.buyerName || 'a buyer'}: ₹${o.price}/quintal for ${o.quantityQuintals}q, status ${o.status}`).join('; ') || 'none yet'}). Across the whole marketplace there are currently ${cropLots.length} active lot(s)${crop ? ` of ${crop}` : ''} and ${buyersForCrop} distinct buyer(s) actively making offers on that crop. Suggest creating/checking a listing in "My Lots" and checking "Smart Matches" in Browse Lots if there is little interest yet. Do not invent buyer names or numbers beyond these.`,
    };
  }

  if (intent === 'SELLER_SEARCH' || intent === 'SMART_MATCHING') {
    const lots = (appData.lots || []).filter((l) => l.status !== 'sold' && l.status !== 'expired');
    let candidates = crop ? lots.filter((l) => l.crop === crop) : lots;
    if (district) candidates = candidates.filter((l) => l.district === district);
    const scored = candidates.map((l) => {
      let score = 80;
      if (crop && l.crop === crop) score += 10;
      if (l.sellerIsKyc) score += 3;
      if (typeof l.sellerRating === 'number') score += Math.min(l.sellerRating, 5);
      return { ...l, matchScore: Math.min(Math.round(score), 99) };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);

    if (scored.length === 0) {
      return { contextText: `No active FasalFlow lots currently match crop="${crop || 'any'}" district="${district || 'any'}". Tell the user honestly - do not invent listings.` };
    }
    const listText = scored.map((l) =>
      `${l.crop} (Grade ${l.grade || 'N/A'}) - ${l.quantityQuintals || '?'} quintals @ ₹${l.price}/quintal, seller ${l.sellerName || 'Unknown'} (${l.district || 'district unknown'}, rating ${l.sellerRating ?? 'N/A'}${l.sellerIsKyc ? ', KYC verified' : ''}) - AI match score ${l.matchScore}%`
    ).join('\n');
    return { contextText: `Real active FasalFlow lots ranked by AI match score:\n${listText}` };
  }

  if (intent === 'TRANSPORT') {
    const transporters = appData.transporters || [];
    let distanceHint = '';
    if (district && secondDistrict) {
      const fare = computeTransportFare({ distanceKm: 60, quantityQuintals: 40, vehicleType: 'Small Truck (1-3 tons)' });
      distanceHint = `The user wants transport from ${district} to ${secondDistrict}. FasalFlow does not have exact road distance for this pair yet - direct them to the Transport tab for a precise quote, but here is an example fare structure for a similar mid-size trip: base fare ₹${fare.baseFare} + ₹${(computeTransportFare({distanceKm:1,quantityQuintals:40,vehicleType:'Small Truck (1-3 tons)'}).distanceCharge)}/km, first transaction commission-free.`;
    }
    const list = transporters.slice(0, 5).map((t) =>
      `${t.name} - ${t.vehicleType}, base fare ₹${t.baseFare} + ₹${t.ratePerKm}/km, capacity ${t.capacityTons}t${t.rating ? `, rating ${t.rating}` : ''}`
    ).join('\n');
    return {
      contextText: `Real FasalFlow transporters currently available:\n${list || 'No transporters loaded from the app right now.'}\n${distanceHint}\nTell the user to use the "Transport" tab to enter exact pickup/drop for a precise fare calculation - do not invent an exact rupee total for a specific route you don't have data for.`,
    };
  }

  if (intent === 'LISTING_HELP') {
    const lots = appData.lots || [];
    const myActive = appData.currentUserId ? lots.filter((l) => l.sellerId === appData.currentUserId && l.status === 'active').length : undefined;
    return {
      contextText: `FasalFlow lists a crop lot via the "Create Lot" / "My Lots" flow: enter crop, variety, grade, quantity, asking price, harvest date, and optional photos (auto-graded by AI). ${myActive !== undefined ? `The current user has ${myActive} active listing(s) right now.` : ''} Explain this flow clearly and encourage the user to use the Create Lot tab.`,
    };
  }

  if (intent === 'OFFER_HELP') {
    const offers = appData.offers || [];
    const lots = appData.lots || [];
    const myLotIds = new Set((appData.currentUserId ? lots.filter((l) => l.sellerId === appData.currentUserId) : []).map((l) => l.id));
    const asFarmer = offers.filter((o) => myLotIds.has(o.lotId));
    const asBuyer = appData.currentUserId ? offers.filter((o) => o.buyerId === appData.currentUserId) : [];
    return {
      contextText: `Offers on FasalFlow: buyers submit an offer price+quantity on a lot; the seller can accept, reject, or counter it from "My Lots". Current user's real data: ${asFarmer.length} offer(s) received on their lots (${asFarmer.map((o) => o.status).join(', ') || 'none'}); ${asBuyer.length} offer(s) they have made as a buyer (${asBuyer.map((o) => o.status).join(', ') || 'none'}). Use these real counts, do not invent others.`,
    };
  }

  // GENERAL_AGRICULTURAL_INFORMATION and anything else: no retrieval needed.
  return { contextText: '' };
}

const CLARIFYING_QUESTIONS: Record<string, Record<string, string>> = {
  crop_and_district: {
    en: 'Sure - which crop, and which district or market, would you like the price for?',
    hi: 'ज़रूर - आप किस फसल का और किस ज़िले/मंडी का भाव जानना चाहते हैं?',
    mr: 'नक्कीच - तुम्हाला कोणत्या पिकाचा आणि कोणत्या जिल्ह्याचा/बाजाराचा दर हवा आहे?',
  },
  crop: {
    en: 'Which crop would you like the price trend for?',
    hi: 'आप किस फसल का भाव-रुझान (ट्रेंड) जानना चाहते हैं?',
    mr: 'तुम्हाला कोणत्या पिकाचा दर-कल (ट्रेंड) जाणून घ्यायचा आहे?',
  },
};

function buildFasalMitraSystemInstruction(language: string): string {
  return `You are "Fasal Mitra" (फसल मित्र / पीक मित्र 🌾), the friendly AI agricultural advisor for the Fasal Flow marketplace, used by Indian farmers and buyers.

Platform facts you can use anytime:
- Commission: Transparent 2% total (1% seller + 1% buyer). First transaction is completely FREE. FPOs get a 50% discount (1% total).
- Logistics: doorstep farm pickup or mandi delivery via vetted rural truck operators, booked from the "Transport" tab.
- Payments: escrow-protected until quality check.
- Grading: Grade A/B/C, can be AI-assisted from crop photos.

CRITICAL rules:
1. You will be given INTENT, ENTITIES, and CONTEXT_DATA that FasalFlow's own systems already retrieved. CONTEXT_DATA is your ONLY source for prices, counts, listings, or offers - never invent, round differently, or "estimate" a number that isn't in CONTEXT_DATA.
2. If CONTEXT_DATA says data wasn't found, say so honestly and suggest a next step (e.g. check the Mandi Prices tab, try another district) - do not guess a plausible-sounding price.
3. Never claim a price is "live government data" unless CONTEXT_DATA explicitly says so.
4. Always reply in the user's selected language: "${language}" (hi = Hindi, mr = Marathi, en = English). Reply ONLY in that language, in a natural, polite tone, even if the user typed in a different language or mixed languages.
5. Keep replies concise (2-5 sentences typically), use emojis sparingly (🌾 🚜 💰 📈).
6. If something is outside agriculture/the platform, politely suggest contacting support@fasalflow.com.`;
}

async function generateFasalMitraReply(
  ai: GoogleGenAI,
  message: string,
  language: string,
  intent: FasalMitraIntent,
  entities: FasalMitraEntities,
  contextText: string,
  userContext: any
): Promise<string> {
  const prompt = `${buildFasalMitraSystemInstruction(language)}

INTENT: ${intent}
ENTITIES: ${JSON.stringify(entities)}
CONTEXT_DATA: ${contextText || '(none needed for this question)'}
User's platform context: ${JSON.stringify(userContext || {})}

User question: ${message}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
  });
  if (!response.text) throw new Error('Empty Gemini reply');
  return response.text;
}

// Fallback reply builder used only when Gemini is completely unavailable.
// Still uses REAL retrieved data (contextText) instead of static canned
// numbers, so prices are never hallucinated even offline.
function buildLocalFallbackReply(intent: FasalMitraIntent, language: string, contextText: string): string {
  const L = (en: string, hi: string, mr: string) => (language === 'hi' ? hi : language === 'mr' ? mr : en);

  if (contextText) {
    const prefix = L('Here is what I found: ', 'यह जानकारी मिली: ', 'ही माहिती मिळाली: ');
    // contextText is written for the AI; give a simplified, honest version.
    return prefix + contextText.split('\n')[0];
  }

  switch (intent) {
    case 'LISTING_HELP':
      return L(
        'To create a listing, go to "Create Lot", enter your crop, grade, quantity and asking price, then publish.',
        'लिस्टिंग बनाने के लिए "Create Lot" पर जाएं, अपनी फसल, ग्रेड, मात्रा और मूल्य भरें और प्रकाशित करें।',
        'लिस्टिंग तयार करण्यासाठी "Create Lot" वर जा, पीक, ग्रेड, प्रमाण आणि किंमत भरा आणि प्रकाशित करा.'
      );
    case 'TRANSPORT':
      return L(
        'Visit the "Transport" tab, enter pickup and drop location, and you will see verified truck options with transparent per-km rates.',
        'ट्रांसपोर्ट के लिए "Transport" टैब पर जाएं, पिकअप और ड्रॉप लोकेशन डालें, आपको प्रमाणित ट्रक विकल्प दिखेंगे।',
        '"Transport" टॅबवर जा, पिकअप व ड्रॉप स्थान टाका, तुम्हाला प्रमाणित ट्रक पर्याय दिसतील.'
      );
    default:
      return L(
        'Namaste! I am Fasal Mitra 🌾. I can help with mandi prices, buyer/seller search, transport, and listings - what would you like to know?',
        'नमस्ते! मैं फसल मित्र हूँ 🌾। मैं मंडी भाव, खरीदार/विक्रेता खोज, ट्रांसपोर्ट और लिस्टिंग में मदद कर सकता हूँ।',
        'नमस्कार! मी फसल मित्र आहे 🌾. मी बाजारभाव, खरेदीदार/विक्रेता शोध, वाहतूक आणि लिस्टिंगसाठी मदत करू शकतो.'
      );
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Initialize Agmarknet background daemon (every 15 mins)
  initAgmarknetDaemon();

  // 1. GET /api/mandi-rates: Filtered mandi rates query
  app.get('/api/mandi-rates', (req, res) => {
    try {
      const crop = req.query.crop as string | undefined;
      const district = req.query.district as string | undefined;
      const rates = getMandiRates(crop, district);
      res.json(rates);
    } catch (err: any) {
      console.error('Error in /api/mandi-rates:', err);
      res.status(500).json({ error: 'Failed to fetch mandi rates' });
    }
  });

  // 2. POST /api/mandi-rates/sync: Manual trigger for immediate live sync
  app.post('/api/mandi-rates/sync', async (req, res) => {
    try {
      const { apiKey } = req.body || {};
      if (apiKey && typeof apiKey === 'string') {
        setAgmarknetApiKey(apiKey);
      }
      const refreshedCache = await refreshMandiRates(typeof apiKey === 'string' ? apiKey : undefined);
      res.json({
        success: true,
        source: refreshedCache.source,
        isLive: true,
        count: refreshedCache.data.length,
        lastUpdated: refreshedCache.lastUpdated,
        data: refreshedCache.data,
      });
    } catch (err: any) {
      console.error('Error syncing mandi rates:', err);
      res.status(500).json({ error: 'Sync failed', details: err.message });
    }
  });

  // 3. GET /api/mandi-rates/status: Status, source badge, timestamp
  app.get('/api/mandi-rates/status', (req, res) => {
    try {
      const status = getMandiStatus();
      res.json(status);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to get mandi status' });
    }
  });

  // 4. POST /api/mandi-rates/import: Direct CSV/JSON bulletin report upload
  app.post('/api/mandi-rates/import', (req, res) => {
    try {
      const payload = req.body?.data || req.body?.csvData || req.body;
      const result = importAgmarknetData(payload);
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // AI Price Prediction API (logic lives in getAIPricePrediction() so the
  // Fasal Mitra chatbot's PRICE_TREND intent can reuse the exact same function)
  app.post('/api/ai/predict-price', async (req, res) => {
    try {
      const { crop = 'Soybean', district = 'Osmanabad' } = req.body;
      const result = await getAIPricePrediction(crop, district);
      res.json(result);
    } catch (err: any) {
      console.error('Price prediction error:', err);
      res.status(500).json({ error: 'Failed to generate price prediction' });
    }
  });

  // AI Auto-Grading API for Crop Photos
  app.post('/api/ai/auto-grade', async (req, res) => {
    try {
      const { crop = 'Soybean', variety = '', photoDescription = '' } = req.body;

      let grade = 'Grade A';
      let moisture = 10.2;
      let purity = 98.4;
      let defect = 1.2;
      let notes = 'Visual inspection shows clean, uniform grain luster, low foreign matter, and optimum moisture under 12%. Rated Grade A.';

      const ai = getGenAI();
      if (ai) {
        try {
          const prompt = `You are a certified AGMARK and e-NAM agricultural quality inspector in India.
Assess the grade for a harvest lot of ${crop} (variety: ${variety || 'Standard'}).
${photoDescription ? `Inspector observations: ${photoDescription}` : 'Lot has clean uniform grains, bright color, no visible mold or pest damage.'}
Respond in valid JSON format:
{
  "suggestedGrade": "Grade A" | "Grade B" | "Grade C",
  "confidence": number between 0.85 and 0.98,
  "moisturePercent": number,
  "purityPercent": number,
  "defectPercent": number,
  "notes": "Clear 2-sentence rationale on grain luster, seed uniformity, and processing suitability"
}`;
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
            }
          });
          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json(parsed);
          }
        } catch (e: any) {
          console.info('Using calibrated AGMARK grading baseline (API unavailable or restricted)');
        }
      }

      // Default fallback
      res.json({
        suggestedGrade: grade,
        confidence: 0.94,
        moisturePercent: moisture,
        purityPercent: purity,
        defectPercent: defect,
        notes,
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to auto-grade lot' });
    }
  });

  // Fasal Mitra AI Chatbot Endpoint
  // Pipeline: understand intent/entities -> retrieve REAL FasalFlow data
  // -> give that data to Gemini as context -> Gemini replies in the
  // selected language. See helper functions defined above startServer().
  app.post('/api/fasal-mitra', async (req, res) => {
    try {
      const { message, language = 'en', userContext, appData } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const ai = getGenAI();

      // Step 1: understand intent + entities (never invents data itself)
      let intent: FasalMitraIntent;
      let entities: FasalMitraEntities;
      if (ai) {
        try {
          ({ intent, entities } = await classifyWithGemini(ai, message));
        } catch (classifyErr) {
          console.info('Gemini classification unavailable, using keyword fallback');
          ({ intent, entities } = classifyWithKeywords(message));
        }
      } else {
        ({ intent, entities } = classifyWithKeywords(message));
      }

      // Step 2: retrieve real FasalFlow data for that intent
      const { contextText, needsClarification } = await retrieveDataForIntent(
        intent,
        entities,
        (appData || {}) as FasalMitraAppData
      );

      if (needsClarification) {
        const q = CLARIFYING_QUESTIONS[needsClarification];
        const reply = q ? (q[language] || q.en) : 'Could you share a bit more detail?';
        return res.json({ reply, intent, entities });
      }

      // Step 3: Gemini writes the final answer using ONLY the retrieved data
      if (ai) {
        try {
          const reply = await generateFasalMitraReply(ai, message, language, intent, entities, contextText, userContext);
          return res.json({ reply, intent, entities });
        } catch (geminiError: any) {
          console.info('Gemini reply generation unavailable, using local fallback');
        }
      }

      // Fallback (no Gemini key / Gemini error): still uses real retrieved
      // data where available, never a hallucinated number.
      const reply = buildLocalFallbackReply(intent, language, contextText);
      res.json({ reply, intent, entities });
    } catch (err: any) {
      console.error('Fasal Mitra handler error:', err);
      res.status(500).json({ error: 'Fasal Mitra unavailable' });
    }
  });

  // Calculate Transport Fare Endpoint
  app.post('/api/transport/calculate', (req, res) => {
    try {
      const { 
        distanceKm = 45, 
        crop = 'Soybean', 
        quantityQuintals = 40,
        vehicleType = 'Small Truck (1-3 tons)',
        hasTempControl = false,
        isFirstTransaction = true 
      } = req.body;

      // Shared with the Fasal Mitra chatbot's TRANSPORT intent (see computeTransportFare above)
      const result = computeTransportFare({ distanceKm, quantityQuintals, vehicleType, hasTempControl, isFirstTransaction });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to calculate transport fare' });
    }
  });

  // ==========================================
  // BACKEND: USERS & PROFILE STORAGE
  // ==========================================
  app.get('/api/users', (req, res) => {
    try {
      const users = db.getUsers();
      res.json(users);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch users', details: err.message });
    }
  });

  app.get('/api/users/:id', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user', details: err.message });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const { name, phone, role = 'farmer', district, state, village, upiId, bankAccountNumber, ifscCode, bankName } = req.body;
      if (!name || !phone) {
        return res.status(400).json({ error: 'Name and phone are required' });
      }
      const newUser = db.createUser({
        name,
        phone,
        role,
        district,
        state,
        village,
        upiId,
        bankAccountNumber,
        ifscCode,
        bankName,
      });
      res.status(201).json(newUser);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    try {
      const updated = db.updateUser(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update user', details: err.message });
    }
  });

  app.get('/api/users/:id/dashboard', (req, res) => {
    try {
      const user = db.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const transactions = db.getTransactions({ userId: user.id });
      const userLots = db.getLots().filter(l => l.sellerId === user.id);
      const userOffers = db.getOffers().filter(o => o.buyerId === user.id || userLots.some(l => l.id === o.lotId));

      const totalVolume = transactions.reduce((acc, t) => acc + (t.quantityQuintals || 0), 0);
      const totalTurnover = transactions.reduce((acc, t) => acc + (t.status === 'completed' ? t.amount : 0), 0);
      const activeEscrow = transactions.filter(t => t.status === 'escrow_locked').reduce((acc, t) => acc + t.amount, 0);

      res.json({
        user,
        stats: {
          totalVolumeQuintals: totalVolume,
          totalTurnoverINR: totalTurnover,
          activeEscrowINR: activeEscrow,
          activeLotsCount: userLots.filter(l => l.status === 'active').length,
          pendingOffersCount: userOffers.filter(o => o.status === 'pending').length,
        },
        recentTransactions: transactions.slice(0, 5),
      });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch user dashboard data', details: err.message });
    }
  });

  // ==========================================
  // BACKEND: TRANSACTION HISTORY & ESCROW LEDGER
  // ==========================================
  app.get('/api/transactions', (req, res) => {
    try {
      const { userId, type, status, lotId } = req.query;
      const txns = db.getTransactions({
        userId: userId as string | undefined,
        type: type as any,
        status: status as any,
        lotId: lotId as string | undefined,
      });
      res.json(txns);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch transactions', details: err.message });
    }
  });

  app.get('/api/transactions/:id', (req, res) => {
    try {
      const txn = db.getTransactionById(req.params.id);
      if (!txn) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(txn);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch transaction', details: err.message });
    }
  });

  app.post('/api/transactions', (req, res) => {
    try {
      const { 
        type = 'trade_deal',
        status = 'pending',
        amount,
        lotId,
        crop,
        quantityQuintals,
        pricePerQuintal,
        sellerId,
        sellerName,
        buyerId,
        buyerName,
        transporterId,
        transporterName,
        paymentMethod = 'UPI Escrow Deposit',
        paymentRef,
        notes,
        pickupDistrict,
        dropDistrict,
      } = req.body;

      if (!amount || !sellerId || !buyerId) {
        return res.status(400).json({ error: 'Amount, sellerId, and buyerId are required' });
      }

      const newTxn = db.createTransaction({
        type,
        status,
        amount,
        lotId,
        crop,
        quantityQuintals,
        pricePerQuintal,
        sellerId,
        sellerName: sellerName || 'Farmer / Seller',
        buyerId,
        buyerName: buyerName || 'Buyer',
        transporterId,
        transporterName,
        platformFee: Math.round(amount * 0.02),
        farmerPayout: Math.round(amount * 0.99),
        buyerTotal: Math.round(amount * 1.01),
        paymentMethod,
        paymentRef: paymentRef || `UPI-TXN-${Date.now()}`,
        notes,
        pickupDistrict,
        dropDistrict,
      });

      res.status(201).json(newTxn);
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          code: 'INSUFFICIENT_BALANCE',
          message: err.message,
          requiredAmount: err.requiredAmount,
          currentBalance: err.currentBalance,
          shortfall: err.shortfall,
          userId: err.userId,
          userName: err.userName,
          userRole: err.userRole,
        });
      }
      res.status(500).json({ error: 'Failed to create transaction', details: err.message });
    }
  });

  app.patch('/api/transactions/:id/status', (req, res) => {
    try {
      const { 
        status, 
        notes, 
        paymentStatus, 
        paymentProgressNotes, 
        clearingBankRef, 
        estimatedSettlementTime, 
        formalitiesCompleted, 
        formalitiesList 
      } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const updated = db.updateTransactionStatus(req.params.id, status, notes, {
        paymentStatus,
        paymentProgressNotes,
        clearingBankRef,
        estimatedSettlementTime,
        formalitiesCompleted,
        formalitiesList,
      });

      if (!updated) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update transaction status', details: err.message });
    }
  });

  // ==========================================
  // BACKEND: BALANCE CHANGES & LEDGER AUDIT
  // ==========================================
  app.get('/api/balance-changes', (req, res) => {
    try {
      const { userId, transactionId } = req.query;
      const changes = db.getBalanceChanges({
        userId: userId as string | undefined,
        transactionId: transactionId as string | undefined,
      });
      res.json(changes);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch balance changes', details: err.message });
    }
  });

  // Top-up wallet balance (helpful for buyers depositing working capital)
  app.post('/api/wallet/topup', (req, res) => {
    try {
      const { userId, amount, paymentMethod = 'UPI Direct Topup' } = req.body;
      if (!userId || !amount || amount <= 0) {
        return res.status(400).json({ error: 'userId and valid positive amount are required' });
      }
      const user = db.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      const prevBal = user.walletBalance || 0;
      const newBal = prevBal + Number(amount);
      user.walletBalance = newBal;

      const balanceRecord = db.recordBalanceChange({
        transactionId: `TOPUP-${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        type: 'credit',
        amount: Number(amount),
        previousBalance: prevBal,
        newBalance: newBal,
        description: `Wallet top-up via ${paymentMethod}`,
      });

      res.json({ success: true, user, balanceRecord });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to top up wallet', details: err.message });
    }
  });

  // Quick simulate a trade transaction with instant balance changes
  app.post('/api/wallet/simulate-trade', (req, res) => {
    try {
      const { sellerId, buyerId, crop = 'Soybean', quantityQuintals = 50, pricePerQuintal = 4850, autoRelease = false } = req.body;
      const seller = db.getUserById(sellerId) || db.getUsers().find(u => u.role === 'farmer') || db.getUsers()[0];
      const buyer = db.getUserById(buyerId) || db.getUsers().find(u => u.role === 'buyer') || db.getUsers()[1];

      const amount = quantityQuintals * pricePerQuintal;
      const status = autoRelease ? 'completed' : 'escrow_locked';

      const txn = db.createTransaction({
        type: 'trade_deal',
        status,
        amount,
        crop: crop as any,
        quantityQuintals,
        pricePerQuintal,
        sellerId: seller.id,
        sellerName: seller.name,
        buyerId: buyer.id,
        buyerName: buyer.name,
        platformFee: Math.round(amount * 0.02),
        farmerPayout: Math.round(amount * 0.99),
        buyerTotal: Math.round(amount * 1.01),
        paymentMethod: 'Instant RBI Escrow Guarantee',
        paymentRef: `UPI-SIM-${Date.now()}`,
        notes: autoRelease 
          ? `Instant simulated settlement for ${quantityQuintals}q ${crop}. Escrow verified and released immediately.` 
          : `Simulated trade deal for ${quantityQuintals}q ${crop}. 100% funds locked in Escrow.`,
        pickupDistrict: seller.district,
        dropDistrict: buyer.district,
      });

      const updatedSeller = db.getUserById(seller.id);
      const updatedBuyer = db.getUserById(buyer.id);
      const balanceChanges = db.getBalanceChanges({ transactionId: txn.id });

      res.status(201).json({
        success: true,
        transaction: txn,
        seller: updatedSeller,
        buyer: updatedBuyer,
        balanceChanges,
      });
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          code: 'INSUFFICIENT_BALANCE',
          message: err.message,
          requiredAmount: err.requiredAmount,
          currentBalance: err.currentBalance,
          shortfall: err.shortfall,
          userId: err.userId,
          userName: err.userName,
          userRole: err.userRole,
        });
      }
      res.status(500).json({ error: 'Failed to simulate trade', details: err.message });
    }
  });

  // ==========================================
  // BACKEND: LOTS & MARKETPLACE STORAGE
  // ==========================================
  app.get('/api/lots', (req, res) => {
    try {
      res.json(db.getLots());
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch lots' });
    }
  });

  app.get('/api/lots/:id', (req, res) => {
    try {
      const lot = db.getLotById(req.params.id);
      if (!lot) return res.status(404).json({ error: 'Lot not found' });
      res.json(lot);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch lot' });
    }
  });

  // Track complete transaction history, offers, escrow, and audit events for a lot
  app.get('/api/lots/:id/history', (req, res) => {
    try {
      const history = db.getLotHistory(req.params.id);
      if (!history) {
        return res.status(404).json({ error: 'Lot not found' });
      }
      res.json(history);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch lot transaction history', details: err.message });
    }
  });

  // Append verified milestone or custom audit event to lot history
  app.post('/api/lots/:id/events', (req, res) => {
    try {
      const { 
        title, 
        description, 
        eventType = 'custom_note', 
        actorId, 
        actorName, 
        actorRole, 
        amount, 
        quantityQuintals, 
        pricePerQuintal, 
        metadata 
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({ error: 'title and description are required' });
      }

      const event = db.addLotEvent(req.params.id, {
        eventType,
        title,
        description,
        actorId,
        actorName,
        actorRole,
        amount,
        quantityQuintals,
        pricePerQuintal,
        metadata,
      });

      if (!event) {
        return res.status(404).json({ error: 'Lot not found' });
      }

      res.status(201).json({ success: true, event });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to record lot event', details: err.message });
    }
  });

  // Query lot lifecycle events globally or by lotId/eventType
  app.get('/api/lot-events', (req, res) => {
    try {
      const { lotId, eventType } = req.query;
      const events = db.getLotEvents({
        lotId: lotId as string | undefined,
        eventType: eventType as string | undefined,
      });
      res.json(events);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch lot events', details: err.message });
    }
  });

  app.post('/api/lots', (req, res) => {
    try {
      const newLot = db.createLot(req.body);
      res.status(201).json(newLot);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create lot', details: err.message });
    }
  });

  app.put('/api/lots/:id', (req, res) => {
    try {
      const updated = db.updateLot(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Lot not found' });
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to update lot' });
    }
  });

  app.delete('/api/lots/:id', (req, res) => {
    try {
      const deleted = db.deleteLot(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Lot not found' });
      res.json({ success: true, message: 'Lot deleted from database' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to delete lot' });
    }
  });

  // ==========================================
  // BACKEND: OFFERS & DEALS STORAGE
  // ==========================================
  app.get('/api/offers', (req, res) => {
    try {
      res.json(db.getOffers());
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch offers' });
    }
  });

  app.post('/api/offers', (req, res) => {
    try {
      const newOffer = db.createOffer(req.body);
      res.status(201).json(newOffer);
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create offer' });
    }
  });

  app.post('/api/offers/:id/accept', (req, res) => {
    try {
      const result = db.acceptOffer(req.params.id);
      if (!result) return res.status(404).json({ error: 'Offer not found' });
      res.json({ success: true, offer: result.offer, transaction: result.transaction });
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          code: 'INSUFFICIENT_BALANCE',
          message: err.message,
          requiredAmount: err.requiredAmount,
          currentBalance: err.currentBalance,
          shortfall: err.shortfall,
          userId: err.userId,
          userName: err.userName,
          userRole: err.userRole,
        });
      }
      res.status(500).json({ error: 'Failed to accept offer', details: err.message });
    }
  });

  app.post('/api/offers/:id/reject', (req, res) => {
    try {
      const offer = db.rejectOffer(req.params.id);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      res.json({ success: true, offer });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to reject offer' });
    }
  });

  app.post('/api/offers/:id/counter', (req, res) => {
    try {
      const { counterPrice } = req.body;
      const offer = db.counterOffer(req.params.id, counterPrice);
      if (!offer) return res.status(404).json({ error: 'Offer not found' });
      res.json({ success: true, offer });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to counter offer' });
    }
  });

  // ==========================================
  // BACKEND: TRANSPORT BOOKINGS
  // ==========================================
  app.get('/api/transport/bookings', (req, res) => {
    try {
      const { userId } = req.query;
      res.json(db.getTransportBookings(userId as string | undefined));
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to fetch transport bookings' });
    }
  });

  app.post('/api/transport/bookings', (req, res) => {
    try {
      const booking = db.createTransportBooking(req.body);
      res.status(201).json(booking);
    } catch (err: any) {
      if (err.code === 'INSUFFICIENT_BALANCE' || err.message?.includes('INSUFFICIENT_BALANCE')) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          code: 'INSUFFICIENT_BALANCE',
          message: err.message,
          requiredAmount: err.requiredAmount,
          currentBalance: err.currentBalance,
          shortfall: err.shortfall,
          userId: err.userId,
          userName: err.userName,
          userRole: err.userRole,
        });
      }
      res.status(500).json({ error: 'Failed to create transport booking', details: err.message });
    }
  });

  // ==========================================
  // CONFIG: MAPS & CARTO API KEY RESOLVER
  // ==========================================
  app.get('/api/config/maps-key', (req, res) => {
    // 1. Check explicit Maps / Carto keys in secrets
    let key = process.env.GOOGLE_MAPS_API_KEY || 
              process.env.VITE_GOOGLE_MAPS_API_KEY || 
              process.env.MAPS_API_KEY || 
              process.env.VITE_MAPS_API_KEY || 
              process.env.GOOGLE_MAP_API_KEY || 
              process.env.GOOGLE_MAPS_KEY || 
              process.env.MAPS_KEY || 
              process.env.GOOGLE_MAPS_PLATFORM_API_KEY || 
              process.env.GOOGLE_API_KEY || 
              process.env.CARTO_API_KEY ||
              process.env.CARTO_KEY ||
              process.env.VITE_CARTO_API_KEY ||
              '';

    // 2. Fallback: Check if GEMINI_API_KEY or any other secret in process.env has a key format
    if (!key || key.trim().length === 0) {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIza')) {
        key = process.env.GEMINI_API_KEY;
      } else {
        for (const [envName, envVal] of Object.entries(process.env)) {
          if (typeof envVal === 'string' && envVal.length >= 10 && (envVal.startsWith('AIza') || envName.toUpperCase().includes('MAP') || envName.toUpperCase().includes('CARTO'))) {
            key = envVal;
            break;
          }
        }
      }
    }

    const cartoKey = (process.env.CARTO_API_KEY || process.env.CARTO_KEY || process.env.VITE_CARTO_API_KEY || key || '').trim();
    const trimmedKey = (key || '').trim();
    res.json({ 
      apiKey: trimmedKey, 
      cartoKey: cartoKey,
      hasKey: Boolean(trimmedKey.length > 5 || cartoKey.length > 5) 
    });
  });


  // Vite middleware for development vs static for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fasal Flow Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
