import { cn } from '@/lib/utils';
import { LevelConfig } from '@/types/game';

interface LevelBadgeProps {
  levelConfig: LevelConfig;
  className?: string;
  showTitle?: boolean;
}

export function LevelBadge({ levelConfig, className, showTitle = true }: LevelBadgeProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Level number badge */}
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-lg">{levelConfig.level}</span>
        </div>
        {/* Glow effect for high levels */}
        {levelConfig.level >= 5 && (
          <div className="absolute inset-0 rounded-full bg-purple-400/30 animate-pulse" />
        )}
      </div>

      {/* Level title */}
      {showTitle && (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wide">Level {levelConfig.level}</span>
          <span className="text-sm font-semibold text-foreground">{levelConfig.title}</span>
        </div>
      )}
    </div>
  );
}
