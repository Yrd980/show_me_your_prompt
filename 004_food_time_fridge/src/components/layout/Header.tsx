import { LevelBadge } from '@/components/game/LevelBadge';
import { XPBar } from '@/components/game/XPBar';
import { LevelConfig } from '@/types/game';

interface HeaderProps {
  levelConfig: LevelConfig;
  totalXp: number;
  xpGainEvents: { amount: number; reason: string; timestamp: number }[];
  itemCount: number;
  expiringCount: number;
}

export function Header({ levelConfig, totalXp, xpGainEvents, itemCount, expiringCount }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Logo and title */}
          <div className="flex items-center gap-3">
            <span className="text-3xl">🧊</span>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Food Time Fridge</h1>
              <p className="text-xs text-gray-500">Your gamified kitchen companion</p>
            </div>
          </div>

          {/* Center: Stats */}
          <div className="hidden md:flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{itemCount}</p>
              <p className="text-xs text-gray-500">Items</p>
            </div>
            {expiringCount > 0 && (
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500 animate-pulse">{expiringCount}</p>
                <p className="text-xs text-gray-500">Expiring</p>
              </div>
            )}
          </div>

          {/* Right: Level and XP */}
          <div className="flex items-center gap-4">
            <LevelBadge levelConfig={levelConfig} />
            <div className="w-32 hidden sm:block">
              <XPBar totalXp={totalXp} xpGainEvents={xpGainEvents} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
