import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Check, ChevronDown, Search, Globe } from 'lucide-react';
import { changeLanguage as executeChangeLanguage } from '../i18n';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../data/languages';
import { SupportedLanguage } from '../types';

export { SUPPORTED_LANGUAGES };
export type { LanguageOption };

interface LanguageSelectorProps {
  variant?: 'navbar' | 'floating' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ 
  variant = 'navbar',
  className = '' 
}) => {
  const { i18n, t } = useTranslation();
  const { setLanguage: setAppContextLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize active language code
  const currentLangCode = (i18n.language?.split('-')[0] as SupportedLanguage) || 'en';
  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLangCode) || SUPPORTED_LANGUAGES[0];

  // Filter languages based on user search
  const filteredLanguages = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return SUPPORTED_LANGUAGES;
    return SUPPORTED_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [searchTerm]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = async (langCode: SupportedLanguage) => {
    console.log(`🔘 [LanguageSelector] Switching to language: "${langCode}"`);
    
    // 1. Trigger i18next language switch
    await executeChangeLanguage(langCode);
    
    // 2. Sync React AppContext state
    if (setAppContextLanguage) {
      setAppContextLanguage(langCode);
    }

    setIsOpen(false);
  };

  if (variant === 'full') {
    return (
      <div className={`p-5 bg-slate-900 border border-slate-800 rounded-2xl ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center space-x-2.5 text-emerald-400">
            <Globe className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                {t('language.select', 'भाषा चुनें / Select Language (22 Official Indian Languages)')}
              </h3>
              <p className="text-xs text-slate-400">
                Choose from all 22 official languages of India for full app localization
              </p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search language / भाषा खोजें..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-800/90 text-white rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 max-h-96 overflow-y-auto pr-1">
          {filteredLanguages.map((l) => {
            const isSelected = currentLangCode === l.code;
            return (
              <button
                key={l.code}
                id={`lang-btn-full-${l.code}`}
                onClick={() => handleLanguageSelect(l.code)}
                className={`flex flex-col justify-between p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-700 text-white border-emerald-400 shadow-md shadow-emerald-950 font-bold scale-[1.02]'
                    : 'bg-slate-800/70 text-slate-200 border-slate-700/80 hover:bg-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start justify-between w-full">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-900/60 text-emerald-400">
                    {l.badge}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-200" />}
                </div>
                <div className="mt-2">
                  <div className="text-sm font-bold truncate">{l.nativeName}</div>
                  <div className={`text-[11px] truncate ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {l.name}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Dropdown Toggle Button */}
      <button
        id="language-selector-dropdown-btn"
        type="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 active:bg-emerald-900 text-emerald-100 text-xs sm:text-sm font-medium border border-emerald-700/60 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900"
        title={t('language.select', 'Change Language')}
      >
        <Languages className="w-4 h-4 text-emerald-400 flex-shrink-0" />
        <span className="font-bold text-white tracking-wide max-w-[85px] sm:max-w-none truncate">
          {currentLang.nativeName}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-200 font-mono font-bold uppercase hidden sm:inline-block">
          {currentLang.badge}
        </span>
        <ChevronDown 
          className={`w-3.5 h-3.5 text-emerald-300 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="language-selector-menu"
          role="menu"
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-slate-200 transform origin-top-right focus:outline-none backdrop-blur-xl overflow-hidden"
        >
          {/* Header & Search */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                22 Indian Languages
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {SUPPORTED_LANGUAGES.length} Total
              </span>
            </div>
            
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search language / भाषा खोजें..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-800/90 text-white placeholder-slate-400 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
              />
            </div>
          </div>

          {/* Languages Scroll List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60 py-1">
            {filteredLanguages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No language found matching "{searchTerm}"
              </div>
            ) : (
              filteredLanguages.map((l) => {
                const isSelected = currentLangCode === l.code;
                return (
                  <button
                    key={l.code}
                    id={`language-option-${l.code}`}
                    role="menuitem"
                    onClick={() => handleLanguageSelect(l.code)}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-emerald-950/90 text-emerald-300 font-bold border-l-4 border-emerald-400 pl-2.5'
                        : 'hover:bg-slate-800/70 text-slate-200 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-slate-800 flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-emerald-400 border border-slate-700 font-mono">
                        {l.badge}
                      </span>
                      <div className="truncate">
                        <div className="font-semibold text-slate-100 flex items-center gap-1.5 truncate">
                          <span>{l.nativeName}</span>
                          <span className="text-[11px] font-normal text-slate-400">({l.name})</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{l.region}</div>
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 text-[10px] text-slate-400 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <span>Active: <span className="text-emerald-400 font-bold font-mono">{currentLang.nativeName} ({currentLangCode})</span></span>
            <span className="text-slate-400">Fasal Flow v1</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
