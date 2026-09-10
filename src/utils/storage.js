// Storage key constants
const TRANSACTIONS_KEY = 'rupeetrack_transactions_v1';
const CATEGORIES_KEY = 'rupeetrack_categories_v1';
const BUDGETS_KEY = 'rupeetrack_budgets_v1';
const RECURRING_KEY = 'rupeetrack_recurring_v1';
const SETTINGS_KEY = 'rupeetrack_settings_v1';

export const PAYMENT_METHODS = [
  { id: 'UPI', label: 'UPI / GPay / PhonePe', icon: 'Smartphone' },
  { id: 'Cash', label: 'Cash', icon: 'Banknote' },
  { id: 'Card', label: 'Debit / Credit Card', icon: 'CreditCard' },
  { id: 'NetBanking', label: 'Net Banking', icon: 'Building2' }
];

export const DEFAULT_CATEGORIES = [
  // Expense Categories
  { id: 'food', name: 'Food & Dining', type: 'expense', icon: 'Utensils', color: '#f97316', bg: 'bg-orange-500/15', text: 'text-orange-400' },
  { id: 'groceries', name: 'Groceries & Kirana', type: 'expense', icon: 'ShoppingBag', color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  { id: 'transport', name: 'Transport & Fuel', type: 'expense', icon: 'Car', color: '#06b6d4', bg: 'bg-cyan-500/15', text: 'text-cyan-400' },
  { id: 'shopping', name: 'Shopping & Clothes', type: 'expense', icon: 'Tag', color: '#ec4899', bg: 'bg-pink-500/15', text: 'text-pink-400' },
  { id: 'bills', name: 'Bills & Utilities', type: 'expense', icon: 'Zap', color: '#eab308', bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  { id: 'entertainment', name: 'Movies & Fun', type: 'expense', icon: 'Film', color: '#8b5cf6', bg: 'bg-purple-500/15', text: 'text-purple-400' },
  { id: 'health', name: 'Health & Medical', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bg: 'bg-red-500/15', text: 'text-red-400' },
  { id: 'rent', name: 'Rent & Housing', type: 'expense', icon: 'Home', color: '#6366f1', bg: 'bg-indigo-500/15', text: 'text-indigo-400' },
  { id: 'other_expense', name: 'Other Expense', type: 'expense', icon: 'MoreHorizontal', color: '#94a3b8', bg: 'bg-slate-500/15', text: 'text-slate-400' },

  // Income Categories
  { id: 'salary', name: 'Salary', type: 'income', icon: 'Briefcase', color: '#10b981', bg: 'bg-emerald-500/15', text: 'text-emerald-400' },
  { id: 'freelance', name: 'Freelance / Business', type: 'income', icon: 'Laptop', color: '#3b82f6', bg: 'bg-blue-500/15', text: 'text-blue-400' },
  { id: 'investment', name: 'Dividends & Returns', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', bg: 'bg-purple-500/15', text: 'text-purple-400' },
  { id: 'cashback', name: 'Cashback & Rewards', type: 'income', icon: 'Gift', color: '#eab308', bg: 'bg-yellow-500/15', text: 'text-yellow-400' },
  { id: 'other_income', name: 'Other Income', type: 'income', icon: 'Coins', color: '#14b8a6', bg: 'bg-teal-500/15', text: 'text-teal-400' }
];

export const DEFAULT_BUDGETS = {
  overall: 45000,
  food: 9000,
  groceries: 7000,
  transport: 4000,
  shopping: 5000,
  bills: 5000,
  entertainment: 3000,
  health: 2000,
  rent: 15000
};

export const DEFAULT_RECURRING = [
  { id: 'rec_1', name: 'House Rent', amount: 15000, categoryId: 'rent', dueDay: 1, paymentMethod: 'NetBanking', active: true },
  { id: 'rec_2', name: 'Airtel Wi-Fi Fiber', amount: 999, categoryId: 'bills', dueDay: 8, paymentMethod: 'UPI', active: true },
  { id: 'rec_3', name: 'Gym Membership', amount: 1500, categoryId: 'health', dueDay: 15, paymentMethod: 'UPI', active: true },
  { id: 'rec_4', name: 'Netflix Subscription', amount: 499, categoryId: 'entertainment', dueDay: 20, paymentMethod: 'Card', active: true }
];

export const AVAILABLE_THEMES = [
  { id: 'emerald', name: 'Emerald Dark', description: 'Deep slate with glowing emerald & teal', color: '#10b981', previewBg: '#022c22', border: '#10b981' },
  { id: 'midnight', name: 'Midnight Sapphire', description: 'Navy neon with electric blue & cyan glow', color: '#06b6d4', previewBg: '#0a192f', border: '#06b6d4' },
  { id: 'sunset', name: 'Sunset Amber', description: 'Warm obsidian with glowing amber & gold', color: '#f59e0b', previewBg: '#2a1205', border: '#f59e0b' },
  { id: 'amoled', name: 'AMOLED Pure Black', description: 'True 100% black background for maximum battery saving', color: '#ffffff', previewBg: '#000000', border: '#27272a' },
  { id: 'light', name: 'Clean Minimal Light', description: 'Crisp porcelain white with soft sage green', color: '#059669', previewBg: '#f8fafc', border: '#cbd5e1' }
];

export const AVAILABLE_LAYOUTS = [
  { id: 'classic', name: 'Classic Flow', description: 'Linear balance overview, budget progress & recent activity' },
  { id: 'bento', name: 'Modern Bento Grid', description: 'Bento box cards with weekly spending mini-chart & budget health' }
];

export const DEFAULT_SETTINGS = {
  currency: '₹',
  currencyCode: 'INR',
  darkMode: true,
  userName: 'Self',
  theme: 'emerald',
  layout: 'classic'
};

// Generates starter transactions for the current month so the app is immediately alive
const getSampleTransactions = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = now.getDate();

  const makeDate = (d) => `${year}-${month}-${String(Math.min(Math.max(1, d), day)).padStart(2, '0')}`;

  return [
    {
      id: 'tx_demo_1',
      type: 'income',
      amount: 65000,
      categoryId: 'salary',
      date: makeDate(1),
      time: '09:30',
      paymentMethod: 'NetBanking',
      note: 'Monthly Salary Credit'
    },
    {
      id: 'tx_demo_2',
      type: 'expense',
      amount: 15000,
      categoryId: 'rent',
      date: makeDate(1),
      time: '11:15',
      paymentMethod: 'NetBanking',
      note: 'Apartment Rent'
    },
    {
      id: 'tx_demo_3',
      type: 'expense',
      amount: 1250,
      categoryId: 'groceries',
      date: makeDate(Math.max(1, day - 5)),
      time: '18:40',
      paymentMethod: 'UPI',
      note: 'Blinkit Grocery Order'
    },
    {
      id: 'tx_demo_4',
      type: 'expense',
      amount: 450,
      categoryId: 'food',
      date: makeDate(Math.max(1, day - 4)),
      time: '13:10',
      paymentMethod: 'UPI',
      note: 'Swiggy Biryani lunch'
    },
    {
      id: 'tx_demo_5',
      type: 'expense',
      amount: 2200,
      categoryId: 'transport',
      date: makeDate(Math.max(1, day - 3)),
      time: '08:20',
      paymentMethod: 'Card',
      note: 'Fuel Tank Fill-up'
    },
    {
      id: 'tx_demo_6',
      type: 'expense',
      amount: 999,
      categoryId: 'bills',
      date: makeDate(Math.max(1, day - 2)),
      time: '16:00',
      paymentMethod: 'UPI',
      note: 'Airtel Wi-Fi recharge'
    },
    {
      id: 'tx_demo_7',
      type: 'income',
      amount: 4500,
      categoryId: 'freelance',
      date: makeDate(Math.max(1, day - 1)),
      time: '19:00',
      paymentMethod: 'UPI',
      note: 'Consulting client project'
    },
    {
      id: 'tx_demo_8',
      type: 'expense',
      amount: 280,
      categoryId: 'food',
      date: makeDate(day),
      time: '14:20',
      paymentMethod: 'UPI',
      note: 'Filter Coffee & Snacks'
    }
  ];
};

// Safe storage accessors
export const getStoredTransactions = () => {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      const sample = getSampleTransactions();
      localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(sample));
      return sample;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read transactions:', err);
    return [];
  }
};

export const saveStoredTransactions = (transactions) => {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions:', err);
  }
};

export const getStoredBudgets = () => {
  try {
    const raw = localStorage.getItem(BUDGETS_KEY);
    if (!raw) {
      localStorage.setItem(BUDGETS_KEY, JSON.stringify(DEFAULT_BUDGETS));
      return DEFAULT_BUDGETS;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_BUDGETS;
  }
};

export const saveStoredBudgets = (budgets) => {
  try {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (err) {
    console.error('Failed to save budgets:', err);
  }
};

export const getStoredRecurring = () => {
  try {
    const raw = localStorage.getItem(RECURRING_KEY);
    if (!raw) {
      localStorage.setItem(RECURRING_KEY, JSON.stringify(DEFAULT_RECURRING));
      return DEFAULT_RECURRING;
    }
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_RECURRING;
  }
};

export const saveStoredRecurring = (recurring) => {
  try {
    localStorage.setItem(RECURRING_KEY, JSON.stringify(recurring));
  } catch (err) {
    console.error('Failed to save recurring items:', err);
  }
};

export const getStoredSettings = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings:', err);
  }
};

// Formatter for Currency with Indian number system (Lakhs/Crores)
export const formatAmount = (num, currency = '₹') => {
  if (num === null || num === undefined || isNaN(num)) return `${currency}0`;
  const abs = Math.abs(num);
  const formatted = abs.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });
  return `${num < 0 ? '-' : ''}${currency}${formatted}`;
};

// Export to CSV for Excel / Google Sheets
export const exportTransactionsToCSV = (transactions) => {
  const headers = ['ID', 'Date', 'Time', 'Type', 'Category', 'Amount', 'Payment Method', 'Note'];
  const rows = transactions.map((t) => {
    const cat = DEFAULT_CATEGORIES.find((c) => c.id === t.categoryId);
    const catName = cat ? cat.name : t.categoryId;
    return [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${t.type}"`,
      `"${catName}"`,
      t.amount,
      `"${t.paymentMethod || 'UPI'}"`,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export Full Backup JSON
export const exportBackupJSON = () => {
  const data = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    transactions: getStoredTransactions(),
    budgets: getStoredBudgets(),
    recurring: getStoredRecurring(),
    settings: getStoredSettings()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `RupeeTrack_Backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Restore from JSON
export const restoreFromJSON = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.transactions && Array.isArray(parsed.transactions)) {
      saveStoredTransactions(parsed.transactions);
    }
    if (parsed.budgets) {
      saveStoredBudgets(parsed.budgets);
    }
    if (parsed.recurring) {
      saveStoredRecurring(parsed.recurring);
    }
    if (parsed.settings) {
      saveStoredSettings(parsed.settings);
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
