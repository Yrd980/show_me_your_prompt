export interface User {
  id: string;
  username: string;
  avatar: string;
  color: string;
}

export interface Channel {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface Message {
  id: string;
  channelId: string;
  userId: string;
  username: string;
  userAvatar: string;
  userColor: string;
  content: string;
  timestamp: number;
}

export interface ChatState {
  messages: Message[];
  selectedChannelId: string;
}
