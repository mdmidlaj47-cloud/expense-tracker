import React from 'react';
import { Home, ListOrdered, PieChart, MoreHorizontal, Plus } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenAddModal }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'transactions', label: 'Records', icon: ListOrdered },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'more', label: 'Manage', icon: MoreHorizontal }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto pointer-events-none">
      <div className="relative px-4 pb-4 pt-1 pointer-events-auto">
        <nav className="relative h-16 rounded-2xl glass-card border border-slate-700/80 bg-slate-900/95 flex items-center justify-around px-2 shadow-2xl shadow-black/80">
          
          {/* First two tabs */}
          {navItems.slice(0, 2).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex flex-col items-center justify-center w-16 py-1 transition-all active-press ${
                  isActive ? 'text-emerald-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-500/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}

          {/* Center Floating Action Button (+) */}
          <div className="relative -top-5 flex justify-center items-center">
            <button
              onClick={onOpenAddModal}
              aria-label="Add Transaction"
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg shadow-emerald-500/40 flex items-center justify-center transform hover:scale-105 active:scale-95 transition border-4 border-slate-950"
            >
              <Plus className="w-7 h-7 stroke-[2.5]" />
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
                  isActive ? 'text-emerald-400 font-semibold scale-105' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className={`p-1 rounded-xl transition ${isActive ? 'bg-emerald-500/15' : ''}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
