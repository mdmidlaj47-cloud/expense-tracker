import React, { useRef, useState } from 'react';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  Smartphone, 
  ShieldCheck, 
  Trash2, 
  DollarSign, 
  Check, 
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Palette,
  LayoutGrid
} from 'lucide-react';
import { 
  exportTransactionsToCSV, 
  exportBackupJSON, 
  restoreFromJSON, 
  formatAmount,
  AVAILABLE_THEMES,
  AVAILABLE_LAYOUTS
} from '../utils/storage';

export default function SettingsView({ 
  settings, 
  onSaveSettings, 
  transactions, 
  theme = 'light',
  onResetData, 
  onClearData 
}) {
  const isLight = theme === 'light';
  const fileInputRef = useRef(null);
  const [restoreMessage, setRestoreMessage] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const currencies = [
    { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
    { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
    { symbol: '€', code: 'EUR', name: 'Euro (€)' },
    { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
    { symbol: 'AED ', code: 'AED', name: 'UAE Dirham (AED)' }
  ];

  const handleCurrencySelect = (curr) => {
    onSaveSettings({
      ...settings,
      currency: curr.symbol,
      currencyCode: curr.code
    });
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = restoreFromJSON(content);
        if (res.success) {
          setRestoreMessage({ type: 'success', text: 'Backup restored successfully! Refreshing...' });
          setTimeout(() => {
            window.location.reload();
          }, 800);
        } else {
          setRestoreMessage({ type: 'error', text: `Failed to restore: ${res.error}` });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-32">
      {/* Install Guide Card (Android & iPhone) */}
      <div className={`p-5 rounded-3xl border transition-all ${
        isLight 
          ? 'bg-gradient-to-br from-emerald-50 via-teal-50/50 to-emerald-100/40 border-emerald-200/90 shadow-xs' 
          : 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border-emerald-500/30 shadow-xl'
      } space-y-3`}>
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Install on Phone (Android & iPhone)
            </h3>
            <span className={`text-[11px] font-semibold ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>
              Fast Fullscreen Standalone App
            </span>
          </div>
        </div>

        <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
          Use <strong>Rupya</strong> like a native app on your phone with zero app-store download:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* Android */}
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white/80 border-emerald-200/80' : 'bg-slate-900/60 border-slate-800'}`}>
            <span className={`text-[11px] font-bold block mb-1 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>🤖 Android (Chrome)</span>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Tap menu <strong>(⋮)</strong> &gt; <strong>"Install app"</strong> or "Add to Home screen".
            </p>
          </div>

          {/* iPhone */}
          <div className={`p-3 rounded-2xl border ${isLight ? 'bg-white/80 border-emerald-200/80' : 'bg-slate-900/60 border-slate-800'}`}>
            <span className={`text-[11px] font-bold block mb-1 ${isLight ? 'text-emerald-800' : 'text-emerald-400'}`}>🍎 iPhone (Safari)</span>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              Tap Share <strong>[↑]</strong> at bottom &gt; tap <strong>"Add to Home Screen"</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Theme & Visual Appearance Selection */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      } space-y-3`}>
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <Palette className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>Theme & Visual Style</span>
          </h4>
          <span className={`text-[10px] capitalize font-semibold ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            {settings.theme || 'light'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {AVAILABLE_THEMES.map((th) => {
            const isSelected = (settings.theme || 'light') === th.id;
            return (
              <button
                key={th.id}
                onClick={() => onSaveSettings({ ...settings, theme: th.id })}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition active-press ${
                  isSelected
                    ? (isLight 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20 shadow-xs' 
                        : 'border-emerald-500 bg-emerald-500/15 text-white font-bold ring-1 ring-emerald-500/40 shadow-sm')
                    : (isLight 
                        ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200')
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="w-6 h-6 rounded-lg border shadow-inner shrink-0" 
                    style={{ backgroundColor: th.previewBg, borderColor: th.border }} 
                  />
                  <div className="text-left">
                    <span className={`block text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {th.name}
                    </span>
                    <span className={`text-[10px] block ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
                      {th.description}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className={`w-4 h-4 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Layout Selection */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      } space-y-3`}>
        <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <LayoutGrid className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>Dashboard Layout Style</span>
        </h4>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {AVAILABLE_LAYOUTS.map((lo) => {
            const isSelected = (settings.layout || 'classic') === lo.id;
            return (
              <button
                key={lo.id}
                onClick={() => onSaveSettings({ ...settings, layout: lo.id })}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col text-left transition active-press ${
                  isSelected
                    ? (isLight 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-600/20 shadow-xs' 
                        : 'border-emerald-500 bg-emerald-500/15 text-white font-bold ring-1 ring-emerald-500/40')
                    : (isLight 
                        ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
                        : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200')
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>{lo.name}</span>
                  {isSelected && <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
                </div>
                <span className={`text-[10px] leading-tight ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>{lo.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Selection */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      } space-y-2`}>
        <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <DollarSign className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>Default Currency</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {currencies.map((curr) => {
            const isSelected = settings.currency === curr.symbol;
            return (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition active-press ${
                  isSelected 
                    ? (isLight 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold' 
                        : 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold')
                    : (isLight 
                        ? 'border-slate-200 bg-slate-50/80 text-slate-700 hover:bg-slate-100 hover:text-slate-900' 
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200')
                }`}
              >
                <span>{curr.name}</span>
                {isSelected && <Check className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export & Data Backup */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      } space-y-3`}>
        <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Download className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>Data Backup & Export</span>
        </h4>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* CSV export */}
          <button
            onClick={() => exportTransactionsToCSV(transactions)}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition active-press ${
              isLight 
                ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-xs' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            }`}
          >
            <Download className={`w-5 h-5 mb-1 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Export CSV</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>For Excel / Sheets</span>
          </button>

          {/* JSON full backup */}
          <button
            onClick={exportBackupJSON}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition active-press ${
              isLight 
                ? 'bg-slate-50/80 hover:bg-slate-100 border-slate-200 text-slate-800 shadow-xs' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-white'
            }`}
          >
            <ShieldCheck className={`w-5 h-5 mb-1 ${isLight ? 'text-teal-600' : 'text-teal-400'}`} />
            <span className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Backup JSON</span>
            <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>Save all settings</span>
          </button>
        </div>

        {/* Restore */}
        <div className={`pt-2 border-t ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 transition active-press ${
              isLight 
                ? 'bg-slate-100/90 hover:bg-slate-200/80 border-slate-200 text-slate-800' 
                : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 text-slate-200'
            }`}
          >
            <Upload className={`w-4 h-4 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
            <span>Restore Backup From File</span>
          </button>
        </div>

        {restoreMessage && (
          <div className={`p-2.5 rounded-xl text-xs font-medium ${
            restoreMessage.type === 'success' 
              ? (isLight ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30') 
              : (isLight ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30')
          }`}>
            {restoreMessage.text}
          </div>
        )}
      </div>

      {/* Data Management Actions */}
      <div className={`rounded-2xl p-4 border transition-colors ${
        isLight ? 'bg-white border-slate-200/90 shadow-xs' : 'glass-card border-slate-800'
      } space-y-2`}>
        <h4 className={`text-xs font-bold flex items-center space-x-1.5 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <RefreshCw className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          <span>Reset & Sample Data</span>
        </h4>

        <div className="flex flex-col space-y-2 pt-1">
          <button
            onClick={onResetData}
            className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 active-press transition ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Reload Starter / Demo Transactions</span>
          </button>

          {showClearConfirm ? (
            <div className={`p-3 border rounded-xl space-y-2 text-center ${
              isLight ? 'bg-rose-50 border-rose-200' : 'bg-rose-500/15 border-rose-500/30'
            }`}>
              <p className={`text-xs font-medium ${isLight ? 'text-rose-800' : 'text-rose-300'}`}>
                Are you sure? All transactions will be wiped.
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className={`w-1/2 py-1.5 rounded-lg text-xs font-semibold ${
                    isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onClearData();
                    setShowClearConfirm(false);
                  }}
                  className="w-1/2 py-1.5 bg-rose-600 rounded-lg text-xs font-semibold text-white"
                >
                  Yes, Clear All
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowClearConfirm(true)}
              className={`w-full py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-2 active-press transition ${
                isLight 
                  ? 'bg-rose-50/70 hover:bg-rose-100 border-rose-200 text-rose-700' 
                  : 'bg-slate-900 hover:bg-rose-950/40 border-slate-800 text-rose-400 hover:border-rose-500/30'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All My Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className={`p-4 rounded-2xl border text-center space-y-1 transition-colors ${
        isLight 
          ? 'bg-emerald-50/70 border-emerald-200/80' 
          : 'bg-slate-900/60 border-slate-800/80'
      }`}>
        <div className={`flex items-center justify-center space-x-1.5 text-xs font-bold ${
          isLight ? 'text-emerald-800' : 'text-emerald-400'
        }`}>
          <ShieldCheck className="w-4 h-4" />
          <span>100% Offline & Private</span>
        </div>
        <p className={`text-[10px] ${isLight ? 'text-emerald-700/80' : 'text-slate-400'}`}>
          Your financial transactions never leave your device. All calculations and storage run locally.
        </p>
      </div>
    </div>
  );
}
