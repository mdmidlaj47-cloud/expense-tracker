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
  getStoredSavingsGoals,
  saveStoredSavingsGoals,
  getStoredSettings, 
  saveStoredSettings,
  loadStarterSampleData
} from './utils/storage';

// URL Hash routing helper so page refresh and bookmarks preserve the exact view
const parseHash = () => {
  const hash = (window.location.hash || '').toLowerCase();
  if (hash === '#records' || hash === '#transactions') {
    return { tab: 'transactions', subTab: 'budgets' };
  }
  if (hash === '#insights' || hash === '#analytics') {
    return { tab: 'analytics', subTab: 'budgets' };
  }
  if (hash === '#savings') {
    return { tab: 'more', subTab: 'savings' };
  }
  if (hash === '#budgets') {
    return { tab: 'more', subTab: 'budgets' };
  }
  if (hash === '#bills' || hash === '#recurring') {
    return { tab: 'more', subTab: 'recurring' };
  }
  if (hash === '#settings') {
    return { tab: 'more', subTab: 'settings' };
  }
  if (hash === '#manage' || hash === '#more') {
    return { tab: 'more', subTab: 'budgets' };
  }
  return { tab: 'dashboard', subTab: 'budgets' };
};

const getHashForNav = (tab, subTab) => {
  if (tab === 'dashboard') return '#dashboard';
  if (tab === 'transactions') return '#records';
  if (tab === 'analytics') return '#insights';
  if (tab === 'more') {
    if (subTab === 'savings') return '#savings';
    if (subTab === 'recurring') return '#bills';
    if (subTab === 'settings') return '#settings';
    return '#budgets';
  }
  return '#dashboard';
};

export default function App() {
  const initialNav = parseHash();
  const [activeTab, setActiveTab] = useState(initialNav.tab);
  const [manageSubTab, setManageSubTab] = useState(initialNav.subTab);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});
  const [recurring, setRecurring] = useState([]);
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [settings, setSettings] = useState({ currency: '₹', currencyCode: 'INR' });
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
    setSavingsGoals(getStoredSavingsGoals());
    setSettings(getStoredSettings());
  }, []);

  // History & Mobile Back Button Navigation System with Hash Sync
  useEffect(() => {
    const nav = parseHash();
    const currentHash = getHashForNav(nav.tab, nav.subTab);
    window.history.replaceState({ app: 'rupya', tab: nav.tab, subTab: nav.subTab, modal: false }, '', currentHash);

    const handleNavigationEvent = (event) => {
      // 1. If transaction modal is open, close it and stay on current page
      if (isAddModalOpenRef.current) {
        setIsAddModalOpen(false);
        setEditingTransaction(null);
        return;
      }

      // 2. Read new hash
      const parsed = parseHash();

      // If hash matches another tab, switch smoothly
      if (parsed.tab !== activeTabRef.current || parsed.subTab !== manageSubTabRef.current) {
        setActiveTab(parsed.tab);
        setManageSubTab(parsed.subTab);
        return;
      }

      // 3. If inside Manage and in a sub-tab, go back to budgets sub-tab
      if (activeTabRef.current === 'more' && manageSubTabRef.current !== 'budgets') {
        setManageSubTab('budgets');
        window.history.replaceState({ app: 'rupya', tab: 'more', subTab: 'budgets', modal: false }, '', '#budgets');
        return;
      }

      // 4. If on another main tab (records, insights, manage), go back to dashboard
      if (activeTabRef.current !== 'dashboard') {
        setActiveTab('dashboard');
        window.history.replaceState({ app: 'rupya', tab: 'dashboard', subTab: 'budgets', modal: false }, '', '#dashboard');
        return;
      }

      // 5. We are on dashboard with no modals: prevent accidental app exit on mobile
      const now = Date.now();
      if (now - lastBackPressTimeRef.current > 2000) {
        lastBackPressTimeRef.current = now;
        window.history.pushState({ app: 'rupya', tab: 'dashboard', subTab: 'budgets', modal: false }, '', '#dashboard');
        setToastMessage('Press back again to exit');
        setTimeout(() => setToastMessage(null), 2000);
      }
    };

    window.addEventListener('popstate', handleNavigationEvent);
    window.addEventListener('hashchange', handleNavigationEvent);
    return () => {
      window.removeEventListener('popstate', handleNavigationEvent);
      window.removeEventListener('hashchange', handleNavigationEvent);
    };
  }, []);

  // Navigation handlers that maintain history stack & URL hash
  const handleTabChange = (newTab, optionalSubTab = null) => {
    if (newTab === 'savings') {
      newTab = 'more';
      optionalSubTab = 'savings';
    }

    const targetSubTab = optionalSubTab || (newTab === 'more' ? (manageSubTab || 'budgets') : manageSubTab);

    if (newTab === activeTab && targetSubTab === manageSubTab) return;

    setActiveTab(newTab);
    if (optionalSubTab) {
      setManageSubTab(optionalSubTab);
    } else if (newTab === 'more' && manageSubTab !== 'budgets' && manageSubTab !== 'savings' && manageSubTab !== 'recurring' && manageSubTab !== 'settings') {
      setManageSubTab('budgets');
    }

    const newHash = getHashForNav(newTab, targetSubTab);
    window.history.pushState({ app: 'rupya', tab: newTab, subTab: targetSubTab, modal: false }, '', newHash);
  };

  const handleSubTabChange = (newSubTab) => {
    if (newSubTab === manageSubTab && activeTab === 'more') return;
    setActiveTab('more');
    setManageSubTab(newSubTab);
    const newHash = getHashForNav('more', newSubTab);
    window.history.pushState({ app: 'rupya', tab: 'more', subTab: newSubTab, modal: false }, '', newHash);
  };

  const handleOpenAddModal = (tx = null) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
    const currentHash = getHashForNav(activeTab, manageSubTab);
    window.history.pushState({ app: 'rupya', tab: activeTab, subTab: manageSubTab, modal: true }, '', currentHash);
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

  // Budgets, Savings Goals & Recurring handlers
  const handleSaveBudgets = (newBudgets) => {
    setBudgets(newBudgets);
    saveStoredBudgets(newBudgets);
  };

  const handleSaveSavingsGoals = (newGoals) => {
    setSavingsGoals(newGoals);
    saveStoredSavingsGoals(newGoals);
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
    setSavingsGoals(getStoredSavingsGoals());
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
      {/* Mobile container - looks native on Android/iPhone screen and cleanly framed on desktop */}
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
            handleTabChange('more', 'recurring');
          }}
        />

        {/* Main View Area */}
        <main className="flex-1 px-4 pt-3 overflow-y-auto no-scrollbar">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              budgets={budgets}
              savingsGoals={savingsGoals}
              currency={settings.currency || '₹'}
              currentMonth={currentMonth}
              theme={currentTheme}
              layout={settings.layout || 'classic'}
              onOpenAddModal={handleOpenAddModal}
              onSelectTransaction={handleEditClick}
              onViewAllTransactions={() => handleTabChange('transactions')}
              onNavigateTab={handleTabChange}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              savingsGoals={savingsGoals}
              currency={settings.currency || '₹'}
              theme={currentTheme}
              onSelectTransaction={handleEditClick}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={handleOpenAddModal}
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
              savingsGoals={savingsGoals}
              onSaveSavingsGoals={handleSaveSavingsGoals}
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
              onOpenAddModal={handleOpenAddModal}
              onSelectTransaction={handleEditClick}
              onDeleteTransaction={handleDeleteTransaction}
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
          savingsGoals={savingsGoals}
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
