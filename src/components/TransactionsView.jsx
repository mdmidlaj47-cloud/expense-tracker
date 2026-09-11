import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Calendar,
  X,
  Plus,
  Edit2
} from 'lucide-react';
import { DEFAULT_CATEGORIES, PAYMENT_METHODS, formatAmount, exportTransactionsToCSV } from '../utils/storage';
import CategoryIcon from './CategoryIcon';

export default function TransactionsView({ 
  transactions, 
  currency = '₹', 
  theme = 'light',
  onSelectTransaction, 
  onDeleteTransaction,
  onOpenAddModal 
}) {
  const isLight = theme === 'light';
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // all | expense | income
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Filter transactions
  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      // Type
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      // Category
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;
      // Payment Method
      if (paymentFilter !== 'all' && tx.paymentMethod !== paymentFilter) return false;
      // Search note or category name or amount
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId);
        const catName = (cat?.name || '').toLowerCase();
        const note = (tx.note || '').toLowerCase();
        const amountStr = String(tx.amount);
        const match = catName.includes(q) || note.includes(q) || amountStr.includes(q) || (tx.paymentMethod || '').toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    }).sort((a, b) => new Date(`${b.date}T${b.time || '00:00'}`) - new Date(`${a.date}T${a.time || '00:00'}`));
  }, [transactions, typeFilter, categoryFilter, paymentFilter, searchQuery]);

  // Group by Date (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    const groups = {};
    filtered.forEach(tx => {
      if (!groups[tx.date]) groups[tx.date] = [];
      groups[tx.date].push(tx);
    });
    return groups;
  }, [filtered]);

  // Total summary of filtered
  const totalFilteredIncome = filtered
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalFilteredExpense = filtered
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Friendly date title
  const getDateHeader = (dateStr) => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

    const d = new Date(dateStr);
    const dayName = d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

    if (dateStr === today) return `Today, ${dayName}`;
    if (dateStr === yesterday) return `Yesterday, ${dayName}`;
    return dayName;
  };

  return (
    <div className="space-y-3 pb-24">
      {/* Top Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search note, category, amount..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full ${
              isLight 
                ? 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-400 shadow-xs' 
                : 'bg-slate-900/90 border-slate-800 text-white placeholder-slate-500 focus:border-emerald-500'
            } border rounded-2xl pl-9 pr-9 py-2.5 text-xs focus:outline-none`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-3 ${isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-white'}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar py-1">
          {/* Type filters */}
          {['all', 'expense', 'income'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTypeFilter(tf)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition active-press ${
                typeFilter === tf
                  ? (isLight ? 'bg-slate-900 text-white shadow-xs' : 'bg-emerald-500 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200')
              }`}
            >
              {tf === 'all' ? 'All' : tf === 'expense' ? 'Expenses' : 'Income'}
            </button>
          ))}

          {/* Payment method selector */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className={`text-xs rounded-xl px-2.5 py-1 focus:outline-none shrink-0 cursor-pointer border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300 focus:border-emerald-500'
            }`}
          >
            <option value="all">Payment: All</option>
            {PAYMENT_METHODS.map(p => (
              <option key={p.id} value={p.id}>{p.id}</option>
            ))}
          </select>

          {/* Category selector */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={`text-xs rounded-xl px-2.5 py-1 focus:outline-none shrink-0 cursor-pointer border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-300 focus:border-emerald-500'
            }`}
          >
            <option value="all">Category: All</option>
            {DEFAULT_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Banner of Filtered Items */}
      <div className={`px-3.5 py-2 rounded-xl border flex items-center justify-between text-[11px] ${
        isLight 
          ? 'bg-white border-slate-200/90 text-slate-600 shadow-xs' 
          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
      }`}>
        <span>Showing <strong>{filtered.length}</strong> transactions</span>
        <div className="flex items-center space-x-2">
          {totalFilteredExpense > 0 && (
            <span className={`${isLight ? 'text-slate-900' : 'text-rose-400'} font-bold`}>-{formatAmount(totalFilteredExpense, currency)}</span>
          )}
          {totalFilteredIncome > 0 && (
            <span className={`${isLight ? 'text-emerald-700' : 'text-emerald-400'} font-bold`}>+{formatAmount(totalFilteredIncome, currency)}</span>
          )}
          <button
            onClick={() => exportTransactionsToCSV(filtered)}
            title="Download CSV"
            className={`p-1 rounded transition ${isLight ? 'hover:bg-slate-100 text-slate-500' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Transactions Grouped by Date */}
      {Object.keys(groupedByDate).length === 0 ? (
        <div className={`p-10 text-center rounded-2xl border ${
          isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
        }`}>
          <p className="text-xs text-slate-400 mb-2">No transactions match your criteria.</p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl active-press"
          >
            Add Record
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(groupedByDate).map(([dateStr, items]) => {
            // Day's net expense
            const dayExpense = items
              .filter(t => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0);

            return (
              <div key={dateStr} className="space-y-1.5">
                {/* Date header with day total */}
                <div className={`flex items-center justify-between px-1 text-[11px] font-semibold ${
                  isLight ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <span>{getDateHeader(dateStr)}</span>
                  {dayExpense > 0 && (
                    <span className="font-medium">
                      Spent: <strong className={isLight ? 'text-slate-800' : 'text-slate-200'}>{formatAmount(dayExpense, currency)}</strong>
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="space-y-1.5">
                  {items.map((tx) => {
                    const cat = DEFAULT_CATEGORIES.find(c => c.id === tx.categoryId) || {
                      name: tx.categoryId,
                      icon: 'MoreHorizontal',
                      color: '#94a3b8'
                    };
                    const isExpense = tx.type === 'expense';
                    const isConfirmingDelete = deleteConfirmId === tx.id;

                    return (
                      <div
                        key={tx.id}
                        className={`p-3 rounded-2xl border flex items-center justify-between transition group ${
                          isLight 
                            ? 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs' 
                            : 'glass-card border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Left: Category Icon & Details */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: isLight ? `${cat.color}18` : `${cat.color}25` }}
                          >
                            <CategoryIcon name={cat.icon} className="w-5 h-5" color={cat.color} />
                          </div>
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center space-x-1.5">
                              <span className={`text-xs font-bold truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                                {cat.name}
                              </span>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium border ${
                                isLight 
                                  ? 'bg-slate-100 text-slate-600 border-slate-200' 
                                  : 'bg-slate-800 text-slate-400 border-slate-700'
                              }`}>
                                {tx.paymentMethod || 'UPI'}
                              </span>
                            </div>
                            <p className={`text-[11px] truncate ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                              {tx.note || tx.time || 'No description'}
                            </p>
                          </div>
                        </div>

                        {/* Right: Amount & Actions */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="text-right">
                            <div className={`text-xs font-extrabold ${
                              isExpense 
                                ? (isLight ? 'text-slate-900' : 'text-rose-400') 
                                : (isLight ? 'text-emerald-700' : 'text-emerald-400')
                            }`}>
                              {isExpense ? '-' : '+'}{formatAmount(tx.amount, currency)}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {tx.time || ''}
                            </span>
                          </div>

                          {/* Dedicated Edit Button */}
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

                          {/* Quick Delete */}
                          {isConfirmingDelete ? (
                            <div className="flex items-center space-x-1 pl-0.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteTransaction(tx.id);
                                  setDeleteConfirmId(null);
                                }}
                                className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold active-press"
                              >
                                Delete
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteConfirmId(null);
                                }}
                                className={`p-1.5 rounded-lg text-[10px] ${
                                  isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                                }`}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteConfirmId(tx.id);
                              }}
                              title="Delete Record"
                              aria-label={`Delete ${cat.name} record`}
                              className={`p-1.5 rounded-lg transition active-press ${
                                isLight
                                  ? 'hover:bg-rose-50 text-slate-400 hover:text-rose-600'
                                  : 'hover:bg-rose-500/15 text-slate-500 hover:text-rose-400'
                              }`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
