import { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Message } from '@/types/chat';

interface MessageFeedProps {
  messages: Message[];
  channelName: string;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  if (messageDate.getTime() === today.getTime()) {
    return `Today at ${time}`;
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${time}`;
  } else {
    return `${date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })} at ${time}`;
  }
}

function shouldGroupWithPrevious(current: Message, previous: Message | undefined): boolean {
  if (!previous) return false;
  if (current.userId !== previous.userId) return false;

  const timeDiff = current.timestamp - previous.timestamp;
  const fiveMinutes = 5 * 60 * 1000;

  return timeDiff < fiveMinutes;
}

export function MessageFeed({ messages, channelName }: MessageFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-bold text-xl"># {channelName}</h2>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const isGrouped = shouldGroupWithPrevious(message, previousMessage);

            return (
              <div
                key={message.id}
                className={`flex gap-3 hover:bg-muted/50 px-2 py-1 rounded ${
                  isGrouped ? 'mt-0.5' : 'mt-4'
                }`}
              >
                {!isGrouped ? (
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                    style={{ backgroundColor: message.userColor }}
                  >
                    {message.userAvatar}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  {!isGrouped && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-semibold text-sm">{message.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <p className="text-sm break-words">{message.content}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
