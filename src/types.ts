export type Mood = 'triste' | 'ansioso' | 'confuso' | 'sozinho';

export interface User {
  name: string;
  age?: string;
  initialMood: Mood;
  avatarId?: string;
}

export type View = 'welcome' | 'onboarding' | 'home' | 'rooms' | 'live-room' | 'emergency' | 'vip' | 'shop' | 'profile' | 'forum' | 'topic-detail';

export type RoomGender = 'mixed' | 'men' | 'women';

export interface Message {
  id: string;
  text: string;
  audioUrl?: string;
  sender: 'user' | 'ai' | 'system';
  senderName?: string;
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  onlineCount: number;
  type: 'public' | 'vip';
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatarId?: string;
  content: string;
  timestamp: number;
  likes: number;
  reactions?: {
    like?: number;
    heart?: number;
    smile?: number;
    sad?: number;
    support?: number;
  };
}

export interface ForumTopic {
  id: string;
  title: string;
  category: string;
  authorName: string;
  authorAvatarId?: string;
  lastUpdate: number;
  repliesCount: number;
  viewsCount: number;
  posts: ForumPost[];
}
