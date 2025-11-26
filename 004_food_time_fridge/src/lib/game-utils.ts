import { LEVELS, LevelConfig } from '@/types/game';
import { FridgeItem, FridgeItemWithStatus, FreshnessStatus, Category } from '@/types/inventory';

// Calculate current level from XP
export function getLevelFromXp(totalXp: number): LevelConfig {
  let currentLevel = LEVELS[0];
  for (const level of LEVELS) {
    if (totalXp >= level.xpRequired) {
      currentLevel = level;
    } else {
      break;
    }
  }
  return currentLevel;
}

// Calculate XP needed for next level
export function getXpToNextLevel(totalXp: number): { current: number; needed: number; progress: number } {
  const currentLevel = getLevelFromXp(totalXp);
  const currentLevelIndex = LEVELS.findIndex(l => l.level === currentLevel.level);
  const nextLevel = LEVELS[currentLevelIndex + 1];

  if (!nextLevel) {
    return { current: 0, needed: 0, progress: 100 }; // Max level
  }

  const xpIntoLevel = totalXp - currentLevel.xpRequired;
  const xpNeededForLevel = nextLevel.xpRequired - currentLevel.xpRequired;
  const progress = (xpIntoLevel / xpNeededForLevel) * 100;

  return {
    current: xpIntoLevel,
    needed: xpNeededForLevel,
    progress: Math.min(100, Math.max(0, progress)),
  };
}

// Calculate freshness status from expiry date
export function calculateFreshness(item: FridgeItem): FridgeItemWithStatus {
  const now = Date.now();

  if (item.expiresAt === null) {
    // Non-perishable item
    return {
      ...item,
      freshnessStatus: 'fresh',
      freshnessPercent: 100,
      daysUntilExpiry: null,
    };
  }

  const totalLifespan = item.expiresAt - item.addedAt;
  const remaining = item.expiresAt - now;
  const daysUntilExpiry = Math.ceil(remaining / (1000 * 60 * 60 * 24));
  const freshnessPercent = Math.max(0, Math.min(100, (remaining / totalLifespan) * 100));

  let freshnessStatus: FreshnessStatus;
  if (daysUntilExpiry <= 0) {
    freshnessStatus = 'expired';
  } else if (freshnessPercent <= 10 || daysUntilExpiry <= 1) {
    freshnessStatus = 'critical';
  } else if (freshnessPercent <= 25 || daysUntilExpiry <= 2) {
    freshnessStatus = 'warning';
  } else if (freshnessPercent <= 50) {
    freshnessStatus = 'good';
  } else {
    freshnessStatus = 'fresh';
  }

  return {
    ...item,
    freshnessStatus,
    freshnessPercent,
    daysUntilExpiry,
  };
}

// Check if item is rescuable (within 24h of expiry)
export function isRescuable(item: FridgeItemWithStatus): boolean {
  return item.daysUntilExpiry !== null && item.daysUntilExpiry <= 1 && item.daysUntilExpiry > 0;
}

// Get unique categories from items
export function getUniqueCategories(items: FridgeItem[]): Category[] {
  return [...new Set(items.map(item => item.category))];
}

// Generate a unique ID
export function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Calculate expiry timestamp from days
export function calculateExpiryDate(daysFromNow: number): number {
  return Date.now() + daysFromNow * 24 * 60 * 60 * 1000;
}

// Find next available slot (0-47)
export function findNextAvailableSlot(items: FridgeItem[]): number {
  const occupiedSlots = new Set(items.map(item => item.slotIndex));
  for (let i = 0; i < 48; i++) {
    if (!occupiedSlots.has(i)) {
      return i;
    }
  }
  return -1; // Fridge is full
}
