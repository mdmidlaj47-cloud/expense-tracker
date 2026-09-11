import React, { useState, useEffect, useMemo } from 'react';
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
  saveStoredSettings
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
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id) => {
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    saveStoredTransactions(updated);
  };

  const handleEditClick = (tx) => {
    setEditingTransaction(tx);
    setIsAddModalOpen(true);
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
    localStorage.clear();
    window.location.reload();
  };

  const handleClearData = () => {
    setTransactions([]);
    saveStoredTransactions([]);
  };

  // Budget status calculation for alert banner
  const budgetStatus = useMemo(() => {
    const monthExpenses = transactions
      .filter(t => t.date.startsWith(currentMonth) && t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const overallLimit = budgets.overall || 45000;
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
            setActiveTab('more');
            setManageSubTab('recurring');
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
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
              onSelectTransaction={handleEditClick}
              onViewAllTransactions={() => setActiveTab('transactions')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              currency={settings.currency || '₹'}
              theme={currentTheme}
              onSelectTransaction={handleEditClick}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenAddModal={() => {
                setEditingTransaction(null);
                setIsAddModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              currency={settings.currency || '₹'}
              currentMonth={currentMonth}
            />
          )}

          {activeTab === 'more' && (
            <ManageView
              subTab={manageSubTab}
              onSubTabChange={setManageSubTab}
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
              onResetData={handleResetData}
              onClearData={handleClearData}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          theme={currentTheme}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'more' && manageSubTab !== 'budgets' && manageSubTab !== 'recurring' && manageSubTab !== 'settings') {
              setManageSubTab('budgets');
            }
          }}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
        />

        {/* Add/Edit Transaction Modal */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingTransaction(null);
          }}
          onSave={handleSaveTransaction}
          initialData={editingTransaction}
          currency={settings.currency || '₹'}
          theme={currentTheme}
        />
      </div>
    </div>
  );
}
