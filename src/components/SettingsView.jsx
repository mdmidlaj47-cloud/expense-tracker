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
  onResetData, 
  onClearData 
}) {
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
    <div className="space-y-4 pb-24">
      {/* Android PWA Install Guide Card */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-500/30 shadow-xl space-y-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Install on Android Phone</h3>
            <span className="text-[11px] text-emerald-400 font-medium">Standalone Fullscreen App</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Use this app like any native Android app without downloading from Play Store:
        </p>

        <ol className="text-xs text-slate-300 space-y-1.5 pl-4 list-decimal">
          <li>Open this app link in <strong>Google Chrome</strong> on your phone.</li>
          <li>Tap the three dots menu <strong>(⋮)</strong> at the top right.</li>
          <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.</li>
          <li>A dedicated app icon will appear on your home screen with offline support!</li>
        </ol>
      </div>

      {/* Theme & Visual Appearance Selection */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
            <Palette className="w-4 h-4 text-emerald-400" />
            <span>Theme & Visual Style</span>
          </h4>
          <span className="text-[10px] text-slate-400 capitalize">{settings.theme || 'emerald'}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {AVAILABLE_THEMES.map((th) => {
            const isSelected = (settings.theme || 'emerald') === th.id;
            return (
              <button
                key={th.id}
                onClick={() => onSaveSettings({ ...settings, theme: th.id })}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold ring-1 ring-emerald-500/40 shadow-sm'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div 
                    className="w-6 h-6 rounded-lg border shadow-inner shrink-0" 
                    style={{ backgroundColor: th.previewBg, borderColor: th.border }} 
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-white">{th.name}</span>
                    <span className="text-[10px] text-slate-400 block">{th.description}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dashboard Layout Selection */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
          <LayoutGrid className="w-4 h-4 text-emerald-400" />
          <span>Dashboard Layout Style</span>
        </h4>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {AVAILABLE_LAYOUTS.map((lo) => {
            const isSelected = (settings.layout || 'classic') === lo.id;
            return (
              <button
                key={lo.id}
                onClick={() => onSaveSettings({ ...settings, layout: lo.id })}
                className={`p-3 rounded-xl border text-xs font-medium flex flex-col text-left transition ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/15 text-white font-bold ring-1 ring-emerald-500/40'
                    : 'border-slate-800 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-white">{lo.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{lo.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          <span>Default Currency</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 pt-1">
          {currencies.map((curr) => {
            const isSelected = settings.currency === curr.symbol;
            return (
              <button
                key={curr.code}
                onClick={() => handleCurrencySelect(curr)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 font-bold' 
                    : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{curr.name}</span>
                {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Export & Data Backup */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Data Backup & Export</span>
        </h4>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {/* CSV export */}
          <button
            onClick={() => exportTransactionsToCSV(transactions)}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center text-center transition active-press"
          >
            <Download className="w-5 h-5 text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-white">Export CSV</span>
            <span className="text-[10px] text-slate-400">For Excel / Sheets</span>
          </button>

          {/* JSON full backup */}
          <button
            onClick={exportBackupJSON}
            className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 flex flex-col items-center justify-center text-center transition active-press"
          >
            <ShieldCheck className="w-5 h-5 text-teal-400 mb-1" />
            <span className="text-xs font-bold text-white">Backup JSON</span>
            <span className="text-[10px] text-slate-400">Save all settings</span>
          </button>
        </div>

        {/* Restore */}
        <div className="pt-2 border-t border-slate-800">
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileImport}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition active-press"
          >
            <Upload className="w-4 h-4 text-slate-400" />
            <span>Restore Backup From File</span>
          </button>
        </div>

        {restoreMessage && (
          <div className={`p-2.5 rounded-xl text-xs font-medium ${
            restoreMessage.type === 'success' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {restoreMessage.text}
          </div>
        )}
      </div>

      {/* Data Management Actions */}
      <div className="glass-card rounded-2xl p-4 border border-slate-800 space-y-2">
        <h4 className="text-xs font-bold text-white flex items-center space-x-1.5">
          <RefreshCw className="w-4 h-4 text-emerald-400" />
          <span>Reset & Sample Data</span>
        </h4>

        <div className="flex flex-col space-y-2 pt-1">
          <button
            onClick={onResetData}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center space-x-2 active-press transition"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Reload Starter / Demo Transactions</span>
          </button>

          {showClearConfirm ? (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl space-y-2 text-center">
              <p className="text-xs text-rose-300 font-medium">Are you sure? All transactions will be wiped.</p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="w-1/2 py-1.5 bg-slate-800 rounded-lg text-xs font-semibold text-slate-300"
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
              className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-rose-950/40 border border-slate-800 text-xs font-semibold text-rose-400 hover:border-rose-500/30 flex items-center justify-center space-x-2 active-press transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All My Records</span>
            </button>
          )}
        </div>
      </div>

      {/* Privacy Guarantee */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 text-center space-y-1">
        <div className="flex items-center justify-center space-x-1.5 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>100% Offline & Private</span>
        </div>
        <p className="text-[10px] text-slate-400">
          Your financial transactions never leave your device. All calculations and storage run locally.
        </p>
      </div>
    </div>
  );
}
