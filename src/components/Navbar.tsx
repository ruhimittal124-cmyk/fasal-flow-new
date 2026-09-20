import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  TrendingUp, 
  ShoppingBag, 
  PlusCircle, 
  Truck, 
  MessageSquare, 
  User, 
  Bot, 
  Menu, 
  X, 
  ShieldCheck, 
  Layers,
  ReceiptText,
  Boxes,
  LogOut
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LanguageSelector } from './LanguageSelector';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const { t } = useTranslation();
  const { currentUser, setAuthModalOpen, logout, setIsFasalMitraOpen, offers } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Count pending offers for badge
  const pendingOffersCount = offers.filter(o => o.status === 'pending').length;

  const navItems = [
    { id: 'home', label: t('nav.home', 'Home'), icon: Sprout },
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: Layers },
    { id: 'aggregation', label: t('nav.fpoPooling', 'FPO Pooling'), icon: Boxes },
    { id: 'mandi-prices', label: t('nav.mandiPrices', 'Mandi Prices'), icon: TrendingUp },
    { id: 'browse-lots', label: t('nav.browseLots', 'Browse Lots'), icon: ShoppingBag },
    { id: 'my-lots', label: t('nav.myLots', 'My Lots'), icon: ShieldCheck, badge: pendingOffersCount > 0 ? pendingOffersCount : undefined },
    { id: 'transactions', label: t('nav.passbookEscrow', 'Passbook & Escrow'), icon: ReceiptText },
    { id: 'transport', label: t('nav.transport', 'Logistics'), icon: Truck },
    { id: 'chat', label: t('nav.chat', 'Messages'), icon: MessageSquare },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white shadow-md border-b border-emerald-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            id="nav-brand-logo"
            onClick={() => setCurrentTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">Fasal<span className="text-emerald-400">Flow</span></span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-800/80 text-emerald-300 border border-emerald-700">
                  {t('nav.agmarknetLive', 'Agmarknet Live')}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/70 hidden sm:block">
                {t('nav.directNetwork', 'Direct Mandi & Farmer Network')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive 
                      ? 'bg-emerald-800 text-white shadow-inner font-semibold' 
                      : 'text-emerald-100 hover:bg-emerald-800/50 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-400/80'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Create Lot Shortcut Button */}
            <button
              id="nav-btn-create-lot"
              onClick={() => setCurrentTab('create-lot')}
              className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('nav.createLot', 'Sell Produce')}</span>
            </button>

            {/* Fasal Mitra Chatbot Trigger */}
            <button
              id="nav-btn-fasal-mitra"
              onClick={() => setIsFasalMitraOpen(true)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 text-xs font-semibold border border-emerald-700/60 shadow-sm"
              title="Fasal Mitra AI"
            >
              <Bot className="w-4 h-4 text-emerald-300 animate-pulse" />
              <span className="hidden sm:inline">{t('nav.aiMitra', 'AI Mitra')}</span>
            </button>

            {/* Language Switcher Dropdown */}
            <LanguageSelector variant="navbar" />

            {/* User Profile / Auth */}
            {currentUser ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  id="nav-btn-profile"
                  onClick={() => setCurrentTab('profile')}
                  className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-emerald-800/60 transition-colors cursor-pointer"
                  title={`${currentUser.name} (${currentUser.role}) - Click to view profile`}
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-semibold leading-tight text-white">{currentUser.name.split(' ')[0]}</p>
                    <p className="text-[10px] text-emerald-300 capitalize">{currentUser.role}</p>
                  </div>
                </button>

                <button
                  id="nav-btn-logout"
                  onClick={logout}
                  className="p-1.5 text-emerald-200 hover:text-white hover:bg-emerald-800/60 rounded-lg transition-colors cursor-pointer"
                  title="Log out of session"
                >
                  <LogOut className="w-4 h-4 text-emerald-300" />
                </button>
              </div>
            ) : (
              <button
                id="nav-btn-signin"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('nav.login', 'Sign In')}</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              id="nav-btn-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-emerald-200 hover:bg-emerald-800 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="nav-mobile-drawer" className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 pt-3 pb-5 space-y-3">
          <div className="pb-2 border-b border-emerald-800/80">
            <LanguageSelector variant="full" />
          </div>

          {/* Mobile Profile Card */}
          {currentUser ? (
            <div className="bg-emerald-900/80 p-3 rounded-xl border border-emerald-800 flex items-center justify-between">
              <div 
                className="flex items-center space-x-3 cursor-pointer"
                onClick={() => {
                  setCurrentTab('profile');
                  setMobileMenuOpen(false);
                }}
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{currentUser.name}</p>
                  <p className="text-xs text-emerald-300 capitalize">{currentUser.role} • {currentUser.phone}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 hover:bg-rose-900 hover:text-white text-xs font-bold flex items-center space-x-1"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm"
            >
              <User className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-emerald-800 text-white' : 'text-emerald-200 hover:bg-emerald-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => {
              setCurrentTab('create-lot');
              setMobileMenuOpen(false);
            }}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('nav.createLot', 'Sell Produce')}</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
