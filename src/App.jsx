import React, { useState, useEffect, useMemo, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import AnalyticsView from './components/AnalyticsView';
import ManageView from './components/ManageView';
import AddTransactionModal from './components/AddTransactionModal';
import { 
  getStoredTransactions, 
  saveStoredTransactions,
  getStoredBudgets, 
  saveStoredBudgets,
  getStoredRecurring, 
  saveStoredRecurring,
  getStoredSettings, 
  saveStoredSettings,
  loadStarterSampleData
} from './utils/storage';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [recurring, setRecurring] = useState([]);
  const [settings, setSettings] = useState({ currency: '₹', currencyCode: 'INR' });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [manageSubTab, setManageSubTab] = useState('budgets');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Refs for tracking navigation state in popstate listener without stale closures
  const activeTabRef = useRef(activeTab);
  const manageSubTabRef = useRef(manageSubTab);
  const isAddModalOpenRef = useRef(isAddModalOpen);
  const lastBackPressTimeRef = useRef(0);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    manageSubTabRef.current = manageSubTab;
  }, [manageSubTab]);

  useEffect(() => {
    isAddModalOpenRef.current = isAddModalOpen;
  }, [isAddModalOpen]);

  // Current Month State (Format: YYYY-MM)
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  // Load from storage on mount
  useEffect(() => {
    setTransactions(getStoredTransactions());
    setBudgets(getStoredBudgets());
    setRecurring(getStoredRecurring());
    setSettings(getStoredSettings());
  }, []);

  // History & Mobile Back Button Navigation System
  useEffect(() => {
    // Replace initial state with root state
    window.history.replaceState({ app: 'rupya', tab: 'dashboard', subTab: 'budgets', modal: false }, '');

    const handlePopState = (event) => {
      // 1. If transaction modal is open, close it and stay on current page
      if (isAddModalOpenRef.current) {
        setIsAddModalOpen(false);
        setEditingTransaction(null);
        return;
      }

      // 2. If inside Manage and in a sub-tab (bills or settings), go back to budgets sub-tab
      if (activeTabRef.current === 'more' && manageSubTabRef.current !== 'budgets') {
        setManageSubTab('budgets');
        return;
      }

      // 3. If on another main tab (records, insights, manage), go back to dashboard
      if (activeTabRef.current !== 'dashboard') {
        const target = event.state?.tab || 'dashboard';
        setActiveTab(target);
        if (event.state?.subTab) setManageSubTab(event.state.subTab);
        return;
      }

      // 4. We are on dashboard with no modals: prevent accidental app exit on mobile
      const now = Date.now();
      if (now - lastBackPressTimeRef.current > 2000) {
        lastBackPressTimeRef.current = now;
        // Re-push root state so user must press back twice quickly to exit
        window.history.pushState({ app: 'rupya', tab: 'dashboard', subTab: 'budgets', modal: false }, '');
        setToastMessage('Press back again to exit');
        setTimeout(() => setToastMessage(null), 2000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handlers that maintain history stack
  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;
    setActiveTab(newTab);
    if (newTab === 'more' && manageSubTab !== 'budgets' && manageSubTab !== 'recurring' && manageSubTab !== 'settings') {
      setManageSubTab('budgets');
    }
    window.history.pushState({ app: 'rupya', tab: newTab, subTab: manageSubTab, modal: false }, '');
  };

  const handleSubTabChange = (newSubTab) => {
    if (newSubTab === manageSubTab) return;
    setManageSubTab(newSubTab);
    window.history.pushState({ app: 'rupya', tab: 'more', subTab: newSubTab, modal: false }, '');
  };

  const handleOpenAddModal = (tx = null) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
    window.history.pushState({ app: 'rupya', tab: activeTab, subTab: manageSubTab, modal: true }, '');
  };

  const handleCloseAddModal = () => {
    if (isAddModalOpen) {
      setIsAddModalOpen(false);
      setEditingTransaction(null);
      if (window.history.state?.modal) {
        window.history.back();
      }
    }
  };

  // Compute available months for dropdown (current month + past 11 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      months.push({ value, label });
    }
    return months;
  }, []);

  // Transactions handlers
  const handleSaveTransaction = (tx) => {
    let updated;
    const exists = transactions.some(t => t.id === tx.id);
    if (exists) {
      updated = transactions.map(t => t.id === tx.id ? tx : t);
    } else {
      updated = [tx, ...transactions];
    }
    setTransactions(updated);
    saveStoredTransactions(updated);
    handleCloseAddModal();
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
  };

  const handleEditClick = (tx) => {
    handleOpenAddModal(tx);
  };

  // Budgets & Recurring handlers
  const handleSaveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    saveStoredBudgets(newBudgets);
  };

  const handleSaveRecurring = (newRecurring) => {
    setRecurring(newRecurring);
    saveStoredRecurring(newRecurring);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  // Reset demo or clear
  const handleResetData = () => {
    const data = loadStarterSampleData();
    setTransactions(data.transactions);
    setBudgets(getStoredBudgets());
    setRecurring(getStoredRecurring());
  };

  const handleClearData = () => {
    setTransactions([]);
    saveStoredTransactions([]);
    setBudgets({ overall: 0 });
    saveStoredBudgets({ overall: 0 });
    setRecurring([]);
    saveStoredRecurring([]);
  };

  // Budget status calculation for alert banner
  const budgetStatus = useMemo(() => {
    const monthExpenses = transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const overallLimit = budgets.overall || 0;
    const ratio = overallLimit > 0 ? (monthExpenses / overallLimit) : 0;
    return { ratio, monthExpenses, overallLimit };
  }, [transactions, currentMonth, budgets]);

  // Pending recurring bills count for badge
  const pendingRecurringCount = useMemo(() => {
    const currentDay = new Date().getDate();
    return recurring.filter(r => r.active && r.dueDay >= currentDay && r.dueDay <= currentDay + 3).length;
  }, [recurring]);

  const getThemeBg = () => {
    switch (settings.theme) {
      case 'midnight': return 'bg-[#060b17] text-slate-100';
      case 'sunset': return 'bg-[#0c0807] text-slate-100';
      case 'light': return 'bg-slate-50 text-slate-900';
      case 'amoled': return 'bg-black text-white';
      default: return 'bg-slate-950 text-slate-100';
    }
  };

  const currentTheme = settings.theme || 'light';

  return (
    <div className={`min-h-screen ${getThemeBg()} flex justify-center font-sans antialiased selection:bg-emerald-200 selection:text-emerald-900 transition-colors duration-300 theme-${currentTheme}`}>
      {/* Mobile container - looks native on Android screen and cleanly framed on desktop */}
      <div className={`w-full max-w-md ${getThemeBg()} min-h-screen flex flex-col relative shadow-2xl transition-colors duration-300 ${
        currentTheme === 'light' ? 'border-x border-slate-200/90 shadow-slate-900/8' : 'border-x border-slate-800/40'
      }`}>
        
        {/* App Header */}
        <Header
          currentMonth={currentMonth}
          onMonthChange={setCurrentMonth}
          availableMonths={availableMonths}
          budgetStatus={budgetStatus}
          pendingRecurringCount={pendingRecurringCount}
          theme={currentTheme}
          onOpenRecurring={() => {
            handleTabChange('more');
            handleSubTabChange('recurring');
          }}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 pt-3 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              currency={settings.currency || '₹'}
              currentMonth={currentMonth}
              theme={currentTheme}
              layout={settings.layout || 'classic'}
              onOpenAddModal={() => handleOpenAddModal(null)}
              onSelectTransaction={handleEditClick}
              onViewAllTransactions={() => handleTabChange('transactions')}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              currency={settings.currency || '₹'}
              theme={currentTheme}
              onSelectTransaction={handleEditClick}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={() => handleOpenAddModal(null)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              currency={settings.currency || '₹'}
              currentMonth={currentMonth}
              theme={currentTheme}
            />
          )}

          {activeTab === 'more' && (
            <ManageView
              subTab={manageSubTab}
              onSubTabChange={handleSubTabChange}
              budgets={budgets}
              onSaveBudgets={handleSaveBudgets}
              recurring={recurring}
              onSaveRecurring={handleSaveRecurring}
              onLogTransaction={handleSaveTransaction}
              settings={settings}
              onSaveSettings={handleSaveSettings}
              transactions={transactions}
              currentMonth={currentMonth}
              currency={settings.currency || '₹'}
              theme={currentTheme}
              onResetData={handleResetData}
              onClearData={handleClearData}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          theme={currentTheme}
          onTabChange={handleTabChange}
          onOpenAddModal={() => handleOpenAddModal(null)}
        />

        {/* Add/Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
          currency={settings.currency || '₹'}
          theme={currentTheme}
        />

        {/* Gentle Toast on Mobile (e.g. Press back again to exit) */}
        {toastMessage && (
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg pointer-events-none backdrop-blur-xs border border-slate-700/60 animate-fade-in">
            {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
}
