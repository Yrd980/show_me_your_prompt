import { FridgeItem } from './inventory';

export interface PlayerStats {
  totalXp: number;
  level: number;
  itemsAdded: number;
  itemsUsed: number;
  itemsRescued: number;  // used within 24h of expiry
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  xpReward: number;
  condition: {
    type: 'count' | 'threshold';
    metric: keyof PlayerStats | 'uniqueCategories' | 'hasRareItem' | 'currentItems';
    target: number;
  };
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: number;
}

export interface LevelConfig {
  level: number;
  xpRequired: number;
  title: string;
}

export const LEVELS: LevelConfig[] = [
  { level: 1, xpRequired: 0, title: 'Fridge Newbie' },
  { level: 2, xpRequired: 50, title: 'Pantry Apprentice' },
  { level: 3, xpRequired: 150, title: 'Food Guardian' },
  { level: 4, xpRequired: 300, title: 'Kitchen Helper' },
  { level: 5, xpRequired: 500, title: 'Freshness Keeper' },
  { level: 6, xpRequired: 750, title: 'Zero Waste Hero' },
  { level: 7, xpRequired: 1000, title: 'Master Chef' },
];

export interface AppState {
  fridgeItems: FridgeItem[];
  playerStats: PlayerStats;
  unlockedAchievements: UnlockedAchievement[];
}

export const INITIAL_STATE: AppState = {
  fridgeItems: [],
  playerStats: {
    totalXp: 0,
    level: 1,
    itemsAdded: 0,
    itemsUsed: 0,
    itemsRescued: 0,
  },
  unlockedAchievements: [],
};

// XP rewards
export const XP_REWARDS = {
  addItem: 5,
  addRareItem: 15, // bonus for rare+
  useItem: 10,
  rescueItem: 20, // used within 24h of expiry
};
