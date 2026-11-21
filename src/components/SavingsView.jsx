import React, { useState, useMemo } from 'react';
import { 
  PiggyBank, 
  Target, 
  Plus, 
  Sparkles, 
  ArrowUpRight, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Shield, 
  Smartphone, 
  Car, 
  Plane, 
  Home, 
  Coins 
} from 'lucide-react';
import { formatAmount } from '../utils/storage';

const GOAL_ICONS = [
  { id: 'PiggyBank', icon: PiggyBank, label: 'Piggy Bank' },
  { id: 'Shield', icon: Shield, label: 'Emergency' },
  { id: 'Smartphone', icon: Smartphone, label: 'Gadget' },
  { id: 'Car', icon: Car, label: 'Vehicle' },
  { id: 'Plane', icon: Plane, label: 'Travel' },
  { id: 'Home', icon: Home, label: 'Home' },
  { id: 'Coins', icon: Coins, label: 'General' }
];

export default function SavingsView({
  savingsGoals = [],
  onSaveSavingsGoals,
  transactions = [],
  currency = '₹',
  theme = 'light',
  onOpenAddModal,
  onSelectTransaction,
  onDeleteTransaction
}) {
  const isLight = theme === 'light';

  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [goalName, setGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [goalIcon, setGoalIcon] = useState('PiggyBank');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // All saving transactions
  const savingTransactions = useMemo(() => {
    return transactions
      .filter(t => t.type === 'saving')
      .sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));
  }, [transactions]);

  // Total Lifetime Savings
  const totalSaved = useMemo(() => {
    return savingTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [savingTransactions]);

  // This month savings
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thisMonthSaved = useMemo(() => {
    return savingTransactions
      .filter(t => t.date.startsWith(currentMonthStr))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [savingTransactions, currentMonthStr]);

  // Compute saved amount per goal
  const goalsWithStats = useMemo(() => {
    return savingsGoals.map(goal => {
      const savedForGoal = savingTransactions
        .filter(t => t.goalId === goal.id || t.categoryId === goal.id)
        .reduce((sum, t) => sum + t.amount, 0);
      const target = goal.targetAmount || 1;
      const progressPercent = Math.min(100, Math.round((savedForGoal / target) * 100));
      const remaining = Math.max(0, target - savedForGoal);
      return {
        ...goal,
        savedForGoal,
        progressPercent,
        remaining
      };
    });
  }, [savingsGoals, savingTransactions]);

  // Breakdown of savings by source payment method (UPI, Cash, Card, NetBanking)
  const savingsBySource = useMemo(() => {
    const sources = {
      UPI: 0,
      Cash: 0,
      Card: 0,
      NetBanking: 0
    };
    savingTransactions.forEach(t => {
      const method = t.paymentMethod || 'UPI';
      if (sources[method] !== undefined) {
        sources[method] += t.amount;
      } else {
        sources.UPI += t.amount;
      }
    });
    return sources;
  }, [savingTransactions]);

  const handleOpenAddGoal = () => {
    setEditingGoal(null);
    setGoalName('');
    setTargetAmount('');
    setGoalIcon('PiggyBank');
    setIsAddingGoal(true);
  };

  const handleOpenEditGoal = (goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setTargetAmount(String(goal.targetAmount || ''));
    setGoalIcon(goal.icon || 'PiggyBank');
    setIsAddingGoal(true);
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    if (!goalName.trim()) return;
    const target = parseFloat(targetAmount) || 10000;

    let updated;
    if (editingGoal) {
      updated = savingsGoals.map(g => g.id === editingGoal.id ? {
        ...g,
        name: goalName.trim(),
        targetAmount: target,
        icon: goalIcon
      } : g);
    } else {
      const newGoal = {
        id: `goal_${Date.now()}`,
        name: goalName.trim(),
        targetAmount: target,
        icon: goalIcon,
        color: '#10b981'
      };
      updated = [...savingsGoals, newGoal];
    }

    onSaveSavingsGoals(updated);
    setIsAddingGoal(false);
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goalId) => {
    const updated = savingsGoals.filter(g => g.id !== goalId);
    onSaveSavingsGoals(updated);
    setDeleteConfirmId(null);
  };

  const renderGoalIcon = (iconName, className = "w-5 h-5") => {
    const match = GOAL_ICONS.find(i => i.id === iconName);
    const IconComp = match ? match.icon : PiggyBank;
    return <IconComp className={className} />;
  };

  return (
    <div className="space-y-4 pb-32">
      {/* 1. Savings Hero Card */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isLight
          ? 'bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5] border-emerald-200/90 shadow-xs text-slate-900'
          : 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-teal-950/40 border-emerald-500/30 text-white'
      }`}>
        <div className="flex items-center justify-between text-xs font-semibold mb-1">
          <span className={`flex items-center space-x-1.5 ${isLight ? 'text-emerald-900' : 'text-emerald-300'}`}>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
            <span className="font-bold">Total Savings Vault 🌱</span>
          </span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center space-x-1 ${
            isLight
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300/80'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}>
            <Sparkles className="w-3 h-3" />
            <span>Active Stash</span>
          </span>
        </div>

        <div className={`text-3xl font-extrabold tracking-tight mt-1 mb-2 ${isLight ? 'text-slate-950' : 'text-white'}`}>
          {formatAmount(totalSaved, currency)}
        </div>

        <div className={`flex items-center justify-between pt-3 border-t text-xs ${
          isLight ? 'border-emerald-100 text-slate-600' : 'border-emerald-900/40 text-slate-300'
        }`}>
          <div>
            <span className="text-[11px] opacity-75 block">Saved This Month:</span>
            <span className={`font-bold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>+{formatAmount(thisMonthSaved, currency)}</span>
          </div>

          <button
            onClick={() => onOpenAddModal({ type: 'saving' })}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center space-x-1.5 transition active-press shadow-xs ${
              isLight
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-emerald-900/10'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Save Money</span>
          </button>
        </div>
      </div>

      {/* 2. Savings Sources (Where did saved money come from) */}
      <div className={`p-4 rounded-2xl border ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      }`}>
        <h3 className={`text-xs font-bold uppercase tracking-wider mb-2.5 ${isLight ? 'text-slate-600' : 'text-slate-300'}`}>
          Savings By Source Wallet
        </h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-semibold text-slate-500 block">UPI / GPay</span>
            <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
              {formatAmount(savingsBySource.UPI, currency)}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-semibold text-slate-500 block">Cash in Hand</span>
            <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
              {formatAmount(savingsBySource.Cash, currency)}
            </span>
          </div>
          <div className={`p-2.5 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
            <span className="text-[10px] font-semibold text-slate-500 block">Bank / Cards</span>
            <span className={`text-xs font-extrabold ${isLight ? 'text-slate-900' : 'text-emerald-400'}`}>
              {formatAmount(savingsBySource.NetBanking + savingsBySource.Card, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Savings Goals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center space-x-1.5">
            <Target className="w-4 h-4 text-emerald-600" />
            <h3 className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              Savings Goals & Pots
            </h3>
          </div>
          <button
            onClick={handleOpenAddGoal}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1 active-press"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>

        {/* Goals List */}
        <div className="space-y-2.5">
          {goalsWithStats.map(goal => (
            <div
              key={goal.id}
              className={`p-4 rounded-2xl border transition ${
                isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {renderGoalIcon(goal.icon)}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {goal.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Target: {formatAmount(goal.targetAmount, currency)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onOpenAddModal({ type: 'saving', goalId: goal.id })}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition active-press border ${
                      isLight 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}
                  >
                    + Deposit
                  </button>
                  <button
                    onClick={() => handleOpenEditGoal(goal)}
                    className={`p-1.5 rounded-lg text-slate-400 transition hover:text-slate-700`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  {goalsWithStats.length > 1 && (
                    <button
                      onClick={() => {
                        if (deleteConfirmId === goal.id) {
                          handleDeleteGoal(goal.id);
                        } else {
                          setDeleteConfirmId(goal.id);
                        }
                      }}
                      className={`p-1.5 rounded-lg transition ${
                        deleteConfirmId === goal.id ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className={`font-extrabold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
                    {formatAmount(goal.savedForGoal, currency)}
                  </span>
                  <span className="font-semibold text-slate-500">
                    {goal.progressPercent}% ({goal.remaining > 0 ? `${formatAmount(goal.remaining, currency)} left` : 'Completed! 🎉'})
                  </span>
                </div>
                <div className={`w-full rounded-full h-2 overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.progressPercent >= 100 ? 'bg-emerald-600' : 'bg-emerald-700'
                    }`}
                    style={{ width: `${goal.progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Recent Savings Transactions */}
      <div className="space-y-2">
        <h3 className={`text-xs font-bold uppercase tracking-wider px-1 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Savings History
        </h3>

        {savingTransactions.length === 0 ? (
          <div className={`p-8 text-center rounded-2xl border ${
            isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
          }`}>
            <PiggyBank className="w-8 h-8 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs text-slate-500">No savings records yet.</p>
            <button
              onClick={() => onOpenAddModal({ type: 'saving' })}
              className="mt-2 text-xs font-bold text-emerald-700 underline"
            >
              Log your first ₹500 saving
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {savingTransactions.map(tx => {
              const matchedGoal = savingsGoals.find(g => g.id === tx.goalId || g.id === tx.categoryId);
              const goalTitle = matchedGoal ? matchedGoal.name : 'General Savings';

              return (
                <div
                  key={tx.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    isLight ? 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300' : 'glass-card border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      <PiggyBank className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5">
                        <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {goalTitle}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${
                          isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        }`}>
                          From {tx.paymentMethod || 'UPI'}
                        </span>
                      </div>
                      <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                        {tx.note || tx.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <div className="text-right">
                      <span className={`text-xs font-extrabold block ${
                        isLight ? 'text-emerald-700' : 'text-emerald-400'
                      }`}>
                        +{formatAmount(tx.amount, currency)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {tx.time || tx.date}
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectTransaction(tx)}
                      title="Edit Record"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 transition"
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

      {/* Add / Edit Goal Modal */}
      {isAddingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-sm rounded-3xl p-5 border shadow-2xl transition-colors ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold">
                {editingGoal ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h3>
              <button
                onClick={() => setIsAddingGoal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-3.5 mt-3">
              <div>
                <label className="text-xs font-bold block mb-1">Goal Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vacation, Bike, New Laptop"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Target Amount ({currency})</label>
                <input
                  type="number"
                  placeholder="e.g. 25000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                  className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
                  }`}
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Choose Icon</label>
                <div className="grid grid-cols-4 gap-2">
                  {GOAL_ICONS.map(item => {
                    const IconC = item.icon;
                    const isSelected = goalIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoalIcon(item.id)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center space-y-1 transition ${
                          isSelected
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <IconC className="w-4 h-4" />
                        <span className="text-[9px] font-semibold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingGoal(false)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-200 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingGoal ? 'Update Goal' : 'Create Goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
