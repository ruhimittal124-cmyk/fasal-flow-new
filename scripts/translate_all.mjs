import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const enPath = path.resolve('src/locales/en/translation.json');
const enSource = JSON.parse(fs.readFileSync(enPath, 'utf8'));

export const TARGET_LANGUAGES = [
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', script: 'Odia' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', script: 'Bengali-Assamese' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', script: 'Perso-Arabic' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', script: 'Devanagari' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', script: 'Devanagari' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', script: 'Devanagari' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', script: 'Devanagari' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', script: 'Devanagari' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी', script: 'Devanagari' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', script: 'Devanagari' },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', script: 'Devanagari' },
  { code: 'sat', name: 'Santali', nativeName: 'संथाली', script: 'Devanagari' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', script: 'Bengali-Meetei' },
];

// Split source into 3 logical chunks to prevent token truncation
const chunkA = {
  nav: enSource.nav,
  hero: enSource.hero,
  stats: enSource.stats,
  highlights: enSource.highlights,
  pillars: enSource.pillars,
  ctaBanner: enSource.ctaBanner,
  dashboard: enSource.dashboard,
  mandiPrices: enSource.mandiPrices,
  footer: enSource.footer,
  crops: enSource.crops,
  language: enSource.language,
  common: enSource.common,
};

const chunkB = {
  browseLots: enSource.browseLots,
  createLot: enSource.createLot,
  myLots: enSource.myLots,
  transport: enSource.transport,
  transactions: enSource.transactions,
  chat: enSource.chat,
  profile: enSource.profile,
};

const chunkC = {
  aggregation: enSource.aggregation,
};

async function translateChunk(chunkData, lang, chunkName, retries = 3) {
  const prompt = `You are a professional agricultural and Indian localization expert.
Translate the following JSON string values into ${lang.name} (${lang.nativeName}, written naturally in ${lang.script} script).
Application context: "Fasal Flow" is an Indian agricultural marketplace connecting farmers, buyers, FPOs (Farmer Producer Organizations), and rural transport logistics with APMC mandi prices. Use natural, authentic agricultural terms used by farmers and traders in India.

CRITICAL RULES:
1. Preserve exact JSON keys, hierarchy, and variable placeholders (like {{count}}, {{name}}, etc.) unchanged.
2. Return ONLY the raw valid JSON object without any Markdown fences, backticks, or extra text.

Source JSON:
${JSON.stringify(chunkData, null, 2)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const text = response.text?.trim() || '';
      const cleanJson = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');
      const parsed = JSON.parse(cleanJson);
      return parsed;
    } catch (err) {
      console.warn(`[${lang.code}] Retry ${attempt}/${retries} for ${chunkName} failed:`, err.message);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

async function processLanguage(lang) {
  const targetDir = path.resolve(`src/locales/${lang.code}`);
  const targetFile = path.join(targetDir, 'translation.json');

  if (fs.existsSync(targetFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
      if (existing.nav && existing.profile && existing.transport && existing.aggregation) {
        console.log(`⏩ [${lang.code}] ${lang.name} already complete, skipping.`);
        return;
      }
    } catch (e) {
      // re-generate if corrupt
    }
  }

  console.log(`🌐 [${lang.code}] Starting translation for ${lang.name} (${lang.nativeName})...`);
  fs.mkdirSync(targetDir, { recursive: true });

  const [resA, resB, resC] = await Promise.all([
    translateChunk(chunkA, lang, 'chunkA'),
    translateChunk(chunkB, lang, 'chunkB'),
    translateChunk(chunkC, lang, 'chunkC'),
  ]);

  const merged = { ...resA, ...resB, ...resC };
  fs.writeFileSync(targetFile, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`✅ [${lang.code}] ${lang.name} successfully saved to ${targetFile}!`);
}

async function main() {
  console.log('🚀 Translating Fasal Flow into all 20 remaining official Indian languages...');
  
  // Process in small batches of 3 to avoid rate limits
  const batchSize = 3;
  for (let i = 0; i < TARGET_LANGUAGES.length; i += batchSize) {
    const batch = TARGET_LANGUAGES.slice(i, i + batchSize);
    await Promise.all(batch.map(processLanguage));
    if (i + batchSize < TARGET_LANGUAGES.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log('🎉 All 22 official languages + English now fully localized!');
}

main().catch((err) => {
  console.error('Fatal translation error:', err);
  process.exit(1);
});
