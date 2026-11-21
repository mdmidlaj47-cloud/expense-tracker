import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar, 
  X, 
  Plus, 
  Edit2, 
  PiggyBank, 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown,
  FolderOpen,
  FolderClosed
} from 'lucide-react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount, exportTransactionsToCSV, DEFAULT_SAVINGS_GOALS } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

// Helper to format "2026-11" -> "November 2026"
const formatMonthName = (monthKey) => {
  if (!monthKey) return '';
  const [y, m] = monthKey.split('-');
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const formatMonthShort = (monthKey) => {
  if (!monthKey) return '';
  const [y, m] = monthKey.split('-');
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
  return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
};

export default function TransactionsView({ 
  transactions = [], 
  savingsGoals = DEFAULT_SAVINGS_GOALS,
  currency = '₹', 
  theme = 'light',
  currentMonth,
  onSelectTransaction, 
  onDeleteTransaction, 
  onOpenAddModal 
}) {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | expense | income | saving
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState('all'); // 'all' or 'YYYY-MM'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Month Filter
      if (selectedMonthFilter !== 'all' && !tx.date.startsWith(selectedMonthFilter)) {
        return false;
      }
      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Category / Goal
      if (categoryFilter !== 'all') {
        if (tx.type === 'saving') {
          if (tx.goalId !== categoryFilter && tx.categoryId !== categoryFilter) return false;
        } else {
          if (tx.categoryId !== categoryFilter) return false;
        }
      }
      // Payment Method
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;
      // Search note or category name or amount
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        let catName = '';
        if (tx.type === 'saving') {
          const g = savingsGoals.find(goal => goal.id === tx.goalId || goal.id === tx.categoryId);
          catName = (g?.name || 'Savings').toLowerCase();
        } else {
          const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId);
          catName = (cat?.name || '').toLowerCase();
        }
        const note = (tx.note || '').toLowerCase();
        const amountStr = String(tx.amount);
        const match = catName.includes(q) || note.includes(q) || amountStr.includes(q) || (tx.paymentMethod || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));
  }, [transactions, selectedMonthFilter, typeFilter, categoryFilter, paymentFilter, searchQuery, savingsGoals]);

  // Group filtered transactions by Month (YYYY-MM) and inside each month by Day
  const groupedByMonth = useMemo(() => {
    const monthsMap = {};
    filtered.forEach(tx => {
      const monthKey = tx.date.slice(0, 7);
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          monthKey,
          label: formatMonthName(monthKey),
          shortLabel: formatMonthShort(monthKey),
          transactions: [],
          days: {},
          totalExpense: 0,
          totalIncome: 0,
          totalSavings: 0
        };
      }
      monthsMap[monthKey].transactions.push(tx);

      if (!monthsMap[monthKey].days[tx.date]) {
        monthsMap[monthKey].days[tx.date] = [];
      }
      monthsMap[monthKey].days[tx.date].push(tx);

      if (tx.type === 'expense') monthsMap[monthKey].totalExpense += tx.amount;
      else if (tx.type === 'income') monthsMap[monthKey].totalIncome += tx.amount;
      else if (tx.type === 'saving') monthsMap[monthKey].totalSavings += tx.amount;
    });

    // Sort descending by month
    return Object.values(monthsMap).sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [filtered]);

  // All distinct months in the entire transaction dataset for filter tabs
  const allAvailableMonths = useMemo(() => {
    const monthSet = new Set();
    transactions.forEach(t => {
      if (t.date) monthSet.add(t.date.slice(0, 7));
    });
    return Array.from(monthSet).sort((a, b) => b.localeCompare(a));
  }, [transactions]);

  // Open / Close (expanded / collapsed) state for each month
  const [openMonths, setOpenMonths] = useState(() => {
    const d = new Date();
    const thisMonthKey = currentMonth || `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    return { [thisMonthKey]: true };
  });

  // Ensure newest month is open on first mount or data load
  useEffect(() => {
    if (groupedByMonth.length > 0) {
      setOpenMonths(prev => {
        // If no months are open, open the newest one
        const hasOpen = Object.values(prev).some(Boolean);
        if (!hasOpen) {
          return { [groupedByMonth[0].monthKey]: true };
        }
        return prev;
      });
    }
  }, [groupedByMonth]);

  // Auto-expand all matching months when user searches or filters
  useEffect(() => {
    if (searchQuery.trim() || typeFilter !== 'all' || categoryFilter !== 'all' || paymentFilter !== 'all') {
      const allActive = {};
      groupedByMonth.forEach(m => { allActive[m.monthKey] = true; });
      setOpenMonths(allActive);
    }
  }, [searchQuery, typeFilter, categoryFilter, paymentFilter, groupedByMonth]);

  // Toggle single month open/close
  const toggleMonth = (monthKey) => {
    setOpenMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // Toggle All Months (Expand all or collapse all)
  const isAllOpen = groupedByMonth.length > 0 && groupedByMonth.every(m => openMonths[m.monthKey]);
  const handleToggleAll = () => {
    if (isAllOpen) {
      setOpenMonths({});
    } else {
      const allState = {};
      groupedByMonth.forEach(m => { allState[m.monthKey] = true; });
      setOpenMonths(allState);
    }
  };

  // Total summary of filtered
  const totalFilteredIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredSavings = filtered
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  // Friendly date title within month
  const getDateHeader = (dateStr) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    if (dateStr === today) return `Today, ${dayName}`;
    if (dateStr === yesterday) return `Yesterday, ${dayName}`;
    return dayName;
  };

  return (
    <div className="space-y-3 pb-24">
      {/* 1. Top Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search note, category, amount, UPI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 shadow-xs' 
                : 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
            } border rounded-2xl pl-9 pr-9 py-2.5 text-xs focus:outline-none`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Type filters */}
          {['all', 'expense', 'income', 'saving'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTypeFilter(tf)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition active-press ${
                typeFilter === tf
                  ? (isLight ? 'bg-slate-900 text-white shadow-xs' : 'bg-emerald-500 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200')
              }`}
            >
              {tf === 'all' ? 'All' : tf === 'expense' ? 'Expenses' : tf === 'income' ? 'Income' : 'Savings 🌱'}
            </button>
          ))}

          {/* Payment method selector */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={`text-xs rounded-xl px-2.5 py-1 focus:outline-none shrink-0 cursor-pointer border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300 focus:border-emerald-500'
            }`}
          >
            <option value="all">Payment: All</option>
            {PAYMENT_METHODS.map(p => (
              <option key={p.id} value={p.id}>{p.id}</option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`text-xs rounded-xl px-2.5 py-1 focus:outline-none shrink-0 cursor-pointer border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300 focus:border-emerald-500'
            }`}
          >
            <option value="all">Category / Goal: All</option>
            <optgroup label="Expense Categories">
              {DEFAULT_CATEGORIES.filter(c => c.type === 'expense').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Income Categories">
              {DEFAULT_CATEGORIES.filter(c => c.type === 'income').map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </optgroup>
            <optgroup label="Savings Goals">
              {savingsGoals.map(g => (
                <option key={g.id} value={g.id}>🌱 {g.name}</option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* Month Selector Pills (if multiple months exist) */}
        {allAvailableMonths.length > 1 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>Month:</span>
            </span>
            <button
              onClick={() => setSelectedMonthFilter('all')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition ${
                selectedMonthFilter === 'all'
                  ? (isLight ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-slate-950')
                  : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
              }`}
            >
              All Months
            </button>
            {allAvailableMonths.map(mk => (
              <button
                key={mk}
                onClick={() => {
                  setSelectedMonthFilter(mk);
                  setOpenMonths(prev => ({ ...prev, [mk]: true }));
                }}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold shrink-0 transition ${
                  selectedMonthFilter === mk
                    ? (isLight ? 'bg-emerald-700 text-white' : 'bg-emerald-500 text-slate-950')
                    : (isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')
                }`}
              >
                {formatMonthShort(mk)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Summary Banner with Expand / Collapse All Controls */}
      <div className={`px-3.5 py-2 rounded-2xl border flex items-center justify-between text-[11px] ${
        isLight 
          ? 'bg-white border-slate-200/90 text-slate-600 shadow-xs' 
          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
      }`}>
        <div className="flex items-center space-x-2">
          <span><strong>{filtered.length}</strong> record{filtered.length !== 1 ? 's' : ''}</span>
          {groupedByMonth.length > 1 && (
            <button
              onClick={handleToggleAll}
              className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold transition flex items-center space-x-1 ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100' : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <ChevronsUpDown className="w-3 h-3" />
              <span>{isAllOpen ? 'Collapse All' : 'Open All'}</span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {totalFilteredExpense > 0 && (
            <span className={`${isLight ? 'text-slate-900' : 'text-rose-400'} font-bold`}>-{formatAmount(totalFilteredExpense, currency)}</span>
          )}
          {totalFilteredIncome > 0 && (
            <span className={`${isLight ? 'text-emerald-700' : 'text-emerald-400'} font-bold`}>+{formatAmount(totalFilteredIncome, currency)}</span>
          )}
          {totalFilteredSavings > 0 && (
            <span className="text-amber-600 font-bold">🌱 {formatAmount(totalFilteredSavings, currency)}</span>
          )}
          <button
            onClick={() => exportTransactionsToCSV(filtered)}
            title="Download CSV"
            className={`p-1 rounded transition ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Monthly Categorized Sections (Open & Closeable Accordions) */}
      {groupedByMonth.length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
        }`}>
          <p className="text-xs text-slate-400 mb-2">No transactions match your criteria.</p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl active-press"
          >
            Add Record
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {groupedByMonth.map((monthGroup) => {
            const isOpen = !!openMonths[monthGroup.monthKey];
            const isCurrent = currentMonth ? monthGroup.monthKey === currentMonth : monthGroup.monthKey === new Date().toISOString().slice(0, 7);

            return (
              <div 
                key={monthGroup.monthKey}
                className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isLight 
                    ? 'bg-white border-slate-200/90 shadow-xs' 
                    : 'glass-card border-slate-800'
                }`}
              >
                {/* Month Collapsible Header Banner - Tap to Open or Close */}
                <button
                  type="button"
                  onClick={() => toggleMonth(monthGroup.monthKey)}
                  className={`w-full p-3.5 flex items-center justify-between text-left transition select-none ${
                    isOpen
                      ? (isLight ? 'bg-slate-50/70 border-b border-slate-100' : 'bg-slate-900/60 border-b border-slate-800/80')
                      : (isLight ? 'hover:bg-slate-50/60' : 'hover:bg-slate-800/40')
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border transition ${
                      isOpen
                        ? (isLight ? 'bg-slate-900 text-white border-slate-900 shadow-xs' : 'bg-emerald-500 text-slate-950 border-emerald-400')
                        : (isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700')
                    }`}>
                      {isOpen ? <FolderOpen className="w-4 h-4" /> : <FolderClosed className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3 className={`text-xs font-extrabold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {monthGroup.label}
                        </h3>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Current
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                          isOpen
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {monthGroup.transactions.length} record{monthGroup.transactions.length !== 1 ? 's' : ''} • Spent: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{formatAmount(monthGroup.totalExpense, currency)}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Right side: Totals & Open/Close Chevron */}
                  <div className="flex items-center space-x-2.5 shrink-0 pl-2">
                    <div className="text-right">
                      {monthGroup.totalExpense > 0 && (
                        <span className="text-xs font-bold text-slate-900 block">
                          -{formatAmount(monthGroup.totalExpense, currency)}
                        </span>
                      )}
                      {monthGroup.totalIncome > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 block">
                          +{formatAmount(monthGroup.totalIncome, currency)}
                        </span>
                      )}
                    </div>

                    <div className={`p-1.5 rounded-xl border flex items-center justify-center transition-transform duration-200 ${
                      isOpen
                        ? (isLight ? 'bg-slate-200/80 border-slate-300 text-slate-800 rotate-180' : 'bg-slate-800 border-slate-700 text-white rotate-180')
                        : (isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-slate-900 border-slate-800 text-slate-400')
                    }`}>
                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                </button>

                {/* Expanded Month Body - Grouped by Day */}
                {isOpen && (
                  <div className="p-3 space-y-3 animate-fade-in">
                    {Object.entries(monthGroup.days).map(([dateStr, items]) => {
                      const dayExpense = items
                        .filter(t => t.type === 'expense')
                        .reduce((sum, t) => sum + t.amount, 0);

                      return (
                        <div key={dateStr} className="space-y-1.5">
                          {/* Date header with day total */}
                          <div className={`flex items-center justify-between px-1 text-[11px] font-semibold ${
                            isLight ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                            <span>{getDateHeader(dateStr)}</span>
                            {dayExpense > 0 && (
                              <span className="font-medium">
                                Spent: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{formatAmount(dayExpense, currency)}</strong>
                              </span>
                            )}
                          </div>

                          {/* Items for this day */}
                          <div className="space-y-1.5">
                            {items.map((tx) => {
                              const isSaving = tx.type === 'saving';
                              const isExpense = tx.type === 'expense';
                              const isConfirmingDelete = deleteConfirmId === tx.id;

                              let displayName = tx.categoryId;
                              let displayIcon = 'MoreHorizontal';
                              let displayColor = '#94a3b8';

                              if (isSaving) {
                                const matchedGoal = savingsGoals.find(g => g.id === tx.goalId || g.id === tx.categoryId);
                                displayName = matchedGoal ? `Savings: ${matchedGoal.name}` : 'Savings Vault';
                                displayIcon = 'PiggyBank';
                                displayColor = '#10b981';
                              } else {
                                const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId) || {
                                  name: tx.categoryId,
                                  icon: 'MoreHorizontal',
                                  color: '#94a3b8'
                                };
                                displayName = cat.name;
                                displayIcon = cat.icon;
                                displayColor = cat.color;
                              }

                              return (
                                <div
                                  key={tx.id}
                                  className={`p-3 rounded-2xl border flex items-center justify-between transition group ${
                                    isLight 
                                      ? 'bg-slate-50/50 border-slate-200/90 hover:bg-white hover:border-slate-300 shadow-2xs' 
                                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                  }`}
                                >
                                  {/* Left: Category Icon & Details */}
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <div 
                                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                      style={{ backgroundColor: isLight ? `${displayColor}18` : `${displayColor}25` }}
                                    >
                                      {isSaving ? (
                                        <PiggyBank className="w-5 h-5 text-emerald-600" />
                                      ) : (
                                        <CategoryIcon name={displayIcon} className="w-5 h-5" color={displayColor} />
                                      )}
                                    </div>
                                    <div className="min-w-0 pr-2">
                                      <div className="flex items-center space-x-1.5">
                                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                          {displayName}
                                        </span>
                                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                                          isSaving
                                            ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30')
                                            : (isLight 
                                                ? 'bg-white text-slate-600 border-slate-200 shadow-3xs' 
                                                : 'bg-slate-800 text-slate-400 border-slate-700')
                                        }`}>
                                          {isSaving ? `Saved from ${tx.paymentMethod || 'UPI'}` : (tx.paymentMethod || 'UPI')}
                                        </span>
                                      </div>
                                      <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                                        {tx.note || tx.time || 'No description'}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Right: Amount & Actions */}
                                  <div className="flex items-center space-x-2 shrink-0">
                                    <div className="text-right">
                                      <div className={`text-xs font-extrabold ${
                                        isSaving
                                          ? 'text-emerald-700'
                                          : isExpense 
                                          ? (isLight ? 'text-slate-900' : 'text-rose-400') 
                                          : (isLight ? 'text-emerald-700' : 'text-emerald-400')
                                      }`}>
                                        {isSaving ? '🌱 +' : isExpense ? '-' : '+'}{formatAmount(tx.amount, currency)}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {tx.time || ''}
                                      </span>
                                    </div>

                                    {/* Dedicated Edit Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTransaction(tx);
                                      }}
                                      title="Edit Record"
                                      aria-label={`Edit ${displayName} record`}
                                      className={`p-1.5 rounded-lg transition active-press ${
                                        isLight
                                          ? 'hover:bg-slate-200/70 text-slate-400 hover:text-slate-700'
                                          : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                                      }`}
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isConfirmingDelete) {
                                          onDeleteTransaction(tx.id);
                                          setDeleteConfirmId(null);
                                        } else {
                                          setDeleteConfirmId(tx.id);
                                          setTimeout(() => setDeleteConfirmId(null), 3500);
                                        }
                                      }}
                                      title={isConfirmingDelete ? 'Click again to confirm delete' : 'Delete Record'}
                                      aria-label={`Delete ${displayName} record`}
                                      className={`p-1.5 rounded-lg transition active-press ${
                                        isConfirmingDelete
                                          ? 'bg-rose-500 text-white'
                                          : isLight
                                          ? 'hover:bg-slate-200/70 text-slate-400 hover:text-rose-500'
                                          : 'hover:bg-slate-800 text-slate-500 hover:text-rose-400'
                                      }`}
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
