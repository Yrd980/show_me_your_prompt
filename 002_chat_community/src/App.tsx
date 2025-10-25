import { useMemo } from 'react';
import { ChannelSidebar } from '@/components/ChannelSidebar';
import { MessageFeed } from '@/components/MessageFeed';
import { MessageInput } from '@/components/MessageInput';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Channel, Message, ChatState } from '@/types/chat';
import channelsData from '@/data/channels.json';
import mockMessagesData from '@/data/mockMessages.json';

const channels = channelsData.channels as Channel[];
const initialMessages = mockMessagesData.messages as Message[];

const CURRENT_USER = {
  id: 'current-user',
  username: 'You',
  avatar: 'YO',
  color: '#6366f1',
};

function App() {
  const [chatState, setChatState] = useLocalStorage<ChatState>('chatState', {
    messages: initialMessages,
    selectedChannelId: 'general',
  });

  const selectedChannel = useMemo(
    () => channels.find((ch) => ch.id === chatState.selectedChannelId) || channels[0],
    [chatState.selectedChannelId]
  );

  const channelMessages = useMemo(
    () => chatState.messages.filter((msg) => msg.channelId === chatState.selectedChannelId),
    [chatState.messages, chatState.selectedChannelId]
  );

  const handleSelectChannel = (channelId: string) => {
    setChatState((prev) => ({
      ...prev,
      selectedChannelId: channelId,
    }));
  };

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      channelId: chatState.selectedChannelId,
      userId: CURRENT_USER.id,
      username: CURRENT_USER.username,
      userAvatar: CURRENT_USER.avatar,
      userColor: CURRENT_USER.color,
      content,
      timestamp: Date.now(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b px-6 py-3">
        <h1 className="text-2xl font-bold">Chat Community</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r p-2">
          <ChannelSidebar
            channels={channels}
            selectedChannelId={chatState.selectedChannelId}
            onSelectChannel={handleSelectChannel}
          />
        </div>

        <div className="flex-1 flex flex-col p-2 gap-2">
          <div className="flex-1 overflow-hidden">
            <MessageFeed messages={channelMessages} channelName={selectedChannel.name} />
          </div>
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  );
}

export default App;
