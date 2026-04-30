export type Mood = 'triste' | 'ansioso' | 'confuso' | 'sozinho';

export interface User {
  name: string;
  age?: string;
  initialMood: Mood;
}

export type View = 'welcome' | 'onboarding' | 'home' | 'chat' | 'rooms' | 'emergency' | 'vip' | 'shop' | 'profile';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: number;
}

export interface Room {
  id: string;
  name: string;
  description: string;
  onlineCount: number;
  type: 'public' | 'vip';
}
