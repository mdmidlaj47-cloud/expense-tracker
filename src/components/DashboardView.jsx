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
  Layers,
  Edit2
} from 'lucide-react';
import { formatAmount, DEFAULT_CATEGORIES } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function DashboardView({ 
  transactions, 
  budgets, 
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
      const spent = monthTransactions.filter(tx => tx.categoryId === t.id).reduce((s, tx) => s + tx.amount, 0);
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

  // Weekly data for Bento layout (Monday to Sunday)
  const weeklyStats = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = (today.getDay() + 6) % 7;
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

  const getAccentBgColor = () => {
    switch (theme) {
      case 'midnight': return 'bg-cyan-500';
      case 'sunset': return 'bg-amber-500';
      case 'light': return 'bg-emerald-700';
      case 'amoled': return 'bg-emerald-500';
      default: return 'bg-emerald-600';
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Total Balance Sage Hero Card */}
      <div className={`relative overflow-hidden rounded-3xl p-5 border transition-all duration-300 ${getBalanceCardStyle()}`}>
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={`flex items-center space-x-1.5 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <Wallet className="w-4 h-4" />
            <span>Net Balance</span>
          </span>
          {savingsRate > 0 && (
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
              isLight 
                ? 'bg-white/80 text-emerald-900 border-emerald-300/80 shadow-xs' 
                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
            }`}>
              <Sparkles className="w-3 h-3" />
              <span>{savingsRate}% Saved</span>
            </span>
          )}
        </div>

        <div className={`text-3xl font-extrabold tracking-tight mt-1 mb-4 ${isLight ? 'text-slate-950' : 'text-white'}`}>
          {formatAmount(netBalance, currency)}
        </div>

        {/* Month Flow Pills (Matching the Scandinavian design) */}
        <div className={`grid grid-cols-2 gap-2.5 pt-3 border-t ${isLight ? 'border-emerald-900/10' : 'border-white/10'}`}>
          <div className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isLight
              ? 'bg-white/85 border-emerald-200/80 shadow-xs'
              : 'border-white/10 bg-black/20'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <ArrowDownLeft className="w-4 h-4 stroke-[2.8]" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-emerald-900/70' : 'opacity-70'}`}>
                Income ↑
              </span>
              <span className={`text-xs font-bold truncate block ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>
                +{formatAmount(totalIncome, currency)}
              </span>
            </div>
          </div>

          <div className={`p-2.5 rounded-2xl border flex items-center space-x-2.5 ${
            isLight
              ? 'bg-white/85 border-rose-200/80 shadow-xs'
              : 'border-white/10 bg-black/20'
          }`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
              isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-500/20 text-rose-400'
            }`}>
              <ArrowUpRight className="w-4 h-4 stroke-[2.8]" />
            </div>
            <div className="min-w-0">
              <span className={`text-[10px] uppercase font-bold block ${isLight ? 'text-rose-900/70' : 'opacity-70'}`}>
                Expense ↓
              </span>
              <span className={`text-xs font-bold truncate block ${isLight ? 'text-rose-700' : 'text-rose-400'}`}>
                -{formatAmount(totalExpense, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Pastel Category Cards Grid (Scandinavian Look from 3rd Mockup) */}
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

      {/* 3. Monthly Budget Bar */}
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
                : getAccentBgColor()
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

      {/* 4. Recent Transactions List (Crisp Scandinavian Clean Cards) */}
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
              Log your first expense
            </button>
          </div>
        ) : (
          <div className="space-y-2">
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
                      style={{ backgroundColor: isLight ? `${cat.color}15` : `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {cat.name}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                          isLight 
                            ? 'bg-slate-50 text-slate-600 border-slate-200' 
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {tx.paymentMethod || 'UPI'}
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
                        isExpense 
                          ? (isLight ? 'text-slate-900' : 'text-rose-400') 
                          : (isLight ? 'text-emerald-700' : 'text-emerald-400')
                      }`}>
                        {isExpense ? '-' : '+'}{formatAmount(tx.amount, currency)}
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
                      aria-label={`Edit ${cat.name} record`}
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
