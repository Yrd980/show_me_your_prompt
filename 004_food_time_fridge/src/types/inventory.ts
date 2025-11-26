export type Category = 'produce' | 'dairy' | 'meat' | 'frozen' | 'pantry' | 'spices' | 'beverages' | 'other';
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type FreshnessStatus = 'fresh' | 'good' | 'warning' | 'critical' | 'expired';

export interface FridgeItem {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  rarity: Rarity;
  quantity: number;
  unit: string;
  addedAt: number;        // timestamp
  expiresAt: number | null;
  slotIndex: number;      // 0-47 for 6x8 grid
}

export interface FridgeItemWithStatus extends FridgeItem {
  freshnessStatus: FreshnessStatus;
  freshnessPercent: number;
  daysUntilExpiry: number | null;
}

export interface MasterIngredient {
  id: string;
  name: string;
  emoji: string;
  category: Category;
  rarity: Rarity;
  defaultUnit: string;
  defaultExpiryDays: number;
}

export const CATEGORY_CONFIG: Record<Category, { icon: string; color: string; defaultDays: number }> = {
  produce: { icon: '🥬', color: 'emerald', defaultDays: 7 },
  dairy: { icon: '🥛', color: 'blue', defaultDays: 14 },
  meat: { icon: '🥩', color: 'red', defaultDays: 5 },
  frozen: { icon: '🧊', color: 'cyan', defaultDays: 90 },
  pantry: { icon: '🥫', color: 'amber', defaultDays: 365 },
  spices: { icon: '🧂', color: 'orange', defaultDays: 365 },
  beverages: { icon: '🥤', color: 'purple', defaultDays: 30 },
  other: { icon: '📦', color: 'gray', defaultDays: 30 },
};

export const RARITY_CONFIG: Record<Rarity, { border: string; bg: string; glow: string }> = {
  common: { border: 'border-gray-300', bg: 'bg-gray-50', glow: '' },
  uncommon: { border: 'border-emerald-500', bg: 'bg-emerald-50', glow: 'shadow-emerald-200/50' },
  rare: { border: 'border-blue-500', bg: 'bg-blue-50', glow: 'shadow-blue-300/50 shadow-md' },
  epic: { border: 'border-purple-500', bg: 'bg-purple-50', glow: 'shadow-purple-400/50 shadow-lg' },
  legendary: { border: 'border-amber-500 border-2', bg: 'bg-gradient-to-br from-amber-50 to-yellow-100', glow: 'shadow-amber-400/60 shadow-xl animate-legendary' },
};

export const FRESHNESS_CONFIG: Record<FreshnessStatus, { ring: string; text: string }> = {
  fresh: { ring: 'ring-emerald-500', text: 'text-emerald-600' },
  good: { ring: 'ring-yellow-500', text: 'text-yellow-600' },
  warning: { ring: 'ring-orange-500', text: 'text-orange-600' },
  critical: { ring: 'ring-red-500', text: 'text-red-600' },
  expired: { ring: 'ring-red-700', text: 'text-red-700' },
};
