import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CallModal } from './components/CallModal';
import { FasalMitraChatbot } from './components/FasalMitraChatbot';
import { ToastContainer } from './components/ToastContainer';
import { BalanceDeltaNotification } from './components/BalanceDeltaNotification';
import { InsufficientBalanceModal } from './components/InsufficientBalanceModal';

import { HomeView } from './views/HomeView';
import { DashboardView } from './views/DashboardView';
import { MandiPricesView } from './views/MandiPricesView';
import { BrowseLotsView } from './views/BrowseLotsView';
import { CreateLotView } from './views/CreateLotView';
import { MyLotsView } from './views/MyLotsView';
import { TransportView } from './views/TransportView';
import { TransactionsView } from './views/TransactionsView';
import { AggregationPoolingView } from './views/AggregationPoolingView';
import { ChatView } from './views/ChatView';
import { ProfileView } from './views/ProfileView';
import { AboutView, HowItWorksView, ContactView, TermsView, PrivacyView } from './views/StaticViews';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const { insufficientBalanceDialog, closeInsufficientBalanceDialog } = useApp();

  const renderView = () => {
    switch (currentTab) {
      case 'home':
        return <HomeView setCurrentTab={setCurrentTab} />;
      case 'dashboard':
        return <DashboardView setCurrentTab={setCurrentTab} />;
      case 'mandi-prices':
        return <MandiPricesView setCurrentTab={setCurrentTab} />;
      case 'browse-lots':
        return <BrowseLotsView setCurrentTab={setCurrentTab} />;
      case 'create-lot':
        return <CreateLotView setCurrentTab={setCurrentTab} />;
      case 'my-lots':
        return <MyLotsView setCurrentTab={setCurrentTab} />;
      case 'transactions':
        return <TransactionsView setCurrentTab={setCurrentTab} />;
      case 'aggregation':
        return <AggregationPoolingView setCurrentTab={setCurrentTab} />;
      case 'transport':
        return <TransportView setCurrentTab={setCurrentTab} />;
      case 'chat':
        return <ChatView setCurrentTab={setCurrentTab} />;
      case 'profile':
        return <ProfileView setCurrentTab={setCurrentTab} />;
      case 'about':
        return <AboutView />;
      case 'how-it-works':
        return <HowItWorksView />;
      case 'contact':
        return <ContactView />;
      case 'terms':
        return <TermsView />;
      case 'privacy':
        return <PrivacyView />;
      default:
        return <HomeView setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="flex-1">
        {renderView()}
      </main>

      <Footer setCurrentTab={setCurrentTab} />

      {/* Global Overlays & Modals */}
      <AuthModal onLoginSuccess={() => setCurrentTab('dashboard')} />
      <CallModal />
      <FasalMitraChatbot />
      <ToastContainer />
      <BalanceDeltaNotification onOpenPassbook={() => setCurrentTab('transactions')} />
      <InsufficientBalanceModal
        isOpen={insufficientBalanceDialog.isOpen}
        onClose={closeInsufficientBalanceDialog}
        transactionTitle={insufficientBalanceDialog.transactionTitle}
        transactionType={insufficientBalanceDialog.transactionType}
        requiredAmount={insufficientBalanceDialog.requiredAmount}
        currentBalance={insufficientBalanceDialog.currentBalance}
        shortfall={insufficientBalanceDialog.shortfall}
        payerName={insufficientBalanceDialog.payerName}
        payerRole={insufficientBalanceDialog.payerRole}
        payerId={insufficientBalanceDialog.payerId}
        crop={insufficientBalanceDialog.crop}
        quantityQuintals={insufficientBalanceDialog.quantityQuintals}
        offerId={insufficientBalanceDialog.offerId}
        onRetry={insufficientBalanceDialog.onRetry}
      />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
