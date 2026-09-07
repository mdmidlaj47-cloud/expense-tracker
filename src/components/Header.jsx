import React from 'react';
import { Calendar, Bell, Sparkles, ChevronDown } from 'lucide-react';

export default function Header({ 
  currentMonth, 
  onMonthChange, 
  availableMonths, 
  budgetStatus,
  pendingRecurringCount,
  onOpenRecurring
}) {
  return (
    <header className="sticky top-0 z-30 px-4 pt-3 pb-3 glass border-b border-slate-800/80">
      <div className="flex items-center justify-between">
        {/* Brand & Greeting */}
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-bold text-lg">
            ₹
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-base font-bold tracking-tight text-white">RupeeTrack</h1>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Personal Finance & Budget</p>
          </div>
        </div>

        {/* Actions: Month Selector & Due Reminder Bell */}
        <div className="flex items-center space-x-2">
          {/* Month selector dropdown */}
          <div className="relative">
            <select
              value={currentMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="appearance-none bg-slate-900/90 hover:bg-slate-800 text-xs font-semibold text-slate-200 pl-2.5 pr-7 py-1.5 rounded-lg border border-slate-700/80 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-sm transition"
            >
              {availableMonths.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900 text-slate-200">
                  {m.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Pending Bills / Recurring reminders button */}
          <button
            onClick={onOpenRecurring}
            aria-label="Recurring Bills"
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 transition active-press"
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
        <div className={`mt-2 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between ${
          budgetStatus.ratio >= 1.0 
            ? 'bg-rose-500/15 border border-rose-500/30 text-rose-300' 
            : 'bg-amber-500/15 border border-amber-500/30 text-amber-300'
        }`}>
          <span className="font-medium">
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
