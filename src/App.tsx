/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { View, User, Mood, RoomGender } from './types';
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Rooms from './pages/Rooms';
import Emergency from './pages/Emergency';
import Profile from './pages/Profile';
import VIP from './pages/VIP';
import Shop from './pages/Shop';
import LiveRoom from './pages/LiveRoom';
import Forum from './pages/Forum';
import TopicDetail from './pages/TopicDetail';
import Navigation from './components/Navigation';

export default function App() {
  const [view, setView] = useState<View>('welcome');
  const [user, setUser] = useState<User | null>(null);
  const [activeRoom, setActiveRoom] = useState<{ name: string; gender: RoomGender } | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('recomecar_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        const initialView = 'home';
        setView(initialView);
        window.history.replaceState({ view: initialView }, '', '');
      } catch (e) {
        console.error('Failed to parse user', e);
        window.history.replaceState({ view: 'welcome' }, '', '');
      }
    } else {
      window.history.replaceState({ view: 'welcome' }, '', '');
    }
  }, []);

  // Sync state with History API
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
        if (event.state.activeRoom) setActiveRoom(event.state.activeRoom);
        if (event.state.topicId) setSelectedTopicId(event.state.topicId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (newView: View, state?: any) => {
    if (newView !== view || state) {
      window.history.pushState({ view: newView, ...state }, '', '');
      setView(newView);
      if (state?.activeRoom) setActiveRoom(state.activeRoom);
      if (state?.topicId) setSelectedTopicId(state.topicId);
    }
  };

  const handleStartOnboarding = () => navigate('onboarding');
  
  const handleCompleteOnboarding = (userData: User) => {
    setUser(userData);
    localStorage.setItem('recomecar_user', JSON.stringify(userData));
    navigate('home');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        return <Welcome onStart={handleStartOnboarding} />;
      case 'onboarding':
        return <Onboarding onComplete={handleCompleteOnboarding} />;
      case 'home':
        return <Home user={user} navigate={navigate} />;
      case 'chat':
        return <Chat user={user} navigate={navigate} />;
      case 'rooms':
        return <Rooms navigate={navigate} />;
      case 'live-room':
        return <LiveRoom user={user} navigate={navigate} roomName={activeRoom?.name || 'Sala'} gender={activeRoom?.gender || 'mixed'} />;
      case 'forum':
        return <Forum navigate={navigate} />;
      case 'topic-detail':
        return <TopicDetail navigate={navigate} topicId={selectedTopicId || ''} />;
      case 'emergency':
        return <Emergency onClose={() => navigate('home')} />;
      case 'profile':
        return <Profile user={user} navigate={navigate} onLogout={() => {
          localStorage.removeItem('recomecar_user');
          setUser(null);
          navigate('welcome');
        }} />;
      case 'vip':
        return <VIP navigate={navigate} />;
      case 'shop':
        return <Shop navigate={navigate} />;
      default:
        return <Home user={user} navigate={navigate} />;
    }
  };

  const showNav = user && !['welcome', 'onboarding', 'emergency', 'live-room'].includes(view);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-brand-gray flex flex-col max-w-md mx-auto shadow-2xl">
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="h-full w-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {showNav && (
        <Navigation currentView={view} navigate={navigate} />
      )}
    </div>
  );
}
