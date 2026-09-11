import React from 'react';
import { Calendar, Bell, Sparkles, ChevronDown } from 'lucide-react';
import RupyaSeedLogo from './RupyaSeedLogo';

export default function Header({ 
  currentMonth, 
  onMonthChange, 
  availableMonths, 
  budgetStatus,
  pendingRecurringCount,
  onOpenRecurring,
  theme = 'light'
}) {
  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-30 px-4 pt-3 pb-3 glass border-b transition-colors ${
      isLight ? 'bg-slate-50/90 border-slate-200/90 text-slate-900' : 'border-slate-800/80 text-white'
    }`}>
      <div className="flex items-center justify-between">
        {/* Brand & Greeting */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 bg-white flex items-center justify-center shrink-0">
            <img 
              src="./apple-touch-icon-180x180.png" 
              alt="Rupya" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) e.target.nextSibling.style.display = 'block';
              }}
            />
            <RupyaSeedLogo className="w-5 h-5 hidden" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className={`text-base font-extrabold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Rupya
              </h1>
              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              }`}>
                Growth
              </span>
            </div>
            <p className={`text-[11px] font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
              Personal Expense & Budget
            </p>
          </div>
        </div>

        {/* Actions: Month Selector & Due Reminder Bell & User avatar */}
        <div className="flex items-center space-x-2">
          {/* Month selector dropdown */}
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className={`appearance-none text-xs font-semibold pl-2.5 pr-7 py-1.5 rounded-xl border focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm transition ${
                isLight
                  ? 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-slate-900/5'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
              }`}
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value} className={isLight ? "bg-white text-slate-800" : "bg-slate-900 text-slate-200"}>
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${
              isLight ? 'text-slate-400' : 'text-slate-400'
            }`} />
          </div>

          {/* Pending Bills / Recurring reminders button */}
          <button
            onClick={onOpenRecurring}
            aria-label="Recurring Bills"
            className={`relative p-2 rounded-xl border transition active-press ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm shadow-slate-900/5' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            {pendingRecurringCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {pendingRecurringCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mini status alert if budget warning */}
      {budgetStatus && budgetStatus.ratio > 0.8 && (
        <div className={`mt-2 px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
          budgetStatus.ratio >= 1.0 
            ? 'bg-rose-50 border border-rose-200 text-rose-700' 
            : 'bg-amber-50 border border-amber-200 text-amber-800'
        }`}>
          <span className="font-semibold">
            {budgetStatus.ratio >= 1.0 
              ? '⚠️ Monthly budget limit exceeded!' 
              : `⚠️ Warning: ${(budgetStatus.ratio * 100).toFixed(0)}% of monthly budget spent`}
          </span>
          <span className="text-[11px] font-bold underline cursor-pointer">View</span>
        </div>
      )}
    </header>
  );
}
