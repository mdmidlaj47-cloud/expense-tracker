import React, { useState } from 'react';
import { Target, Bell, Settings as SettingsIcon, Download } from 'lucide-react';
import BudgetView from './BudgetView';
import RecurringView from './RecurringView';
import SettingsView from './SettingsView';

export default function ManageView({
  subTab = 'budgets',
  onSubTabChange,
  budgets,
  onSaveBudgets,
  recurring,
  onSaveRecurring,
  onLogTransaction,
  settings,
  onSaveSettings,
  transactions,
  currentMonth,
  currency,
  onResetData,
  onClearData
}) {
  const tabs = [
    { id: 'budgets', label: 'Budgets', icon: Target },
    { id: 'recurring', label: 'Bills & Subscriptions', icon: Bell },
    { id: 'settings', label: 'Settings & Data', icon: SettingsIcon }
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab pills */}
      <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = subTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSubTabChange(tab.id)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition ${
                isActive
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Subtab Content */}
      {subTab === 'budgets' && (
        <BudgetView
          budgets={budgets}
          onSaveBudgets={onSaveBudgets}
          transactions={transactions}
          currency={currency}
          currentMonth={currentMonth}
        />
      )}

      {subTab === 'recurring' && (
        <RecurringView
          recurring={recurring}
          onSaveRecurring={onSaveRecurring}
          onLogTransaction={onLogTransaction}
          currency={currency}
        />
      )}

      {subTab === 'settings' && (
        <SettingsView
          settings={settings}
          onSaveSettings={onSaveSettings}
          transactions={transactions}
          onResetData={onResetData}
          onClearData={onClearData}
        />
      )}
    </div>
  );
}
