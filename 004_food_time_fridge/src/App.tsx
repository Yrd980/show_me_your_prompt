import { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useGameEngine } from '@/hooks/useGameEngine';
import { AppState, INITIAL_STATE } from '@/types/game';
import { FridgeItem, FridgeItemWithStatus } from '@/types/inventory';
import { calculateFreshness } from '@/lib/game-utils';
import { Header } from '@/components/layout/Header';
import { FridgeGrid } from '@/components/inventory/FridgeGrid';
import { AddItemDialog } from '@/components/inventory/AddItemDialog';
import { ItemDetailDialog } from '@/components/inventory/ItemDetailDialog';
import { ExpiryPanel } from '@/components/inventory/ExpiryPanel';
import { AchievementToast } from '@/components/game/AchievementToast';

function App() {
  // Main app state persisted to localStorage
  const [state, setState] = useLocalStorage<AppState>('food-time-fridge', INITIAL_STATE);

  // Game engine for XP/achievements
  const {
    handleAddItem,
    handleUseItem,
    handleDiscardItem,
    xpGainEvents,
    achievementEvents,
    clearAchievementEvent,
    currentLevel,
  } = useGameEngine(state, setState);

  // UI state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [targetSlotIndex, setTargetSlotIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<FridgeItemWithStatus | null>(null);
  const [newItemIds, setNewItemIds] = useState<Set<string>>(new Set());

  // Calculate expiring items count
  const expiringCount = useMemo(() => {
    return state.fridgeItems.filter(item => {
      const withStatus = calculateFreshness(item);
      return withStatus.daysUntilExpiry !== null && withStatus.daysUntilExpiry <= 3;
    }).length;
  }, [state.fridgeItems]);

  // Handle clicking an empty slot
  const handleClickEmpty = useCallback((slotIndex: number) => {
    setTargetSlotIndex(slotIndex);
    setAddDialogOpen(true);
  }, []);

  // Handle clicking an item
  const handleClickItem = useCallback((item: FridgeItemWithStatus) => {
    setSelectedItem(item);
  }, []);

  // Handle adding a new item
  const handleAdd = useCallback((item: FridgeItem) => {
    handleAddItem(item);
    // Mark as new for animation
    setNewItemIds(prev => new Set(prev).add(item.id));
    // Remove "new" status after animation
    setTimeout(() => {
      setNewItemIds(prev => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 500);
  }, [handleAddItem]);

  // Handle moving item via drag-and-drop
  const handleMoveItem = useCallback((itemId: string, newSlotIndex: number) => {
    setState(prev => ({
      ...prev,
      fridgeItems: prev.fridgeItems.map(item =>
        item.id === itemId ? { ...item, slotIndex: newSlotIndex } : item
      ),
    }));
  }, [setState]);

  // Handle using item from detail dialog or expiry panel
  const handleUse = useCallback((itemId: string, isRescue: boolean) => {
    handleUseItem(itemId, isRescue);
    setSelectedItem(null);
  }, [handleUseItem]);

  // Handle discarding item
  const handleDiscard = useCallback((itemId: string) => {
    handleDiscardItem(itemId);
    setSelectedItem(null);
  }, [handleDiscardItem]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header
        levelConfig={currentLevel}
        totalXp={state.playerStats.totalXp}
        xpGainEvents={xpGainEvents}
        itemCount={state.fridgeItems.length}
        expiringCount={expiringCount}
      />

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fridge Grid - Main area */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎒</span>
              My Fridge Backpack
            </h2>
            <FridgeGrid
              items={state.fridgeItems}
              newItemIds={newItemIds}
              onClickEmpty={handleClickEmpty}
              onClickItem={handleClickItem}
              onMoveItem={handleMoveItem}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Expiry Panel */}
            <ExpiryPanel
              items={state.fridgeItems}
              onUseItem={handleUse}
              onDiscardItem={handleDiscard}
            />

            {/* Quick stats */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold mb-3">📊 Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-violet-600">{state.playerStats.itemsAdded}</p>
                  <p className="text-xs text-gray-500">Items Added</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">{state.playerStats.itemsUsed}</p>
                  <p className="text-xs text-gray-500">Items Used</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-600">{state.playerStats.itemsRescued}</p>
                  <p className="text-xs text-gray-500">Items Rescued</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">{state.unlockedAchievements.length}</p>
                  <p className="text-xs text-gray-500">Achievements</p>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-lg border border-violet-200 p-4">
              <h3 className="text-sm font-semibold text-violet-700 mb-2">💡 Tips</h3>
              <ul className="text-xs text-violet-600 space-y-1">
                <li>• Add items to earn XP (+5 per item)</li>
                <li>• Rare items give bonus XP (+15)</li>
                <li>• Rescue expiring items for +20 XP</li>
                <li>• Drag items to reorganize your fridge</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAdd}
        targetSlotIndex={targetSlotIndex}
      />

      {/* Item Detail Dialog */}
      <ItemDetailDialog
        item={selectedItem}
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        onUse={handleUse}
        onDiscard={handleDiscard}
      />

      {/* Achievement Toasts */}
      {achievementEvents.map(event => (
        <AchievementToast
          key={event.timestamp}
          achievement={event.achievement}
          onClose={() => clearAchievementEvent(event.timestamp)}
        />
      ))}
    </div>
  );
}

export default App;
