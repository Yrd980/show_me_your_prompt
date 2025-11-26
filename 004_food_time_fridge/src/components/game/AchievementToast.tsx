import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Achievement } from '@/types/game';
import { Button } from '@/components/ui/button';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
  className?: string;
}

export function AchievementToast({ achievement, onClose, className }: AchievementToastProps) {
  // Auto-close after 4 seconds
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 animate-drop',
        'bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-400',
        'rounded-lg shadow-xl p-4 pr-10 max-w-sm',
        className
      )}
    >
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>

      {/* Content */}
      <div className="flex items-center gap-3">
        {/* Achievement emoji */}
        <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-2xl animate-level-up">
          {achievement.emoji}
        </div>

        {/* Text */}
        <div className="flex-1">
          <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">
            Achievement Unlocked!
          </p>
          <p className="font-bold text-amber-900">{achievement.name}</p>
          <p className="text-sm text-amber-700">{achievement.description}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">
            +{achievement.xpReward} XP
          </p>
        </div>
      </div>

      {/* Shimmer effect */}
      <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shimmer" />
      </div>
    </div>
  );
}
