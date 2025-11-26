import { cn } from '@/lib/utils';
import { getXpToNextLevel } from '@/lib/game-utils';

interface XPBarProps {
  totalXp: number;
  className?: string;
}

interface XpGainEvent {
  amount: number;
  reason: string;
  timestamp: number;
}

interface XPBarWithEventsProps extends XPBarProps {
  xpGainEvents: XpGainEvent[];
}

export function XPBar({ totalXp, className, xpGainEvents }: XPBarWithEventsProps) {
  const { current, needed, progress } = getXpToNextLevel(totalXp);
  const isMaxLevel = needed === 0;

  return (
    <div className={cn('relative', className)}>
      {/* XP Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 h-3 bg-violet-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-violet-600 min-w-[60px] text-right">
          {isMaxLevel ? 'MAX' : `${current}/${needed}`}
        </span>
      </div>

      {/* Floating XP gain notifications */}
      <div className="absolute -top-6 right-0 flex flex-col items-end gap-1">
        {xpGainEvents.map((event) => (
          <span
            key={event.timestamp}
            className="animate-xp-float text-sm font-bold text-emerald-500"
          >
            +{event.amount} XP
          </span>
        ))}
      </div>
    </div>
  );
}
