import React, { useState } from 'react';
import { 
  Bell, 
  Calendar, 
  Plus, 
  Check, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function RecurringView({ 
  recurring, 
  onSaveRecurring, 
  onLogTransaction, 
  currency = '₹' 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('bills');
  const [dueDay, setDueDay] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  const currentDay = new Date().getDate();

  // Total recurring commitments per month
  const totalMonthlyCommitments = recurring
    .filter(r => r.active)
    .reduce((sum, r) => sum + r.amount, 0);

  const handleAddRecurring = (e) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name.trim() || isNaN(num) || num <= 0) return;

    const newItem = {
      id: `rec_${Date.now()}`,
      name: name.trim(),
      amount: num,
      categoryId,
      dueDay: parseInt(dueDay, 10) || 1,
      paymentMethod,
      active: true
    };

    onSaveRecurring([...recurring, newItem]);
    setIsAdding(false);
    setName('');
    setAmount('');
  };

  const handleDelete = (id) => {
    onSaveRecurring(recurring.filter(r => r.id !== id));
  };

  const handleToggleActive = (id) => {
    onSaveRecurring(
      recurring.map(r => r.id === id ? { ...r, active: !r.active } : r)
    );
  };

  const handleQuickPay = (item) => {
    const today = new Date().toISOString().slice(0, 10);
    const nowTime = new Date().toTimeString().slice(0, 5);
    onLogTransaction({
      id: `tx_${Date.now()}`,
      type: 'expense',
      amount: item.amount,
      categoryId: item.categoryId,
      paymentMethod: item.paymentMethod || 'UPI',
      date: today,
      time: nowTime,
      note: `Recurring: ${item.name}`
    });
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Overview Card */}
      <div className="glass-card rounded-3xl p-5 border border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center space-x-1">
            <Bell className="w-3.5 h-3.5 text-emerald-400" />
            <span>Monthly Subscriptions & Bills</span>
          </span>
          <h3 className="text-xl font-extrabold text-white mt-1">
            {formatAmount(totalMonthlyCommitments, currency)}
            <span className="text-xs font-normal text-slate-400">/mo</span>
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {recurring.filter(r => r.active).length} active recurring commitments
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 active-press transition"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Bill</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {recurring.map((item) => {
          const cat = DEFAULT_CATEGORIES.find(c => c.id === item.categoryId) || {
            name: 'Bills',
            icon: 'Zap',
            color: '#eab308'
          };

          const daysDiff = item.dueDay - currentDay;
          let dueBadge = '';
          let dueBadgeColor = 'text-slate-400 bg-slate-800';

          if (daysDiff === 0) {
            dueBadge = 'Due Today! 🚨';
            dueBadgeColor = 'text-rose-400 bg-rose-500/15 border-rose-500/30';
          } else if (daysDiff > 0 && daysDiff <= 3) {
            dueBadge = `Due in ${daysDiff} days`;
            dueBadgeColor = 'text-amber-400 bg-amber-500/15 border-amber-500/30';
          } else if (daysDiff < 0) {
            dueBadge = `Passed this month (${item.dueDay}th)`;
          } else {
            dueBadge = `Due on ${item.dueDay}th`;
          }

          return (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl glass-card border transition ${
                item.active ? 'border-slate-800' : 'border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cat.color}25` }}
                  >
                    <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.name}</h4>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-medium border ${dueBadgeColor}`}>
                        {dueBadge}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        via {item.paymentMethod || 'UPI'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-white block">
                    {formatAmount(item.amount, currency)}
                  </span>
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className="text-[10px] text-slate-400 hover:text-emerald-400"
                  >
                    {item.active ? 'Active' : 'Paused'}
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 mt-2">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-slate-500 hover:text-rose-400 p-1 transition"
                  title="Remove Subscription"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleQuickPay(item)}
                  className="px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-1 active-press transition"
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                  <span>Log as Paid</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Subscription Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-white">Add Recurring Bill</h4>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRecurring} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Bill Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electricity Bill, Gym, SIP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Due Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {DEFAULT_CATEGORIES.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {PAYMENT_METHODS.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-800 text-xs font-bold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-600/30"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
