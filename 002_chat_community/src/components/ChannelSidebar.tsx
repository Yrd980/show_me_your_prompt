import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Channel } from '@/types/chat';
import { Hash, Megaphone, HelpCircle, Lightbulb, Star } from 'lucide-react';

interface ChannelSidebarProps {
  channels: Channel[];
  selectedChannelId: string;
  onSelectChannel: (channelId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  hash: Hash,
  megaphone: Megaphone,
  'help-circle': HelpCircle,
  lightbulb: Lightbulb,
  star: Star,
};

export function ChannelSidebar({ channels, selectedChannelId, onSelectChannel }: ChannelSidebarProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg">Chat Community</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase">
            Channels
          </div>
          {channels.map((channel) => {
            const Icon = iconMap[channel.icon] || Hash;
            const isSelected = channel.id === selectedChannelId;

            return (
              <Button
                key={channel.id}
                variant={isSelected ? 'secondary' : 'ghost'}
                className={`w-full justify-start font-medium ${
                  isSelected ? 'bg-secondary' : ''
                }`}
                onClick={() => onSelectChannel(channel.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {channel.name}
              </Button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
