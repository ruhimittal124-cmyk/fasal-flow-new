import React from 'react';
import { useTranslation } from 'react-i18next';
import { Sprout, ShieldCheck, Scale, Truck, PhoneCall, CheckCircle } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {t('about.title', 'About Fasal Flow India')}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {t('about.subtitle', 'Empowering farmers and buyers with AI technology, live mandi transparency, and direct trade.')}
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs space-y-6 text-sm text-slate-700 leading-relaxed">
        <p>
          {t('about.p1', 'Fasal Flow was founded to dismantle systemic agricultural exploitation in India. For decades, farmers in rural Maharashtra and across the nation have faced steep 8-12% commission deductions by intermediary arhatiyas, inaccurate manual grading, and lack of transport access.')}
        </p>
        <p>
          {t('about.p2', 'By connecting farm gates directly with industrial millers, seed processors, and food companies through transparent 2% flat fees, AI AGMARK quality evaluation, and automated rural logistics, Fasal Flow increases farm-gate realizations by 14-22%.')}
        </p>
      </div>
    </div>
  );
};

export const HowItWorksView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {t('howItWorks.title', 'How Fasal Flow Works')}
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          {t('howItWorks.subtitle', 'A seamless 4-step process from farm gate listing to bank account payout.')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">1</span>
          <h3 className="font-bold text-base text-slate-900">{t('howItWorks.step1Title', 'List Produce & AI Grade')}</h3>
          <p className="text-xs text-slate-600">{t('howItWorks.step1Desc', 'Farmer uploads harvest photos. Fasal Mitra AI auto-grades moisture, purity, and grain quality to certify Grade A specs.')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">2</span>
          <h3 className="font-bold text-base text-slate-900">{t('howItWorks.step2Title', 'Receive Direct Mill Bids')}</h3>
          <p className="text-xs text-slate-600">{t('howItWorks.step2Desc', 'Verified millers and FPOs submit direct purchase offers. Compare benchmark Agmarknet prices and accept or counter-bid in real-time.')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">3</span>
          <h3 className="font-bold text-base text-slate-900">{t('howItWorks.step3Title', 'Book Logistics with 1-Click')}</h3>
          <p className="text-xs text-slate-600">{t('howItWorks.step3Desc', 'Choose from regional verified mini trucks or heavy haulers with transparent per-km rates and farm-gate pickup.')}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">4</span>
          <h3 className="font-bold text-base text-slate-900">{t('howItWorks.step4Title', 'Instant Escrow Payout')}</h3>
          <p className="text-xs text-slate-600">{t('howItWorks.step4Desc', "Upon digital weighbridge and moisture confirmation at destination, funds are released directly to the farmer's bank account.")}</p>
        </div>
      </div>
    </div>
  );
};

export const ContactView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-900">{t('contact.title', 'Contact Fasal Flow Support')}</h1>
        <p className="text-xs text-slate-500">{t('contact.subtitle', 'Our agricultural helpline is available 7 days a week.')}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs text-slate-700">
        <p><strong>{t('contact.kisanSupport', 'Toll-Free Kisan Support')}:</strong> 1800-200-FASAL (1800-200-3272)</p>
        <p><strong>{t('contact.whatsapp', 'WhatsApp Support')}:</strong> +91 98221 45678</p>
        <p><strong>{t('contact.email', 'Email')}:</strong> support@fasalflow.in</p>
        <p><strong>{t('contact.office', 'Regional Head Office')}:</strong> Agtech Corridor, Latur - 413512, Maharashtra</p>
      </div>
    </div>
  );
};

export const TermsView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-700 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('terms.title', 'Terms of Service & Escrow Guidelines')}</h1>
      <p>1. <strong>Platform Commission:</strong> Fasal Flow levies a flat 1% seller fee and 1% buyer fee on finalized transactions.</p>
      <p>2. <strong>Quality Verification:</strong> All crop lots are subject to final destination sampling verifying stated moisture and purity within ±1.5% tolerance.</p>
      <p>3. <strong>Escrow Lock:</strong> Funds deposited by buyers are held securely until physical delivery confirmation.</p>
    </div>
  );
};

export const PrivacyView: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6 text-xs text-slate-700 leading-relaxed">
      <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('privacy.title', 'Privacy Policy')}</h1>
      <p>Fasal Flow encrypts all farmer contact details, Aadhaar KYC tokens, and financial transaction records with 256-bit AES encryption.</p>
    </div>
  );
};
