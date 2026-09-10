import React from 'react';
import { Home, ListOrdered, PieChart, MoreHorizontal, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenAddModal, theme = 'light' }) {
  const isLight = theme === 'light';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'transactions', label: 'Records', icon: ListOrdered },
    { id: 'analytics', label: 'Insights', icon: PieChart },
    { id: 'more', label: 'Manage', icon: MoreHorizontal }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none">
      <div className="relative px-4 pb-4 pt-1 pointer-events-auto">
        <nav className={`relative h-16 rounded-2xl glass-card flex items-center justify-around px-2 transition-colors ${
          isLight
            ? 'bg-white/95 border border-slate-200/90 shadow-xl shadow-slate-900/8 text-slate-800'
            : 'border border-slate-700/80 bg-slate-900/95 shadow-2xl shadow-black/80 text-white'
        }`}>
          
          {/* First two tabs */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-16 py-1 transition-all active-press ${
                  isActive 
                    ? (isLight ? 'text-slate-950 font-bold scale-105' : 'text-emerald-400 font-semibold scale-105')
                    : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-300')
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  isActive ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-emerald-500/15') : ''
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Action Button (+) */}
          <div className="relative -top-5 flex justify-center items-center">
            <button
              onClick={onOpenAddModal}
              aria-label="Add Transaction"
              className={`w-14 h-14 rounded-full flex items-center justify-center transform hover:scale-105 active:scale-95 transition shadow-lg ${
                isLight
                  ? 'bg-slate-900 text-white border-4 border-white shadow-slate-900/25 hover:bg-slate-800'
                  : 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-white border-4 border-slate-950 shadow-emerald-500/40'
              }`}
            >
              <Plus className="w-7 h-7 stroke-[2.8]" />
            </button>
          </div>

          {/* Last two tabs */}
          {navItems.slice(2, 4).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-16 py-1 transition-all active-press ${
                  isActive 
                    ? (isLight ? 'text-slate-950 font-bold scale-105' : 'text-emerald-400 font-semibold scale-105')
                    : (isLight ? 'text-slate-400 hover:text-slate-600' : 'text-slate-400 hover:text-slate-300')
                }`}
              >
                <div className={`p-1 rounded-xl transition ${
                  isActive ? (isLight ? 'bg-slate-100 text-slate-900' : 'bg-emerald-500/15') : ''
                }`}>
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
