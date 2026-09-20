import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Truck, Scale, PhoneCall } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-sm mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="font-extrabold text-xl text-white">Fasal<span className="text-emerald-400">Flow</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('footer.description', 'Empowering Indian farmers and agricultural buyers with direct market access, AI crop grading, Agmarknet live mandi rates, and seamless rural transport logistics.')}
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-900/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{t('footer.transparentFee', 'Transparent 2% Flat Fee (1% Seller + 1% Buyer)')}</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer.marketplace', 'Marketplace')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('browse-lots')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.browseLots', 'Browse Crop Lots')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('create-lot')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.sellProduce', 'Sell Farm Produce')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('mandi-prices')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.livePrices', 'Live Mandi Prices')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('transport')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.logistics', 'Logistics & Truck Booking')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('dashboard')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.analytics', 'Marketplace Analytics')}
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Pillars */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer.features', 'Key Features')}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center space-x-1.5">
                <Scale className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.featAiGrading', 'AI Computer Vision Crop Grading')}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.featDoorstep', 'Doorstep Farm Gate Pickup')}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.featEscrow', 'Escrow-Protected UPI/NEFT Deals')}</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('footer.featNegotiation', 'Direct Voice & Chat Negotiation')}</span>
              </li>
            </ul>
          </div>

          {/* Legal & About */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              {t('footer.info', 'Information')}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('about')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.about', 'About Fasal Flow')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.howItWorks', 'How It Works')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('contact')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.support', 'Contact Support')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('terms')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.terms', 'Terms of Service')}
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('privacy')} className="hover:text-emerald-400 transition-colors">
                  {t('footer.privacy', 'Privacy Policy')}
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* 22 Indian Languages Grid in Footer */}
        <div className="mt-10 pt-6 border-t border-slate-800">
          <LanguageSelector variant="full" />
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>{t('footer.copyright', '© 2026 Fasal Flow India. Built for Indian Agriculture.')}</p>
          <p className="mt-2 sm:mt-0 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
            <span>{t('footer.feedActive', 'Agmarknet Official Feed Active')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
