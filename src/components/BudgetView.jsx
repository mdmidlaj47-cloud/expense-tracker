import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Edit2, Plus, Sparkles, X, Check } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function BudgetView({ 
  budgets, 
  onSaveBudgets, 
  transactions, 
  currency = '₹', 
  currentMonth 
}) {
  const [editingCatId, setEditingCatId] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  // Expenses this month
  const monthExpenses = transactions.filter(t => t.date.startsWith(currentMonth) && t.type === 'expense');

  // Overall spend
  const totalMonthExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);
  const overallLimit = budgets.overall || 45000;
  const overallRatio = overallLimit > 0 ? (totalMonthExpense / overallLimit) : 0;
  const overallRemaining = overallLimit - totalMonthExpense;

  // Expense categories
  const expenseCategories = DEFAULT_CATEGORIES.filter(c => c.type === 'expense');

  const handleStartEdit = (catId, currentVal) => {
    setEditingCatId(catId);
    setEditLimit(String(currentVal || 0));
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const val = parseFloat(editLimit);
    if (!isNaN(val) && val >= 0) {
      const updated = { ...budgets, [editingCatId]: val };
      onSaveBudgets(updated);
    }
    setEditingCatId(null);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Overall Budget Header Card */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Monthly Cap</span>
              <h3 className="text-base font-extrabold text-white">
                {formatAmount(overallLimit, currency)}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleStartEdit('overall', overallLimit)}
            className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition active-press text-xs font-semibold flex items-center space-x-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallRatio >= 1.0 ? 'bg-rose-500' : overallRatio > 0.75 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.round(overallRatio * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">
              Spent: <strong className="text-slate-200">{formatAmount(totalMonthExpense, currency)}</strong>
            </span>
            <span className={overallRemaining >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {overallRemaining >= 0 
                ? `${formatAmount(overallRemaining, currency)} remaining` 
                : `Over by ${formatAmount(Math.abs(overallRemaining), currency)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Category Limits & Alerts
        </h3>
        <span className="text-[10px] text-slate-500">Tap to modify</span>
      </div>

      {/* Category Budgets List */}
      <div className="space-y-2.5">
        {expenseCategories.map((cat) => {
          const limit = budgets[cat.id] || 0;
          const spent = monthExpenses
            .filter(t => t.categoryId === cat.id)
            .reduce((sum, t) => sum + t.amount, 0);

          const ratio = limit > 0 ? (spent / limit) : 0;
          const percent = Math.min(100, Math.round(ratio * 100));
          const remaining = limit - spent;
          const isOver = spent > limit && limit > 0;
          const isWarning = ratio >= 0.75 && !isOver;

          return (
            <div
              key={cat.id}
              onClick={() => handleStartEdit(cat.id, limit)}
              className={`p-3.5 rounded-2xl glass-card border transition cursor-pointer active-press ${
                isOver 
                  ? 'border-rose-500/40 bg-rose-500/5' 
                  : isWarning 
                  ? 'border-amber-500/30 bg-amber-500/5' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25` }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-xs font-bold text-white">{cat.name}</h4>
                      {isOver && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                          OVER
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Limit: {limit > 0 ? formatAmount(limit, currency) : 'No limit set'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-200">
                    {formatAmount(spent, currency)}
                  </div>
                  {limit > 0 && (
                    <span className={`text-[10px] font-semibold ${
                      isOver ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-slate-400'
                    }`}>
                      {ratio >= 1.0 ? `${Math.round(ratio * 100)}%` : `${percent}% used`}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {limit > 0 ? (
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                  />
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic">
                  Tap to set a monthly target for this category
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      {editingCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-bold text-white">
                Set Budget Limit
              </h4>
              <button 
                onClick={() => setEditingCatId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Monthly Target ({currency})
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingCatId(null)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
