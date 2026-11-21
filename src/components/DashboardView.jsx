import React, { useMemo, useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  TrendingUp, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  Download, 
  Target,
  Sparkles,
  Calendar,
  Activity,
  Layers,
  Edit2,
  PiggyBank,
  Smartphone,
  Banknote,
  CreditCard,
  Building2,
  PieChart
} from 'lucide-react';
import { formatAmount, DEFAULT_CATEGORIES, DEFAULT_SAVINGS_GOALS } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function DashboardView({ 
  transactions = [], 
  budgets = {}, 
  savingsGoals = DEFAULT_SAVINGS_GOALS,
  currency = '₹', 
  currentMonth,
  theme = 'light',
  layout = 'classic',
  onOpenAddModal, 
  onSelectTransaction,
  onViewAllTransactions,
  onNavigateTab
}) {
  const isLight = theme === 'light';
  const [walletViewMode, setWalletViewMode] = useState('balance'); // 'balance' | 'income'

  // Filter transactions for current month (YYYY-MM)
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  // Totals for current month
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthSavings = monthTransactions
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  // Overall lifetime totals
  const lifetimeIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const lifetimeExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const lifetimeSavings = transactions
    .filter(t => t.type === 'saving')
    .reduce((sum, t) => sum + t.amount, 0);

  // Spendable Balance = (Income - Expense - Savings)
  const netSpendableBalance = lifetimeIncome - lifetimeExpense - lifetimeSavings;
  // Total Net Worth = (Spendable + Savings) = (Income - Expense)
  const totalNetWorth = lifetimeIncome - lifetimeExpense;

  // Monthly Budget calculations
  const monthlyCap = budgets.overall || 45000;
  const budgetRatio = monthlyCap > 0 ? (totalExpense / monthlyCap) : 0;
  const budgetRemaining = Math.max(0, monthlyCap - totalExpense);
  const budgetPercent = Math.min(100, Math.round(budgetRatio * 100));

  // Daily average calculations
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = Math.min(daysInMonth, now.getDate());
  const dailyAverage = currentDay > 0 ? Math.round(totalExpense / currentDay) : 0;
  const daysLeft = Math.max(1, daysInMonth - currentDay);
  const dailySafeSpend = Math.max(0, Math.round(budgetRemaining / daysLeft));

  // Savings rate
  const savingsRate = totalIncome > 0 
    ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) 
    : 0;

  // Payment Method Breakdown: UPI, Cash, Cards, NetBanking
  const methodStats = useMemo(() => {
    const list = [
      { id: 'UPI', label: 'UPI / GPay', icon: Smartphone, color: '#10b981', bg: 'bg-emerald-500/10', border: 'border-emerald-200' },
      { id: 'Cash', label: 'Cash in Hand', icon: Banknote, color: '#f59e0b', bg: 'bg-amber-500/10', border: 'border-amber-200' },
      { id: 'Bank', label: 'Bank & Cards', icon: Building2, color: '#06b6d4', bg: 'bg-cyan-500/10', border: 'border-cyan-200', alias: ['Card', 'NetBanking'] }
    ];

    return list.map(item => {
      const matchMethod = (pm) => {
        if (item.alias) return item.alias.includes(pm) || pm === item.id;
        if (item.id === 'UPI') return pm === 'UPI' || !pm;
        return pm === item.id;
      };

      const inc = transactions.filter(t => t.type === 'income' && matchMethod(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter(t => t.type === 'expense' && matchMethod(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);
      const sav = transactions.filter(t => t.type === 'saving' && matchMethod(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);
      const balance = inc - exp - sav;

      const mInc = monthTransactions.filter(t => t.type === 'income' && matchMethod(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);
      const mExp = monthTransactions.filter(t => t.type === 'expense' && matchMethod(t.paymentMethod)).reduce((s, t) => s + t.amount, 0);

      return {
        ...item,
        income: inc,
        expense: exp,
        saved: sav,
        balance,
        monthIncome: mInc,
        monthExpense: mExp
      };
    });
  }, [transactions, monthTransactions]);

  // Expense share by payment method (Percentages)
  const expenseBreakdown = useMemo(() => {
    const total = totalExpense || 1;
    return methodStats.map(m => {
      const pct = Math.round((m.monthExpense / total) * 100);
      return {
        ...m,
        spent: m.monthExpense,
        percent: pct
      };
    });
  }, [methodStats, totalExpense]);

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 6);

  // 4 Pastel Category breakdown cards matching the Scandinavian mockup
  const topPastelCategories = useMemo(() => {
    const targets = [
      { id: 'groceries', defaultName: 'Groceries', pastelBg: 'bg-[#dcfce7]', pastelBorder: 'border-[#bbf7d0]', pastelText: 'text-[#15803d]', icon: 'ShoppingBag' },
      { id: 'food', defaultName: 'Dining Out', pastelBg: 'bg-[#ffe4e6]', pastelBorder: 'border-[#fecdd3]', pastelText: 'text-[#be123c]', icon: 'Utensils' },
      { id: 'bills', defaultName: 'Subscriptions', pastelBg: 'bg-[#f3e8ff]', pastelBorder: 'border-[#e9d5ff]', pastelText: 'text-[#7e22ce]', icon: 'Zap' },
      { id: 'transport', defaultName: 'Transport', pastelBg: 'bg-[#e0f2fe]', pastelBorder: 'border-[#bae6fd]', pastelText: 'text-[#0369a1]', icon: 'Car' }
    ];

    return targets.map(t => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === t.id);
      const spent = monthTransactions.filter(tx => tx.categoryId === t.id && tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
      return {
        id: t.id,
        name: cat ? cat.name : t.defaultName,
        icon: t.icon,
        pastelBg: t.pastelBg,
        pastelBorder: t.pastelBorder,
        pastelText: t.pastelText,
        spent
      };
    });
  }, [monthTransactions]);

  // Active top savings goal for dashboard preview
  const topSavingsGoal = useMemo(() => {
    const goals = savingsGoals.length > 0 ? savingsGoals : DEFAULT_SAVINGS_GOALS;
    const first = goals[0];
    if (!first) return null;
    const saved = transactions
      .filter(t => t.type === 'saving' && (t.goalId === first.id || t.categoryId === first.id))
      .reduce((s, t) => s + t.amount, 0);
    const target = first.targetAmount || 10000;
    const pct = Math.min(100, Math.round((saved / target) * 100));
    return { ...first, saved, target, pct };
  }, [savingsGoals, transactions]);

  // Theme styling helpers
  const getBalanceCardStyle = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-gradient-to-br from-[#0a192f] via-[#0f172a] to-[#020b18] border-cyan-500/30 shadow-cyan-950/40 text-white';
      case 'sunset':
        return 'bg-gradient-to-br from-[#2a1205] via-[#1a0c06] to-[#0f0704] border-amber-500/30 shadow-amber-950/40 text-white';
      case 'amoled':
        return 'bg-black border-zinc-800 text-white shadow-none';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/60 border-emerald-500/20 shadow-emerald-950/20 text-white';
      case 'light':
      default:
        return 'sage-hero-card text-slate-900';
    }
  };

  const getAccentTextColor = () => {
    switch (theme) {
      case 'midnight': return 'text-cyan-400';
      case 'sunset': return 'text-amber-400';
      case 'light': return 'text-emerald-700';
      case 'amoled': return 'text-emerald-400';
      default: return 'text-emerald-600';
    }
  };

  return (
    <div className="space-y-4 pb-32">
      {/* 1. Total Spendable Balance Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${getBalanceCardStyle()}`}>
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={`flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Wallet className="w-4 h-4" />
            <span>Available Balance</span>
          </span>
          <div className="flex items-center space-x-1.5">
            {lifetimeSavings > 0 && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                isLight 
                  ? 'bg-amber-100/90 text-amber-900 border-amber-300/80 shadow-xs' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                <span>🌱 {formatAmount(lifetimeSavings, currency)} Saved</span>
              </span>
            )}
            {savingsRate > 0 && (
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
                isLight 
                  ? 'bg-white/80 text-emerald-900 border-emerald-300/80 shadow-xs' 
                  : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              }`}>
                <Sparkles className="w-3 h-3" />
                <span>{savingsRate}% Rate</span>
              </span>
            )}
          </div>
        </div>

        <div className={`text-3xl font-extrabold tracking-tight mt-1 mb-1 ${isLight ? 'text-slate-950' : 'text-white'}`}>
          {formatAmount(netSpendableBalance, currency)}
        </div>

        {lifetimeSavings > 0 && (
          <p className={`text-[11px] font-medium mb-3 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Total Net Worth: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{formatAmount(totalNetWorth, currency)}</strong> (includes vault savings)
          </p>
        )}

        {/* 3-Column Month Flow Pills (Income, Expense, Saved) */}
        <div className={`grid grid-cols-3 gap-2 pt-3 border-t ${isLight ? 'border-emerald-900/10' : 'border-white/10'}`}>
          {/* Income Pill */}
          <div className={`p-2 rounded-2xl border flex flex-col justify-center ${
            isLight ? 'bg-white/90 border-emerald-200/80 shadow-xs' : 'border-white/10 bg-black/20'
          }`}>
            <span className={`text-[9px] uppercase font-bold flex items-center space-x-0.5 ${isLight ? 'text-emerald-900/80' : 'text-emerald-400'}`}>
              <ArrowDownLeft className="w-3 h-3 stroke-[2.8]" />
              <span>Income</span>
            </span>
            <span className={`text-xs font-bold truncate mt-0.5 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
              +{formatAmount(totalIncome, currency)}
            </span>
          </div>

          {/* Expense Pill */}
          <div className={`p-2 rounded-2xl border flex flex-col justify-center ${
            isLight ? 'bg-white/90 border-rose-200/80 shadow-xs' : 'border-white/10 bg-black/20'
          }`}>
            <span className={`text-[9px] uppercase font-bold flex items-center space-x-0.5 ${isLight ? 'text-rose-900/80' : 'text-rose-400'}`}>
              <ArrowUpRight className="w-3 h-3 stroke-[2.8]" />
              <span>Expense</span>
            </span>
            <span className={`text-xs font-bold truncate mt-0.5 ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
              -{formatAmount(totalExpense, currency)}
            </span>
          </div>

          {/* Savings Pill */}
          <div 
            onClick={() => onNavigateTab('savings')}
            className={`p-2 rounded-2xl border flex flex-col justify-center cursor-pointer active-press ${
              isLight ? 'bg-white/90 border-amber-200/80 shadow-xs' : 'border-white/10 bg-black/20'
            }`}
          >
            <span className={`text-[9px] uppercase font-bold flex items-center space-x-0.5 ${isLight ? 'text-amber-900/80' : 'text-amber-400'}`}>
              <span>🌱</span>
              <span>Saved</span>
            </span>
            <span className={`text-xs font-bold truncate mt-0.5 ${isLight ? 'text-amber-800' : 'text-amber-300'}`}>
              +{formatAmount(monthSavings, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Wallets & Payment Methods Breakdown (UPI, Cash, Bank) */}
      <div className={`p-4 rounded-3xl border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800 text-white'
      }`}>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center space-x-1.5">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Wallets & Methods
            </h3>
          </div>
          <div className={`flex items-center p-0.5 rounded-xl border text-[10px] font-bold ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            <button
              onClick={() => setWalletViewMode('balance')}
              className={`px-2 py-0.5 rounded-lg transition ${
                walletViewMode === 'balance'
                  ? (isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white')
                  : ''
              }`}
            >
              Balances
            </button>
            <button
              onClick={() => setWalletViewMode('income')}
              className={`px-2 py-0.5 rounded-lg transition ${
                walletViewMode === 'income'
                  ? (isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-slate-800 text-white')
                  : ''
              }`}
            >
              Income View
            </button>
          </div>
        </div>

        {/* 3 Wallet Cards */}
        <div className="grid grid-cols-3 gap-2">
          {methodStats.map(m => {
            const IconComponent = m.icon;
            return (
              <div
                key={m.id}
                className={`p-3 rounded-2xl border text-center transition ${
                  isLight
                    ? 'bg-slate-50/80 border-slate-200/90 shadow-2xs hover:bg-slate-50'
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <div 
                  className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center mb-1.5"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <IconComponent className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <span className={`text-[10px] font-bold truncate block ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  {m.label}
                </span>

                {walletViewMode === 'balance' ? (
                  <>
                    <span className={`text-xs font-extrabold truncate block mt-0.5 ${
                      m.balance >= 0 ? (isLight ? 'text-slate-900' : 'text-emerald-400') : 'text-rose-500'
                    }`}>
                      {formatAmount(m.balance, currency)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Spent: {formatAmount(m.monthExpense, currency)}
                    </span>
                  </>
                ) : (
                  <>
                    <span className={`text-xs font-extrabold truncate block mt-0.5 ${
                      isLight ? 'text-emerald-700' : 'text-emerald-400'
                    }`}>
                      +{formatAmount(m.monthIncome, currency)}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Lifetime: +{formatAmount(m.income, currency)}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Dedicated Savings Pot Card (🌱 Seed Stash) */}
      <div 
        onClick={() => onNavigateTab('savings')}
        className={`p-4 rounded-3xl border transition cursor-pointer active-press ${
          isLight
            ? 'bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#fefce8] border-emerald-200/90 shadow-xs hover:border-emerald-300'
            : 'glass-card border-slate-800 hover:border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2.5">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h3 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Savings Vault 🌱
                </h3>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Active
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {lifetimeSavings > 0 ? `Saved ${formatAmount(lifetimeSavings, currency)} across all goals` : 'Start your first savings pot today'}
              </p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenAddModal({ type: 'saving' });
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1 active-press transition ${
              isLight
                ? 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
                : 'bg-emerald-500 text-slate-950 font-extrabold'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Save</span>
          </button>
        </div>

        {topSavingsGoal && (
          <div className="mt-3 pt-2.5 border-t border-emerald-900/10 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700">{topSavingsGoal.name}</span>
              <span className="font-semibold text-emerald-700">
                {formatAmount(topSavingsGoal.saved, currency)} / {formatAmount(topSavingsGoal.target, currency)} ({topSavingsGoal.pct}%)
              </span>
            </div>
            <div className={`w-full rounded-full h-1.5 overflow-hidden ${isLight ? 'bg-slate-200/70' : 'bg-slate-800'}`}>
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${topSavingsGoal.pct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 4. Expense Breakdown by Payment Method (UPI, Cash, Cards) */}
      {totalExpense > 0 && (
        <div className={`p-4 rounded-3xl border transition-colors ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800 text-white'
        }`}>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center space-x-1.5">
              <PieChart className="w-4 h-4 text-slate-600" />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                Expense By Payment Method
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">This Month</span>
          </div>

          <div className="space-y-2 mt-2">
            {expenseBreakdown.map(item => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    <strong>{formatAmount(item.spent, currency)}</strong> ({item.percent}%)
                  </span>
                </div>
                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${item.percent}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. Pastel Category Cards Grid (Scandinavian Look from 3rd Mockup) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
            Spending Categories
          </span>
          <button
            onClick={() => onNavigateTab('analytics')}
            className={`text-xs font-semibold ${getAccentTextColor()} flex items-center space-x-0.5 active-press`}
          >
            <span>Insights</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {topPastelCategories.map(c => (
            <div
              key={c.id}
              onClick={() => onNavigateTab('analytics')}
              className={`p-3 rounded-2xl border transition cursor-pointer active-press flex items-center space-x-2.5 ${
                isLight
                  ? `${c.pastelBg} ${c.pastelBorder} ${c.pastelText} shadow-xs hover:opacity-90`
                  : 'glass-card border-slate-800 text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                isLight ? 'bg-white/80 shadow-xs' : 'bg-slate-800'
              }`}>
                <CategoryIcon name={c.icon} className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-[11px] font-bold truncate block">
                  {c.name}
                </span>
                <span className="text-xs font-extrabold truncate block">
                  {formatAmount(c.spent, currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Monthly Budget Bar */}
      <div 
        onClick={() => onNavigateTab('more')} 
        className={`rounded-2xl p-4 border transition cursor-pointer active-press ${
          isLight 
            ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300 text-slate-800' 
            : 'glass-card border-slate-800 hover:border-slate-700 text-white'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-lg ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/15 text-emerald-400'}`}>
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Monthly Budget</h3>
              <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                {budgetRemaining > 0 
                  ? `${formatAmount(budgetRemaining, currency)} left for ${daysLeft} days` 
                  : 'Budget exceeded!'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs font-bold ${
              budgetRatio > 0.9 ? 'text-rose-500' : budgetRatio > 0.7 ? 'text-amber-500' : getAccentTextColor()
            }`}>
              {budgetPercent}%
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 inline ml-1" />
          </div>
        </div>

        {/* Progress bar */}
        <div className={`w-full rounded-full h-2 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-950 border border-slate-800'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              budgetRatio >= 1.0 
                ? 'bg-rose-500' 
                : budgetRatio > 0.75 
                ? 'bg-amber-400' 
                : 'bg-emerald-700'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Daily Spending Velocity */}
        <div className={`flex items-center justify-between mt-2.5 pt-2 text-[11px] border-t ${
          isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800/60 text-slate-400'
        }`}>
          <span>Avg: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{formatAmount(dailyAverage, currency)}/day</strong></span>
          <span>Safe limit: <strong className={getAccentTextColor()}>{formatAmount(dailySafeSpend, currency)}/day</strong></span>
        </div>
      </div>

      {/* 7. Recent Transactions List (Crisp Scandinavian Clean Cards) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
            Recent Transactions
          </h3>
          <button 
            onClick={onViewAllTransactions}
            className={`text-xs font-semibold ${getAccentTextColor()} flex items-center space-x-0.5 active-press`}
          >
            <span>See All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${isLight ? 'bg-white border-slate-200' : 'glass-card border-slate-800'}`}>
            <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>No transactions recorded yet.</p>
            <button
              onClick={onOpenAddModal}
              className={`mt-2 text-xs font-bold ${getAccentTextColor()} underline`}
            >
              Log your first expense or saving
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => {
              const isSaving = tx.type === 'saving';
              const isExpense = tx.type === 'expense';

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
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition ${
                    isLight 
                      ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs' 
                      : 'glass-card border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div 
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        isLight ? 'bg-slate-100' : ''
                      }`}
                      style={{ backgroundColor: isLight ? `${displayColor}15` : `${displayColor}25` }}
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
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                          isSaving
                            ? (isLight ? 'bg-amber-50 text-amber-900 border-amber-200' : 'bg-amber-500/10 text-amber-300 border-amber-500/30')
                            : (isLight 
                                ? 'bg-slate-50 text-slate-600 border-slate-200' 
                                : 'bg-slate-800 text-slate-400 border-slate-700')
                        }`}>
                          {isSaving ? `Saved from ${tx.paymentMethod || 'UPI'}` : (tx.paymentMethod || 'UPI')}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {tx.note || tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-2">
                    <div className="text-right">
                      <div className={`text-xs font-extrabold ${
                        isSaving
                          ? (isLight ? 'text-amber-700' : 'text-amber-400')
                          : isExpense 
                          ? (isLight ? 'text-rose-700' : 'text-rose-400') 
                          : (isLight ? 'text-emerald-700' : 'text-emerald-400')
                      }`}>
                        {isSaving ? '🌱 +' : isExpense ? '-' : '+'}{formatAmount(tx.amount, currency)}
                      </div>
                      <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
                        {tx.time || tx.date.slice(5)}
                      </span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTransaction(tx);
                      }}
                      title="Edit Record"
                      aria-label={`Edit ${displayName} record`}
                      className={`p-1.5 rounded-lg transition active-press ${
                        isLight 
                          ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' 
                          : 'hover:bg-slate-800 text-slate-500 hover:text-slate-300'
                      }`}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
