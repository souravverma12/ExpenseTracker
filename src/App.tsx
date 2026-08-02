import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TransactionModal } from './components/transactions/TransactionModal';
import { ConfirmationDialog } from './components/ui/ConfirmationDialog';

import { DashboardView } from './components/dashboard/DashboardView';
import { TransactionListView } from './components/transactions/TransactionListView';
import { BudgetsView } from './components/budgets/BudgetsView';
import { CalendarView } from './components/calendar/CalendarView';
import { CategoryManagerView } from './components/categories/CategoryManagerView';
import { SettingsView } from './components/settings/SettingsView';

const MainContent: React.FC = () => {
  const { 
    activeTab, 
    isLoading, 
    showMigrationPrompt, 
    isMigrating, 
    triggerMigration, 
    dismissMigration 
  } = useApp();
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  if (isLoading || isMigrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-indigo-400 font-semibold text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <span>{isMigrating ? 'Migrating local transactions to Cloud Firestore...' : 'Synchronizing secure financial ledger...'}</span>
        </div>
      </div>
    );
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'transactions':
        return <TransactionListView />;
      case 'budgets':
        return <BudgetsView />;
      case 'calendar':
        return <CalendarView />;
      case 'categories':
        return <CategoryManagerView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-200">
      <Sidebar isOpenMobile={isOpenMobile} setIsOpenMobile={setIsOpenMobile} />

      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <Header onOpenMobileMenu={() => setIsOpenMobile(true)} />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      <TransactionModal />

      {/* Local Data Cloud Migration Dialog */}
      <ConfirmationDialog
        isOpen={showMigrationPrompt}
        onClose={dismissMigration}
        onConfirm={triggerMigration}
        title="Sync Local Transactions to Cloud?"
        message="We detected existing local transactions on this device. Would you like to merge and upload them into your secure cloud profile so you can access them from anywhere?"
        confirmLabel="Merge Data to Cloud"
        cancelLabel="Keep Separated"
        isDanger={false}
      />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </ToastProvider>
  );
}

export default App;
