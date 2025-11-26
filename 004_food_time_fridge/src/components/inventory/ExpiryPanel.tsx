import { useMemo } from 'react';
import { AlertTriangle, Utensils, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FridgeItem, FRESHNESS_CONFIG } from '@/types/inventory';
import { calculateFreshness, isRescuable } from '@/lib/game-utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ExpiryPanelProps {
  items: FridgeItem[];
  onUseItem: (itemId: string, isRescue: boolean) => void;
  onDiscardItem: (itemId: string) => void;
}

export function ExpiryPanel({ items, onUseItem, onDiscardItem }: ExpiryPanelProps) {
  // Calculate freshness and filter expiring items
  const expiringItems = useMemo(() => {
    return items
      .map(item => calculateFreshness(item))
      .filter(item => item.daysUntilExpiry !== null && item.daysUntilExpiry <= 3)
      .sort((a, b) => (a.daysUntilExpiry || 0) - (b.daysUntilExpiry || 0));
  }, [items]);

  if (expiringItems.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-emerald-500">✓</span>
            All Fresh!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No items expiring soon. Great job keeping your fridge fresh!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
          <AlertTriangle className="h-4 w-4" />
          Expiring Soon ({expiringItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {expiringItems.map(item => {
          const freshnessStyle = FRESHNESS_CONFIG[item.freshnessStatus];
          const canRescue = isRescuable(item);

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg bg-white border',
                item.freshnessStatus === 'expired' && 'opacity-60',
                item.freshnessStatus === 'critical' && 'border-red-300 animate-shake'
              )}
            >
              {/* Item info */}
              <span className="text-xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className={cn('text-xs', freshnessStyle.text)}>
                  {item.daysUntilExpiry === null
                    ? 'No expiry'
                    : item.daysUntilExpiry <= 0
                    ? 'Expired!'
                    : item.daysUntilExpiry === 1
                    ? 'Expires tomorrow'
                    : `${item.daysUntilExpiry} days left`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant={canRescue ? 'default' : 'secondary'}
                  onClick={() => onUseItem(item.id, canRescue)}
                  className={cn(
                    'h-8 gap-1',
                    canRescue && 'bg-emerald-500 hover:bg-emerald-600'
                  )}
                >
                  <Utensils className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {canRescue ? 'Rescue!' : 'Use'}
                  </span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDiscardItem(item.id)}
                  className="h-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        {/* Rescue bonus hint */}
        <p className="text-xs text-center text-orange-600 mt-2">
          💡 Rescue items within 24h of expiry for +20 bonus XP!
        </p>
      </CardContent>
    </Card>
  );
}
