import { cn } from '@/lib/utils';
import { FridgeItemWithStatus, RARITY_CONFIG, FRESHNESS_CONFIG } from '@/types/inventory';

interface ItemCardProps {
  item: FridgeItemWithStatus;
  onClick?: () => void;
  className?: string;
  isNew?: boolean;
}

export function ItemCard({ item, onClick, className, isNew }: ItemCardProps) {
  const rarityStyle = RARITY_CONFIG[item.rarity];
  const freshnessStyle = FRESHNESS_CONFIG[item.freshnessStatus];

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full h-full rounded-lg border-2 cursor-pointer',
        'flex flex-col items-center justify-center gap-1 p-1',
        'transition-all duration-200 hover:scale-105',
        rarityStyle.border,
        rarityStyle.bg,
        rarityStyle.glow,
        isNew && 'animate-drop',
        className
      )}
    >
      {/* Freshness ring */}
      <div
        className={cn(
          'absolute inset-1 rounded-md ring-2 pointer-events-none',
          freshnessStyle.ring,
          item.freshnessStatus === 'critical' && 'animate-shake',
          item.freshnessStatus === 'expired' && 'opacity-50'
        )}
      />

      {/* Emoji */}
      <span className={cn(
        'text-2xl',
        item.freshnessStatus === 'expired' && 'grayscale opacity-60'
      )}>
        {item.emoji}
      </span>

      {/* Quantity badge */}
      {item.quantity > 1 && (
        <span className="absolute bottom-1 right-1 text-xs font-bold bg-white/80 px-1 rounded">
          x{item.quantity}
        </span>
      )}

      {/* Days remaining badge */}
      {item.daysUntilExpiry !== null && item.daysUntilExpiry <= 3 && (
        <span
          className={cn(
            'absolute top-0 left-0 text-[10px] font-bold px-1 rounded-br',
            item.daysUntilExpiry <= 0
              ? 'bg-red-500 text-white'
              : item.daysUntilExpiry <= 1
              ? 'bg-red-400 text-white'
              : 'bg-orange-400 text-white'
          )}
        >
          {item.daysUntilExpiry <= 0 ? 'EXP' : `${item.daysUntilExpiry}d`}
        </span>
      )}

      {/* Rarity indicator for rare+ */}
      {['rare', 'epic', 'legendary'].includes(item.rarity) && (
        <span className="absolute top-0 right-0 text-[10px]">
          {item.rarity === 'rare' && '💎'}
          {item.rarity === 'epic' && '⭐'}
          {item.rarity === 'legendary' && '👑'}
        </span>
      )}

      {/* Tooltip on hover */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {item.name}
        </div>
      </div>
    </div>
  );
}
