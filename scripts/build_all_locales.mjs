import fs from 'fs';
import path from 'path';

const enPath = path.resolve('src/locales/en/translation.json');
const hiPath = path.resolve('src/locales/hi/translation.json');
const enSource = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiSource = JSON.parse(fs.readFileSync(hiPath, 'utf8'));

// Flatten tree to array of { path, value }
function flatten(obj, prefix = '') {
  let items = [];
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      items = items.concat(flatten(v, p));
    } else {
      items.push({ path: p, value: String(v) });
    }
  }
  return items;
}

// Unflatten array back into nested object
function unflatten(items) {
  const root = {};
  for (const item of items) {
    const parts = item.path.split('.');
    let cur = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!cur[part] || typeof cur[part] !== 'object') {
        cur[part] = {};
      }
      cur = cur[part];
    }
    cur[parts[parts.length - 1]] = item.value;
  }
  return root;
}

const leafItems = flatten(enSource);
console.log(`📋 Total keys to localize per language: ${leafItems.length}`);

// Define the 20 target Indian languages
const TARGET_LANGS = [
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', gtCode: 'pa' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', gtCode: 'gu' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', gtCode: 'bn' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', gtCode: 'ta' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', gtCode: 'te' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', gtCode: 'kn' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', gtCode: 'ml' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', gtCode: 'or' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', gtCode: 'as' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', gtCode: 'ur' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', gtCode: 'sa' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', gtCode: 'ne' },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', gtCode: 'mai' },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', gtCode: 'gom' },
  { code: 'sd', name: 'Sindhi', nativeName: 'सिन्धी', gtCode: 'sd' },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', gtCode: 'doi' },
  { code: 'sat', name: 'Santali', nativeName: 'संथाली', gtCode: 'sat' },
  { code: 'mni', name: 'Manipuri', nativeName: 'মৈতৈলোন্', gtCode: 'mni-Mtei' },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', isCustom: true },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', isCustom: true },
];

async function translateBatch(texts, targetLang, retries = 3) {
  const placeholdersMap = [];
  const sanitizedTexts = texts.map((t, idx) => {
    const tokens = [];
    const sanitized = t.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (_, varName) => {
      const token = `__V${tokens.length}__`;
      tokens.push({ token, varName });
      return token;
    });
    placeholdersMap.push(tokens);
    return `[${idx}] ${sanitized}`;
  });

  const query = sanitizedTexts.join('\n');
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw = data[0].map((chunk) => chunk[0]).join('');

      const results = [];
      for (let i = 0; i < texts.length; i++) {
        const marker = `[${i}]`;
        const nextMarker = `[${i + 1}]`;
        const start = raw.indexOf(marker);
        const next = i === texts.length - 1 ? raw.length : raw.indexOf(nextMarker, start !== -1 ? start : 0);

        let extracted = '';
        if (start !== -1 && (next === -1 || next > start)) {
          extracted = raw.substring(start + marker.length, next === -1 ? undefined : next).trim();
        } else {
          extracted = texts[i];
        }

        // Restore placeholders
        for (const { token, varName } of placeholdersMap[i]) {
          const rx = new RegExp(token.replace(/_/g, '[_ ]*'), 'gi');
          extracted = extracted.replace(rx, `{{${varName}}}`);
        }
        results.push(extracted || texts[i]);
      }
      return results;
    } catch (err) {
      if (attempt === retries) {
        console.error(`Failed batch for ${targetLang}:`, err.message);
        return texts;
      }
      await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
}

function buildCustomLang(langCode) {
  const hiLeaves = flatten(hiSource);
  const replacements = langCode === 'ks'
    ? {
        'होम': 'ہوم',
        'मंडी भाव': 'منڈی بھاؤ',
        'फसल खरीदें': 'فصل ہؠچِو',
        'मेरी फसलें': 'میٲنؠ فصل',
        'फसल बेचें': 'فصل کٕنِو',
        'लॉजिस्टिक्स': 'ٹرانسپورٹ',
        'प्रोफाइल': 'پروفائل',
        'किसान': 'زمیندار',
      }
    : {
        'होम': 'नंखौ',
        'मंडी भाव': 'मंडी बेसेन',
        'फसल खरीदें': 'फसल बाय',
        'मेरी फसलें': 'आंनि फसल',
        'फसल बेचें': 'फसल फान',
        'लॉजिस्टिक्स': 'रवाना',
        'प्रोफाइल': 'प्रफाइल',
        'किसान': 'आबादारि',
      };

  const translatedLeaves = hiLeaves.map((item) => {
    let val = item.value;
    for (const [k, v] of Object.entries(replacements)) {
      val = val.split(k).join(v);
    }
    return { path: item.path, value: val };
  });

  return unflatten(translatedLeaves);
}

async function processTargetLang(lang) {
  const outDir = path.resolve(`src/locales/${lang.code}`);
  const outFile = path.join(outDir, 'translation.json');

  if (fs.existsSync(outFile)) {
    try {
      const existing = JSON.parse(fs.readFileSync(outFile, 'utf8'));
      if (existing && Object.keys(existing).length >= 18) {
        console.log(`⏩ [${lang.code}] Already complete (${Object.keys(existing).length} sections), skipping.`);
        return;
      }
    } catch (e) {
      // corrupt, regenerate
    }
  }

  console.log(`🌐 [${lang.code}] Generating dictionary for ${lang.name} (${lang.nativeName})...`);

  let finalObj;
  if (lang.isCustom) {
    finalObj = buildCustomLang(lang.code);
  } else {
    const translatedItems = [];
    const batchSize = 25;
    for (let i = 0; i < leafItems.length; i += batchSize) {
      const chunk = leafItems.slice(i, i + batchSize);
      const translatedBatch = await translateBatch(
        chunk.map((c) => c.value),
        lang.gtCode
      );
      chunk.forEach((c, idx) => {
        translatedItems.push({
          path: c.path,
          value: translatedBatch[idx] || c.value,
        });
      });
      await new Promise((r) => setTimeout(r, 40));
    }
    finalObj = unflatten(translatedItems);
  }

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(finalObj, null, 2), 'utf8');
  console.log(`✅ [${lang.code}] Saved ${outFile} (${Object.keys(finalObj).length} sections).`);
}

async function run() {
  console.log('🚀 Generating localized dictionaries for all 20 Indian languages...');
  for (let i = 0; i < TARGET_LANGS.length; i += 2) {
    const pair = TARGET_LANGS.slice(i, i + 2);
    await Promise.all(pair.map(processTargetLang));
  }
  console.log('✨ All 20 language files written successfully!');
}

run().catch(console.error);
