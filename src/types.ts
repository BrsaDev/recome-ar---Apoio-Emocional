export type Mood = 'triste' | 'ansioso' | 'confuso' | 'sozinho';

export interface SupportAngel {
  id: string;
  name: string;
  avatarId: string;
}

export interface User {
  name: string;
  age?: string;
  initialMood?: Mood;
  avatarId?: string;
  plan?: 'free' | 'basic' | 'vip' | 'premium';
  supportAngels?: SupportAngel[];
  termsAccepted?: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;
  email?: string;
  authProvider?: 'google' | 'email';
}

export type View = 'welcome' | 'login' | 'onboarding' | 'home' | 'rooms' | 'live-room' | 'emergency' | 'vip' | 'shop' | 'profile' | 'forum' | 'topic-detail' | 'privacy-policy' | 'support' | 'admin';

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
  capacity?: number; // Maximum capacity (e.g. 10)
  invitedAngels?: string[]; // IDs of invited SupportAngels
  invitedBy?: string; // Creator's name
  isPremiumRoom?: boolean; // Creator is Premium
}

export interface ForumPost {
  id: string;
  authorName: string;
  authorAvatarId?: string;
  content: string;
  timestamp: number;
  likes: number;
  isDeleted?: boolean; // Indicates if the post has been soft-deleted
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
  scheduledDeletionTime?: number; // Time when this topic is scheduled for deletion
}
