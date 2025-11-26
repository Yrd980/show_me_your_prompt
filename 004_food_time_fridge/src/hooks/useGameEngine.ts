import { useCallback, useState } from 'react';
import { AppState, Achievement, UnlockedAchievement, LEVELS, XP_REWARDS } from '@/types/game';
import { FridgeItem, Rarity } from '@/types/inventory';
import { getLevelFromXp, getUniqueCategories } from '@/lib/game-utils';
import achievementsData from '@/data/achievements.json';

interface XpGainEvent {
  amount: number;
  reason: string;
  timestamp: number;
}

interface AchievementUnlockEvent {
  achievement: Achievement;
  timestamp: number;
}

export function useGameEngine(
  state: AppState,
  setState: React.Dispatch<React.SetStateAction<AppState>>
) {
  const [xpGainEvents, setXpGainEvents] = useState<XpGainEvent[]>([]);
  const [achievementEvents, setAchievementEvents] = useState<AchievementUnlockEvent[]>([]);

  const achievements = achievementsData.achievements as Achievement[];

  // Add XP and check for level up
  const addXp = useCallback((amount: number, reason: string) => {
    setState(prev => {
      const newTotalXp = prev.playerStats.totalXp + amount;
      const newLevel = getLevelFromXp(newTotalXp);

      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          totalXp: newTotalXp,
          level: newLevel.level,
        },
      };
    });

    // Show XP gain animation
    setXpGainEvents(prev => [...prev, { amount, reason, timestamp: Date.now() }]);

    // Auto-remove after animation
    setTimeout(() => {
      setXpGainEvents(prev => prev.filter(e => Date.now() - e.timestamp < 1000));
    }, 1000);
  }, [setState]);

  // Check and unlock achievements
  const checkAchievements = useCallback((currentState: AppState) => {
    const unlockedIds = new Set(currentState.unlockedAchievements.map(a => a.achievementId));
    const newUnlocks: UnlockedAchievement[] = [];

    for (const achievement of achievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const { condition } = achievement;
      let isUnlocked = false;

      switch (condition.metric) {
        case 'itemsAdded':
          isUnlocked = currentState.playerStats.itemsAdded >= condition.target;
          break;
        case 'itemsUsed':
          isUnlocked = currentState.playerStats.itemsUsed >= condition.target;
          break;
        case 'itemsRescued':
          isUnlocked = currentState.playerStats.itemsRescued >= condition.target;
          break;
        case 'currentItems':
          isUnlocked = currentState.fridgeItems.length >= condition.target;
          break;
        case 'uniqueCategories':
          isUnlocked = getUniqueCategories(currentState.fridgeItems).length >= condition.target;
          break;
        case 'hasRareItem':
          const rareOrHigher: Rarity[] = ['rare', 'epic', 'legendary'];
          isUnlocked = currentState.fridgeItems.some(item => rareOrHigher.includes(item.rarity));
          break;
      }

      if (isUnlocked) {
        newUnlocks.push({
          achievementId: achievement.id,
          unlockedAt: Date.now(),
        });

        // Show achievement popup
        setAchievementEvents(prev => [...prev, { achievement, timestamp: Date.now() }]);
      }
    }

    if (newUnlocks.length > 0) {
      setState(() => {
        let totalBonusXp = 0;
        for (const unlock of newUnlocks) {
          const ach = achievements.find(a => a.id === unlock.achievementId);
          if (ach) totalBonusXp += ach.xpReward;
        }

        // Use currentState (passed from caller) to preserve all state including fridgeItems
        const newTotalXp = currentState.playerStats.totalXp + totalBonusXp;
        const newLevel = getLevelFromXp(newTotalXp);

        return {
          ...currentState,
          playerStats: {
            ...currentState.playerStats,
            totalXp: newTotalXp,
            level: newLevel.level,
          },
          unlockedAchievements: [...currentState.unlockedAchievements, ...newUnlocks],
        };
      });
    }
  }, [achievements, setState]);

  // Handle adding item
  const handleAddItem = useCallback((item: FridgeItem) => {
    // Calculate XP to add
    let xp = XP_REWARDS.addItem;
    const rareOrHigher: Rarity[] = ['rare', 'epic', 'legendary'];
    if (rareOrHigher.includes(item.rarity)) {
      xp += XP_REWARDS.addRareItem;
    }

    setState(prev => {
      const newTotalXp = prev.playerStats.totalXp + xp;
      const newLevel = getLevelFromXp(newTotalXp);

      const newState = {
        ...prev,
        fridgeItems: [...prev.fridgeItems, item],
        playerStats: {
          ...prev.playerStats,
          itemsAdded: prev.playerStats.itemsAdded + 1,
          totalXp: newTotalXp,
          level: newLevel.level,
        },
      };

      // Check achievements after state update
      setTimeout(() => checkAchievements(newState), 100);

      return newState;
    });

    // Show XP gain animation
    setXpGainEvents(prev => [...prev, { amount: xp, reason: 'Added item', timestamp: Date.now() }]);

    // Auto-remove after animation
    setTimeout(() => {
      setXpGainEvents(prev => prev.filter(e => Date.now() - e.timestamp < 1000));
    }, 1000);
  }, [setState, checkAchievements]);

  // Handle using/consuming item
  const handleUseItem = useCallback((itemId: string, isRescue: boolean) => {
    const xp = isRescue ? XP_REWARDS.useItem + XP_REWARDS.rescueItem : XP_REWARDS.useItem;
    const reason = isRescue ? 'Rescued item!' : 'Used item';

    setState(prev => {
      const newTotalXp = prev.playerStats.totalXp + xp;
      const newLevel = getLevelFromXp(newTotalXp);

      const newState = {
        ...prev,
        fridgeItems: prev.fridgeItems.filter(item => item.id !== itemId),
        playerStats: {
          ...prev.playerStats,
          itemsUsed: prev.playerStats.itemsUsed + 1,
          itemsRescued: isRescue ? prev.playerStats.itemsRescued + 1 : prev.playerStats.itemsRescued,
          totalXp: newTotalXp,
          level: newLevel.level,
        },
      };

      setTimeout(() => checkAchievements(newState), 100);

      return newState;
    });

    // Show XP gain animation
    setXpGainEvents(prev => [...prev, { amount: xp, reason, timestamp: Date.now() }]);

    // Auto-remove after animation
    setTimeout(() => {
      setXpGainEvents(prev => prev.filter(e => Date.now() - e.timestamp < 1000));
    }, 1000);
  }, [setState, checkAchievements]);

  // Handle discarding item (no XP)
  const handleDiscardItem = useCallback((itemId: string) => {
    setState(prev => ({
      ...prev,
      fridgeItems: prev.fridgeItems.filter(item => item.id !== itemId),
    }));
  }, [setState]);

  // Clear achievement notification
  const clearAchievementEvent = useCallback((timestamp: number) => {
    setAchievementEvents(prev => prev.filter(e => e.timestamp !== timestamp));
  }, []);

  return {
    addXp,
    handleAddItem,
    handleUseItem,
    handleDiscardItem,
    xpGainEvents,
    achievementEvents,
    clearAchievementEvent,
    currentLevel: LEVELS.find(l => l.level === state.playerStats.level) || LEVELS[0],
  };
}
