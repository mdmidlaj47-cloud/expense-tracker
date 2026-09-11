import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, Edit2, Plus, Sparkles, X, Check } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function BudgetView({ 
  budgets, 
  onSaveBudgets, 
  transactions, 
  currency = '₹', 
  currentMonth,
  theme = 'light'
}) {
  const isLight = theme === 'light';
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

  // Handle Android / Mobile Back button when editing budget limit
  React.useEffect(() => {
    if (editingCatId) {
      window.history.pushState({ app: 'rupya', isBudgetModal: true }, '');
      const handlePop = () => {
        setEditingCatId(null);
      };
      window.addEventListener('popstate', handlePop, { once: true });
      return () => {
        window.removeEventListener('popstate', handlePop);
      };
    }
  }, [editingCatId]);

  const handleCloseEdit = () => {
    if (editingCatId) {
      setEditingCatId(null);
      if (window.history.state?.isBudgetModal) {
        window.history.back();
      }
    }
  };

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
    handleCloseEdit();
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Overall Budget Header Card */}
      <div className={`p-5 rounded-3xl border relative overflow-hidden transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-xl ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/15 text-emerald-400'}`}>
              <Target className="w-5 h-5" />
            </div>
            <div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                Total Monthly Cap
              </span>
              <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {formatAmount(overallLimit, currency)}
              </h3>
            </div>
          </div>

          <button
            onClick={() => handleStartEdit('overall', overallLimit)}
            className={`p-2 rounded-xl transition active-press text-xs font-semibold flex items-center space-x-1 ${
              isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className={`w-full rounded-full h-2.5 overflow-hidden border ${
            isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-950 border-slate-800'
          }`}>
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallRatio >= 1.0 ? 'bg-rose-500' : overallRatio > 0.75 ? 'bg-amber-400' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, Math.round(overallRatio * 100))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <span className={isLight ? 'text-slate-600' : 'text-slate-400'}>
              Spent: <strong className={isLight ? 'text-slate-900' : 'text-slate-200'}>{formatAmount(totalMonthExpense, currency)}</strong>
            </span>
            <span className={overallRemaining >= 0 ? (isLight ? 'text-emerald-700 font-bold' : 'text-emerald-400 font-bold') : 'text-rose-500 font-bold'}>
              {overallRemaining >= 0 
                ? `${formatAmount(overallRemaining, currency)} remaining` 
                : `Over by ${formatAmount(Math.abs(overallRemaining), currency)}`}
            </span>
          </div>
        </div>
      </div>

      {/* Category Budgets Header */}
      <div className="flex items-center justify-between px-1">
        <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Category Limits & Alerts
        </h3>
        <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>Tap to modify</span>
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
              className={`p-3.5 rounded-2xl border transition cursor-pointer active-press ${
                isLight 
                  ? (isOver ? 'bg-rose-50/50 border-rose-200 shadow-xs' : isWarning ? 'bg-amber-50/50 border-amber-200 shadow-xs' : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs')
                  : (isOver ? 'border-rose-500/40 bg-rose-500/5' : isWarning ? 'border-amber-500/30 bg-amber-500/5' : 'glass-card border-slate-800 hover:border-slate-700')
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: isLight ? `${cat.color}15` : `${cat.color}25` }}
                  >
                    <CategoryIcon name={cat.icon} className="w-4 h-4" color={cat.color} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{cat.name}</h4>
                      {isOver && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${isLight ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                          OVER
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      Limit: {limit > 0 ? formatAmount(limit, currency) : 'No limit set'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
                    {formatAmount(spent, currency)}
                  </div>
                  {limit > 0 && (
                    <span className={`text-[10px] font-semibold ${
                      isOver ? 'text-rose-500' : isWarning ? 'text-amber-500' : (isLight ? 'text-slate-500' : 'text-slate-400')
                    }`}>
                      {ratio >= 1.0 ? `${Math.round(ratio * 100)}%` : `${percent}% used`}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {limit > 0 ? (
                <div className={`w-full rounded-full h-1.5 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.round(ratio * 100))}%` }}
                  />
                </div>
              ) : (
                <div className={`text-[10px] italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tap to set a monthly target for this category
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Budget Limit Modal */}
      {editingCatId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xs rounded-3xl p-5 shadow-2xl space-y-4 border ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Set Budget Limit
              </h4>
              <button 
                onClick={handleCloseEdit}
                className={isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-white'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className={`text-[11px] block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                  Monthly Target ({currency})
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  autoFocus
                  placeholder="0"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-base font-bold focus:outline-none ${
                    isLight 
                      ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600' 
                      : 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500'
                  }`}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className={`w-1/2 py-2.5 rounded-xl text-xs font-bold ${
                    isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-slate-900 text-xs font-bold text-white shadow-xs"
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
