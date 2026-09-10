import React, { useMemo } from 'react';
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
  Layers
} from 'lucide-react';
import { formatAmount, DEFAULT_CATEGORIES } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function DashboardView({ 
  transactions, 
  budgets, 
  currency = '₹', 
  currentMonth,
  theme = 'emerald',
  layout = 'classic',
  onOpenAddModal, 
  onSelectTransaction,
  onViewAllTransactions,
  onNavigateTab
}) {
  // Filter transactions for current month (YYYY-MM)
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));

  // Totals
  const totalIncome = monthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = monthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Overall lifetime balance
  const lifetimeIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const lifetimeExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = lifetimeIncome - lifetimeExpense;

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

  // Recent 6 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`))
    .slice(0, 6);

  // Weekly data for Bento layout (Monday to Sunday)
  const weeklyStats = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    // find Monday of this week
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek);

    const weekData = days.map((label, idx) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + idx);
      const dStr = d.toISOString().slice(0, 10);
      const spent = transactions
        .filter(t => t.date === dStr && t.type === 'expense')
        .reduce((s, t) => s + t.amount, 0);
      return { label, spent, isToday: idx === dayOfWeek };
    });

    const maxSpent = Math.max(...weekData.map(w => w.spent), 100);
    const totalWeek = weekData.reduce((s, w) => s + w.spent, 0);
    return { weekData, maxSpent, totalWeek };
  }, [transactions]);

  // Top 3 category budget health for Bento layout
  const topCategoryBudgets = useMemo(() => {
    return DEFAULT_CATEGORIES
      .filter(c => c.type === 'expense' && (budgets[c.id] || 0) > 0)
      .map(c => {
        const limit = budgets[c.id] || 1;
        const spent = monthTransactions.filter(t => t.categoryId === c.id).reduce((s, t) => s + t.amount, 0);
        const ratio = Math.min(1.2, spent / limit);
        const percent = Math.round((spent / limit) * 100);
        return { ...c, spent, limit, ratio, percent };
      })
      .slice(0, 3);
  }, [budgets, monthTransactions]);

  // Theme styling helpers
  const getBalanceCardStyle = () => {
    switch (theme) {
      case 'midnight':
        return 'bg-gradient-to-br from-[#0a192f] via-[#0f172a] to-[#020b18] border-cyan-500/30 shadow-cyan-950/40 text-white';
      case 'sunset':
        return 'bg-gradient-to-br from-[#2a1205] via-[#1a0c06] to-[#0f0704] border-amber-500/30 shadow-amber-950/40 text-white';
      case 'light':
        return 'bg-gradient-to-br from-emerald-50 via-white to-slate-50 border-emerald-300 text-slate-900 shadow-md shadow-emerald-950/5';
      case 'amoled':
        return 'bg-black border-zinc-800 text-white shadow-none';
      case 'emerald':
      default:
        return 'bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/60 border-emerald-500/20 shadow-emerald-950/20 text-white';
    }
  };

  const getAccentTextColor = () => {
    switch (theme) {
      case 'midnight': return 'text-cyan-400';
      case 'sunset': return 'text-amber-400';
      case 'light': return 'text-emerald-600';
      case 'amoled': return 'text-emerald-400';
      default: return 'text-emerald-400';
    }
  };

  const getAccentBgColor = () => {
    switch (theme) {
      case 'midnight': return 'bg-cyan-500';
      case 'sunset': return 'bg-amber-500';
      case 'light': return 'bg-emerald-600';
      case 'amoled': return 'bg-emerald-500';
      default: return 'bg-emerald-500';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Total Balance Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-5 border shadow-xl transition-all duration-300 ${getBalanceCardStyle()}`}>
        <div className="flex items-center justify-between text-xs font-medium mb-1 opacity-80">
          <span className="flex items-center space-x-1.5">
            <Wallet className="w-4 h-4" />
            <span>Net Available Balance</span>
          </span>
          {savingsRate > 0 && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
              theme === 'light' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{savingsRate}% Saved</span>
            </span>
          )}
        </div>

        <div className="text-3xl font-extrabold tracking-tight mt-1 mb-4">
          {formatAmount(netBalance, currency)}
        </div>

        {/* Month Flow Pills */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-white/10">
          <div className="p-2.5 rounded-2xl border border-white/10 bg-black/20 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold opacity-70 block">Income</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">
                {formatAmount(totalIncome, currency)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl border border-white/10 bg-black/20 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold opacity-70 block">Spent</span>
              <span className="text-xs font-bold text-rose-400 truncate block">
                {formatAmount(totalExpense, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. LAYOUT VARIATION: CLASSIC vs BENTO GRID */}
      {layout === 'bento' ? (
        /* BENTO GRID LAYOUT */
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3">
            {/* Bento Tile 1: Weekly Spending Mini-Chart (7 cols) */}
            <div 
              onClick={() => onNavigateTab('analytics')}
              className="col-span-7 glass-card rounded-2xl p-3.5 border border-slate-800 hover:border-slate-700 transition cursor-pointer active-press flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-1">
                  <span>This Week</span>
                  <span className={getAccentTextColor()}>{formatAmount(weeklyStats.totalWeek, currency)}</span>
                </div>
                <p className="text-[10px] text-slate-500">Weekly Overview</p>
              </div>

              {/* Mini Bar Chart */}
              <div className="flex items-end justify-between h-20 pt-3 px-1 border-b border-slate-800/80">
                {weeklyStats.weekData.map((w, idx) => {
                  const h = Math.max(8, Math.round((w.spent / weeklyStats.maxSpent) * 100));
                  return (
                    <div key={idx} className="flex flex-col items-center flex-1 space-y-1">
                      <div className="w-full flex justify-center items-end h-14">
                        <div 
                          className={`w-2.5 rounded-t transition-all ${
                            w.isToday 
                              ? `${getAccentBgColor()} shadow-sm` 
                              : w.spent > 0 
                              ? 'bg-slate-700' 
                              : 'bg-slate-800/40'
                          }`}
                          style={{ height: `${h}%` }}
                        />
                      </div>
                      <span className={`text-[8px] ${w.isToday ? 'font-bold text-white' : 'text-slate-500'}`}>
                        {w.label[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bento Tile 2: Category Budget Health Rings (5 cols) */}
            <div 
              onClick={() => onNavigateTab('more')}
              className="col-span-5 glass-card rounded-2xl p-3 border border-slate-800 hover:border-slate-700 transition cursor-pointer active-press flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-300">Budget</span>
                <span className={`text-[10px] font-bold ${getAccentTextColor()}`}>{budgetPercent}%</span>
              </div>

              <div className="space-y-2 py-1">
                {topCategoryBudgets.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic py-2">No category limits configured</p>
                ) : (
                  topCategoryBudgets.map(cat => (
                    <div key={cat.id} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-300 truncate max-w-[55px]">{cat.name}</span>
                        <span className={cat.ratio >= 1.0 ? 'text-rose-400 font-bold' : 'text-slate-400 font-medium'}>
                          {cat.percent}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${cat.ratio >= 1.0 ? 'bg-rose-500' : getAccentBgColor()}`}
                          style={{ width: `${Math.min(100, cat.percent)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              <span className="text-[9px] text-slate-500 block text-right mt-1">Tap for details →</span>
            </div>
          </div>

          {/* Bento Tile 3: Daily Velocity Strip */}
          <div className="glass-card rounded-2xl px-4 py-2.5 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Daily Spending Burn:</span>
            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="text-slate-200">Avg: {formatAmount(dailyAverage, currency)}/d</span>
              <span className="text-slate-600">|</span>
              <span className={getAccentTextColor()}>Safe: {formatAmount(dailySafeSpend, currency)}/d</span>
            </div>
          </div>
        </div>
      ) : (
        /* CLASSIC FLOW LAYOUT */
        <div 
          onClick={() => onNavigateTab('more')} 
          className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition cursor-pointer active-press"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg bg-emerald-500/15 ${getAccentTextColor()}`}>
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-200">Monthly Budget</h3>
                <p className="text-[10px] text-slate-400">
                  {budgetRemaining > 0 
                    ? `${formatAmount(budgetRemaining, currency)} left for ${daysLeft} days` 
                    : 'Budget exceeded!'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-bold ${
                budgetRatio > 0.9 ? 'text-rose-400' : budgetRatio > 0.7 ? 'text-amber-400' : getAccentTextColor()
              }`}>
                {budgetPercent}%
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500 inline ml-1" />
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                budgetRatio >= 1.0 
                  ? 'bg-rose-500' 
                  : budgetRatio > 0.75 
                  ? 'bg-amber-400' 
                  : getAccentBgColor()
              }`}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>

          {/* Daily Spending Velocity */}
          <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
            <span>Avg: <strong className="text-slate-200">{formatAmount(dailyAverage, currency)}/day</strong></span>
            <span>Safe limit: <strong className={getAccentTextColor()}>{formatAmount(dailySafeSpend, currency)}/day</strong></span>
          </div>
        </div>
      )}

      {/* 3. Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenAddModal}
          className={`p-3 rounded-2xl border text-slate-200 flex flex-col items-center justify-center text-center active-press transition ${
            theme === 'midnight' 
              ? 'bg-cyan-500/10 border-cyan-500/30' 
              : theme === 'sunset' 
              ? 'bg-amber-500/10 border-amber-500/30' 
              : 'bg-emerald-500/15 border-emerald-500/30'
          }`}
        >
          <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center mb-1 shadow-md ${getAccentBgColor()}`}>
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>
          <span className="text-[11px] font-bold">Add Entry</span>
        </button>

        <button
          onClick={() => onNavigateTab('analytics')}
          className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex flex-col items-center justify-center text-center active-press transition"
        >
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">Analytics</span>
        </button>

        <button
          onClick={() => onNavigateTab('more')}
          className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-slate-300 flex flex-col items-center justify-center text-center active-press transition"
        >
          <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center mb-1">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-bold">Budgets</span>
        </button>
      </div>

      {/* 4. Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Recent Activity
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
          <div className="p-8 text-center rounded-2xl glass-card border border-slate-800">
            <p className="text-xs text-slate-400">No transactions recorded yet.</p>
            <button
              onClick={onOpenAddModal}
              className={`mt-2 text-xs font-bold ${getAccentTextColor()} underline`}
            >
              Log your first expense
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {recentTransactions.map((tx) => {
              const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId) || {
                name: tx.categoryId,
                icon: 'MoreHorizontal',
                color: '#94a3b8'
              };
              const isExpense = tx.type === 'expense';

              return (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx)}
                  className="p-3 rounded-2xl glass-card border border-slate-800 hover:border-slate-700 flex items-center justify-between cursor-pointer active-press transition"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-white truncate">
                          {cat.name}
                        </span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-medium bg-slate-800 text-slate-400 border border-slate-700">
                          {tx.paymentMethod || 'UPI'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate">
                        {tx.note || tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <div className={`text-xs font-extrabold ${isExpense ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {isExpense ? '-' : '+'}{formatAmount(tx.amount, currency)}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {tx.time || tx.date.slice(5)}
                    </span>
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
