import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FridgeItem, FridgeItemWithStatus, Category, CATEGORY_CONFIG } from '@/types/inventory';
import { calculateFreshness } from '@/lib/game-utils';
import { GridSlot } from './GridSlot';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface FridgeGridProps {
  items: FridgeItem[];
  newItemIds: Set<string>;
  onClickEmpty: (slotIndex: number) => void;
  onClickItem: (item: FridgeItemWithStatus) => void;
  onMoveItem: (itemId: string, newSlotIndex: number) => void;
}

const ROWS = 6;
const COLS = 8;
const CATEGORIES: (Category | 'all')[] = ['all', 'produce', 'dairy', 'meat', 'frozen', 'pantry', 'spices', 'beverages', 'other'];

export function FridgeGrid({ items, newItemIds, onClickEmpty, onClickItem, onMoveItem }: FridgeGridProps) {
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Calculate freshness for all items
  const itemsWithStatus = useMemo(() => {
    return items.map(item => calculateFreshness(item));
  }, [items]);

  // Filter items by category
  const filteredItems = useMemo(() => {
    if (categoryFilter === 'all') return itemsWithStatus;
    return itemsWithStatus.filter(item => item.category === categoryFilter);
  }, [itemsWithStatus, categoryFilter]);

  // Create slot map for quick lookup
  const slotMap = useMemo(() => {
    const map = new Map<number, FridgeItemWithStatus>();
    for (const item of itemsWithStatus) {
      map.set(item.slotIndex, item);
    }
    return map;
  }, [itemsWithStatus]);

  // Handle drag and drop
  const handleDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handleDragOver = (slotIndex: number) => {
    setDragOverSlot(slotIndex);
  };

  const handleDrop = (slotIndex: number) => {
    if (draggedItemId && !slotMap.has(slotIndex)) {
      onMoveItem(draggedItemId, slotIndex);
    }
    setDraggedItemId(null);
    setDragOverSlot(null);
  };

  // Generate all slots
  const slots = [];
  for (let i = 0; i < ROWS * COLS; i++) {
    const item = slotMap.get(i);
    const shouldShow = !item || categoryFilter === 'all' || item.category === categoryFilter;

    slots.push(
      <GridSlot
        key={i}
        slotIndex={i}
        item={shouldShow ? item || null : null}
        isNew={item ? newItemIds.has(item.id) : false}
        onClickEmpty={onClickEmpty}
        onClickItem={onClickItem}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragOver={dragOverSlot === i && !slotMap.has(i)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => {
          const config = cat === 'all' ? { icon: '📋', color: 'gray' } : CATEGORY_CONFIG[cat];
          const count = cat === 'all'
            ? itemsWithStatus.length
            : itemsWithStatus.filter(i => i.category === cat).length;

          return (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                'gap-1',
                categoryFilter === cat && 'ring-2 ring-offset-1'
              )}
            >
              <span>{config.icon}</span>
              <span className="capitalize">{cat}</span>
              {count > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {count}
                </Badge>
              )}
            </Button>
          );
        })}
      </div>

      {/* Grid */}
      <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-4 shadow-inner">
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
          }}
        >
          {slots}
        </div>
      </div>

      {/* Capacity indicator */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>
          {items.length} / {ROWS * COLS} slots used
        </span>
        <span>
          {categoryFilter !== 'all' && `Showing: ${filteredItems.length} ${categoryFilter} items`}
        </span>
      </div>
    </div>
  );
}
