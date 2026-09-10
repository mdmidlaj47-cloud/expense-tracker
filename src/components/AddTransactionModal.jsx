import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Clock, CreditCard, Tag, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function AddTransactionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null, 
  currency = '₹',
  theme = 'light'
}) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const isLight = theme === 'light';

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] flex flex-col overflow-hidden transition-colors ${
          isLight 
            ? 'bg-white border-t sm:border border-slate-200 text-slate-900 shadow-slate-900/15' 
            : 'bg-slate-900 border-t sm:border border-slate-800 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`px-5 pt-4 pb-3 flex items-center justify-between border-b ${
          isLight ? 'border-slate-100' : 'border-slate-800'
        }`}>
          <div className="flex items-center space-x-2">
            <span className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {initialData ? 'Edit Record' : 'Log New Transaction'}
            </span>
          </div>
          <button 
            onClick={onClose}
            className={`p-1.5 rounded-full transition ${
              isLight ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - scrollable */}
        <div className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {/* Expense vs Income Toggle */}
          <div className={`grid grid-cols-2 p-1 rounded-2xl border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/25'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
              }`}
            >
              Expense 💸
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-slate-200')
              }`}
            >
              Income 💰
            </button>
          </div>

          {/* Amount input */}
          <div className={`p-4 rounded-2xl border text-center ${
            isLight ? 'bg-slate-50 border-slate-200/90' : 'bg-slate-950/80 border-slate-800/90'
          }`}>
            <label className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Enter Amount
            </label>
            <div className="flex items-center justify-center space-x-1">
              <span className={`text-3xl font-extrabold ${type === 'expense' ? 'text-rose-500' : 'text-emerald-600'}`}>
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
                className={`w-48 text-center text-3xl font-extrabold bg-transparent focus:outline-none ${
                  isLight ? 'text-slate-900 placeholder-slate-300' : 'text-white placeholder-slate-600'
                }`}
              />
            </div>

            {/* Quick Add Chips */}
            <div className={`flex items-center justify-center space-x-2 mt-3 pt-3 border-t ${
              isLight ? 'border-slate-200' : 'border-slate-800/80'
            }`}>
              {[100, 500, 1000, 2000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAdd(val)}
                  className={`px-2.5 py-1 rounded-xl border text-[11px] font-bold active-press transition ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs' 
                      : 'bg-slate-900 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  +{currency}{val}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          {/* Category Selector Grid */}
          <div>
            <label className={`text-xs font-bold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
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
                    className={`p-2.5 rounded-2xl border flex flex-col items-center justify-center text-center transition active-press ${
                      isSelected
                        ? (isLight 
                            ? 'border-emerald-600 bg-emerald-50 text-slate-900 ring-2 ring-emerald-600/30' 
                            : 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500/50')
                        : (isLight 
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-xs' 
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-slate-300')
                    }`}
                  >
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center mb-1.5"
                      style={{ backgroundColor: `${cat.color}25` }}
                    >
                      <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                    </div>
                    <span className="text-[11px] font-semibold truncate w-full leading-tight">
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className={`text-xs font-bold block mb-2 ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
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
                        ? (isLight 
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' 
                            : 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-semibold')
                        : (isLight 
                            ? 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-xs' 
                            : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-300')
                    }`}
                  >
                    <CategoryIcon name={pm.icon} className="w-4 h-4 text-emerald-600" />
                    <span className="truncate">{pm.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-[11px] font-semibold block mb-1 flex items-center space-x-1 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <Calendar className="w-3.5 h-3.5" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
            <div>
              <label className={`text-[11px] font-semibold block mb-1 flex items-center space-x-1 ${
                isLight ? 'text-slate-600' : 'text-slate-400'
              }`}>
                <Clock className="w-3.5 h-3.5" />
                <span>Time</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-950 border-slate-800 text-white'
                }`}
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className={`text-[11px] font-semibold block mb-1 ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Note / Description (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Starbucks coffee, Grocery at Waitrose"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-emerald-500 ${
                isLight ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-xs' : 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
              }`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center space-x-3 ${
          isLight ? 'border-slate-100 bg-slate-50/80' : 'border-slate-800 bg-slate-900/90'
        }`}>
          <button
            type="button"
            onClick={onClose}
            className={`w-1/3 py-3 rounded-xl border text-xs font-bold transition active-press ${
              isLight ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 shadow-xs' : 'border-slate-700 bg-slate-800/80 text-slate-300'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`w-2/3 py-3 rounded-xl text-white text-xs font-extrabold flex items-center justify-center space-x-1.5 active-press transition shadow-md ${
              isLight
                ? 'bg-slate-900 hover:bg-black shadow-slate-900/20'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 shadow-emerald-600/30'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>{initialData ? 'Update Record' : 'Save Record'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
