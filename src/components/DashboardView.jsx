import React from 'react';
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
  Sparkles
} from 'lucide-react';
import { formatAmount, DEFAULT_CATEGORIES } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function DashboardView({ 
  transactions, 
  budgets, 
  currency = '₹', 
  currentMonth,
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

  return (
    <div className="space-y-4 pb-24">
      {/* Total Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/60 border border-emerald-500/20 shadow-xl shadow-emerald-950/20">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
        
        <div className="flex items-center justify-between text-slate-300 text-xs font-medium mb-1">
          <span className="flex items-center space-x-1.5">
            <Wallet className="w-4 h-4 text-emerald-400" />
            <span>Net Available Balance</span>
          </span>
          {savingsRate > 0 && (
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>{savingsRate}% Saved</span>
            </span>
          )}
        </div>

        <div className="text-3xl font-extrabold text-white tracking-tight mt-1 mb-4">
          {formatAmount(netBalance, currency)}
        </div>

        {/* Month Summary pill indicators */}
        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-slate-800/80">
          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Income</span>
              <span className="text-xs font-bold text-emerald-400 truncate block">
                {formatAmount(totalIncome, currency)}
              </span>
            </div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800 flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Spent</span>
              <span className="text-xs font-bold text-rose-400 truncate block">
                {formatAmount(totalExpense, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Budget Tracker Bar */}
      <div 
        onClick={() => onNavigateTab('more')} 
        className="glass-card rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition cursor-pointer active-press"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
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
              budgetRatio > 0.9 ? 'text-rose-400' : budgetRatio > 0.7 ? 'text-amber-400' : 'text-emerald-400'
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
                : 'bg-emerald-500'
            }`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>

        {/* Daily Spending Velocity */}
        <div className="flex items-center justify-between mt-2.5 pt-2 text-[11px] text-slate-400 border-t border-slate-800/60">
          <span>Avg: <strong className="text-slate-200">{formatAmount(dailyAverage, currency)}/day</strong></span>
          <span>Safe limit: <strong className="text-emerald-400">{formatAmount(dailySafeSpend, currency)}/day</strong></span>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={onOpenAddModal}
          className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex flex-col items-center justify-center text-center active-press transition"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1 shadow-md shadow-emerald-500/30">
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

      {/* Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Recent Activity
          </h3>
          <button 
            onClick={onViewAllTransactions}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center space-x-0.5 active-press"
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
              className="mt-2 text-xs font-bold text-emerald-400 underline"
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
