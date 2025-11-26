import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FridgeItemWithStatus } from '@/types/inventory';
import { ItemCard } from './ItemCard';

interface GridSlotProps {
  slotIndex: number;
  item: FridgeItemWithStatus | null;
  isNew?: boolean;
  onClickEmpty: (slotIndex: number) => void;
  onClickItem: (item: FridgeItemWithStatus) => void;
  onDragStart?: (itemId: string) => void;
  onDragOver?: (slotIndex: number) => void;
  onDrop?: (slotIndex: number) => void;
  isDragOver?: boolean;
}

export function GridSlot({
  slotIndex,
  item,
  isNew,
  onClickEmpty,
  onClickItem,
  onDragStart,
  onDragOver,
  onDrop,
  isDragOver,
}: GridSlotProps) {
  const handleDragStart = (e: React.DragEvent) => {
    if (item && onDragStart) {
      e.dataTransfer.setData('text/plain', item.id);
      onDragStart(item.id);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDragOver) {
      onDragOver(slotIndex);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (onDrop) {
      onDrop(slotIndex);
    }
  };

  if (item) {
    return (
      <div
        className="w-14 h-14 group"
        draggable
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ItemCard
          item={item}
          isNew={isNew}
          onClick={() => onClickItem(item)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'w-14 h-14 rounded-lg border-2 border-dashed border-gray-300',
        'flex items-center justify-center cursor-pointer',
        'transition-all duration-200',
        'hover:border-gray-400 hover:bg-gray-50',
        'group',
        isDragOver && 'border-violet-500 bg-violet-50'
      )}
      onClick={() => onClickEmpty(slotIndex)}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Plus className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
    </div>
  );
}
