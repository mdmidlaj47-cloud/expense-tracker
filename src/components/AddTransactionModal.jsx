import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, CreditCard, Tag, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function AddTransactionModal({ isOpen, onClose, onSave, initialData = null, currency = '₹' }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  // Reset or fill form when opened
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'expense');
        setAmount(String(initialData.amount || ''));
        setCategoryId(initialData.categoryId || '');
        setPaymentMethod(initialData.paymentMethod || 'UPI');
        setDate(initialData.date || new Date().toISOString().slice(0, 10));
        setTime(initialData.time || new Date().toTimeString().slice(0, 5));
        setNote(initialData.note || '');
      } else {
        const now = new Date();
        setType('expense');
        setAmount('');
        const firstExp = DEFAULT_CATEGORIES.find(c => c.type === 'expense');
        setCategoryId(firstExp ? firstExp.id : 'food');
        setPaymentMethod('UPI');
        setDate(now.toISOString().slice(0, 10));
        setTime(now.toTimeString().slice(0, 5));
        setNote('');
      }
      setError('');
    }
  }, [isOpen, initialData]);

  // When type changes, select the first category of that type if current category doesn't match
  const handleTypeChange = (newType) => {
    setType(newType);
    const validCats = DEFAULT_CATEGORIES.filter(c => c.type === newType);
    if (!validCats.some(c => c.id === categoryId)) {
      setCategoryId(validCats[0]?.id || '');
    }
  };

  const handleQuickAdd = (addVal) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + addVal));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }
    if (!categoryId) {
      setError('Please select a category');
      return;
    }

    // Trigger mini confetti on income or savings!
    if (type === 'income') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } catch (err) {}
    }

    onSave({
      id: initialData?.id || `tx_${Date.now()}`,
      type,
      amount: numAmount,
      categoryId,
      paymentMethod,
      date,
      time,
      note: note.trim()
    });

    onClose();
  };

  if (!isOpen) return null;

  const filteredCategories = DEFAULT_CATEGORIES.filter(c => c.type === type);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-slate-900 border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <span className="text-base font-bold text-white">
              {initialData ? 'Edit Record' : 'Log New Transaction'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Expense vs Income Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Expense 💸
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Income 💰
            </button>
          </div>

          {/* Amount input */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 text-center">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
              Enter Amount
            </label>
            <div className="flex items-center justify-center space-x-1">
              <span className={`text-3xl font-extrabold ${type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`}>
                {currency}
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="any"
                autoFocus
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-48 text-center text-3xl font-extrabold bg-transparent text-white focus:outline-none placeholder-slate-600"
              />
            </div>

            {/* Quick Add Chips */}
            <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t border-slate-800/80">
              {[100, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-[11px] font-semibold text-slate-300 active-press transition"
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Category Selector Grid */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Select Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {filteredCategories.map((cat) => {
                const isSelected = categoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition active-press ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-sm ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                    }`}
                  >
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                    </div>
                    <span className="text-[11px] font-medium truncate w-full leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PAYMENT_METHODS.map((pm) => {
                const isSelected = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id)}
                    className={`px-3 py-2 rounded-xl border text-xs font-medium flex items-center space-x-2 transition ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <CategoryIcon name={pm.icon} className="w-4 h-4 text-emerald-400" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center space-x-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1 flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Swiggy biryani, Metro card recharge"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="w-1/3 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-xs font-bold text-slate-300 hover:text-white transition active-press"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-extrabold shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-1.5 active-press transition"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{initialData ? 'Update Record' : 'Save Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
