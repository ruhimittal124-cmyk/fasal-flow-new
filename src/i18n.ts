import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SupportedLanguage } from './types';

import enTranslation from './locales/en/translation.json';
import hiTranslation from './locales/hi/translation.json';
import mrTranslation from './locales/mr/translation.json';
import paTranslation from './locales/pa/translation.json';
import guTranslation from './locales/gu/translation.json';
import bnTranslation from './locales/bn/translation.json';
import taTranslation from './locales/ta/translation.json';
import teTranslation from './locales/te/translation.json';
import knTranslation from './locales/kn/translation.json';
import mlTranslation from './locales/ml/translation.json';
import orTranslation from './locales/or/translation.json';
import asTranslation from './locales/as/translation.json';
import urTranslation from './locales/ur/translation.json';
import saTranslation from './locales/sa/translation.json';
import neTranslation from './locales/ne/translation.json';
import maiTranslation from './locales/mai/translation.json';
import kokTranslation from './locales/kok/translation.json';
import ksTranslation from './locales/ks/translation.json';
import sdTranslation from './locales/sd/translation.json';
import doiTranslation from './locales/doi/translation.json';
import brxTranslation from './locales/brx/translation.json';
import satTranslation from './locales/sat/translation.json';
import mniTranslation from './locales/mni/translation.json';

export const defaultNS = 'translation';

export const resources = {
  en: { translation: enTranslation },
  hi: { translation: hiTranslation },
  mr: { translation: mrTranslation },
  pa: { translation: paTranslation },
  gu: { translation: guTranslation },
  bn: { translation: bnTranslation },
  ta: { translation: taTranslation },
  te: { translation: teTranslation },
  kn: { translation: knTranslation },
  ml: { translation: mlTranslation },
  or: { translation: orTranslation },
  as: { translation: asTranslation },
  ur: { translation: urTranslation },
  sa: { translation: saTranslation },
  ne: { translation: neTranslation },
  mai: { translation: maiTranslation },
  kok: { translation: kokTranslation },
  ks: { translation: ksTranslation },
  sd: { translation: sdTranslation },
  doi: { translation: doiTranslation },
  brx: { translation: brxTranslation },
  sat: { translation: satTranslation },
  mni: { translation: mniTranslation },
};

export const ALL_SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  'en', 'hi', 'mr', 'pa', 'gu', 'bn', 'ta', 'te', 'kn', 'ml',
  'or', 'as', 'ur', 'sa', 'ne', 'mai', 'kok', 'ks', 'sd', 'doi',
  'brx', 'sat', 'mni'
];

// Get initially saved language from localStorage (or fallback to 'en')
const initialLanguage: SupportedLanguage = (() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('fasalflow_lang') || localStorage.getItem('i18nextLng');
    if (saved && ALL_SUPPORTED_LANGUAGES.includes(saved as SupportedLanguage)) {
      return saved as SupportedLanguage;
    }
  }
  return 'en';
})();

console.log('🌐 [i18n] Initializing i18next with language:', initialLanguage);

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    defaultNS,
    supportedLngs: ALL_SUPPORTED_LANGUAGES,
    interpolation: {
      escapeValue: false, // React already safeguards from XSS
    },
    react: {
      useSuspense: false, // Disables Suspense requirement to prevent blank page flashes
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
  });

// Debug event listeners for language change verification
i18n.on('languageChanged', (lng) => {
  console.log('🌐 [i18n] Event fired: languageChanged ->', lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('fasalflow_lang', lng);
    localStorage.setItem('i18nextLng', lng);
  }
});

i18n.on('initialized', (options) => {
  console.log('🌐 [i18n] Event fired: initialized with options ->', options.lng);
});

export const changeLanguage = async (newLang: SupportedLanguage) => {
  console.log('🌐 [i18n] changeLanguage requested:', newLang, 'current is:', i18n.language);
  try {
    await i18n.changeLanguage(newLang);
    console.log('🌐 [i18n] changeLanguage resolved! Active language is now:', i18n.language);
    if (typeof window !== 'undefined') {
      localStorage.setItem('fasalflow_lang', newLang);
      localStorage.setItem('i18nextLng', newLang);
      // Dispatch a custom window event for any non-hook subscribers
      window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { language: newLang } }));
    }
  } catch (error) {
    console.error('❌ [i18n] Failed to change language:', error);
  }
};

export default i18n;
