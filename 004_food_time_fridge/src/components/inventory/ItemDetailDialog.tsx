import { Utensils, Trash2, Calendar, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FridgeItemWithStatus, RARITY_CONFIG, FRESHNESS_CONFIG, CATEGORY_CONFIG } from '@/types/inventory';
import { isRescuable } from '@/lib/game-utils';

interface ItemDetailDialogProps {
  item: FridgeItemWithStatus | null;
  open: boolean;
  onClose: () => void;
  onUse: (itemId: string, isRescue: boolean) => void;
  onDiscard: (itemId: string) => void;
}

export function ItemDetailDialog({ item, open, onClose, onUse, onDiscard }: ItemDetailDialogProps) {
  if (!item) return null;

  const rarityStyle = RARITY_CONFIG[item.rarity];
  const freshnessStyle = FRESHNESS_CONFIG[item.freshnessStatus];
  const categoryConfig = CATEGORY_CONFIG[item.category];
  const canRescue = isRescuable(item);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-2xl">{item.emoji}</span>
            {item.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rarity and category badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className={cn('capitalize', rarityStyle.border, rarityStyle.bg, 'text-gray-700')}>
              {item.rarity === 'legendary' && '👑 '}
              {item.rarity === 'epic' && '⭐ '}
              {item.rarity === 'rare' && '💎 '}
              {item.rarity}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              {categoryConfig.icon} {item.category}
            </Badge>
            <Badge className={cn(freshnessStyle.ring, freshnessStyle.text, 'bg-white border')}>
              {item.freshnessStatus}
            </Badge>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <span>
                <strong>{item.quantity}</strong> {item.unit}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-xs">Added {formatDate(item.addedAt)}</span>
            </div>
          </div>

          {/* Expiry info */}
          {item.expiresAt && (
            <div className={cn(
              'p-3 rounded-lg',
              item.freshnessStatus === 'fresh' && 'bg-emerald-50 text-emerald-700',
              item.freshnessStatus === 'good' && 'bg-yellow-50 text-yellow-700',
              item.freshnessStatus === 'warning' && 'bg-orange-50 text-orange-700',
              item.freshnessStatus === 'critical' && 'bg-red-50 text-red-700',
              item.freshnessStatus === 'expired' && 'bg-red-100 text-red-800',
            )}>
              <p className="font-medium">
                {item.daysUntilExpiry === null
                  ? 'No expiry date'
                  : item.daysUntilExpiry <= 0
                  ? '⚠️ This item has expired!'
                  : item.daysUntilExpiry === 1
                  ? '⏰ Expires tomorrow!'
                  : `📅 Expires in ${item.daysUntilExpiry} days`}
              </p>
              <p className="text-xs mt-1">
                Expiry date: {formatDate(item.expiresAt)}
              </p>
              {canRescue && (
                <p className="text-xs mt-2 font-semibold text-emerald-600">
                  🦸 Use now for +20 rescue bonus XP!
                </p>
              )}
            </div>
          )}

          {/* Freshness bar */}
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Freshness</span>
              <span>{Math.round(item.freshnessPercent)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  item.freshnessPercent > 50 && 'bg-emerald-500',
                  item.freshnessPercent > 25 && item.freshnessPercent <= 50 && 'bg-yellow-500',
                  item.freshnessPercent > 10 && item.freshnessPercent <= 25 && 'bg-orange-500',
                  item.freshnessPercent <= 10 && 'bg-red-500',
                )}
                style={{ width: `${item.freshnessPercent}%` }}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => { onDiscard(item.id); onClose(); }}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Discard
          </Button>
          <Button
            onClick={() => { onUse(item.id, canRescue); onClose(); }}
            className={cn(
              canRescue && 'bg-emerald-500 hover:bg-emerald-600'
            )}
          >
            <Utensils className="h-4 w-4 mr-1" />
            {canRescue ? 'Rescue & Use' : 'Use Item'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
