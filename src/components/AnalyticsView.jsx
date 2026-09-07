import React, { useState, useMemo } from 'react';
import { 
  PieChart as ChartIcon, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  Award,
  Calendar,
  Sparkles
} from 'lucide-react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function AnalyticsView({ transactions, currency = '₹', currentMonth }) {
  const [activeTab, setActiveTab] = useState('categories'); // categories | daily | payment
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter transactions for current selected month
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');
  }, [transactions, currentMonth]);

  const totalExpense = useMemo(() => {
    return monthTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  // Aggregate by Category
  const categoryStats = useMemo(() => {
    const map = {};
    monthTransactions.forEach(t => {
      map[t.categoryId] = (map[t.categoryId] || 0) + t.amount;
    });

    const list = Object.entries(map).map(([catId, amount]) => {
      const cat = DEFAULT_CATEGORIES.find(c => c.id === catId) || {
        name: catId,
        color: '#94a3b8',
        icon: 'MoreHorizontal'
      };
      const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: catId,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        amount,
        percent
      };
    });

    return list.sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpense]);

  // Aggregate by Payment Method
  const paymentStats = useMemo(() => {
    const map = {};
    monthTransactions.forEach(t => {
      const pm = t.paymentMethod || 'UPI';
      map[pm] = (map[pm] || 0) + t.amount;
    });

    return Object.entries(map).map(([pmId, amount]) => {
      const pm = PAYMENT_METHODS.find(p => p.id === pmId) || { label: pmId, icon: 'Smartphone' };
      const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: pmId,
        label: pm.label,
        icon: pm.icon,
        amount,
        percent
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, totalExpense]);

  // Last 7 days spending
  const dailySpending = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'narrow' });
      const dayAmount = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      days.push({ dateStr, label, amount: dayAmount });
    }
    const maxVal = Math.max(...days.map(d => d.amount), 1);
    return { days, maxVal };
  }, [transactions]);

  // Top spending category
  const topCategory = categoryStats[0];

  return (
    <div className="space-y-4 pb-24">
      {/* View Switcher */}
      <div className="grid grid-cols-3 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        {[
          { id: 'categories', label: 'Categories' },
          { id: 'daily', label: 'Daily Trend' },
          { id: 'payment', label: 'Payment Mode' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-2 text-xs font-bold rounded-xl transition ${
              activeTab === tab.id
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Highlights Box */}
      {topCategory && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${topCategory.color}25` }}
            >
              <CategoryIcon name={topCategory.icon} className="w-5 h-5" color={topCategory.color} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center space-x-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Top Expense</span>
              </span>
              <h4 className="text-xs font-bold text-white">{topCategory.name}</h4>
              <p className="text-[11px] text-slate-400">
                {topCategory.percent.toFixed(0)}% of month ({formatAmount(topCategory.amount, currency)})
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Total Spent</span>
            <span className="text-sm font-extrabold text-rose-400">
              {formatAmount(totalExpense, currency)}
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: Categories Breakdown */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {categoryStats.length === 0 ? (
            <div className="p-8 text-center rounded-2xl glass-card border border-slate-800 text-slate-400 text-xs">
              No expense data recorded for this month.
            </div>
          ) : (
            <>
              {/* Donut Chart Representation */}
              <div className="glass-card rounded-2xl p-5 border border-slate-800 flex flex-col items-center">
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    {(() => {
                      let accumulatedPercent = 0;
                      return categoryStats.map((cat) => {
                        const strokeDasharray = `${cat.percent} ${100 - cat.percent}`;
                        const strokeDashoffset = -accumulatedPercent;
                        accumulatedPercent += cat.percent;

                        return (
                          <circle
                            key={cat.id}
                            cx="50"
                            cy="50"
                            r="38"
                            fill="transparent"
                            stroke={cat.color}
                            strokeWidth="15"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            className="transition-all duration-700 hover:opacity-80 cursor-pointer"
                            pathLength="100"
                            onClick={() => setSelectedCategory(cat)}
                          />
                        );
                      });
                    })()}
                  </svg>
                  
                  {/* Center of Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {selectedCategory ? selectedCategory.name : 'Total Spend'}
                    </span>
                    <span className="text-base font-extrabold text-white">
                      {formatAmount(selectedCategory ? selectedCategory.amount : totalExpense, currency)}
                    </span>
                    {selectedCategory && (
                      <span className="text-[10px] font-bold text-emerald-400">
                        {selectedCategory.percent.toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Tap any slice or item below to inspect</p>
              </div>

              {/* Category List with Bars */}
              <div className="space-y-2">
                {categoryStats.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? null : cat)}
                      className={`p-3 rounded-2xl glass-card border transition cursor-pointer active-press ${
                        isSelected ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center space-x-2.5">
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${cat.color}25` }}
                          >
                            <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                            <span className="text-[10px] text-slate-400">{cat.percent.toFixed(1)}% of total</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-200 block">
                            {formatAmount(cat.amount, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${cat.percent}%`, backgroundColor: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: Daily Trends */}
      {activeTab === 'daily' && (
        <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Last 7 Days Activity</span>
            </h4>
            <span className="text-[11px] text-slate-400">Peak: {formatAmount(dailySpending.maxVal, currency)}</span>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between h-44 pt-6 pb-2 px-1 border-b border-slate-800">
            {dailySpending.days.map((d, i) => {
              const heightPercent = dailySpending.maxVal > 0 ? (d.amount / dailySpending.maxVal) * 100 : 0;
              const isToday = i === dailySpending.days.length - 1;
              return (
                <div key={d.dateStr} className="flex flex-col items-center flex-1 space-y-1.5 group">
                  <span className="text-[9px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition truncate">
                    {d.amount > 0 ? formatAmount(d.amount, currency) : ''}
                  </span>
                  <div className="w-full flex justify-center items-end h-32">
                    <div
                      className={`w-5 rounded-t-lg transition-all duration-500 ${
                        isToday 
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 shadow-md shadow-emerald-500/20' 
                          : d.amount > 0 
                          ? 'bg-slate-700 hover:bg-slate-600' 
                          : 'bg-slate-800/40'
                      }`}
                      style={{ height: `${Math.max(6, heightPercent)}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>
                    {d.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-400 text-center">
            Hover or tap any bar to inspect daily expense
          </p>
        </div>
      )}

      {/* TAB 3: Payment Method Distribution */}
      {activeTab === 'payment' && (
        <div className="space-y-2">
          {paymentStats.map((pm) => (
            <div
              key={pm.id}
              className="p-3.5 rounded-2xl glass-card border border-slate-800 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-emerald-400">
                  <CategoryIcon name={pm.icon} className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{pm.label}</h4>
                  <span className="text-[10px] text-slate-400">{pm.percent.toFixed(1)}% of total</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-extrabold text-slate-200 block">
                  {formatAmount(pm.amount, currency)}
                </span>
                <div className="w-20 bg-slate-950 rounded-full h-1.5 overflow-hidden mt-1 inline-block">
                  <div 
                    className="h-full bg-emerald-500 rounded-full" 
                    style={{ width: `${pm.percent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
